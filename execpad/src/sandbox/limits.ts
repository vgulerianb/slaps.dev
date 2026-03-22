import { createHash } from "node:crypto";

export function truncateOutput(
  stdout: string,
  stderr: string,
  maxBytes: number | undefined,
): { stdout: string; stderr: string; truncated: boolean; hashFull?: string } {
  if (maxBytes == null || maxBytes <= 0) {
    return { stdout, stderr, truncated: false };
  }
  const combined = stdout.length + stderr.length;
  if (combined <= maxBytes) {
    return { stdout, stderr, truncated: false };
  }
  const h = createHash("sha256").update(stdout + "\0" + stderr).digest("hex");
  let budget = maxBytes;
  let out = stdout;
  let err = stderr;
  if (out.length > budget) {
    out = out.slice(0, budget) + "\n...[truncated]";
    err = "";
    budget = 0;
  } else {
    budget -= out.length;
  }
  if (budget > 0 && err.length > budget) {
    err = err.slice(0, budget) + "\n...[truncated]";
  }
  return { stdout: out, stderr: err, truncated: true, hashFull: h };
}
