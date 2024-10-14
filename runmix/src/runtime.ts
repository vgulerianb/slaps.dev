import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { FileChange, Language, ResourceLimits, RunOptions, RunResult, RuntimeOptions, SerializedRuntime } from "./types.js";
import type { FsAdapter } from "./fs/types.js";
import { RealFs } from "./fs/real-fs.js";
import { ReadonlyFs } from "./fs/readonly-fs.js";
import { BashEngine, JavaScriptEngine, PythonEngine } from "./engines/bash.js";
import { SqlEngine } from "./engines/sql.js";
import type { Engine } from "./engines/engine.js";
import { listMatchingRelPaths } from "./extensions/globs.js";

const DEFAULT_LIMITS: ResourceLimits = {
  timeoutMs: 30_000,
  maxOutputBytes: 2 * 1024 * 1024,
};

function cpRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, name.name);
    const d = path.join(dest, name.name);
    if (name.isDirectory()) cpRecursive(s, d);
    else if (name.isFile()) fs.copyFileSync(s, d);
  }
}

function snapshotTree(root: string, rels: string[]): Map<string, { mtime: number; size: number }> {
  const m = new Map<string, { mtime: number; size: number }>();
  for (const rel of rels) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p) || !fs.statSync(p).isFile()) continue;
    const st = fs.statSync(p);
    m.set(rel, { mtime: st.mtimeMs, size: st.size });
  }
  return m;
}

function diffTrees(
  root: string,
  before: Map<string, { mtime: number; size: number }>,
  afterRels: string[],
): FileChange[] {
  const changes: FileChange[] = [];
  for (const rel of afterRels) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
      if (before.has(rel)) {
        changes.push({ path: rel, type: "deleted", size: 0 });
      }
      continue;
    }
    const st = fs.statSync(p);
    const prev = before.get(rel);
    if (!prev) {
      changes.push({ path: rel, type: "created", size: st.size });
    } else if (prev.mtime !== st.mtimeMs || prev.size !== st.size) {
      changes.push({ path: rel, type: "modified", size: st.size });
    }
  }
  return changes;
}

export class Runtime {
  readonly root: string;
  private readonly workDir: string;
  private readonly ownsWorkDir: boolean;
  private readonly limits: ResourceLimits;
  private readonly engines = new Map<Language, Engine>();
  private readonly options: RuntimeOptions;

  constructor(root: string, options: RuntimeOptions = {}) {
    this.root = path.resolve(root);
    this.options = options;
    this.limits = { ...DEFAULT_LIMITS, ...options.limits };
    if (options.overlay) {
      this.workDir = fs.mkdtempSync(path.join(os.tmpdir(), "runmix-"));
      cpRecursive(this.root, this.workDir);
      this.ownsWorkDir = true;
    } else {
      this.workDir = this.root;
      this.ownsWorkDir = false;
    }
    if (options.files) {
      for (const [rel, content] of Object.entries(options.files)) {
        const p = path.join(this.workDir, rel);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, content, "utf8");
      }
    }
    this.engines.set("bash", new BashEngine());
    this.engines.set("python", new PythonEngine());
    this.engines.set("javascript", new JavaScriptEngine());
    this.engines.set("sql", new SqlEngine());
  }

  /** Effective cwd for execution and fs (overlay copy or real root). */
  get effectiveRoot(): string {
    return this.workDir;
  }

  get fs(): FsAdapter {
    const real = new RealFs(this.workDir);
    if (this.options.readonly) return new ReadonlyFs(real);
    return real;
  }

  private engine(lang: Language): Engine {
    const e = this.engines.get(lang);
    if (!e) throw new Error(`Unknown language: ${lang}`);
    return e;
  }

  async run(lang: Language, code: string, opts: RunOptions = {}): Promise<RunResult> {
    const timeoutMs = opts.timeoutMs ?? this.limits.timeoutMs ?? DEFAULT_LIMITS.timeoutMs!;
    const maxOutputBytes = opts.maxOutputBytes ?? this.limits.maxOutputBytes;
    const cwd = path.resolve(this.workDir, opts.cwd ?? ".");
    if (!cwd.startsWith(path.resolve(this.workDir))) {
      throw new Error("cwd escapes workspace");
    }
    const globs = this.options.includeGlobs?.length
      ? listMatchingRelPaths(this.workDir, this.options.includeGlobs, this.options.excludeGlobs)
      : listMatchingRelPaths(this.workDir, ["**/*"], this.options.excludeGlobs ?? ["**/node_modules/**", "**/.git/**"]);
    const before = snapshotTree(this.workDir, globs);
    const result = await this.engine(lang).execute(code, cwd, {
      ...opts,
      timeoutMs,
      maxOutputBytes,
    });
    const afterRels = listMatchingRelPaths(this.workDir, ["**/*"], this.options.excludeGlobs ?? ["**/node_modules/**", "**/.git/**"]);
    const files = diffTrees(this.workDir, before, afterRels);
    return { ...result, files };
  }

  /** Apply overlay workspace back to original root (overlay mode only). */
  apply(): void {
    if (!this.options.overlay) {
      throw new Error("apply() only valid in overlay mode");
    }
    cpRecursive(this.workDir, this.root);
  }

  close(): void {
    if (this.ownsWorkDir) {
      fs.rmSync(this.workDir, { recursive: true, force: true });
    }
  }

  serialize(): SerializedRuntime {
    if (!this.options.overlay) {
      return {
        version: 1,
        root: this.root,
        readonly: !!this.options.readonly,
        overlay: false,
        overlayWrites: {},
      };
    }
    const writes: Record<string, string> = {};
    const walk = (dir: string, prefix: string) => {
      for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, name.name);
        const rel = prefix ? `${prefix}/${name.name}` : name.name;
        if (name.isDirectory()) walk(p, rel);
        else writes[rel] = fs.readFileSync(p, "utf8");
      }
    };
    walk(this.workDir, "");
    return {
      version: 1,
      root: this.root,
      readonly: !!this.options.readonly,
      overlay: true,
      overlayWrites: writes,
    };
  }

  static deserialize(data: SerializedRuntime): Runtime {
    if (data.version !== 1) throw new Error("Unsupported serialize version");
    const rt = new Runtime(data.root, {
      overlay: data.overlay,
      readonly: data.readonly,
      files: data.overlay ? data.overlayWrites : undefined,
    });
    return rt;
  }

  asOpenAITool(): {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  } {
    const self = this;
    return {
      type: "function",
      function: {
        name: "execute_code",
        description:
          "Execute code in the workspace directory. Languages: bash, python, javascript, sql.",
        parameters: {
          type: "object",
          properties: {
            language: {
              type: "string",
              enum: ["bash", "python", "javascript", "sql"],
            },
            code: { type: "string" },
          },
          required: ["language", "code"],
        },
      },
    };
  }

  /** OpenAI tool handler: call with parsed function arguments. */
  async executeToolCall(args: { language: Language; code: string }): Promise<RunResult> {
    return this.run(args.language, args.code);
  }
}
