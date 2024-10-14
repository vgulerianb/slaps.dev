import type { RunResult, RunOptions, Language } from "../types.js";

export interface Engine {
  readonly language: Language;
  execute(
    code: string,
    cwd: string,
    opts: RunOptions & { timeoutMs: number; maxOutputBytes?: number },
  ): Promise<RunResult>;
}
