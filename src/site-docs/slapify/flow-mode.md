# Flow mode

Flow mode runs `.flow` files: plain-text E2E tests, one step per line, written in English. Each step is interpreted against the current page and executed in a real browser, with popups dismissed, failed steps retried once and screenshots kept for the report. `slapify run` exits non-zero when a flow fails, so it drops into CI as is.

## The `.flow` format

```text
# tests/checkout.flow
Go to https://myshop.com
[Optional] Close cookie banner
Click "Add to Cart" on the first product
Go to checkout
Log in
Fill shipping address
Click "Place Order"
Verify "Order confirmed" appears
```

- One step per line. Blank lines are ignored.
- A line that starts with `#` is a comment. Comments must be on their own line; text after a step is part of the step.
- Steps run in order. A required step that still fails after its retry stops the flow.

## Step syntax

| Syntax | Example | Behaviour |
|--------|---------|-----------|
| Required step | `Click the login button` | Must pass; retried once after a 1 second wait |
| Optional step | `[Optional] Close popup` | Never retried; a failure or skip does not fail the flow |
| Conditional | `If "Accept cookies" appears, click Accept` | Skipped when the condition does not hold |
| Assertion | `Verify "Welcome" message appears` | Checked against the page. Steps starting with Verify, Check, Confirm, Ensure, Assert or Expect can take the Jev fast path |
| Named credential | `Login with admin credentials` | Logs in with the `admin` profile. `Use admin credentials`, `Inject admin credentials` and `@inject admin` work too |
| Auto credential | `Log in`, `Sign in`, `Log in to github.com` | Picks a profile for the current site (see below) |
| Capture a session | `@debug_wait github` | Pauses so you can log in by hand, then saves the session (see below) |

Anything else is plain English: `Go to`, `Click`, `Fill email with test@example.com`, `Press Enter`, `Scroll down`, and so on.

## What happens on every step

| Automatically | How |
|---------------|-----|
| Cookie banners, popups, chat widgets | Checked before and after each step and dismissed before they block the next one |
| CAPTCHAs | After each step, page signals for reCAPTCHA, hCaptcha and Cloudflare Turnstile trigger an attempt to click the challenge checkbox |
| Credential lookup | Login steps with no profile named pick the best match for the current domain |
| Retry | A failed required step is retried once |

## Verify steps and the Jev fast paths

With a [decision model](decision-models.md) configured, two LLM calls can be skipped:

- **Popup check.** When the decision model says the page clearly has no popup (p < 0.15), the popup-check LLM call is skipped. Switch off with `jev.use.interruption_gate: false`.
- **Verify steps.** When it says a Verify-style step is clearly true (p >= 0.9), the step passes without an LLM call. Anything else, including a likely failure, still goes to the LLM, so a fast path can pass a step but never fail one. Switch off with `jev.use.verify_fast_path: false`.

Results report how many calls were skipped (`TestResult.jev`).

## Credentials in flows

Flows read profiles from `.slapify/credentials.yaml` (format in [Configuration](configuration.md)):

- `login-form` profiles: the runner finds the login form, fills username and password, and submits. (`totp_secret` and `fixed_otp` are accepted in the file but not yet filled in by the flow runner in 0.0.23; use `@debug_wait` to capture a session instead.)
- `inject` profiles set cookies, localStorage and sessionStorage instead of logging in.

For `Log in` with no profile named, the runner picks a profile whose name matches the site (`github` or `github.com` on github.com), then `default`, then the first profile. `slapify credentials` lists your profiles.

`@debug_wait <name>` pauses the flow so you can log in, finish 2FA or accept cookies by hand. Press Enter and the cookies, localStorage and sessionStorage are saved as an `inject` profile named `<name>` in `temp_credentials.yaml`, ready to copy into `.slapify/credentials.yaml`. If an older capture stored storage as JSON strings, `slapify fix-credentials [files...]` repairs it (`--dry-run` to preview).

## `slapify run`

```bash
slapify run [options] [files...]
```

| Flag | Description |
|------|-------------|
| `--headed` | Run browser in headed mode (visible) |
| `--report [format]` | Generate report folder (html, markdown, json) |
| `--output <dir>` | Output directory for reports (default: `./test-reports`) |
| `--credentials <profile>` | Default credentials profile to use |
| `-p, --parallel` | Run tests in parallel |
| `-w, --workers <n>` | Number of parallel workers (default: 4) |
| `--performance` | Run performance audit (scores, real-user metrics, framework and re-render analysis) and include in report |

```bash
slapify run                              # every .flow under ./tests
slapify run tests/login.flow
slapify run tests/ --headed
slapify run tests/ --report --performance
slapify run tests/ --parallel --workers 8
```

Files and directories can be mixed; directories are searched recursively. Screenshots are taken only when `--report` is given. The report is a folder: `<flow>-<timestamp>/report.html` for one flow, `test-suite-<timestamp>/` for several. `--performance` audits the page each flow ends on; in 0.0.23 it applies to sequential runs only, and `--credentials` is accepted but not used by the runner.

## CI and exit codes

| Exit code | When |
|-----------|------|
| `0` | Every flow passed, or no `.flow` files were found |
| `1` | Any flow failed, or the run hit an error (for example, no `.slapify` folder) |

```yaml
# GitHub Actions
- name: Run E2E flows
  run: npx slapify run tests/ --report
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Commit `.slapify/config.yaml` (it references keys as `${VAR}`) and keep `credentials.yaml` out of the repo; supply secrets through the environment. Flows use the first model in your `llm` list. For CI, an API-key provider is the dependable choice; see [Models and subscriptions](models.md).

## Writing and generating flows

| Command | What it does |
|---------|--------------|
| `slapify create <name> [-d dir]` | Prompts for steps line by line and writes `<dir>/<name>.flow` (default dir `tests`) |
| `slapify generate <prompt> [-d dir] [--headed]` | Runs the goal as a task and saves only the steps that actually worked to `<dir>` (default `tests`). Alias: `gen` |
| `slapify task "<goal>" --save-flow` | The same from any task, written to the current directory |
| `slapify fix <file> [--auto] [--headed]` | Runs a failing flow, asks the LLM what went wrong and proposes edits. It applies them after you confirm, or straight away with `--auto`, keeping a backup of the original |
| `slapify validate [files...]` | Checks flow syntax (empty flows, very short steps, conditionals without an action) |
| `slapify list` | Lists flow files |

```bash
slapify generate "test the login flow on github.com"
slapify generate "test checkout on myshop.com" --dir tests/checkout
```

A generated flow comes from a run that really happened, so it reflects the real path through login, CAPTCHAs and dynamic content rather than a guess from a page snapshot. To run flows from code or inside Jest or Vitest, use the `Slapify` class in the [API reference](api-reference.md).
