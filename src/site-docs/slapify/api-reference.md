# API reference

Everything here is exported from the package entry point:

```ts
import { createAgent, runTask, runFast, listSessions, loadSession, Slapify } from "slapify";
```

Config is read from `.slapify/config.yaml` (found by walking up from `process.cwd()`). Inline `config` is laid over it: top-level keys replace the file's, and `browser` is merged one level deep. Inline config with an `llm` works with no config file at all. Sessions are stored in `.slapify/tasks/` under `process.cwd()`.

## `createAgent(options?)`

The simplest way in: the task agent with defaults that apply to every run.

```ts
import { createAgent } from "slapify";

const agent = createAgent({
  config: {
    llm: { provider: "anthropic", model: "claude-sonnet-4-6", api_key: process.env.ANTHROPIC_API_KEY },
    browser: { headless: true, stealth: true },
  },
});

// Run to completion
const run = await agent.run("Go to news.ycombinator.com and return the top 10 headlines");
console.log(run.status, run.finalSummary);

// Stream events as they happen
const stream = agent.stream("Find the cheapest 27-inch 4K monitor on example-store.com");
for await (const event of stream) {
  if (event.type === "status_update") console.log("->", event.message);
  if (event.type === "tool_start") console.log(`  [${event.toolName}]`);
}
console.log((await stream.result).finalSummary);

// Continue an earlier session, memory and history included
await agent.resume(run.id, "Now open the top story and summarise the comments");
```

`options` is `AgentOptions`: every `runTask` option except `goal`, plus `config`. Per-call options override the defaults, and `onEvent` handlers from both are called.

| Method | Returns | Description |
|--------|---------|-------------|
| `run(goal, options?)` | `Promise<TaskSession>` | Run a goal to completion, or until stopped with `persistent` |
| `resume(sessionId, goal, options?)` | `Promise<TaskSession>` | Continue a session with its memory and context |
| `stream(goal, options?)` | `AgentStream` | Async iterable of `TaskEvent`, with `result: Promise<TaskSession>`. A failed run throws from the iterator and rejects `result` |
| `fast(goal, options?)` | `Promise<FastResult>` | Ultrafast mode; options are `FastRunOptions` without `goal` and `config` |
| `sessions()` | `TaskSession[]` | Past sessions, newest first |
| `session(id)` | `TaskSession \| null` | One past session |

## `runTask(options)`

The function underneath `createAgent`. Returns `Promise<TaskSession>` and throws if the run fails (for example, 5 failed turns in a row).

```ts
import { runTask, type TaskEvent } from "slapify";

const session = await runTask({
  goal: "Get the current gold price and record it",
  schema: { type: "object", properties: { price: { type: "number" }, currency: { type: "string" } } },
  outputFile: "gold.json",
  timeLimitMinutes: 10,
  onEvent: (e: TaskEvent) => {
    if (e.type === "status_update") console.log(e.message);
    if (e.type === "done") console.log(e.summary);
  },
  onHumanInput: async (question, hint) => promptUser(question, hint), // your own UI
});
console.log(session.structuredOutput);
```

Key `TaskRunOptions`:

| Option | Type | Description |
|--------|------|-------------|
| `goal` | `string` | The task, in plain English (required) |
| `config` | `Partial<SlapifyConfig>` | Inline config laid over the config file |
| `sessionId` | `string` | Resume this session |
| `headed` | `boolean` | Show the browser |
| `stealth` | `boolean` | Override `browser.stealth` |
| `persistent` | `boolean` | Run until stopped; the agent cannot end the task |
| `timeLimitMinutes` | `number` | Hard time budget, checked before each turn |
| `maxIterations` | `number` | Turn cap (default 400) |
| `record` | `string` | Record into this folder (frames, `video.webm`, `replay.html`) |
| `livePort` | `number` | With `record`: serve a live view on this local port (`0` picks a free one) |
| `schema` / `outputFile` | `object` / `string` | Structured output via `write_output` |
| `saveFlow` / `flowOutputDir` | `boolean` / `string` | Save the steps as a `.flow` file (default: current directory) |
| `inheritedMemory` | `Record<string, string>` | Start a new session with this memory (what `--memory-from` does) |
| `executablePath` | `string` | Browser binary, overriding config |
| `onEvent` | `(e: TaskEvent) => void` | Every event as it happens |
| `onSessionUpdate` | `(s: TaskSession) => void` | Called as the session changes |
| `onHumanInput` | `(question, hint?) => Promise<string>` | Answers `ask_user`. Default: reads stdin, racing Telegram when configured |

### `TaskSession`

`id`, `goal`, `status` (`"running" | "completed" | "failed" | "sleeping" | "scheduled"`), `createdAt`, `updatedAt`, `iteration`, `memory: Record<string, string>`, `scheduledJobs`, `finalSummary?`, `savedFlowPath?`, `perfAudits?` (one entry per `perf_audit` call), `structuredOutput?`.

### `TaskEvent`

| `type` | Fields |
|--------|--------|
| `thinking` | none |
| `tool_start` | `toolName`, `args` |
| `tool_done` | `toolName`, `result` (first 200 characters) |
| `tool_error` | `toolName`, `error` |
| `message` | `text` (model text and harness notices) |
| `status_update` | `message` |
| `human_input_needed` | `question`, `hint?` |
| `credentials_saved` | `profileName`, `credType` |
| `scheduled` | `cron`, `task` |
| `sleeping` | `until` |
| `flow_saved` | `path` |
| `output_written` | `path`, `data` |
| `done` | `summary` |
| `error` | `error` |

## `listSessions()` and `loadSession(id)`

`listSessions(): TaskSession[]` returns every session in `.slapify/tasks/`, newest first. `loadSession(id): TaskSession | null` loads one.

## `runFast(options)`

Ultrafast mode. Needs `jev` in config. See [Decision models and fast mode](decision-models.md).

```ts
import { runFast } from "slapify";

const res = await runFast({
  goal: "Find a waterproof jacket under $150 and add it to the cart in size M",
  url: "https://shop.example",
  onEvent: (e) => { if (e.type === "step") console.log(e.step.operation, e.step.label ?? ""); },
});
console.log(res.status, res.reason, `${res.elapsedMs}ms`);
```

| `FastRunOptions` | Description |
|------------------|-------------|
| `goal` | The goal (required) |
| `url` | Page to start on |
| `config`, `headed`, `stealth` | As in `runTask` |
| `maxActions`, `maxDecisions` | Budgets (default 60 and 120) |
| `keepOpen` | Leave the browser open afterwards |
| `record` | Record into this folder |
| `onEvent` | `FastEvent`: `observe`, `step`, `verify` or `stop` |

`FastResult`: `status` (`"done" | "blocked" | "limit" | "error"`), `reason`, `steps: FastStep[]`, `decisions`, `textCalls`, `elapsedMs`, `jevMs`, `textMs`, `jevInputTokens`, `finalUrl`, `replay?`. Each `FastStep` has `operation`, `target?`, `label?`, `text?`, `confidence`, `targetConfidence?`, timings, `url`, `pageChanged?` and `note?`.

## `Slapify` (flows)

Runs `.flow` files and inline steps. Also the default export.

```ts
import { Slapify } from "slapify";

const slapify = new Slapify({ configDir: ".slapify" });

const result = await slapify.run(
  ["Go to https://example.com", 'Click "More information"', 'Verify URL contains "iana.org"'],
  "example-test",
);
console.log(result.status, result.passedSteps, result.duration);

const results = await slapify.runMultiple(["tests/"], { parallel: true, workers: 4 });
console.log(slapify.saveSuiteReport(results)); // report folder path
```

Constructor `SlapifyOptions`: `configDir` (load config and credentials from there, with `config` merged over), or `config` with an `llm` (only `llm`, `browser` and `report` are used), plus optional `credentials`. With neither, it loads from the current directory.

| Method | Returns | Description |
|--------|---------|-------------|
| `run(steps, name?, options?)` | `Promise<TestResult>` | Run an array of step strings |
| `runContent(content, name?, options?)` | `Promise<TestResult>` | Run flow text |
| `runFile(path, options?)` | `Promise<TestResult>` | Run a `.flow` file |
| `runFlow(flow, options?)` | `Promise<TestResult>` | Run a parsed `FlowFile` |
| `runMultiple(patterns, options?)` | `Promise<TestResult[]>` | Files or directories; `{ parallel, workers }` |
| `runAll(dir?, options?)` | `Promise<TestResult[]>` | Every flow under `dir` (default `tests`) |
| `generateReport(result)` / `generateSuiteReport(results)` | `string` | Report content in `report.format` |
| `saveReport(result)` / `saveSuiteReport(results)` | `string` | Write an HTML report folder; returns its path |
| `printSummary(result)` | `void` | Print to the console |
| `getConfig()` | `SlapifyConfig` | The resolved config |

`options` (`RunOptions`) take `onTestStart(name, totalSteps)`, `onStep(stepResult, name)` and `onTestComplete(result)`. `TestResult` has `status` (`"passed" | "failed"`), `steps: StepResult[]`, `totalSteps`, `passedSteps`, `failedSteps`, `skippedSteps`, `duration`, `autoHandled`, `assumptions`, and `perfAudit?` and `jev?` when used.

In Jest or Vitest:

```ts
test("user can log in", async () => {
  const result = await new Slapify({ configDir: ".slapify" }).runFile("tests/login.flow");
  expect(result.status).toBe("passed");
}, 120_000);
```

## Performance audits

Audit results arrive on `TaskSession.perfAudits` (task mode, one per `perf_audit` call) and `TestResult.perfAudit` (from `TestRunner.runFlow` with its audit flag, which is what `slapify run --performance` uses). Each result has `url`, `auditedAt`, `vitals` (`fcp`, `lcp`, `cls`, `ttfb`, `domContentLoaded`, `loadComplete`), `scores` (`performance`, `accessibility`, `bestPractices`, `seo`, or `null`), `react` (detection, re-render issues, interaction tests, or `null`) and `network` (sizes, API calls, slow and failed calls, long tasks, memory). The lower-level `runPerfAudit()` function is not exported from the package entry point in 0.0.23.

## `BrowserAgent`

The browser layer the agent uses, over `agent-browser`. Construct it with a `BrowserConfig`; the browser opens on the first `navigate()`.

```ts
import { BrowserAgent } from "slapify";

const browser = new BrowserAgent({ headless: true, stealth: true });
await browser.navigate("https://example.com");
const state = await browser.getState(); // { url, title, snapshot, refs }
console.log(await browser.getPageText());
await browser.close();
```

| Group | Methods |
|-------|---------|
| Navigate | `navigate(url)`, `goBack()`, `goForward()`, `reload()`, `close()` |
| Read | `getState()`, `snapshot()`, `getPageText()`, `getLinks(contains?, limit?)`, `getUrl()`, `getTitle()`, `screenshot(path?, fullPage?)`, `evaluate(script)` |
| Act (by ref) | `click`, `doubleClick`, `fill`, `type`, `press(key)`, `hover`, `select`, `setChecked`, `drag`, `upload`, `download`, `scroll(direction, amount?)`, `wait(msOrCondition)` |
| Tabs | `listTabs()`, `switchTab(id)`, `closeTab(id?)` |
| Session state | `getCookies()`, `setCookie(name, value)`, `getLocalStorage()`, `setLocalStorage(k, v)`, `getSessionStorage()`, `setSessionStorage(k, v)` |
| Setup | `BrowserAgent.isInstalled()`, `BrowserAgent.install()` |

## Lower-level exports

| Export | Purpose |
|--------|---------|
| `TestRunner` | `new TestRunner(config, credentials).runFlow(flow, onStep?, runPerformanceAudit?)`. Closes its browser when done, so use one per flow |
| `AIInterpreter` | Turns a flow step plus page state into actions (`new AIInterpreter(llmConfig)`) |
| `ReportGenerator` | `new ReportGenerator(reportConfig)`: `generate`, `saveAsFolder`, `saveSuiteAsFolder` |
| `loadConfig(dir?)`, `loadCredentials(dir?)`, `getConfigDir()` | Read config the way the CLI does |
| `initConfig(dir?, InitOptions)` | Write a new `.slapify` folder, as `slapify init -y` does |
| `findSystemBrowsers()`, `checkBrowserPath(path)` | Locate installed browsers |
| `parseFlowFile(path)`, `parseFlowContent(text, name?)`, `findFlowFiles(dir)`, `validateFlowFile(flow)`, `getFlowSummary(flow)` | Flow parsing and checks |

## Exported types

`Agent`, `AgentOptions`, `AgentRunOptions`, `AgentStream`, `TaskRunOptions`, `TaskSession`, `TaskEvent`, `TaskStatus`, `FastRunOptions`, `FastResult`, `FastStep`, `FastEvent`, `FastOperation`, `InitOptions`, `SlapifyOptions`, `RunOptions`, `RunMultipleOptions`, `SlapifyConfig`, `LLMConfig`, `BrowserConfig`, `JevConfig`, `ReviewConfig`, `FilesConfig`, `ReportConfig`, `CredentialsConfig`, `CredentialProfile`, `CookieConfig`, `FlowFile`, `FlowStep`, `StepResult`, `ActionLog`, `TestResult`, `BrowserState`, `RefInfo`.
