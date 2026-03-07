# API reference

## `BrowserAgent`

Core Playwright wrapper with LLM-driven navigation.

```ts
import { BrowserAgent } from "slapify";

const agent = new BrowserAgent({ model: "gpt-4o" });
await agent.launch();

const result = await agent.task("Click the login button and submit the form");
console.log(result);

await agent.close();
```

### Constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `model` | `string` | `"gpt-4o"` | LLM model identifier |
| `headless` | `boolean` | `true` | Run without visible browser window |
| `maxSteps` | `number` | `30` | Maximum agent steps per task |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `launch()` | `Promise<void>` | Start the browser |
| `task(goal)` | `Promise<TaskResult>` | Execute an autonomous task |
| `navigate(url)` | `Promise<void>` | Navigate to a URL |
| `screenshot()` | `Promise<Buffer>` | Capture current page screenshot |
| `close()` | `Promise<void>` | Close the browser |

## `runPerfAudit`

Run a Lighthouse-style performance audit against a URL.

```ts
import { runPerfAudit, BrowserAgent } from "slapify";

const agent = new BrowserAgent();
await agent.launch();

const result = await runPerfAudit("https://example.com", agent);
console.log(result.scores);
// { performance: 92, accessibility: 87, bestPractices: 100, seo: 83 }

await agent.close();
```

### `AuditResult`

| Property | Type | Description |
|----------|------|-------------|
| `scores` | `object` | Performance, accessibility, best practices, and SEO scores (0–100) |
| `metrics` | `object` | LCP, FID, CLS, TTFB, and other Core Web Vitals |
| `report` | `string` | Full HTML report string |

## `TaskResult`

Returned by `agent.task()`:

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | Whether the goal was achieved |
| `steps` | `StepRecord[]` | Array of steps taken with screenshots |
| `elapsedMs` | `number` | Total wall-clock time |
