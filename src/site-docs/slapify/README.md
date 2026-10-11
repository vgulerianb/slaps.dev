# Slapify

Slapify is a fully autonomous browser agent. Give it a goal in plain English and it does what a person at a keyboard would: reads pages, clicks, types, logs in, fills forms, uploads and downloads files, works across tabs, and keeps going until the goal is done. A run can last a few seconds or several days: the agent can schedule itself, sleep between cycles, remember what it has done, and report to you on Telegram.

The same package also runs plain-English end-to-end test flows (`.flow` files) and performance audits, from the CLI or from Node.js.

It is built to be left alone. Every action has a contract, irreversible actions (posting, sending, buying) can be reviewed against your own policy before they run, repeated failures get guidance instead of dead ends, and an LLM outage makes the run wait rather than exit.

## Install

```bash
npm install -g slapify

# or run without installing
npx slapify init
```

Requires Node.js 18 or later. The current release on npm is 0.0.23.

## Quick start

```bash
# 1. Create .slapify/config.yaml (pick a provider, a model and a browser)
npx slapify init

# 2. Give the agent a goal
npx slapify task "Find three well-reviewed ramen places near Union Square open after 10pm and put them in ramen.json"
```

From code:

```ts
import { createAgent } from "slapify";

const agent = createAgent({ stealth: true });
const run = await agent.run("Check the status of my last three orders on example-shop.com");
console.log(run.finalSummary);
```

## Modes

| Mode | Entry point | What it does |
|------|-------------|--------------|
| **Task** | `slapify task "<goal>"` | The autonomous agent. It plans, browses, logs in, schedules itself and remembers state across runs until the goal is met. |
| **Run** | `slapify run tests/` | Executes `.flow` files: plain-English E2E steps with auto-dismissed popups, retries, screenshots and HTML reports. Exits non-zero on failure. |
| **Programmatic** | `createAgent()`, `runTask()`, `Slapify` | The same agent and flow runner from JavaScript or TypeScript, with inline config, event streaming and resumable sessions. |

Two more commands: `slapify fast` lets a decision model drive simple click-and-fill goals in seconds, and `slapify server` keeps an agent online that takes new goals from Telegram.

## Run it on a subscription or any API

| You have | Provider | Setup |
|----------|----------|-------|
| Claude Pro or Max | `claude-cli` | Install Claude Code, log in once, pick "Claude Code CLI" in `slapify init`. Each turn runs through `claude -p`. |
| ChatGPT Plus, Pro or Business | `codex` | Run `npx slapify login codex` and pick "ChatGPT plan (Codex)" in init. |
| An API key | `anthropic`, `openai`, `google`, `mistral`, `groq` | Set the key in your environment and reference it from config. |
| A local model | `ollama` | Point `base_url` at your Ollama server. |

`llm` can be a list. When one model is rate-limited or out of quota, the agent moves to the next, and when every model is down it waits and retries. See [Models and subscriptions](models.md).

## Documentation

| Page | Contents |
|------|----------|
| [Getting started](getting-started.md) | Requirements, `slapify init`, the `.slapify` folder, first task, first flow, reports and recordings |
| [Task mode](task-mode.md) | Every `slapify task` flag, sessions, persistent runs, structured output, the agent's tools, login, Telegram, stealth, vision |
| [Models and subscriptions](models.md) | API providers, fallback chains, Claude via `claude-cli`, ChatGPT via `codex`, how they compare |
| [Harness and safety](harness.md) | Tool contracts, admission, action review, recovery, compaction, file sandbox, running unattended |
| [Decision models and fast mode](decision-models.md) | Jev, OpenAI Decisions, `slapify fast` |
| [Flow mode](flow-mode.md) | `.flow` syntax, `slapify run` flags, credentials in flows, CI exit codes, generating flows |
| [Configuration](configuration.md) | Annotated `.slapify/config.yaml` reference and `credentials.yaml` |
| [API reference](api-reference.md) | `createAgent`, `runTask`, `runFast`, sessions, the `Slapify` class, `BrowserAgent`, exported types |
