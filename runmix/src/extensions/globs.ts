import * as fs from "node:fs";
import * as path from "node:path";
import { minimatch } from "minimatch";

function walkFiles(root: string, baseRel = ""): string[] {
  const out: string[] = [];
  const dir = path.join(root, baseRel);
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = baseRel ? `${baseRel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walkFiles(root, rel));
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

export function listMatchingRelPaths(
  root: string,
  includeGlobs: string[],
  excludeGlobs: string[] = [],
): string[] {
  const all = walkFiles(root);
  const included = all.filter((rel) => {
    const posix = rel.split(path.sep).join("/");
    const inc = includeGlobs.some((g) => minimatch(posix, g, { dot: true }));
    if (!inc) return false;
    return !excludeGlobs.some((g) => minimatch(posix, g, { dot: true }));
  });
  return included;
}
