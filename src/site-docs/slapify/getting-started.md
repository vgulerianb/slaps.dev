# Getting started

## Install

```bash
npx slapify init
```

This scaffolds a config file and installs the required browser binaries via Playwright.

## Set your LLM provider

Slapify is LLM-provider agnostic. Export the appropriate key before running:

```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...
```

## Run your first autonomous task

```bash
slapify task "Go to github.com/trending and summarise the top 5 repos" --report
```

Slapify will:

1. Launch a browser (headless by default)
2. Plan a series of steps to accomplish the goal
3. Navigate, click, and type autonomously using screenshot-driven reasoning
4. Generate an HTML report with screenshots when `--report` is passed

## Run a flow test

```bash
slapify run tests/smoke.flow --report
```

A `.flow` file is a plain-text script describing a user journey:

```
Navigate to https://example.com
Click "Sign in"
Type "user@example.com" in the email field
Click the submit button
Assert the page contains "Welcome"
```

## Programmatic usage

```ts
import { BrowserAgent, runPerfAudit } from "slapify";

const agent = new BrowserAgent();
await agent.launch();

const result = await runPerfAudit("https://example.com", agent);
console.log(result.scores);

await agent.close();
```

## Next steps

- [Task mode](task-mode.md) for autonomous agent flags and report format
- [Flow mode](flow-mode.md) for the `.flow` file format and CI setup
- [API reference](api-reference.md) for the full Node.js SDK
