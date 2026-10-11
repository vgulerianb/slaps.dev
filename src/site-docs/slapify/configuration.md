# Configuration

Slapify reads `.slapify/config.yaml`, found by walking up from the current directory. `slapify init` writes a starting file. Only `llm` is required. From code, inline config passed to `createAgent()` or `runTask()` is laid over this file, and is enough on its own when it includes `llm`.

## Environment variables

Any string value can reference an environment variable as `${NAME}`. It is replaced when the file is loaded, and an unset variable becomes an empty string. The same applies to `credentials.yaml`. The CLI also loads a `.env` file from the current directory.

```yaml
api_key: ${ANTHROPIC_API_KEY}
```

## Full reference

Every top-level key, with defaults in comments:

```yaml
# ── Model (required) ───────────────────────────────────────────────
# One model, or an ordered fallback list (see Models and subscriptions).
llm:
  - provider: anthropic          # anthropic | openai | google | mistral | groq | ollama | claude-cli | codex
    model: claude-sonnet-4-6
    api_key: ${ANTHROPIC_API_KEY}
    # base_url: https://...      # anthropic, openai (compatible gateways) and ollama
    label: Claude (primary)      # optional name shown in fallback logs
  - provider: claude-cli
    model: sonnet                # sonnet | opus | haiku | a full model id
    # cli_path: claude           # claude-cli only: path to the binary (default: claude on PATH)
    # timeout_seconds: 600       # claude-cli and codex: max seconds per call (default 600)
  - provider: codex
    model: gpt-5.4-mini
    # reasoning_effort: medium   # codex only: minimal | low | medium | high (default: the model's own)

# ── Browser ────────────────────────────────────────────────────────
browser:
  headless: true                 # default true
  timeout: 30000                 # ms per browser command (default 30000)
  viewport:
    width: 1280                  # default 1280 x 720
    height: 720
  # executablePath: /path/to/chrome   # use an installed Chrome or Chromium
  stealth: true                  # hide automation fingerprints (default off; init turns it on)
  profile: .slapify/browser-profile   # persistent Chromium profile: cookies, storage, 2FA survive restarts
  # userAgent: "Mozilla/5.0 ..."  # only to override; stealth derives one from the real browser
  args:                          # extra Chromium launch args
    - "--no-sandbox"
  # audio: false                 # let a headless browser play sound (headless is muted by default)
  # browserbase:                 # use a Browserbase cloud browser instead of a local one
  #   api_key: ${BROWSERBASE_API_KEY}
  #   project_id: ${BROWSERBASE_PROJECT_ID}   # optional

# ── Seeing the page ────────────────────────────────────────────────
vision: false                    # send screenshots to the model as images (default off)

# ── Typed text ─────────────────────────────────────────────────────
text_filters:                    # literal find-and-replace on everything the agent types, in order
  " \u2014 ": ", "
  "\u2014": ", "

# ── Decision model (optional) ──────────────────────────────────────
jev:
  enabled: true                  # off unless set
  provider: typesafe             # typesafe | vercel | openrouter | openai
  api_key: ${TYPESAFE_API_KEY}
  # model, base_url, path, protocol: override the provider's defaults
  min_confidence: 0.7            # default 0.7
  timeout_ms: 10000              # default 10000
  use:
    tools: true                  # find_element, check, pursue
    interruption_gate: true      # flow runner popup check
    verify_fast_path: true       # flow runner Verify steps

# ── Review irreversible actions (optional) ─────────────────────────
review:
  enabled: true                  # default off
  policy: |
    Replies must be on-topic, friendly and free of made-up facts.
    Never buy anything or delete anything.
  on_unavailable: hold           # hold (default) | allow
  fallback: llm                  # llm (default) | none
  min_confidence: 0.4            # Jev margin below which the LLM gives a second opinion (default 0.4)

# ── File sandbox ───────────────────────────────────────────────────
files:
  uploads_dir: .slapify/uploads      # only files here (or in downloads_dir) can be uploaded
  downloads_dir: .slapify/downloads  # downloads are saved here

# ── Ultrafast mode (slapify fast) ──────────────────────────────────
fast:
  max_actions: 60                # default 60
  max_decisions: 120             # default 120
  # text_llm:                    # model for field values (default: the first llm)
  #   provider: groq
  #   model: llama-3.3-70b-versatile
  #   api_key: ${GROQ_API_KEY}

# ── Flow reports ───────────────────────────────────────────────────
report:
  format: html                   # html | markdown | json (loader default markdown; init writes html)
  screenshots: true              # default true
  output_dir: ./test-reports     # default ./test-reports

# ── Extensions ─────────────────────────────────────────────────────
plugins:
  rules:                         # markdown files appended to the agent's system prompt
    - rules/my-persona.md
  tools:                         # modules exporting Vercel AI SDK tool() definitions
    - tools/query_database.js

# ── Telegram ───────────────────────────────────────────────────────
telegram:
  bot_token: ${TELEGRAM_BOT_TOKEN}
  allowed_chat_id: 123456789     # optional: only accept messages from this chat
```

## Notes by section

**`llm`.** Provider details, defaults and the fallback rules are in [Models and subscriptions](models.md). The fallback list is used for task-mode turns; review, flows and fast mode use the first entry.

**`browser`.** `stealth` and `profile` are explained in [Task mode](task-mode.md). `--headed` on the command line overrides `headless`, and `--stealth` / `--no-stealth` override `stealth`. In 0.0.23 the task agent does not pass `audio` or `browserbase` to the browser; flows (`slapify run`) and `slapify fast` use the whole `browser` block.

**`vision`.** See [Task mode](task-mode.md). Works with every provider; `claude-cli` describes images through a separate call.

**`text_filters`.** Applied in the `type` tool and to values typed by `slapify fast`. List longer patterns first. See [Harness and safety](harness.md).

**`jev`, `fast`.** See [Decision models and fast mode](decision-models.md).

**`review`, `files`.** See [Harness and safety](harness.md). Relative `files` paths resolve from the folder that contains `.slapify`.

**`report`.** Controls flow reports. `slapify run --report` writes a report folder under `--output` (default `./test-reports`). Task reports always go to `slapify-task-reports/`.

**`plugins`.** Paths resolve from the `.slapify` folder. Each tools module must export objects with `parameters` and `execute`, as `tool()` from the `ai` package produces; they are offered to the agent next to its own tools and count as `mutate` actions. Node must be able to import the file, so plain `.js` is the safe choice. In 0.0.23 rule files fail to load with a "require is not defined" warning; tools are unaffected.

```js
// .slapify/tools/database.js
import { tool } from "ai";
import { z } from "zod";

export const queryProdDB = tool({
  description: "Execute a read-only SQL query.",
  parameters: z.object({ sql: z.string() }),
  execute: async ({ sql }) => ({ rows: [{ id: 1 }] }),
});
```

**`telegram`.** What the agent sends and how live instructions work is in [Task mode](task-mode.md). Without `allowed_chat_id`, any chat that messages the bot can instruct it.

## `credentials.yaml`

`.slapify/credentials.yaml` holds login profiles for task mode and flows. Init adds it to `.slapify/.gitignore`.

```yaml
profiles:
  default:
    type: login-form
    username: ${TEST_USERNAME}
    password: ${TEST_PASSWORD}

  admin:
    type: login-form
    email: admin@example.com      # task mode uses username, then email, then phone
    password: ${ADMIN_PASSWORD}

  # Skip the login form: inject an existing session
  my-session:
    type: inject
    cookies:
      - name: auth_token
        value: ${AUTH_TOKEN}
    localStorage:
      user_id: "12345"
      theme: dark
    sessionStorage:
      session_token: ${SESSION_TOKEN}
```

| Type | Fields used | How it is applied |
|------|-------------|-------------------|
| `login-form` | `username` (or `email`, `phone`), `password` | The login form is found, filled and submitted |
| `inject` | `cookies` (`name`, `value`), `localStorage`, `sessionStorage` | Set on the page that is open, then the page reloads. Cookie `domain` and `path` are accepted but not applied in 0.0.23 |

The schema also accepts `oauth`, `otp` and `headers` types and the fields `totp_secret`, `fixed_otp`, `backup_codes` and `headers`; 0.0.23 does not act on them. The agent writes new profiles here with `save_credentials`, and `slapify credentials` lists them.
