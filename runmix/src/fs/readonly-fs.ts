import type { FsAdapter } from "./types.js";

export class ReadonlyFs implements FsAdapter {
  constructor(private inner: FsAdapter) {}

  readFile(rel: string): Buffer {
    return this.inner.readFile(rel);
  }

  writeFile(): void {
    throw new Error("Filesystem is read-only");
  }

  mkdir(): void {
    throw new Error("Filesystem is read-only");
  }

  exists(rel: string): boolean {
    return this.inner.exists(rel);
  }

  readdir(rel: string): string[] {
    return this.inner.readdir(rel);
  }

  unlink(): void {
    throw new Error("Filesystem is read-only");
  }

  realPath(rel: string): string {
    return this.inner.realPath(rel);
  }
}
