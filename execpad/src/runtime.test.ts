import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Runtime } from "./runtime.js";
import { truncateOutput } from "./sandbox/limits.js";
import { exportRunLogJSON } from "./run-log.js";

function hasSqlite3Cli(): boolean {
  try {
    execSync("sqlite3 -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("Runtime", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "execpad-test-"));
    fs.mkdirSync(path.join(tmp, "data"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "data", "x.txt"), "hello", "utf8");
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("runs bash and reads workspace file", async () => {
    const rt = new Runtime(tmp);
    const r = await rt.run("bash", "cat data/x.txt");
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe("hello");
    rt.close();
  });

  it("runs python", async () => {
    const rt = new Runtime(tmp);
    const r = await rt.run("python", "print(1 + 1)");
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe("2");
    rt.close();
  });

  it("readonly fs rejects write", async () => {
    const rt = new Runtime(tmp, { readonly: true });
    expect(() => rt.fs.writeFile("nope.txt", "x")).toThrow(/read-only/i);
    rt.close();
  });

  it("overlay apply copies changes to root", async () => {
    const rt = new Runtime(tmp, { overlay: true });
    await rt.run("bash", 'echo "z" > data/y.txt');
    expect(fs.existsSync(path.join(tmp, "data", "y.txt"))).toBe(false);
    rt.apply();
    expect(fs.readFileSync(path.join(tmp, "data", "y.txt"), "utf8").trim()).toBe("z");
    rt.close();
  });

  it("serialize and deserialize roundtrip overlay", async () => {
    const rt = new Runtime(tmp, { overlay: true });
    await rt.run("bash", 'echo "q" > data/q.txt');
    const ser = rt.serialize();
    rt.close();
    const rt2 = Runtime.deserialize(ser);
    const text = rt2.fs.readFile("data/q.txt").toString("utf8").trim();
    expect(text).toBe("q");
    rt2.close();
  });

  it("asOpenAITool returns schema", () => {
    const rt = new Runtime(tmp);
    const t = rt.asOpenAITool();
    expect(t.type).toBe("function");
    expect(t.function.name).toBe("execute_code");
    rt.close();
  });

  it("apply() without overlay throws", () => {
    const rt = new Runtime(tmp);
    expect(() => rt.apply()).toThrow(/overlay mode/i);
    rt.close();
  });

  it("rejects cwd outside workspace", async () => {
    const rt = new Runtime(tmp);
    await expect(rt.run("bash", "true", { cwd: ".." })).rejects.toThrow(/escapes workspace/i);
    rt.close();
  });

  it("runs javascript (Node)", async () => {
    const rt = new Runtime(tmp);
    const r = await rt.run("javascript", "console.log(40+2)");
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe("42");
    rt.close();
  });

  it.skipIf(!hasSqlite3Cli())("runs sql via sqlite3 CLI", async () => {
    const rt = new Runtime(tmp);
    const r = await rt.run("sql", "SELECT 1 AS n;");
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/1/);
    rt.close();
  });

  it("truncateOutput leaves small output unchanged", () => {
    const r = truncateOutput("a", "b", 10_000);
    expect(r.truncated).toBe(false);
    expect(r.stdout).toBe("a");
  });

  it("truncateOutput truncates and hashes when over limit", () => {
    const r = truncateOutput("x".repeat(100), "", 50);
    expect(r.truncated).toBe(true);
    expect(r.hashFull).toMatch(/^[a-f0-9]{64}$/);
  });

  it("readonly overlay still rejects write on overlay fs", () => {
    const rt = new Runtime(tmp, { overlay: true, readonly: true });
    expect(() => rt.fs.writeFile("x.txt", "n")).toThrow(/read-only/i);
    rt.close();
  });

  it("getRunLog records stdout and code; clearRunLog empties", async () => {
    const rt = new Runtime(tmp);
    await rt.run("bash", 'echo "logged"');
    const log = rt.getRunLog();
    expect(log.length).toBe(1);
    expect(log[0].stdout.trim()).toBe("logged");
    expect(log[0].language).toBe("bash");
    expect(exportRunLogJSON(log)).toContain("logged");
    rt.clearRunLog();
    expect(rt.getRunLog().length).toBe(0);
    rt.close();
  });

  it("runLogMaxEntries drops oldest runs", async () => {
    const rt = new Runtime(tmp, { runLogMaxEntries: 2 });
    await rt.run("bash", "echo 1");
    await rt.run("bash", "echo 2");
    await rt.run("bash", "echo 3");
    const log = rt.getRunLog();
    expect(log.length).toBe(2);
    expect(log[0].stdout.trim()).toBe("2");
    expect(log[1].stdout.trim()).toBe("3");
    rt.close();
  });

  it("runLog false skips recording", async () => {
    const rt = new Runtime(tmp, { runLog: false });
    await rt.run("bash", "echo x");
    expect(rt.getRunLog().length).toBe(0);
    rt.close();
  });

  it("onRun fires for each run", async () => {
    const ids: string[] = [];
    const rt = new Runtime(tmp, { onRun: (e) => ids.push(e.id) });
    await rt.run("bash", "true");
    await rt.run("bash", "true");
    expect(ids).toEqual(["run-1", "run-2"]);
    rt.close();
  });
});
