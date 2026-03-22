export interface FsAdapter {
  readFile(rel: string): Buffer;
  writeFile(rel: string, data: Buffer | string): void;
  mkdir(rel: string, recursive?: boolean): void;
  exists(rel: string): boolean;
  readdir(rel: string): string[];
  unlink(rel: string): void;
  realPath(rel: string): string;
}
