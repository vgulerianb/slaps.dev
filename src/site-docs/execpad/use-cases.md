# Use cases & examples

Patterns that work well with **agentpad** in agents, CI, and local tools. Every snippet targets a real directory (`Runtime` root).

**Automated tests:** the Node build uses **Vitest**; Python uses **pytest** in the [agentpad (execpad) repo](https://github.com/vgulerianb/execpad). With that clone next to [slaps.dev](https://github.com/vgulerianb/slaps.dev), run `npm run test:packages` at the site root to run agentpad + stubfetch (JS + Python) where clones exist.

---

## Building agents with agentpad

**agentpad** is the **workspace runtime** your agent calls when it needs to run shell, Python, Node, or SQL against a **real checkout** (customer repo, task sandbox, or CI workspace). Typical flow:

1. Create one **`Runtime(root)`** per session (or per task), with **`readonly`**, **`overlay`**, and **`limits`** chosen for trust level.
2. Register **`asOpenAITool()` / `as_openai_tool()`** (or your provider’s equivalent) so the model emits **`{ language, code }`**.
3. On each tool call, run **`executeToolCall` / `execute_tool_call`**, then append **stdout / stderr / exit code / changed files** back into the chat (truncate large output—see [Configuration](configuration.md)).

### Wire the model’s `execute_code` tool to `Runtime`

{% ts %}
```ts
import type { RunResult } from "agentpad";
import { Runtime } from "agentpad";

/** Call this when the chat API returns a tool_call for `execute_code`. */
export async function dispatchExecuteCode(
  rt: Runtime,
  args: { language: "bash" | "python" | "javascript" | "sql"; code: string },
): Promise<RunResult> {
  return rt.executeToolCall({ language: args.language, code: args.code });
}

// When building tools[] for the model, reuse the schema from the runtime:
const rt = new Runtime("./agent-workspace", { overlay: true, limits: { timeoutMs: 60_000 } });
const executeCodeTool = rt.asOpenAITool();
// Pass `executeCodeTool` in your `tools` array alongside your other agent tools.
```
{% /ts %}

{% py %}
```python
from agentpad import Runtime, RunResult


def dispatch_execute_code(rt: Runtime, args: dict) -> RunResult:
    """Call when the model returns a tool call for execute_code."""
    return rt.execute_tool_call(
        {"language": args["language"], "code": args["code"]}
    )


rt = Runtime("./agent-workspace", overlay=True, limits={"timeout_ms": 60_000})
tool_schema = rt.as_openai_tool()
# Pass `tool_schema` in your provider’s tools list.
```
{% /py %}

### Feed results back to the agent

Agents need **grounding**: after each run, stringify a short summary (trim stdout, cap file list). Example shape:

{% ts %}
```ts
import type { RunResult } from "agentpad";

function summarizeForAgent(r: RunResult, maxChars = 4000) {
  const out = (r.stdout + r.stderr).slice(0, maxChars);
  const files = r.files.slice(0, 20).map((f) => `${f.type} ${f.path}`);
  return JSON.stringify({
    exitCode: r.exitCode,
    output: out,
    truncated: r.truncated,
    files,
  });
}
```
{% /ts %}

{% py %}
```python
import json
from agentpad import RunResult


def summarize_for_agent(r: RunResult, max_chars: int = 4000) -> str:
    blob = (r.stdout + r.stderr)[:max_chars]
    files = [f"{f.type} {f.path}" for f in r.files[:20]]
    return json.dumps(
        {
            "exit_code": r.exit_code,
            "output": blob,
            "truncated": r.truncated,
            "files": files,
        }
    )
```
{% /py %}

### Speculative agent edits (overlay)

Let the agent **`run`** destructive commands on a **copy**; only **`apply()`** when a human or policy gate approves—see **§3 Safe edits** below.

### Security reminder

agentpad runs **real processes** with the host user’s privileges. Use **read-only** or **overlay** for untrusted prompts, tight **timeouts**, and never expose **`Runtime`** directly on the public internet without another boundary—see [Security](security.md).

---

## 1. CI: run checks in the repo

{% ts %}
```ts
import { Runtime } from "agentpad";

const rt = new Runtime(process.cwd(), { readonly: true });

const r = await rt.run("bash", "npm test", {
  cwd: ".",
  timeoutMs: 120_000,
});

console.log(r.exitCode === 0 ? "ok" : "failed", r.stdout.slice(0, 500));
rt.close();
```
{% /ts %}

{% py %}
```python
from agentpad import Runtime

rt = Runtime(".", readonly=True)
r = rt.run("bash", "pytest -q", cwd=".")
print("ok" if r.exit_code == 0 else "failed", r.stdout[:500])
rt.close()
```
{% /py %}

Use **read-only** when you only need to verify the tree, not mutate it.

---

## 2. Agent: run Python and read a file from the workspace

{% ts %}
```ts
import { Runtime } from "agentpad";

const rt = new Runtime("./my-service");

const r = await rt.run(
  "python",
  `import json, pathlib
p = pathlib.Path("package.json")
print(json.dumps({"name": json.loads(p.read_text())["name"]}))`,
);

console.log(JSON.parse(r.stdout));
console.log(r.files); // created / modified / deleted under the workspace

rt.close();
```
{% /ts %}

{% py %}
```python
import json
from agentpad import Runtime

rt = Runtime("./my-service")
r = rt.run(
    "python",
    '''import json, pathlib
p = pathlib.Path("package.json")
print(json.dumps({"name": json.loads(p.read_text())["name"]}))''',
)
print(json.loads(r.stdout))
print([f.path for f in r.files])
rt.close()
```
{% /py %}

---

## 3. Safe edits: overlay, then `apply()`

Run destructive commands against a **temp copy** of the project; merge back when satisfied.

{% ts %}
```ts
import { Runtime } from "agentpad";

const rt = new Runtime("./app", { overlay: true });

await rt.run("bash", 'echo "patched" > config.local.env');
// Live tree under ./app is unchanged until:
rt.apply();
rt.close();
```
{% /ts %}

{% py %}
```python
from agentpad import Runtime

rt = Runtime("./app", overlay=True)
rt.run("bash", 'echo "patched" > config.local.env')
rt.apply()
rt.close()
```
{% /py %}

---

## 4. Audit trail: session run log

{% ts %}
```ts
import { Runtime, exportRunLogJSON } from "agentpad";

const rt = new Runtime("./repo", {
  runLog: true,
  runLogMaxEntries: 50,
  onRun: (e) => {
    if (e.stderr) console.warn(e.id, e.stderr);
  },
});

await rt.run("python", "print('hello')");
console.log(exportRunLogJSON(rt.getRunLog()));

rt.clearRunLog();
rt.close();
```
{% /ts %}

{% py %}
```python
from agentpad import Runtime, export_run_log_json

def on_run(e):
    if e.stderr:
        print(e.id, e.stderr)

rt = Runtime("./repo", run_log=True, run_log_max_entries=50, on_run=on_run)
rt.run("python", "print('hello')")
print(export_run_log_json(rt.get_run_log()))
rt.clear_run_log()
rt.close()
```
{% /py %}

---

## 5. OpenAI-style tool calling

Same **function schema** shape in both languages; wire the returned JSON into your model, then dispatch with `executeToolCall` / `execute_tool_call`.

{% ts %}
```ts
import { Runtime } from "agentpad";

const rt = new Runtime("./workspace");
const tool = rt.asOpenAITool();

// Pass `tool` to the chat API as a tool definition, then:
const result = await rt.executeToolCall({
  language: "python",
  code: "print(len(open('README.md').read()))",
});

console.log(result.stdout, result.exitCode);
rt.close();
```
{% /ts %}

{% py %}
```python
from agentpad import Runtime

rt = Runtime("./workspace")
tool = rt.as_openai_tool()

# Pass `tool` to your model; when it returns a tool call dict:
result = rt.execute_tool_call(
    {"language": "python", "code": "print(len(open('README.md').read()))"}
)
print(result.stdout, result.exit_code)
rt.close()
```
{% /py %}

---

## Next steps

- [Configuration](configuration.md) — limits, globs, run log options
- [API reference](api-reference.md) — full types and methods
- [Security](security.md) — threat model before exposing to untrusted agents
