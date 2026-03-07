# Task mode

Task mode launches an **autonomous AI agent** that plans and executes multi-step browser interactions to achieve a goal described in plain English.

## Basic usage

```bash
slapify task "GOAL" [flags]
```

## Flags

| Flag | Description |
|------|-------------|
| `--report` | Generate an HTML report with screenshots and timing |
| `--url <url>` | Start at a specific URL instead of letting the agent navigate |
| `--model <model>` | Override the LLM model (e.g. `gpt-4o`, `claude-3-5-sonnet`) |
| `--max-steps <n>` | Cap the number of agent steps (default: 30) |
| `--headless` | Run without a visible browser window (default: true) |

## How it works

1. The agent takes a **screenshot** of the current page
2. It sends the screenshot and page accessibility tree to the LLM
3. The LLM selects the next action (click, type, navigate, scroll, extract, etc.)
4. Slapify executes the action via Playwright
5. The loop continues until the goal is met or the step limit is reached

## Examples

```bash
# Extract structured data
slapify task "Go to news.ycombinator.com and list the top 10 story titles"

# Fill and submit a form
slapify task "Sign up at example.com with email test@example.com"

# Competitive research
slapify task "Visit stripe.com/pricing and extract all plan names and prices"

# With a specific start URL and model
slapify task "Find the cheapest MacBook" --url apple.com --model gpt-4o --report
```

## Reports

With `--report`, Slapify saves an HTML file containing:

- Goal statement and final status (success / failure)
- Each step with a screenshot and the action taken
- Total elapsed time and step count
- Performance metrics if a perf audit was requested
