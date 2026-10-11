# Getting started

## Requirements

- **Node.js 18 or later.**
- **A Chromium-based browser.** `slapify init` finds Chrome, Chromium, Edge or Brave in their usual install locations. If none is found, or you prefer it, Chromium (about 170MB) is downloaded on first run.
- **An LLM**, one of:
  - an API key for Anthropic, OpenAI, Google, Mistral or Groq,
  - [Claude Code](https://claude.com/claude-code) installed and logged in, to run on a Claude Pro or Max plan,
  - a ChatGPT Plus, Pro or Business plan, signed in with `npx slapify login codex`,
  - a local Ollama server.

Browser control goes through [agent-browser](https://www.npmjs.com/package/agent-browser), which installs with Slapify. If it is missing, `slapify install` installs it globally and downloads its browser.

## Install

```bash
npm install -g slapify
# or use npx for every command
npx slapify init
```

## `slapify init`

Run it in your project folder. It asks three things, then writes your config.

**1. LLM provider and model.**

| Choice | Provider | Next prompt |
|--------|----------|-------------|
| 1) Anthropic (Claude), the default | `anthropic` | Pick a model, then the API key step |
| 2) Claude Code CLI | `claude-cli` | Pick `sonnet`, `opus`, `haiku` or a custom id; init makes a test `claude -p` call to confirm your login |
| 3) ChatGPT plan (Codex) | `codex` | Opens your browser to sign in with ChatGPT (skipped if already signed in), then lists the models your plan can use |
| 4) OpenAI | `openai` | Pick a model, then the API key step |
| 5) Google (Gemini) | `google` | Pick a model, then the API key step |
| 6) Mistral, 7) Groq, 8) Ollama | `mistral`, `groq`, `ollama` | Type a model id |

**2. API key** (API providers only). Init looks for the provider's variable (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `MISTRAL_API_KEY` or `GROQ_API_KEY`) and offers a test call. The key is never written to config: config references it as `${ANTHROPIC_API_KEY}` and so on. A key you paste at this prompt is only used for the test, so also export it in your shell or put it in `.env`.

**3. Browser.** Use a browser found on your system, download Chromium on first run, or enter a path.

`npx slapify init -y` skips the prompts and uses the defaults: Anthropic with `claude-sonnet-4-6`.

## The `.slapify` folder

Init creates:

| Path | What it is |
|------|------------|
| `.slapify/config.yaml` | LLM, browser and report settings. Stealth and a persistent browser profile are on by default. See [Configuration](configuration.md). |
| `.slapify/credentials.yaml` | Login profiles. Listed in `.slapify/.gitignore` so it is not committed. |
| `tests/example.flow` | A sample flow. |

These appear as you use it:

| Path | Created by |
|------|------------|
| `.slapify/tasks/` | Every task session: `<id>.json` (state and memory) and `<id>.jsonl` (event log) |
| `.slapify/browser-profile/` | The persistent Chromium profile, when `browser.profile` points here |
| `.slapify/uploads/`, `.slapify/downloads/` | Files the agent may upload, and files it downloads |
| `~/.slapify/chatgpt-auth.json` | ChatGPT sign-in tokens for the `codex` provider |

The CLI finds `.slapify` by walking up from the current directory, and loads a `.env` file from the current directory if there is one.

## Set your key

```bash
export ANTHROPIC_API_KEY=your-key
```

Skip this for `claude-cli` (run `claude` once and sign in) and `codex` (`npx slapify login codex`).

## Your first task

```bash
npx slapify task "Go to news.ycombinator.com and summarise the top 5 stories" --report
```

The agent reads the page, decides what to do, and prints status updates as it goes. When it finishes you get a summary, the session id, anything it saved to memory, and with `--report` an HTML report at `slapify-task-reports/<session-id>.html`. Add `--headed` to watch the browser, or `--debug` to see every tool call. Press Ctrl+C to stop; the report is still written.

See [Task mode](task-mode.md) for everything else a task can do.

## Your first flow

`tests/example.flow`, as created by init (most comments trimmed):

```text
# Example Test - Getting Started with Slapify
Go to https://example.com
Verify page title contains "Example"
[Optional] Close any cookie consent popup
Click on "More information" link
Verify URL contains "iana.org"
```

```bash
npx slapify run tests/example.flow --report
```

Each line is interpreted and executed in the browser. The command prints a pass or fail line per step and exits `1` if any flow fails. See [Flow mode](flow-mode.md).

## Reports and recordings

| What | Command | Where it goes |
|------|---------|---------------|
| Task report | `slapify task "..." --report` | `slapify-task-reports/<session-id>.html`: tool timeline, summaries, perf data |
| Flow report | `slapify run ... --report` | `test-reports/<flow>-<timestamp>/report.html` with screenshots, or `test-suite-<timestamp>/` for several flows |
| Recording | `slapify task "..." --record runs/demo` | `frames/` (annotated screenshot per step), `video.webm`, `steps.json`, `replay.html` |
| Live view | add `--live` to `--record` | `http://127.0.0.1:8790/` while the run is going |

`video.webm` needs ffmpeg. Slapify finds one on your `PATH`, or the copy Playwright downloads.

## Other commands

| Command | What it does |
|---------|--------------|
| `slapify fast <goal>` | Ultrafast mode, driven by a decision model. See [Decision models and fast mode](decision-models.md). |
| `slapify server` | Stay online and take goals from Telegram |
| `slapify login codex` / `slapify logout codex` | Sign in to or out of a ChatGPT plan |
| `slapify create <name>` / `slapify generate <prompt>` | Write a flow by hand, or have the agent run a goal and save the steps that worked |
| `slapify fix <file>` | Analyse a failing flow and suggest or apply fixes (`--auto`, `--headed`) |
| `slapify validate [files...]` / `slapify list` | Check flow syntax / list flow files |
| `slapify credentials` / `slapify fix-credentials` | List credential profiles / repair profiles saved with JSON-string storage |
| `slapify install` | Install `agent-browser` and its browser |
