# Flow mode

Flow mode executes **`.flow` files** — plain-text scripts that describe browser user journeys step by step. Think Playwright E2E tests, but written in natural language.

## .flow file format

```
# Comments start with #, blank lines are ignored

Navigate to https://example.com
Click "Login"
Type "admin@example.com" in the email field
Type "password123" in the password field
Click the "Sign in" button
Assert the page contains "Dashboard"
Assert the URL contains "/dashboard"
Take a screenshot
```

## Supported step types

| Pattern | Example |
|---------|---------|
| Navigate | `Navigate to https://example.com` |
| Click | `Click "Submit"` or `Click the submit button` |
| Type | `Type "hello" in the search field` |
| Assert text | `Assert the page contains "Welcome"` |
| Assert URL | `Assert the URL contains "/dashboard"` |
| Wait | `Wait for the page to load` |
| Screenshot | `Take a screenshot` |

## Running a flow

```bash
slapify run path/to/test.flow
slapify run path/to/test.flow --report
```

## CI integration

Flow mode exits with **code 0** on success and **non-zero** on the first failed step, making it a natural fit for CI/CD pipelines:

```yaml
# GitHub Actions
- name: Run smoke tests
  run: slapify run tests/smoke.flow
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Running multiple flows

```bash
# Run all .flow files in a directory
slapify run tests/
```

Steps are executed in order; a single failure stops the flow and sets the non-zero exit code.
