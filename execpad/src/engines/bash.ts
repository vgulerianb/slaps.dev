import { spawn } from "node:child_process";
import type { RunResult, RunOptions } from "../types.js";
import type { Engine } from "./engine.js";
import { truncateOutput } from "../sandbox/limits.js";

function runProcess(
  cmd: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  timeoutMs: number,
  maxOutputBytes: number | undefined,
  stdin?: string,
): Promise<RunResult> {
  const start = Date.now();
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, timeoutMs);
    if (stdin != null) {
      child.stdin?.write(stdin);
      child.stdin?.end();
    }
    child.stdout?.on("data", (c: Buffer) => {
      stdout += c.toString("utf8");
    });
    child.stderr?.on("data", (c: Buffer) => {
      stderr += c.toString("utf8");
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const t = truncateOutput(stdout, stderr, maxOutputBytes);
      resolve({
        stdout: t.stdout,
        stderr: t.stderr,
        exitCode: signal ? 128 : (code ?? 0),
        durationMs: Date.now() - start,
        files: [],
        truncated: t.truncated,
      });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout: "",
        stderr: String(err),
        exitCode: 127,
        durationMs: Date.now() - start,
        files: [],
        truncated: false,
      });
    });
  });
}

export class BashEngine implements Engine {
  readonly language = "bash" as const;

  async execute(
    code: string,
    cwd: string,
    opts: RunOptions & { timeoutMs: number; maxOutputBytes?: number },
  ): Promise<RunResult> {
    return runProcess("bash", ["-c", code], cwd, opts.env ?? {}, opts.timeoutMs, opts.maxOutputBytes);
  }
}

export class PythonEngine implements Engine {
  readonly language = "python" as const;

  async execute(
    code: string,
    cwd: string,
    opts: RunOptions & { timeoutMs: number; maxOutputBytes?: number },
  ): Promise<RunResult> {
    const py = process.platform === "win32" ? "python" : "python3";
    return runProcess(py, ["-c", code], cwd, opts.env ?? {}, opts.timeoutMs, opts.maxOutputBytes);
  }
}

export class JavaScriptEngine implements Engine {
  readonly language = "javascript" as const;

  async execute(
    code: string,
    cwd: string,
    opts: RunOptions & { timeoutMs: number; maxOutputBytes?: number },
  ): Promise<RunResult> {
    return runProcess(process.execPath, ["-e", code], cwd, opts.env ?? {}, opts.timeoutMs, opts.maxOutputBytes);
  }
}
