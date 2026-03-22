export type Language = "bash" | "python" | "javascript" | "sql";

export interface ResourceLimits {
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export interface RunLogEntry {
  id: string;
  /** Epoch ms when the run finished. */
  at: number;
  language: Language;
  code: string;
  cwd: string;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  truncated: boolean;
  files: FileChange[];
}

export interface RuntimeOptions {
  readonly?: boolean;
  overlay?: boolean;
  limits?: ResourceLimits;
  /** Seed files relative to root (written on construction). */
  files?: Record<string, string>;
  /** Glob patterns for `listMatching` / snapshot diff scope (minimatch). */
  includeGlobs?: string[];
  excludeGlobs?: string[];
  /**
   * When true (default), each `run()` is appended to an in-memory ring buffer
   * (`getRunLog` / `clearRunLog`) for agents and dashboards.
   */
  runLog?: boolean;
  /** Max retained log entries; oldest dropped. Default 200. */
  runLogMaxEntries?: number;
  /** Called after each run with the same payload stored in the log. */
  onRun?: (entry: RunLogEntry) => void;
}

export interface RunOptions extends ResourceLimits {
  env?: Record<string, string>;
  cwd?: string;
}

export interface FileChange {
  path: string;
  type: "created" | "modified" | "deleted";
  size: number;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  files: FileChange[];
  truncated: boolean;
}

export interface SerializedRuntime {
  version: 1;
  root: string;
  readonly: boolean;
  overlay: boolean;
  overlayWrites: Record<string, string>;
}
