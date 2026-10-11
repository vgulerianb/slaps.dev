# Decision models and fast mode

A decision model does not plan or write. It answers narrow questions about a page ("which of these elements is the reply box?", "does this page show my reply?") with calibrated probabilities, fast and cheaply. Slapify can use one next to your main LLM to skip LLM turns it does not need, and to drive simple goals on its own in ultrafast mode.

Two backends are supported: [Jev](https://www.browserbase.com/blog/what-is-jev), TypeSafe's decision model, and OpenAI's [Decisions API](https://developers.openai.com/api/docs/guides/decisions). Both are configured under `jev` and both are optional.

## Where it is used

| Where | What the decision model does | When it is not sure |
|-------|------------------------------|---------------------|
| `find_element(description)` (task mode) | Picks the matching ref from the page, or up to 8 refs in one request with `descriptions` | Returns `confident: false`; the agent reads the snapshot and chooses |
| `check(statement)` (task mode) | Probability that a statement about the page is true | Between 0.15 and 0.85 the agent looks for itself |
| `pursue(goal)` (task mode, with vision) | Picks each small move in a game or canvas app | Hands back to the agent |
| Action review | Clear or caution on irreversible actions | The main LLM gives a second opinion |
| Flow runner, popup check | Skips the popup-check LLM call when there is clearly no popup (p < 0.15) | The normal LLM check runs |
| Flow runner, `Verify` steps | Passes clearly true steps without an LLM call (p >= 0.9) | The normal LLM path runs |
| `slapify fast` | Picks every step | See below |

## Providers

| `provider` | Endpoint | Default model | Key |
|------------|----------|---------------|-----|
| `typesafe` | `https://api.typesafe.ai/v1/systemone` | `jev-latest` | From console.typesafe.ai |
| `vercel` | `https://ai-gateway.vercel.sh/typesafe/v1/systemone` | `jev-latest` | Vercel AI Gateway key |
| `openrouter` | `https://openrouter.ai/api/v1/systemone` | `~typesafe/jev-latest` | OpenRouter key |
| `openai` | `https://api.openai.com/v1/decisions` | `gpt-6-luna` | OpenAI API key |

TypeSafe, Vercel AI Gateway and OpenRouter take the same request, so one client covers all three.

## Configuration

```yaml
jev:
  enabled: true                 # off unless set
  provider: typesafe            # typesafe | vercel | openrouter | openai
  api_key: ${TYPESAFE_API_KEY}
  # model: jev-latest           # override the provider's model id
  # base_url: https://proxy.example.com   # override the provider's URL
  # path: /v1/systemone         # request path appended to base_url
  # protocol: systemone         # systemone | decisions; only needed with a custom base_url
  min_confidence: 0.7           # find_element answers below this are not trusted (default 0.7)
  timeout_ms: 10000             # per request, retries included (default 10000)
  use:                          # all default to on when jev is enabled
    tools: true                 # find_element, check and pursue in task mode
    interruption_gate: true     # flow runner: skip popup checks when clearly none
    verify_fast_path: true      # flow runner: pass clearly true Verify steps
```

Action review and `slapify fast` use the decision model whenever one is configured; the `use` switches do not affect them. Review has its own threshold, `review.min_confidence` (see [Harness and safety](harness.md)).

## How fallbacks work

Jev is an accelerator, never a requirement:

- **At startup**, `enabled: true` without an `api_key`, or without a known provider or `base_url`, disables it with a warning. The run carries on without it.
- **Per request**, HTTP 429, 500, 502, 503, 504 and 529 are retried up to twice (honouring `Retry-After`, waiting at most 2 seconds), all within `timeout_ms`. A dropped connection is resent once. A 401 (bad key), a 422 (rejected request) or a timeout is not retried.
- **Any failure or low-confidence answer** sends the caller down its normal path: the agent reads the snapshot itself, review asks the LLM, the flow runner makes its usual LLM call.

The exception is `slapify fast`, which has no LLM to fall back to for decisions: a failed or invalid decision ends the run with status `error`.

## OpenAI Decisions

```yaml
jev:
  enabled: true
  provider: openai
  api_key: ${OPENAI_API_KEY}
```

This uses `gpt-6-luna` through `POST /v1/decisions`. It answers the same three kinds of question with calibrated probabilities, so Slapify translates on the way out and back on the way in:

| Slapify asks | Sent to Decisions as |
|--------------|----------------------|
| Which one (choice) | `choice`, with each option as a value and description |
| Yes or no | `predicate`, with the "true when" and "false when" criteria added to the instructions |
| How much (score) | `score`, with each criterion as a level |

Answers come back in the same shape as Jev's. A refusal, or an answer that does not match its question, is dropped and treated as not confident. Every integration in the table above works with either backend unchanged.

It needs an OpenAI API key; a ChatGPT plan sign-in (`slapify login codex`) does not cover it. If you route through a proxy that fronts OpenAI, set `base_url` and add `protocol: decisions` (and `path` if it differs from `/v1/decisions`).

## Ultrafast mode: `slapify fast`

For goals that are mostly clicking and filling in (search, filter, add to cart, fill a form), the decision model can drive the browser by itself. The LLM is called only to write the text for a field.

```bash
slapify fast "Find a waterproof jacket under $150 and add it to the cart in size M with gift wrap" \
  --url https://shop.example
```

| Flag | Description |
|------|-------------|
| `--url <url>` | Page to start on |
| `--headed` | Show the browser window |
| `--stealth` | Hide automation fingerprints (overrides `browser.stealth`) |
| `--max-actions <n>` | Browser actions before giving up (default 60) |
| `--keep-open` | Leave the browser open afterwards |
| `--record <dir>` | Record the run: annotated frames, `video.webm` (with ffmpeg) and `replay.html` |
| `--json` | Print the full result as JSON |

It needs a `jev` section. The command exits `0` when the goal is done and `1` otherwise.

**How a step works.** Each step is one decision request. It picks the operation (`CLICK`, `TYPE_TEXT`, `SELECT`, `PRESS_ENTER`, `SCROLL_DOWN`, `SCROLL_UP`, `GO_BACK`, `WAIT`, `DONE` or `BLOCKED`) and, in the same request, a target for each of click, type and select, each chosen only from elements compatible with it. The target for the chosen operation is then executed. For `TYPE_TEXT`, the LLM writes the value from the goal; if the goal does not say what belongs in the field, nothing is typed rather than inventing personal details.

```text
   6.1s  CLICK link "Drizzle Rain Jacket"   (43% / 97%, jev 1230ms)
   8.0s  SELECT option "M"                  (62% / 92%, jev 1097ms)
  11.7s  CLICK button "Add to cart"         (98% / 100%, jev 313ms)
```

**What keeps it honest.**

- **Validated answers.** An operation or target outside the offered set never runs.
- **`DONE` has to be verified.** A separate check judges the actions taken plus the page. A rejected claim goes back into the loop; three rejections stop the run as `blocked`.
- **Stops when stuck.** Three actions in a row that change nothing end the run as `blocked`.
- **The agent's guards.** Clicks are checked for stale or covered elements first, an irreversible click that already succeeded on the page is not repeated, irreversible clicks go through review when it is on, and `text_filters` apply to typed values.
- **Budgets.** 60 actions and 120 decisions by default. The run ends as `limit` when either runs out.

Results end as `done`, `blocked`, `limit` or `error`. Budgets and the text model can also be set in config:

```yaml
fast:
  max_actions: 60
  max_decisions: 120
  text_llm:                     # a small, fast model for field values (default: the first llm)
    provider: groq
    model: llama-3.3-70b-versatile
    api_key: ${GROQ_API_KEY}
```

From code: `createAgent().fast(goal, { url })` or `runFast()`. See [API reference](api-reference.md).

**When to use it.** Well-defined flows where the next step is always "which element next". There is no planning model, so open-ended research, writing, or anything that needs judgement beyond the next element belongs in `slapify task`. Use `--keep-open` to leave the browser where fast mode stopped.
