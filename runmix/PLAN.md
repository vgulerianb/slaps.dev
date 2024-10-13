# runmix

**Multi-language code execution for AI agents. Zero infra. One `npm install` or `pip install`.**

`runmix` gives your AI application Python, JavaScript, SQL, and Bash execution — all operating on a real directory, all running in-process. No Docker. No cloud sandbox service. No cold starts. Ships as both an **npm package** and a **pip package** with the same API shape.

---

## The Problem

Every AI product that lets agents or users run code faces the same ugly choice:

1. **Cloud sandbox services** (E2B, Modal, CodeSandbox) — per-execution cost, network latency on every tool call, vendor lock-in, and the operational overhead of managing API keys and quotas.
2. **Docker containers** — 500ms+ cold starts, per-container memory overhead, requires Docker daemon running, painful in CI, impossible in the browser.
3. **Raw WASM runtimes** (Pyodide, QuickJS, sql.js) — low-level APIs, each has its own filesystem abstraction, no shared state between languages, no resource limits, no integration with LLM tool-calling protocols.
4. **Virtual filesystem approaches** — require you to serialize your project into JSON `{ path: content }` maps. That's tedious for real codebases. Agents work on real directories, not JSON blobs.

**What's missing:** A single package where you point at a directory, write `rt.run('python', code)`, and the code operates on real files in that directory — with resource limits, multi-language support, and ready-to-use LLM tool integrations.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Your Application                          │
│                                                               │
│   const rt = new Runtime('./my-project')                      │
│   const result = await rt.run('python', code)                 │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                     Runtime (core)                             │
│                                                               │
│   - Language routing                                          │
│   - Resource limits (timeout, memory, output size)            │
│   - Working directory scoping                                 │
│   - Execution trace recording                                 │
└─────┬─────────┬──────────┬──────────┬────────────────────────┘
      │         │          │          │
┌─────▼───┐ ┌──▼─────┐ ┌──▼────┐ ┌──▼─────┐
│ Python  │ │   JS   │ │  SQL  │ │  Bash  │   ← Engine layer
│ Engine  │ │ Engine │ │Engine │ │ Engine │
└─────┬───┘ └──┬─────┘ └──┬────┘ └──┬─────┘
      │        │          │         │
┌─────▼────────▼──────────▼─────────▼──────────────────────────┐
│                   Real Filesystem                              │
│                                                               │
│   ./my-project/          ← base directory                     │
│   ├── src/               All engines read/write here.         │
│   ├── data/              Python writes data/out.csv →         │
│   └── ...                SQL reads data/out.csv               │
│                                                               │
│   Modes:                                                      │
│   ├── default    — read/write directly to disk                │
│   ├── readonly   — read only, writes rejected                 │
│   └── overlay    — reads from disk, writes stay in memory     │
└───────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Real directory access by default.** You pass a path — `Runtime('./my-project')` — and code runs against those real files. No need to serialize your project into JSON. This matches how agents actually work (Agno's `FileTools(base_dir=...)`, Cursor's workspace, etc.).

2. **Three filesystem modes.** Default is direct read/write. `readonly: true` prevents mutations. `overlay: true` gives copy-on-write (reads from disk, writes to memory) for safe experimentation with `.diff()` and `.apply()`.

3. **Engines are lazy-loaded.** `Runtime('./data')` doesn't load any WASM binaries until the first `.run()` call for a specific language. You don't pay for languages you don't use.

4. **Each `run()` call shares the directory.** The filesystem is the shared state primitive. Python writes a CSV, SQL queries it, JS formats it — all through normal file I/O against the same directory.

5. **Network is off by default.** Opt-in via URL-prefix allow-list. Secrets are injected via header transforms at the boundary — they never enter executed code.

6. **Integrations are thin wrappers, not frameworks.** `.asTool()` returns an AI SDK `Tool` object. `.asOpenAITool()` returns OpenAI function-calling JSON. The library doesn't import these frameworks — it produces plain objects that conform to their schemas.

7. **Same API in TypeScript and Python.** The npm and pip packages have identical method names, options, and behavior. Code examples translate 1:1.

---

## File Structure

```
runmix/
├── package.json                         # npm package
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── README.md
├── PLAN.md
├── LICENSE                              # Apache-2.0
│
├── src/                                 # TypeScript (npm) implementation
│   ├── index.ts                         # Public API: Runtime, types, fs exports
│   │
│   ├── runtime.ts                       # Core Runtime class
│   │                                    #   - new Runtime(dir, opts?)
│   │                                    #   - .run(lang, code, opts?)
│   │                                    #   - .checkpoint() / .rollback(snap)
│   │                                    #   - .fork() → new Runtime (COW overlay)
│   │                                    #   - .close()
│   │
│   ├── types.ts                         # Shared types
│   │                                    #   RuntimeConfig, RunResult, RunOptions,
│   │                                    #   Language, ResourceLimits, NetworkConfig
│   │
│   ├── engines/
│   │   ├── engine.ts                    # Engine interface + BaseEngine
│   │   │                                #   .execute(code, opts) → RunResult
│   │   │                                #   .isLoaded() → boolean
│   │   │                                #   .destroy()
│   │   │
│   │   ├── python/
│   │   │   ├── index.ts                 # PythonEngine — wraps Pyodide (WASM)
│   │   │   ├── loader.ts               # Lazy WASM loading + caching
│   │   │   └── fs-bridge.ts            # Syncs base directory ↔ Pyodide MEMFS
│   │   │
│   │   ├── javascript/
│   │   │   ├── index.ts                 # JavaScriptEngine — wraps QuickJS (WASM)
│   │   │   ├── loader.ts               # Lazy WASM loading
│   │   │   └── node-compat.ts          # Shims: fs, path, process, Buffer
│   │   │
│   │   ├── sql/
│   │   │   ├── index.ts                 # SQLEngine — wraps sql.js (WASM)
│   │   │   ├── loader.ts               # Lazy WASM loading
│   │   │   └── csv-table.ts            # Auto-mount CSV files as virtual tables
│   │   │
│   │   └── bash/
│   │       ├── index.ts                 # BashEngine — wraps just-bash
│   │       └── bridge.ts               # Bridges base directory ↔ just-bash FS
│   │
│   ├── fs/
│   │   ├── index.ts                     # FS mode exports
│   │   ├── types.ts                     # FsInterface: read, write, mkdir, stat,
│   │   │                                #   readdir, unlink, rename, exists, diff
│   │   ├── real-fs.ts                   # Default — direct read/write to disk
│   │   ├── readonly-fs.ts              # Wraps real-fs, rejects all writes
│   │   ├── overlay-fs.ts              # Copy-on-write: reads disk, writes memory
│   │   └── snapshot.ts                 # Serialize/deserialize FS state for
│   │                                    #   checkpoint/rollback/fork (overlay mode)
│   │
│   ├── sandbox/
│   │   ├── limits.ts                    # Resource limit enforcement
│   │   │                                #   - Timeout via AbortController
│   │   │                                #   - Output size cap (truncate + hash)
│   │   │                                #   - Memory tracking (per-engine where possible)
│   │   │
│   │   └── network.ts                  # Network policy
│   │                                    #   - URL prefix allow-list
│   │                                    #   - Method restrictions
│   │                                    #   - Header transforms (inject secrets)
│   │                                    #   - Redirect protection
│   │
│   ├── integrations/
│   │   ├── ai-sdk.ts                    # .asTool() → Vercel AI SDK Tool
│   │   ├── openai.ts                    # .asOpenAITool() → function calling schema
│   │   ├── anthropic.ts                # .asAnthropicTool() → tool_use schema
│   │   ├── mcp.ts                       # .asMCPServer() → MCP server
│   │   └── langchain.ts               # .asLangChainTool() → LangChain StructuredTool
│   │
│   └── streaming/
│       ├── index.ts
│       └── output-stream.ts            # StreamingRunResult — yields stdout/stderr
│                                        #   chunks as they're produced
│
├── python/                              # Python (pip) implementation
│   ├── pyproject.toml                   # pip package config
│   ├── README.md
│   │
│   ├── src/
│   │   └── runmix/
│   │       ├── __init__.py              # Public API: Runtime, RunResult
│   │       ├── runtime.py               # Core Runtime class (same API as TS)
│   │       ├── types.py                 # Shared types (dataclasses)
│   │       │
│   │       ├── engines/
│   │       │   ├── __init__.py
│   │       │   ├── base.py              # Engine ABC
│   │       │   ├── python_engine.py     # subprocess + resource limits
│   │       │   ├── javascript_engine.py # subprocess + bundled QuickJS binary
│   │       │   ├── sql_engine.py        # sqlite3 stdlib
│   │       │   └── bash_engine.py       # subprocess + bash
│   │       │
│   │       ├── fs/
│   │       │   ├── __init__.py
│   │       │   ├── real_fs.py           # Default — os/pathlib operations
│   │       │   ├── readonly_fs.py       # Rejects writes
│   │       │   └── overlay_fs.py        # Copy-on-write
│   │       │
│   │       ├── sandbox/
│   │       │   ├── __init__.py
│   │       │   ├── limits.py            # ulimit, timeout, output cap
│   │       │   └── network.py           # URL allow-list for curl/requests
│   │       │
│   │       └── integrations/
│   │           ├── __init__.py
│   │           ├── openai_tool.py       # .as_openai_tool() → function schema
│   │           ├── anthropic_tool.py    # .as_anthropic_tool() → tool_use schema
│   │           ├── langchain_tool.py    # .as_langchain_tool()
│   │           └── mcp_server.py        # .as_mcp_server()
│   │
│   └── tests/
│       ├── test_runtime.py
│       ├── test_engines/
│       │   ├── test_python.py
│       │   ├── test_javascript.py
│       │   ├── test_sql.py
│       │   └── test_bash.py
│       └── test_integrations/
│           └── test_openai.py
│
├── tests/                               # TypeScript tests
│   ├── runtime.test.ts
│   ├── engines/
│   │   ├── python.test.ts
│   │   ├── javascript.test.ts
│   │   ├── sql.test.ts
│   │   └── bash.test.ts
│   ├── fs/
│   │   ├── real-fs.test.ts
│   │   ├── readonly-fs.test.ts
│   │   └── overlay-fs.test.ts
│   └── integrations/
│       ├── ai-sdk.test.ts
│       └── mcp.test.ts
│
└── examples/
    ├── 01-basic/
    ├── 02-ai-chatbot/
    ├── 03-data-pipeline/
    ├── 04-mcp-server/
    └── 05-eval-harness/
```

---

## Core API

### TypeScript (npm)

```typescript
import { Runtime } from 'runmix';

// Point at a real directory — code runs against these files
const rt = new Runtime('./my-project');

// Read-only mode — agent can read files but not modify them
const rt = new Runtime('./data', { readonly: true });

// Overlay mode — reads from disk, writes stay in memory until .apply()
const rt = new Runtime('./my-project', { overlay: true });

// Full configuration
const rt = new Runtime('./workspace', {
  // Filesystem mode (default: read/write)
  readonly: false,
  overlay: false,

  // Additional inline files (written to the directory on init)
  files: {
    'config.json': '{"debug": true}',
    'scripts/setup.sh': '#!/bin/bash\necho "ready"',
  },

  // Resource limits (overridable per .run())
  limits: {
    timeout: 10_000,          // 10 seconds
    maxOutputSize: 1_048_576, // 1MB stdout+stderr
    maxMemory: '128mb',
  },

  // Network policy (off by default)
  network: {
    allowedUrls: [
      'https://api.github.com',
      {
        url: 'https://api.openai.com',
        transform: [{ headers: { Authorization: 'Bearer sk-...' } }],
      },
    ],
    allowedMethods: ['GET', 'POST'],
  },
});
```

### Python (pip)

```python
from runmix import Runtime

# Point at a real directory
rt = Runtime('./my-project')

# Read-only mode
rt = Runtime('./data', readonly=True)

# Overlay mode
rt = Runtime('./my-project', overlay=True)

# Full configuration
rt = Runtime('./workspace',
    files={
        'config.json': '{"debug": true}',
    },
    limits={
        'timeout': 10_000,
        'max_output_size': 1_048_576,
    },
    network={
        'allowed_urls': ['https://api.github.com'],
    },
)
```

### `run()` — Execute Code

```typescript
interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;           // Wall-clock ms
  files: FileChange[];        // Files created/modified/deleted during execution
  truncated: boolean;         // True if output was capped
}

interface FileChange {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  size: number;
}
```

**TypeScript:**

```typescript
const result = await rt.run('python', `
import json, os

with open('data/users.json') as f:
    users = json.load(f)

active = [u for u in users if u['active']]
print(f"Found {len(active)} active users")

with open('data/active_users.json', 'w') as f:
    json.dump(active, f, indent=2)
`);
// result.stdout → "Found 12 active users\n"
// result.exitCode → 0
// result.files → [{ path: 'data/active_users.json', type: 'created', size: 340 }]

// Per-call overrides
const result = await rt.run('javascript', `
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(pkg.name);
`, { timeout: 5000, env: { NODE_ENV: 'production' } });

// Streaming execution
const stream = rt.runStreaming('python', longRunningCode);
for await (const chunk of stream) {
  process.stdout.write(chunk.data);
}
const result = await stream.result;
```

**Python:**

```python
result = rt.run('python', """
import json

with open('data/users.json') as f:
    users = json.load(f)

active = [u for u in users if u['active']]
print(f"Found {len(active)} active users")

with open('data/active_users.json', 'w') as f:
    json.dump(active, f, indent=2)
""")
# result.stdout → "Found 12 active users\n"
# result.exit_code → 0

result = rt.run('bash', 'grep -r "TODO" src/ | wc -l')

result = rt.run('sql', """
  SELECT product, SUM(revenue) as total
  FROM 'data/sales.csv'
  GROUP BY product
  ORDER BY total DESC
  LIMIT 10
""")
```

### Overlay Mode — Safe Experimentation

```typescript
const rt = new Runtime('./my-project', { overlay: true });

// Agent can read real files
await rt.run('bash', 'cat package.json | jq .dependencies');

// "Writes" stay in memory — real files untouched
await rt.run('python', `
with open('src/index.ts', 'a') as f:
    f.write('\\nconsole.log("injected")\\n')
`);

// See what the agent changed
const diff = rt.diff();
console.log(diff);
// --- a/src/index.ts
// +++ b/src/index.ts
// @@ -42,3 +42,4 @@
//  ...existing code...
// +console.log("injected")

// Apply to real disk only if you approve
rt.apply();

// Or checkpoint / rollback within the overlay
const snap = rt.checkpoint();
await rt.run('bash', 'rm -rf src/*');
rt.rollback(snap); // src/* is back
```

### Direct Filesystem Access

```typescript
// Inspect the working directory
const files = rt.fs.list('src/');                   // ['index.ts', 'utils.ts']
const content = rt.fs.read('src/index.ts');         // file content as string
const exists = rt.fs.exists('data/output.csv');     // true/false

// Write files (respects readonly/overlay mode)
rt.fs.write('config.json', '{"debug": false}');
rt.fs.mkdir('output/reports');

// Bulk write inline files (useful for seeding test data)
rt.fs.writeMany({
  'fixtures/a.json': '{"id": 1}',
  'fixtures/b.json': '{"id": 2}',
});
```

---

## Usage Examples

### Example 1: AI Chatbot with Code Execution

A chatbot that can run code against a workspace directory.

**TypeScript:**

```typescript
import { Runtime } from 'runmix';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const rt = new Runtime('./workspace', {
  limits: { timeout: 15_000 },
});

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  tools: {
    execute_code: rt.asTool(),
  },
  system: `You can execute Python and JavaScript code in the ./workspace directory.
           Files persist across executions within this conversation.`,
  prompt: 'Read data/sales.csv and find the top 5 products by revenue.',
});
```

**Python:**

```python
from runmix import Runtime
from openai import OpenAI

rt = Runtime('./workspace', limits={'timeout': 15_000})
client = OpenAI()

response = client.chat.completions.create(
    model='gpt-4o',
    tools=[rt.as_openai_tool()],
    messages=[{
        'role': 'user',
        'content': 'Read data/sales.csv and find the top 5 products by revenue.'
    }],
)

for call in response.choices[0].message.tool_calls or []:
    args = json.loads(call.function.arguments)
    result = rt.run(args['language'], args['code'])
    # Feed result back to the model...
```

### Example 2: Multi-Language Data Pipeline

Agent processes real project data by chaining Python, SQL, and JavaScript.

**TypeScript:**

```typescript
import { Runtime } from 'runmix';

// Point at a directory with raw data files
const rt = new Runtime('./data-pipeline');

// Step 1: Python cleans the raw data
await rt.run('python', `
import json, csv

with open('raw/events.json') as f:
    data = json.load(f)

seen = set()
clean = []
for row in data:
    key = (row['user_id'], row['timestamp'])
    if key not in seen and row['event'] is not None:
        seen.add(key)
        clean.append(row)

with open('processed/events.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['user_id', 'timestamp', 'event', 'value'])
    w.writeheader()
    w.writerows(clean)

print(f"Cleaned {len(data)} → {len(clean)} rows")
`);

// Step 2: SQL aggregates the CSV (auto-mounted as virtual table)
const agg = await rt.run('sql', `
  SELECT
    event,
    COUNT(*) as count,
    ROUND(AVG(value), 2) as avg_value
  FROM 'processed/events.csv'
  GROUP BY event
  ORDER BY count DESC
`);

// Step 3: Bash generates a summary
await rt.run('bash', `
  echo "# Event Summary" > processed/report.md
  echo "" >> processed/report.md
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> processed/report.md
  echo "" >> processed/report.md
  cat processed/events.csv | head -1
  wc -l < processed/events.csv
`);
```

### Example 3: MCP Server

Expose runmix as an MCP server that any agent (Claude, Cursor, etc.) can connect to.

**TypeScript:**

```typescript
import { Runtime } from 'runmix';

const rt = new Runtime('./project', {
  limits: { timeout: 30_000, maxMemory: '256mb' },
  network: {
    allowedUrls: ['https://api.github.com'],
  },
});

// Starts an MCP server with tools:
//   execute_code(language, code) → { stdout, stderr, exitCode }
//   read_file(path) → string
//   write_file(path, content) → void
//   list_files(directory) → string[]
const server = rt.asMCPServer({
  name: 'runmix-sandbox',
  version: '1.0.0',
});
server.listen({ transport: 'stdio' });
```

**Python:**

```python
from runmix import Runtime

rt = Runtime('./project',
    limits={'timeout': 30_000},
    network={'allowed_urls': ['https://api.github.com']},
)

server = rt.as_mcp_server(name='runmix-sandbox', version='1.0.0')
server.listen(transport='stdio')
```

### Example 4: Agent Eval Harness

Run deterministic evaluations of agent-generated code against real project directories.

**TypeScript:**

```typescript
import { Runtime } from 'runmix';
import { mkdtempSync, cpSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface EvalCase {
  name: string;
  projectDir: string;          // Path to a fixture directory
  agentCode: string;
  language: string;
  assertions: {
    exitCode?: number;
    stdoutContains?: string[];
    fileExists?: string[];
    fileContains?: Record<string, string>;
  };
}

async function runEval(cases: EvalCase[]): Promise<EvalReport> {
  const results = await Promise.all(cases.map(async (tc) => {
    // Copy fixture to a temp directory so each case is isolated
    const tmp = mkdtempSync(join(tmpdir(), 'eval-'));
    cpSync(tc.projectDir, tmp, { recursive: true });

    const rt = new Runtime(tmp, {
      limits: { timeout: 10_000 },
    });

    try {
      const result = await rt.run(tc.language, tc.agentCode);

      const pass =
        (tc.assertions.exitCode === undefined || result.exitCode === tc.assertions.exitCode) &&
        (tc.assertions.stdoutContains?.every(s => result.stdout.includes(s)) ?? true) &&
        (tc.assertions.fileExists?.every(f => rt.fs.exists(f)) ?? true) &&
        (Object.entries(tc.assertions.fileContains ?? {}).every(
          ([path, substr]) => rt.fs.read(path).includes(substr)
        ));

      return { name: tc.name, pass, result };
    } finally {
      rt.close();
    }
  }));

  return { results, passRate: results.filter(r => r.pass).length / results.length };
}
```

**Python:**

```python
from runmix import Runtime
import tempfile, shutil

def run_eval(cases):
    results = []
    for tc in cases:
        tmp = tempfile.mkdtemp(prefix='eval-')
        shutil.copytree(tc['project_dir'], tmp, dirs_exist_ok=True)

        rt = Runtime(tmp, limits={'timeout': 10_000})
        try:
            result = rt.run(tc['language'], tc['agent_code'])
            passed = (
                result.exit_code == tc.get('expected_exit_code', 0)
                and all(s in result.stdout for s in tc.get('stdout_contains', []))
                and all(rt.fs.exists(f) for f in tc.get('file_exists', []))
            )
            results.append({'name': tc['name'], 'pass': passed, 'result': result})
        finally:
            rt.close()
            shutil.rmtree(tmp)

    pass_rate = sum(1 for r in results if r['pass']) / len(results)
    return {'results': results, 'pass_rate': pass_rate}
```

### Example 5: Read-Only Codebase Analysis

Agent analyzes a real codebase without risk of modifying it.

**TypeScript:**

```typescript
import { Runtime } from 'runmix';

// readonly: true — any write operation raises an error
const rt = new Runtime('/path/to/production-repo', { readonly: true });

// Agent can read and analyze files
const result = await rt.run('bash', `
  echo "=== Project Structure ==="
  find . -name '*.ts' | head -20

  echo ""
  echo "=== TODO Count ==="
  grep -r "TODO" src/ | wc -l

  echo ""
  echo "=== Dependencies ==="
  cat package.json | jq '.dependencies | keys[]'
`);

// This would throw: Error: Filesystem is read-only
await rt.run('bash', 'echo "oops" > src/index.ts');
```

**Python:**

```python
from runmix import Runtime

rt = Runtime('/path/to/production-repo', readonly=True)

result = rt.run('python', """
import os, json

ts_files = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.ts'):
            ts_files.append(os.path.join(root, f))

print(f"Found {len(ts_files)} TypeScript files")

with open('package.json') as f:
    pkg = json.load(f)
    deps = list(pkg.get('dependencies', {}).keys())
    print(f"Dependencies: {', '.join(deps)}")
""")
```

### Example 6: OpenAI Function Calling (Direct)

**TypeScript:**

```typescript
import { Runtime } from 'runmix';
import OpenAI from 'openai';

const rt = new Runtime('./workspace');
const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  tools: [rt.asOpenAITool()],
  messages: [{ role: 'user', content: 'List all CSV files and show their row counts' }],
});

for (const call of response.choices[0].message.tool_calls ?? []) {
  if (call.function.name === 'execute_code') {
    const args = JSON.parse(call.function.arguments);
    const result = await rt.run(args.language, args.code);
    // Feed result back to the model...
  }
}
```

**Python:**

```python
from runmix import Runtime
from openai import OpenAI
import json

rt = Runtime('./workspace')
client = OpenAI()

response = client.chat.completions.create(
    model='gpt-4o',
    tools=[rt.as_openai_tool()],
    messages=[{'role': 'user', 'content': 'List all CSV files and show their row counts'}],
)

for call in response.choices[0].message.tool_calls or []:
    args = json.loads(call.function.arguments)
    result = rt.run(args['language'], args['code'])
```

---

## Implementation: TypeScript (npm)

### Engine Strategy

| Language | Runtime | Execution Model | Binary Size | Load Time |
|----------|---------|-----------------|-------------|-----------|
| JavaScript | QuickJS-NG (WASM) | In-process, sandboxed | ~400KB | <50ms |
| Python | Pyodide (WASM) | In-process, sandboxed | ~10MB | ~2s first load |
| SQL | sql.js (WASM) | In-process, sandboxed | ~1MB | ~100ms |
| Bash | just-bash (TS) | In-process, interpreted | ~200KB | <20ms |

Each engine receives the base directory path and operates on it. For WASM engines (Pyodide, QuickJS), the bridge syncs relevant files from the real directory into the engine's in-memory FS before execution, and syncs writes back afterward. For direct engines (just-bash), the bridge maps file operations to the real directory via Node's `fs` module.

### FS ↔ Engine Bridge

1. **Before execution:** Scan the base directory, sync changed files into the engine's internal FS.
2. **During execution:** Engine reads/writes its own FS natively (fast, no per-syscall bridge).
3. **After execution:** Detect files changed by the engine, write them back to the real directory (or to the overlay layer).

For large directories, only sync files the code is likely to touch (configurable via `include`/`exclude` globs), plus sync on-demand when the engine requests a file not yet loaded.

### Output Capture

- **stdout/stderr:** Redirected to string buffers. Streaming mode yields chunks via `AsyncIterable`.
- **File artifacts:** After execution, diff the directory to detect created/modified files. Return as `FileChange[]` in `RunResult`.
- **Truncation:** If stdout exceeds `maxOutputSize`, truncate and set `result.truncated = true`.

### Error Model

```typescript
// Engine errors (syntax, runtime) — returned in RunResult
result.exitCode !== 0;
result.stderr; // contains the error message / traceback

// Sandbox violations — thrown as exceptions
class TimeoutError extends Error {}     // execution exceeded timeout
class MemoryError extends Error {}      // engine hit memory limit
class NetworkError extends Error {}     // URL not in allow-list
class OutputLimitError extends Error {} // stdout/stderr too large
class ReadOnlyError extends Error {}    // write attempted in readonly mode
```

---

## Implementation: Python (pip)

The Python package is a **native implementation** — no Node.js dependency, no WASM. It uses the tools Python already has.

### Engine Strategy

| Language | Execution Model | How |
|----------|-----------------|-----|
| Python | `subprocess.run()` | Spawns a child Python process with `cwd` set to the base directory. Resource limits via `ulimit` (Linux/macOS) or `resource` module. Timeout via `subprocess.run(timeout=...)`. |
| JavaScript | `subprocess.run()` | Bundles a QuickJS binary (small, statically linked). Writes code to a temp file, executes via the bundled binary with `cwd` set to base directory. |
| SQL | `sqlite3` stdlib | Uses Python's built-in `sqlite3` module. CSVs auto-loaded as virtual tables via `csv.reader` + `INSERT`. |
| Bash | `subprocess.run()` | Spawns `bash -c` with `cwd` set to base directory. Resource limits via `ulimit` wrapper. |

### Key Differences from TypeScript Version

- **No WASM** — uses native subprocess execution, which is simpler and has no binary dependencies.
- **Sandboxing is lighter** — relies on OS-level isolation (`cwd`, `ulimit`, `timeout`) rather than WASM memory boundaries. For Python code execution, optionally integrates with `RestrictedPython` or `safepyrun` for import/attribute restrictions.
- **No lazy-loading** — engines are just functions that call `subprocess.run()`, so there's nothing heavy to load.
- **Same API surface** — `Runtime`, `run()`, `fs.read()`, `as_openai_tool()`, etc. all work the same way.

### File Structure Detail

```python
# src/runmix/__init__.py
from .runtime import Runtime
from .types import RunResult, FileChange, RuntimeConfig

# src/runmix/runtime.py
class Runtime:
    def __init__(self, directory: str, *, readonly=False, overlay=False, **kwargs): ...
    def run(self, language: str, code: str, **kwargs) -> RunResult: ...
    def close(self) -> None: ...

    # Filesystem access
    @property
    def fs(self) -> FsInterface: ...

    # Overlay mode
    def diff(self) -> str: ...
    def apply(self) -> None: ...
    def checkpoint(self) -> str: ...
    def rollback(self, snapshot_id: str) -> None: ...

    # Integrations
    def as_openai_tool(self) -> dict: ...
    def as_anthropic_tool(self) -> dict: ...
    def as_langchain_tool(self): ...
    def as_mcp_server(self, **kwargs): ...

# src/runmix/types.py
@dataclass
class RunResult:
    stdout: str
    stderr: str
    exit_code: int
    duration: float
    files: list[FileChange]
    truncated: bool

@dataclass
class FileChange:
    path: str
    type: str   # 'created' | 'modified' | 'deleted'
    size: int
```

### Python Package Dependencies

```toml
# pyproject.toml
[project]
name = "runmix"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []  # Zero runtime dependencies for core

[project.optional-dependencies]
langchain = ["langchain-core>=0.2"]
mcp = ["mcp>=1.0"]
restricted = ["RestrictedPython>=7.0"]
```

Zero required dependencies for the core package. Optional extras for framework integrations.

---

## Implementation Phases

### Phase 1: Core + Bash Engine (Weeks 1–2)

**Goal:** `rt.run('bash', code)` works against a real directory in both TypeScript and Python.

- [ ] `Runtime` class — constructor takes directory path, mode flags
- [ ] `RealFs` / `ReadonlyFs` — thin wrappers over Node `fs` / Python `os`
- [ ] `BashEngine` — the simplest engine (subprocess in Python, just-bash in TS)
- [ ] `RunResult` type, timeout enforcement, output capture
- [ ] Basic tests: run bash against a temp directory, verify file I/O
- [ ] Package setup: `package.json` + `pyproject.toml`

**Why Bash first:** It's the simplest engine in both languages (just `subprocess.run('bash', '-c', code, cwd=dir)` in Python) and validates the entire Runtime → Engine → FS pipeline.

### Phase 2: Python + JS + SQL Engines (Weeks 3–5)

**Goal:** All four languages work in both packages.

TypeScript:
- [ ] `PythonEngine` (Pyodide WASM), `JavaScriptEngine` (QuickJS WASM), `SQLEngine` (sql.js)
- [ ] FS bridge: sync base directory ↔ WASM engine FS
- [ ] Lazy engine loading

Python:
- [ ] `PythonEngine` (subprocess), `JavaScriptEngine` (bundled QuickJS), `SQLEngine` (sqlite3)
- [ ] CSV auto-mount for SQL
- [ ] Cross-language tests

### Phase 3: Overlay Mode + Sandbox (Weeks 6–7)

- [ ] `OverlayFs` — copy-on-write in both TS and Python
- [ ] `checkpoint()` / `rollback()` / `diff()` / `apply()`
- [ ] Network allow-list (TS: fetch interception, Python: requests/urllib patching)
- [ ] Memory limits (TS: WASM memory caps, Python: `resource.setrlimit`)

### Phase 4: Integrations (Weeks 8–9)

- [ ] `.asTool()` / `.as_tool()` — Vercel AI SDK (TS only)
- [ ] `.asOpenAITool()` / `.as_openai_tool()` — OpenAI function calling
- [ ] `.asAnthropicTool()` / `.as_anthropic_tool()` — Anthropic tool_use
- [ ] `.asMCPServer()` / `.as_mcp_server()` — MCP server
- [ ] `.asLangChainTool()` / `.as_langchain_tool()` — LangChain

### Phase 5: Polish + Ship (Weeks 10–11)

- [ ] README for both packages
- [ ] `npm publish` + `pip publish`
- [ ] Example projects
- [ ] Performance benchmarks

---

## Future Extensions (Post-MVP)

- **Python packages in WASM:** Bundle numpy, pandas via Pyodide micropip for the TS version.
- **Browser build:** JS + SQL + Bash only (no Python, no real FS — uses InMemoryFs).
- **Persistent sessions:** Serialize Runtime state for conversation continuity across HTTP requests.
- **GPU/native tier:** Paid hosted version with real containers for heavy workloads.
- **Custom language plugins:** API for adding new engine types (R, Ruby, Go via TinyGo WASM).
- **`include`/`exclude` globs:** Control which files are synced to WASM engines for large directories.
