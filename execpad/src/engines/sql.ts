import { spawn } from "node:child_process";
import type { RunResult, RunOptions } from "../types.js";
import type { Engine } from "./engine.js";
import { truncateOutput } from "../sandbox/limits.js";

/** Runs SQL via sqlite3 CLI when available; attaches cwd for file paths in queries. */
export class SqlEngine implements Engine {
  readonly language = "sql" as const;

  async execute(
    code: string,
    cwd: string,
    opts: RunOptions & { timeoutMs: number; maxOutputBytes?: number },
  ): Promise<RunResult> {
    const start = Date.now();
    const sql = code.trim();
    return new Promise((resolve) => {
      const child = spawn("sqlite3", [":memory:", sql], {
        cwd,
        env: { ...process.env, ...opts.env },
      });
      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => child.kill("SIGKILL"), opts.timeoutMs);
      child.stdout?.on("data", (c: Buffer) => {
        stdout += c.toString("utf8");
      });
      child.stderr?.on("data", (c: Buffer) => {
        stderr += c.toString("utf8");
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        const t = truncateOutput(stdout, stderr, opts.maxOutputBytes);
        resolve({
          stdout: t.stdout,
          stderr: t.stderr,
          exitCode: code ?? 0,
          durationMs: Date.now() - start,
          files: [],
          truncated: t.truncated,
        });
      });
      child.on("error", () => {
        clearTimeout(timer);
        resolve({
          stdout: "",
          stderr:
            "sqlite3 CLI not found; install SQLite or use execpad Python (stdlib sqlite3).",
          exitCode: 127,
          durationMs: Date.now() - start,
          files: [],
          truncated: false,
        });
      });
    });
  }
}
