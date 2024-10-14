import * as fs from "node:fs";
import * as path from "node:path";
import type { FsAdapter } from "./types.js";

export class RealFs implements FsAdapter {
  constructor(private readonly root: string) {}

  private resolve(rel: string): string {
    const r = path.resolve(this.root, rel);
    if (!r.startsWith(path.resolve(this.root))) {
      throw new Error(`Path escapes root: ${rel}`);
    }
    return r;
  }

  readFile(rel: string): Buffer {
    return fs.readFileSync(this.resolve(rel));
  }

  writeFile(rel: string, data: Buffer | string): void {
    const p = this.resolve(rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, data);
  }

  mkdir(rel: string, recursive = true): void {
    fs.mkdirSync(this.resolve(rel), { recursive });
  }

  exists(rel: string): boolean {
    return fs.existsSync(this.resolve(rel));
  }

  readdir(rel: string): string[] {
    return fs.readdirSync(this.resolve(rel));
  }

  unlink(rel: string): void {
    fs.unlinkSync(this.resolve(rel));
  }

  realPath(rel: string): string {
    return this.resolve(rel);
  }
}
