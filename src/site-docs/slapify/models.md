# Models and subscriptions

Slapify needs one LLM to plan and write. It can be an API model, your Claude Pro or Max plan through Claude Code, your ChatGPT plan, or a local model. Set it under `llm` in `.slapify/config.yaml`, as a single model or an ordered fallback list.

## Providers

| Provider | Auth | Init default model | Notes |
|----------|------|--------------------|-------|
| `anthropic` | `api_key` (`ANTHROPIC_API_KEY`) | `claude-sonnet-4-6` | `base_url` supported; `/v1` is appended if missing |
| `openai` | `api_key` (`OPENAI_API_KEY`) | `gpt-5.2` | `base_url` for OpenAI-compatible gateways such as OpenRouter or LiteLLM |
| `google` | `api_key` (`GOOGLE_API_KEY`) | `gemini-3-flash` | |
| `mistral` | `api_key` (`MISTRAL_API_KEY`) | `mistral-small-latest` | |
| `groq` | `api_key` (`GROQ_API_KEY`) | `llama-3.3-70b-versatile` | |
| `ollama` | none | `llama3` | `base_url`, default `http://localhost:11434/v1` |
| `claude-cli` | your Claude Code login | `sonnet` | Claude Pro or Max, through `claude -p` |
| `codex` | `slapify login codex` | `gpt-5.4-mini` | ChatGPT Plus, Pro or Business |

Reference keys with `${VAR}` so they stay out of the file:

```yaml
llm:
  provider: anthropic
  model: claude-sonnet-4-6
  api_key: ${ANTHROPIC_API_KEY}
```

```yaml
# Any OpenAI-compatible endpoint (a gateway, LiteLLM, a proxy)
llm:
  provider: openai
  model: your-model-id
  api_key: ${GATEWAY_API_KEY}
  base_url: https://gateway.example.com/v1
```

With `base_url` set, a trailing `/chat/completions` is removed and compatible mode is used. A leading `openai/` in the model name is always stripped.

```yaml
# Local, no key
llm:
  provider: ollama
  model: llama3
  base_url: http://localhost:11434/v1
```

## Fallback chains

```yaml
llm:
  - provider: anthropic
    model: claude-sonnet-4-6
    api_key: ${ANTHROPIC_API_KEY}
    label: Claude (primary)       # shown in fallback logs
  - provider: openai
    model: gpt-5.2
    api_key: ${OPENAI_API_KEY}
  - provider: codex
    model: gpt-5.4-mini
```

In task mode the agent starts on the first model. A timeout or dropped connection is retried on the same model 3 times (5, 10, then 15 seconds apart) before it moves on. A rate limit, quota, usage limit, billing or auth error moves straight to the next model. The run stays on the new model until that one fails too. When every model has failed, it waits 1, 2, 4, then every 5 minutes and starts again from the first. It never exits for this. See [Harness and safety](harness.md).

The chain is used for agent turns and context compaction. Action review, the flow runner and ultrafast mode's text model use the first entry.

## Claude Pro or Max: `claude-cli`

Runs every agent turn through your local [Claude Code](https://claude.com/claude-code) install, so usage counts against your plan instead of an API bill.

```bash
npm install -g @anthropic-ai/claude-code
claude                 # log in once
claude -p "hi"         # confirm print mode works
npx slapify init       # pick "Claude Code CLI"; init makes a test call
```

```yaml
llm:
  provider: claude-cli
  model: sonnet                 # sonnet, opus, haiku, or a full model id
  # cli_path: /usr/local/bin/claude   # only if claude is not on your PATH
  # timeout_seconds: 600              # max seconds per call (default 600)
```

**How it works.** Each turn is one `claude -p` call with JSON output. `claude -p` returns only text, so tool calling goes through the prompt: the tool schemas are in the system prompt, Claude answers with a `{"tool_calls": [...]}` object, and Slapify parses it and runs the tools.

- Claude Code's own tools are switched off on agent turns (`--tools ""`). With them on, the model stops following the prompt protocol and answers in prose.
- `ANTHROPIC_API_KEY` is removed from the environment of every call, so it always runs on your subscription login.
- A response cut off mid-JSON is repaired and its tool calls recovered, rather than read as a final answer.

**Caveats.**

- A long task makes a call every turn, which uses your plan's allowance. At the limit every call fails at once, with `"duration_api_ms": 0` in the error. Slapify treats that as a provider failure: it moves to the next model in your chain, or waits until the limit resets.
- Each call starts a process, so turns are slower than over the API. Raise `timeout_seconds` if turns legitimately take longer.
- `temperature` and `maxTokens` are ignored with a warning.
- Vision works through a separate one-shot `claude -p` call that reads the screenshot and returns a description.

Claude Code can also drive Slapify as a tool. Allow the command and ask for structured output it can read back:

```bash
claude -p "Run: npx slapify task 'Get the top 5 HN posts with titles and URLs' \
  --schema '{\"type\":\"object\",\"properties\":{\"posts\":{\"type\":\"array\"}}}' \
  --output hn.json, then read hn.json and summarise it." \
  --allowedTools "Bash(npx slapify:*)" "Read"
```

If Slapify itself also uses `claude-cli`, every Slapify turn spawns another `claude -p` call. That works, but an API-key provider is lighter for high-volume scripting.

## ChatGPT plan: `codex`

Runs every agent turn on a ChatGPT Plus, Pro or Business plan. Slapify signs in with ChatGPT itself and calls the Codex endpoint directly: no API key, no `codex` binary, no subprocess per turn.

```bash
npx slapify login codex             # opens your browser, then lists the models your plan can use
npx slapify login codex --status    # who is signed in; exits 1 if nobody
npx slapify login codex --no-browser  # print the sign-in URL instead of opening it
npx slapify logout codex
```

```yaml
llm:
  provider: codex
  model: gpt-5.4-mini              # any model `slapify login codex` lists
  # reasoning_effort: medium       # minimal | low | medium | high (minimal is sent as low)
  # timeout_seconds: 600           # max seconds per request, whole stream included
```

Tools are native function calls, screenshots go in as real images (models marked "no images" in the list cannot take them), and token usage comes back with each response. The endpoint rejects output-length and sampling settings, so `maxTokens`, `temperature` and similar are dropped with a warning.

**What to know.**

- **Tokens** live in `~/.slapify/chatgpt-auth.json` (mode 600). They are refreshed 5 minutes before they expire, rotated refresh tokens are saved, and a refresh that returns a different account is refused. Slapify never reads or writes `~/.codex`.
- **Sign-in** uses a browser OAuth flow with a callback on `localhost:1455` (or `1457` if that port is busy) and times out after 5 minutes.
- **Plan limits apply.** A usage or rate limit is treated like any provider outage: the run moves down the chain or waits, rather than exiting.
- **The endpoint is undocumented** (`chatgpt.com/backend-api/codex/responses`) and can change without notice. Sign-in uses the Codex CLI's public OAuth client, and OpenAI's terms apply to how your plan is used. For automation, OpenAI recommends an API key: use `provider: openai`.
- A ChatGPT sign-in does not cover OpenAI Decisions (`jev.provider: openai`), which needs an API key.

## How they compare

| | API providers | `claude-cli` | `codex` |
|---|---|---|---|
| Billing | Per token | Claude Pro or Max allowance | ChatGPT plan allowance |
| Tool calls | Native | Bridged through the prompt as JSON | Native function calls |
| Images (`vision: true`) | Inline image parts | Separate `claude -p` call returns a description | Inline image parts |
| Usage reporting | From the API | From the CLI's JSON output | From the API response |
| Per-turn overhead | One HTTP request | One process start | One streamed HTTP request |
| Setup | Key in env, `${VAR}` in config | Install Claude Code, log in once | `npx slapify login codex` |
| Best for | Automation, CI, high volume | Personal use on an existing plan | Personal use on an existing plan |
