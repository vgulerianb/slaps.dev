import * as fs from "node:fs";
import * as path from "node:path";
import type { FsAdapter } from "./types.js";

/** Copy-on-write: reads fall through to disk; writes stay in memory until apply(). */
export class OverlayFs implements FsAdapter {
  private readonly writes = new Map<string, Buffer>();
  private readonly deleted = new Set<string>();

  constructor(private readonly root: string) {}

  private resolve(rel: string): string {
    const r = path.resolve(this.root, rel);
    if (!r.startsWith(path.resolve(this.root))) {
      throw new Error(`Path escapes root: ${rel}`);
    }
    return r;
  }

  readFile(rel: string): Buffer {
    const norm = path.normalize(rel);
    if (this.deleted.has(norm)) {
      throw new Error(`ENOENT: ${rel}`);
    }
    const w = this.writes.get(norm);
    if (w) return Buffer.from(w);
    return fs.readFileSync(this.resolve(rel));
  }

  writeFile(rel: string, data: Buffer | string): void {
    const norm = path.normalize(rel);
    this.deleted.delete(norm);
    this.writes.set(norm, Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8"));
  }

  mkdir(rel: string, recursive = true): void {
    const norm = path.normalize(rel);
    this.writes.set(`${norm}/.__dir__`, Buffer.alloc(0));
    if (recursive) {
      /* noop marker for nested paths */
    }
  }

  exists(rel: string): boolean {
    const norm = path.normalize(rel);
    if (this.deleted.has(norm)) return false;
    if (this.writes.has(norm) || [...this.writes.keys()].some((k) => k.startsWith(norm + "/"))) {
      return true;
    }
    return fs.existsSync(this.resolve(rel));
  }

  readdir(rel: string): string[] {
    const norm = path.normalize(rel);
    const disk = fs.existsSync(this.resolve(rel)) ? fs.readdirSync(this.resolve(rel)) : [];
    const overlay = new Set<string>();
    const prefix = norm === "." ? "" : norm + "/";
    for (const k of this.writes.keys()) {
      if (!k.startsWith(prefix)) continue;
      const rest = k.slice(prefix.length);
      const seg = rest.split("/")[0];
      if (seg) overlay.add(seg);
    }
    return [...new Set([...disk, ...overlay])];
  }

  unlink(rel: string): void {
    const norm = path.normalize(rel);
    this.writes.delete(norm);
    this.deleted.add(norm);
  }

  realPath(rel: string): string {
    return this.resolve(rel);
  }

  getOverlayWrites(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of this.writes) {
      if (k.endsWith("/.__dir__")) continue;
      out[k] = v.toString("utf8");
    }
    return out;
  }

  getDeleted(): string[] {
    return [...this.deleted];
  }

  applyToDisk(): void {
    for (const rel of this.deleted) {
      const p = this.resolve(rel);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    for (const [rel, buf] of this.writes) {
      if (rel.endsWith("/.__dir__")) {
        const dir = rel.replace(/\/\.__dir__$/, "");
        fs.mkdirSync(this.resolve(dir), { recursive: true });
        continue;
      }
      const p = this.resolve(rel);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, buf);
    }
    this.writes.clear();
    this.deleted.clear();
  }

  diffAgainstDisk(): string {
    const lines: string[] = [];
    for (const [rel, buf] of this.writes) {
      if (rel.endsWith("/.__dir__")) continue;
      const p = this.resolve(rel);
      const before = fs.existsSync(p) ? fs.readFileSync(p).toString("utf8") : "";
      const after = buf.toString("utf8");
      if (before !== after) {
        lines.push(`--- ${rel} (disk)`);
        lines.push(`+++ ${rel} (overlay)`);
        lines.push(`@@`);
        lines.push(`-${before.split("\n").join("\n-")}`);
        lines.push(`+${after.split("\n").join("\n+")}`);
      }
    }
    for (const rel of this.deleted) {
      if (fs.existsSync(this.resolve(rel))) {
        lines.push(`deleted (overlay): ${rel}`);
      }
    }
    return lines.join("\n");
  }
}
