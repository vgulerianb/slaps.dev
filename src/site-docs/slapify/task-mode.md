# Task mode

`slapify task` runs the autonomous agent. You give it a goal; it decides what to do, does it in a real browser, and keeps going until the goal is met, you stop it, or a limit is reached.

```bash
slapify task [options] [goal]
```

Each turn, the model sees the goal, the conversation so far and the results of its last tool calls, and answers with more tool calls. It reads pages as an accessibility snapshot of interactive elements, each with a ref it can click or type into, and reads body text separately when it needs the content. It sees screenshots only when vision is on. Before a call runs, the harness classifies it, applies admission rules and, for irreversible actions, an optional policy review. See [Harness and safety](harness.md).

## Flags

| Flag | Description |
|------|-------------|
| `--headed` | Show the browser window |
| `--stealth` | Hide automation fingerprints (overrides `browser.stealth`) |
| `--no-stealth` | Disable stealth even if `browser.stealth` is set |
| `--persistent` | Run until stopped: the agent cannot end the task itself |
| `--time-limit <minutes>` | Stop the task after this many minutes, enforced by the harness |
| `--record <dir>` | Record the run: annotated frames, `video.webm` (with ffmpeg) and `replay.html` |
| `--live [port]` | With `--record`: watch the browser live at `http://127.0.0.1:<port>/` (default 8790) |
| `--debug` | Show all tool calls and internal steps |
| `--report` | Generate an HTML report after the task completes |
| `--save-flow` | Save agent steps as a reusable `.flow` file when done |
| `--session <id>` | Resume an existing task session |
| `--memory-from <id>` | Start a new session, with the goal given now, that inherits another session's memory |
| `--list-sessions` | List all task sessions |
| `--logs <id>` | Show logs for a task session |
| `--max-iterations <n>` | Safety cap on agent loop iterations (default 400) |
| `--schema <json-or-file>` | JSON Schema (inline JSON string or path to a `.json` file) the agent should use to structure its output |
| `--output <file>` | File path to write structured JSON output to (used together with `--schema`) |

`--report` writes `slapify-task-reports/<session-id>.html`, also when you press Ctrl+C or the run fails. `--save-flow` writes `<goal-slug>.flow` in the current directory; use `slapify generate --dir` to choose the folder. The command exits `1` when the run fails with an error.

## Sessions

Every run is a session with its own memory and event log, saved in `.slapify/tasks/` under the current directory.

```bash
slapify task --list-sessions                       # newest first, with status and iterations
slapify task --logs <id>                           # the session's event log
slapify task --session <id>                        # resume; the stored goal is used if you give none
slapify task "Reply to anything new" --memory-from <id>
```

- `--session` restores the session's memory **and** its conversation history. Anything you told it earlier in that session, for example over Telegram, comes back too. The browser is new, so the agent is told every old element ref is stale and to get fresh ones.
- `--memory-from` starts a clean session with the new goal and copies only the other session's memory. Use it when you want a fresh start that still knows the thread URL or the last item it handled.

## Long and persistent runs

| You want | Use |
|----------|-----|
| A fixed time budget | `--time-limit 30` (minutes; decimals work). The harness checks it before each turn, so a turn already running, such as a long `sleep_until`, finishes first. The run then ends as completed. |
| A task that never ends on its own | `--persistent`. `done()` is refused, a reply without tool calls counts as a pause, and each `sleep_until` ends a cycle and compacts the history so cost per turn stays flat for days. |
| More turns | `--max-iterations` (default 400). One turn is one iteration. Reaching the cap ends the run as failed. |

For runs measured in days, see [Running long tasks unattended](harness.md).

## Scheduling and memory

The agent manages time itself:

- `schedule(cron, task_description)` registers a cron job, for example `*/30 * * * *`. If the agent finishes with jobs registered, the process stays alive. Each firing runs as a new session that inherits a copy of the memory and cannot schedule again.
- `sleep_until(until)` pauses in place. `until` is an ISO time or a phrase such as `5 minutes`, `2 hours` or `tomorrow 9am`.
- `remember(key, value)`, `recall(key)` and `list_memories()` keep facts in the session's memory, which survives resumes. Keep values to a line each; long values make responses long enough to be cut off.

## Structured output

```bash
slapify task "Get the top 5 HN posts and their URLs" \
  --schema '{"type":"object","properties":{"posts":{"type":"array"}}}' \
  --output hn.json
```

The schema goes into the system prompt and the agent records data with `write_output(data, mode)`. In the default `append` mode, data is pushed onto an array value or merged into an object value (array properties with the same key are concatenated); `overwrite` replaces it. The file is rewritten on every call. Data builds up within one session: a new session starts empty, so its first write replaces the file, while `--session` continues from the saved value. From code, the same data is on `session.structuredOutput`.

## The agent's tools

| Purpose | Tools |
|---------|-------|
| Reading | `get_page_state`, `get_page_text`, `get_links`, `fetch_url`, `perf_audit` |
| Acting | `navigate`, `click`, `type`, `press`, `hover`, `double_click`, `set_checked`, `select_option`, `drag`, `scroll`, `wait`, `reload`, `go_back` |
| Files and tabs | `upload_file`, `download_file`, `list_tabs`, `switch_tab`, `close_tab` |
| Auth | `list_credential_profiles`, `inject_credentials`, `fill_login_form`, `save_credentials`, `solve_captcha` |
| Memory and scheduling | `remember`, `recall`, `list_memories`, `schedule`, `sleep_until` |
| Talking to you | `status_update`, `ask_user`, `write_output`, `done` |
| Vision | `screenshot(look_for)` |
| Direct input and pursue | `click_at`, `hold_keys`, `move_mouse`; `pursue` when Jev and vision are both on |
| Jev (when `jev.enabled`) | `find_element`, `check` |

What is worth knowing about them:

- `get_page_state` lists interactive elements only. To read posts, articles or results the agent calls `get_page_text` (up to 30,000 characters). `get_links` is the only way to see URLs, so it can go straight to an item.
- `fetch_url` makes a direct HTTP GET with a Chrome TLS fingerprint. It is faster than the browser for APIs and pages that block automation.
- `set_checked` is idempotent; `select_option` drives native `select` dropdowns.
- `upload_file` only accepts files inside the uploads or downloads folder; `download_file` saves into the downloads folder under a sanitized name and never overwrites. See [Harness and safety](harness.md).
- Clicks rewrite `target="_blank"` links and `window.open` to stay in the same tab. The tab tools handle windows that open anyway, such as OAuth sign-in.
- Direct input is for canvas apps and games: `click_at` and `move_mouse` take viewport coordinates, `hold_keys` sends real key-down and key-up events, and both clicks and held keys accept `look_for` to look at the screen right after. `pursue(goal)` hands a short physical sub-goal ("walk to the red car and get in") to a fast loop where Jev picks each move, up to `max_steps` (default 12).
- `perf_audit(url)` collects FCP, LCP, CLS and TTFB, lab scores (performance, accessibility, SEO, best practices), framework and re-render analysis, and network data. The deep audit runs in a separate browser so the session is not disturbed. Several audits in one task appear as tabs in the report.
- Custom tools listed in `plugins.tools` are offered next to these. See [Configuration](configuration.md).

## Credentials and login

Profiles live in `.slapify/credentials.yaml` (format in [Configuration](configuration.md)). At a login page the agent lists the profiles and picks one: an `inject` profile sets cookies, localStorage and sessionStorage and reloads; a `login-form` profile fills the username (or email, or phone) and password. After a successful login it can call `save_credentials(capture_from_browser: true)` so later runs skip the form. If no profile fits, it asks you with `ask_user` and offers to save what you give it.

`ask_user` prompts in the terminal. With Telegram configured, the question goes there too and the first answer wins, which is how you hand it an OTP from your phone.

## Telegram

```yaml
telegram:
  bot_token: ${TELEGRAM_BOT_TOKEN}
  allowed_chat_id: 123456789   # optional: ignore messages from anyone else
```

With this set, the agent messages you when a task starts or fails, posts every `status_update` and `ask_user`, tells you when review holds an action, and warns you once if the LLM has been unavailable for 10 minutes. Anything you send mid-run is injected as a live instruction. It applies to the current cycle only, unless you say it should last ("from now on...").

`slapify server` starts an agent that waits for instructions over Telegram. Send it a goal, optionally prefixed with `/task`. It accepts `--headed`, `--debug` and `--report`.

## Stealth and browser profiles

`browser.stealth: true` (or `--stealth` for one run) hides common automation tells. It adds `--disable-blink-features=AutomationControlled`, removes `HeadlessChrome` from the User-Agent unless you set `browser.userAgent`, and injects a script that patches a fingerprint only when its value already looks automated: `navigator.webdriver`, a missing `window.chrome`, empty plugins or languages, a software WebGL renderer. On a current Chrome the script usually patches nothing, which leaves nothing to detect. It is not invisible: client-hint headers, worker scopes and timing still differ from a person's browser.

`browser.profile: ".slapify/browser-profile"` keeps a persistent Chromium profile, so cookies, storage and remembered 2FA survive restarts. Combine both for sites with bot detection, and only automate sites you are allowed to.

## Vision

With `vision: true` in config, `screenshot(look_for: "is there an error banner?")` sends the page to the model as an image. Use it for CAPTCHAs, charts, image-only posts and broken layouts; `get_page_text` stays cheaper and exact for text. Only the latest screenshot is kept in context. With `claude-cli`, a separate one-shot `claude -p` call reads the image and returns a description. With vision off, screenshots are saved to disk and the agent is told it cannot see them.

## Text filters

`text_filters` in config is a literal find-and-replace applied inside the `type` tool, after the model writes text and before it reaches the page. Use it for rules that must hold every time, such as never typing an em dash. See [Harness and safety](harness.md).

## Examples

```bash
slapify task "What is the current gold price?"
slapify task "Audit the home, pricing and about pages on vercel.com" --report
slapify task "Log into myapp.com and export my account data" --headed
slapify task "Check https://example.com/status every 5 minutes and tell me if it is down" --persistent
slapify task "Reply to unread Slack DMs with a friendly holding message" --time-limit 20 --record runs/slack
```
