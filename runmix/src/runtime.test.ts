import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Runtime } from "./runtime.js";

describe("Runtime", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "runmix-test-"));
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
});
