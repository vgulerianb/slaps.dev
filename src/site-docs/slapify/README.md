# Slapify

**AI-powered browser automation** — run autonomous agents, execute natural-language test flows, and audit web performance from a single CLI and Node.js SDK.

## Install

```bash
npx slapify init
```

Or as a project dependency:

```bash
npm install slapify
```

Requires **Node.js 18+** and an LLM API key (OpenAI, Anthropic, or any compatible provider).

## Quick start

```bash
# Run an autonomous browser task
slapify task "Summarise the top posts on x.com today" --report

# Execute a .flow test file
slapify run tests/checkout.flow --report
```

## Modes

| Mode | Description |
|------|-------------|
| **Task** | Autonomous AI agent — plan, navigate, and act end-to-end in the browser |
| **Run** | Execute `.flow` files — natural-language step-by-step test scripts |
| **Programmatic** | Node.js SDK for custom auditing and deep CI/CD integration |

## Documentation

| Doc | Contents |
|-----|----------|
| [Getting started](getting-started.md) | Install, LLM setup, first run |
| [Task mode](task-mode.md) | Autonomous agent, screenshots, reports, flags |
| [Flow mode](flow-mode.md) | `.flow` format, step syntax, CI exit codes |
| [API reference](api-reference.md) | `BrowserAgent`, `runPerfAudit`, programmatic SDK |
