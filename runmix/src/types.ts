export type Language = "bash" | "python" | "javascript" | "sql";

export interface ResourceLimits {
  timeoutMs?: number;
  maxOutputBytes?: number;
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
