import type { RunLogEntry } from "./types.js";

/** Serialize session log for tools / eval artifacts. */
export function exportRunLogJSON(entries: readonly RunLogEntry[], pretty = true): string {
  return JSON.stringify([...entries], null, pretty ? 2 : undefined);
}

/** Human-readable log for pasting into issues or LLM context. */
export function exportRunLogMarkdown(entries: readonly RunLogEntry[]): string {
  const lines: string[] = ["# execpad session log", ""];
  for (const e of entries) {
    lines.push(`## ${e.id} — ${e.language} @ ${new Date(e.at).toISOString()}`);
    lines.push("");
    lines.push(`- **exit:** ${e.exitCode} · **duration:** ${e.durationMs}ms · **truncated:** ${e.truncated}`);
    lines.push(`- **cwd:** \`${e.cwd}\``);
    if (e.files.length) {
      lines.push(`- **files:** ${e.files.map((f) => `${f.type}:${f.path}`).join(", ")}`);
    }
    lines.push("");
    lines.push("### code");
    lines.push("");
    lines.push("```");
    lines.push(e.code);
    lines.push("```");
    lines.push("");
    lines.push("### stdout");
    lines.push("");
    lines.push("```");
    lines.push(e.stdout || "(empty)");
    lines.push("```");
    lines.push("");
    lines.push("### stderr");
    lines.push("");
    lines.push("```");
    lines.push(e.stderr || "(empty)");
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}
