# ghost-env

**Simulated worlds for AI agents. Real structure, fake data, zero blast radius.**

`ghost-env` creates coherent, deterministic fake environments — APIs, databases, filesystems, and services — that AI agents interact with exactly like real ones. Not individual mocks: an entire **simulated world** where a fake GitHub issue references a fake file in a fake repo backed by a fake database, and it all stays consistent. Ships as both an **npm package** and a **pip package** with the same API shape.

---

## The Problem

Building, testing, and evaluating AI agents requires letting them interact with external services. Today, teams face three bad options:

1. **Hit real APIs during development** — Costs money, triggers rate limits, risks mutating production data when an agent calls `DELETE` on the wrong endpoint. You can't run 500 eval iterations against real Stripe.

2. **Mock individual endpoints with nock/msw/responses** — Tedious per-endpoint setup. No cross-service consistency (your Stripe mock doesn't know about your Postgres mock). Mocks rot as APIs evolve. Every test is a bespoke wiring job.

3. **Run full staging environments** — Docker Compose with real Postgres, real Redis, real service containers. Expensive, slow, flaky, and overkill when you just need the agent to believe it's talking to Stripe.

**What's missing:** A library where you say "give me a world with 5 users, 3 repos, and a Stripe account" and every API/DB/FS query returns **structurally correct, internally consistent** responses — deterministically, in-process, with zero infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Agent Application                   │
│                                                              │
│   env = GhostEnv(providers=[github(...), stripe(...)])       │
│   agent = MyAgent(fetch=env.fetch, db=env.db)                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      GhostEnv Core                           │
│                                                              │
│   ┌──────────────┐  ┌────────────────┐  ┌───────────────┐   │
│   │  Interceptor  │  │  World State   │  │   Recorder    │   │
│   │              │  │                │  │               │   │
│   │  fetch()  ───┼──▶  Resolves     ─┼──▶  Logs every   │   │
│   │  db.query()──┤  │  requests     │  │  interaction  │   │
│   │  fs.read() ──┤  │  against      │  │  for replay   │   │
│   │              │  │  unified      │  │  & assertion  │   │
│   │              │  │  state graph  │  │               │   │
│   └──────┬───────┘  └───────┬────────┘  └───────────────┘   │
│          │                  │                                 │
│   ┌──────▼──────────────────▼─────────────────────────────┐  │
│   │                    Providers                           │  │
│   │                                                        │  │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐  │  │
│   │  │  HTTP   │ │Database │ │Filesys  │ │  Presets   │  │  │
│   │  │Provider │ │Provider │ │Provider │ │(GH,Stripe │  │  │
│   │  │         │ │(SQLite) │ │(InMem)  │ │ S3,Slack) │  │  │
│   │  └─────────┘ └─────────┘ └─────────┘ └────────────┘  │  │
│   └────────────────────────────────────────────────────────┘  │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                  Seed / Consistency                    │   │
│   │                                                       │   │
│   │  Deterministic RNG from seed value.                   │   │
│   │  Cross-provider refs (GitHub user → DB row → FS file) │   │
│   │  stay consistent automatically.                       │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **World State is the core abstraction.** Providers don't maintain independent state — they read from and write to a unified object graph. When the GitHub provider creates a repo, the DB provider can see the corresponding row. This is what separates ghost-env from "just a bunch of mocks."

2. **Providers are thin schema adapters.** The GitHub provider knows that `GET /repos/:owner/:repo` maps to a `Repository` entity in World State and returns it in GitHub's JSON shape. It doesn't have its own storage — it's a **view** over World State.

3. **Interception, not server simulation.** ghost-env replaces `fetch()` / `httpx` and database drivers at the language level. No TCP sockets, no port allocation, no servers. This is why it's fast and works in-process.

4. **Deterministic by default.** A `seed` value drives all random generation (IDs, timestamps, response latencies). Same seed + same agent actions = same results. This makes evals reproducible.

5. **Recording is always on.** Every interaction (HTTP request, DB query, FS read) is logged with timestamps, inputs, outputs, and which provider served it. This powers assertions, debugging, and replay.

6. **Same API in TypeScript and Python.** The npm and pip packages have identical method names, options, and behavior.

---

## File Structure

```
ghost-env/
├── package.json                             # npm package
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── README.md
├── PLAN.md
├── LICENSE                                  # Apache-2.0
│
├── src/                                     # TypeScript (npm) implementation
│   ├── index.ts                             # Public API exports
│   │
│   ├── ghost-env.ts                         # Main GhostEnv class
│   │                                        #   - new GhostEnv(config)
│   │                                        #   - .fetch — intercepted fetch
│   │                                        #   - .db(name) — intercepted DB client
│   │                                        #   - .fs — intercepted filesystem
│   │                                        #   - .calls() — recorded interactions
│   │                                        #   - .reset() — restore to seed state
│   │                                        #   - .snapshot() / .restore()
│   │
│   ├── types.ts                             # Core types
│   │
│   ├── world/
│   │   ├── index.ts
│   │   ├── state.ts                         # WorldState — unified entity store
│   │   ├── seed.ts                          # Deterministic seeding (Mulberry32 PRNG)
│   │   ├── consistency.ts                   # Cross-provider consistency rules
│   │   └── relations.ts                     # Entity relationship definitions
│   │
│   ├── providers/
│   │   ├── index.ts
│   │   ├── provider.ts                      # Provider interface
│   │   │
│   │   ├── http/
│   │   │   ├── index.ts
│   │   │   ├── http-provider.ts             # Generic HTTP provider
│   │   │   ├── interceptor.ts               # fetch() replacement
│   │   │   ├── router.ts                    # URL pattern matching
│   │   │   └── response.ts                  # Response builder
│   │   │
│   │   ├── database/
│   │   │   ├── index.ts
│   │   │   ├── db-provider.ts               # SQL simulation (sql.js backed)
│   │   │   ├── pg-adapter.ts                # pg client API compatibility
│   │   │   ├── mysql-adapter.ts             # mysql2 API compatibility
│   │   │   └── sync.ts                      # WorldState ↔ SQLite sync
│   │   │
│   │   ├── filesystem/
│   │   │   ├── index.ts
│   │   │   └── fs-provider.ts               # Virtual filesystem (Map-backed)
│   │   │
│   │   └── presets/
│   │       ├── index.ts
│   │       ├── github.ts                    # GitHub REST API simulation
│   │       ├── stripe.ts                    # Stripe API simulation
│   │       ├── openai.ts                    # OpenAI API (canned responses)
│   │       ├── s3.ts                        # AWS S3 API simulation
│   │       ├── slack.ts                     # Slack Web API simulation
│   │       ├── postgres-data.ts             # Seeded Postgres schemas
│   │       └── redis.ts                     # Redis command simulation
│   │
│   ├── recording/
│   │   ├── index.ts
│   │   ├── recorder.ts                      # Captures every interaction
│   │   ├── assertions.ts                    # Assert on recorded interactions
│   │   └── export.ts                        # Export as JSON, Markdown, HAR
│   │
│   ├── eval/
│   │   ├── index.ts
│   │   ├── scenario.ts                      # Define eval scenarios
│   │   ├── runner.ts                        # Batch scenario runner
│   │   └── metrics.ts                       # Pass rate, cost, regression detection
│   │
│   └── integrations/
│       ├── vitest.ts                        # Vitest plugin + custom matchers
│       └── jest.ts                          # Jest plugin
│
├── python/                                  # Python (pip) implementation
│   ├── pyproject.toml
│   ├── README.md
│   │
│   ├── src/
│   │   └── ghost_env/
│   │       ├── __init__.py                  # Public API
│   │       ├── ghost_env.py                 # Main GhostEnv class
│   │       ├── types.py                     # Shared types (dataclasses)
│   │       │
│   │       ├── world/
│   │       │   ├── __init__.py
│   │       │   ├── state.py                 # WorldState — dict-of-dicts store
│   │       │   ├── seed.py                  # Deterministic seeding
│   │       │   ├── consistency.py           # Cross-provider consistency rules
│   │       │   └── relations.py             # Entity relationships
│   │       │
│   │       ├── providers/
│   │       │   ├── __init__.py
│   │       │   ├── base.py                  # Provider ABC
│   │       │   │
│   │       │   ├── http/
│   │       │   │   ├── __init__.py
│   │       │   │   ├── http_provider.py     # Generic HTTP provider
│   │       │   │   ├── interceptor.py       # httpx / requests interception
│   │       │   │   ├── router.py            # URL pattern matching
│   │       │   │   └── response.py          # Response builder
│   │       │   │
│   │       │   ├── database/
│   │       │   │   ├── __init__.py
│   │       │   │   ├── db_provider.py       # SQL simulation (sqlite3 backed)
│   │       │   │   ├── pg_adapter.py        # psycopg2 API compatibility
│   │       │   │   └── sync.py              # WorldState ↔ SQLite sync
│   │       │   │
│   │       │   └── presets/
│   │       │       ├── __init__.py
│   │       │       ├── github.py            # GitHub REST API simulation
│   │       │       ├── stripe.py            # Stripe API simulation
│   │       │       ├── openai_preset.py     # OpenAI API (canned responses)
│   │       │       ├── s3.py                # AWS S3 API simulation
│   │       │       └── slack.py             # Slack Web API simulation
│   │       │
│   │       ├── recording/
│   │       │   ├── __init__.py
│   │       │   ├── recorder.py              # Captures every interaction
│   │       │   ├── assertions.py            # Assert helpers
│   │       │   └── export.py                # Export as JSON, Markdown
│   │       │
│   │       ├── eval/
│   │       │   ├── __init__.py
│   │       │   ├── scenario.py              # Define eval scenarios
│   │       │   ├── runner.py                # Batch scenario runner
│   │       │   └── metrics.py               # Compute eval metrics
│   │       │
│   │       └── integrations/
│   │           ├── __init__.py
│   │           ├── pytest_plugin.py         # Pytest plugin + fixtures
│   │           └── unittest_plugin.py       # unittest integration
│   │
│   └── tests/
│       ├── test_ghost_env.py
│       ├── test_world/
│       │   ├── test_state.py
│       │   └── test_seed.py
│       ├── test_providers/
│       │   ├── test_http.py
│       │   ├── test_database.py
│       │   └── test_presets/
│       │       ├── test_github.py
│       │       └── test_stripe.py
│       └── test_eval/
│           └── test_runner.py
│
├── tests/                                   # TypeScript tests
│   ├── ghost-env.test.ts
│   ├── world/
│   │   ├── state.test.ts
│   │   ├── seed.test.ts
│   │   └── consistency.test.ts
│   ├── providers/
│   │   ├── http.test.ts
│   │   ├── database.test.ts
│   │   └── presets/
│   │       ├── github.test.ts
│   │       ├── stripe.test.ts
│   │       └── s3.test.ts
│   ├── recording/
│   │   ├── recorder.test.ts
│   │   └── assertions.test.ts
│   └── eval/
│       ├── scenario.test.ts
│       └── runner.test.ts
│
└── examples/
    ├── 01-basic-http/
    ├── 02-github-bot/
    ├── 03-ecommerce-agent/
    ├── 04-agent-eval-suite/
    └── 05-custom-provider/
```

---

## Core API

### TypeScript (npm)

```typescript
import { GhostEnv, github, stripe, postgres } from 'ghost-env';

const env = new GhostEnv({
  seed: 42,

  providers: [
    github({
      orgs: [{ name: 'acme', repos: ['api', 'web', 'mobile'] }],
      users: [
        { login: 'alice', name: 'Alice Chen', repos: ['dotfiles'] },
        { login: 'bob', name: 'Bob Smith' },
      ],
    }),

    stripe({
      customers: [
        { email: 'alice@acme.com', plan: 'pro', balance: 5000 },
      ],
      products: [
        { name: 'Pro Plan', price: 2999, interval: 'month' },
      ],
    }),

    postgres({
      tables: {
        users: [
          { id: 1, email: 'alice@acme.com', role: 'admin', github_login: 'alice' },
          { id: 2, email: 'bob@acme.com', role: 'member', github_login: 'bob' },
        ],
        audit_log: [],
      },
    }),
  ],
});
```

### Python (pip)

```python
from ghost_env import GhostEnv, github, stripe, postgres

env = GhostEnv(
    seed=42,
    providers=[
        github(
            orgs=[{'name': 'acme', 'repos': ['api', 'web', 'mobile']}],
            users=[
                {'login': 'alice', 'name': 'Alice Chen', 'repos': ['dotfiles']},
                {'login': 'bob', 'name': 'Bob Smith'},
            ],
        ),
        stripe(
            customers=[
                {'email': 'alice@acme.com', 'plan': 'pro', 'balance': 5000},
            ],
            products=[
                {'name': 'Pro Plan', 'price': 2999, 'interval': 'month'},
            ],
        ),
        postgres(
            tables={
                'users': [
                    {'id': 1, 'email': 'alice@acme.com', 'role': 'admin', 'github_login': 'alice'},
                    {'id': 2, 'email': 'bob@acme.com', 'role': 'member', 'github_login': 'bob'},
                ],
                'audit_log': [],
            },
        ),
    ],
)
```

### Intercepted `fetch()` / `httpx`

**TypeScript:**

```typescript
const agent = new MyAgent({ fetch: env.fetch });

const response = await env.fetch('https://api.github.com/repos/acme/api/issues');
const issues = await response.json();

// POST works — mutations update World State
await env.fetch('https://api.github.com/repos/acme/api/issues', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Bug: login fails', body: '...' }),
});
// World State now has a new issue — subsequent GETs include it
```

**Python:**

```python
# Option 1: Explicit — pass env.fetch to your agent
agent = MyAgent(fetch=env.fetch)

response = env.fetch('https://api.github.com/repos/acme/api/issues')
issues = response.json()

# Option 2: Context manager — patches httpx/requests globally
with env.intercept():
    import httpx
    resp = httpx.get('https://api.github.com/repos/acme/api/issues')
    issues = resp.json()  # intercepted, returns fake data

# POST works the same way
env.fetch('https://api.github.com/repos/acme/api/issues', method='POST', json={
    'title': 'Bug: login fails',
    'body': '...',
})
```

### Intercepted Database

**TypeScript:**

```typescript
const db = env.db('postgres');

const { rows } = await db.query('SELECT * FROM users WHERE role = $1', ['admin']);
// [{ id: 1, email: 'alice@acme.com', role: 'admin', github_login: 'alice' }]

await db.query('INSERT INTO audit_log (user_id, action) VALUES ($1, $2)', [1, 'login']);
```

**Python:**

```python
db = env.db('postgres')

rows = db.query('SELECT * FROM users WHERE role = %s', ['admin'])
# [{'id': 1, 'email': 'alice@acme.com', 'role': 'admin', 'github_login': 'alice'}]

db.query('INSERT INTO audit_log (user_id, action) VALUES (%s, %s)', [1, 'login'])

# Or use as a drop-in psycopg2 replacement
conn = env.connection('postgres')
cur = conn.cursor()
cur.execute('SELECT * FROM users WHERE role = %s', ('admin',))
rows = cur.fetchall()
```

### Recording & Assertions

**TypeScript:**

```typescript
const calls = env.calls();
// [
//   { provider: 'github', method: 'GET', url: '/repos/acme/api/issues', status: 200 },
//   { provider: 'github', method: 'POST', url: '/repos/acme/api/issues', status: 201 },
//   { provider: 'postgres', query: 'SELECT * FROM users ...', params: ['admin'] },
// ]

expect(env).toHaveCalled('github', {
  method: 'POST',
  path: '/repos/acme/api/issues',
  body: { title: expect.stringContaining('Bug') },
});

expect(env).toHaveQueried(/INSERT INTO audit_log/);
expect(env).not.toHaveCalled('stripe');
```

**Python:**

```python
calls = env.calls()

# Assert helpers
assert env.was_called('github', method='POST', path='/repos/acme/api/issues')
assert env.was_queried(r'INSERT INTO audit_log')
assert not env.was_called('stripe')

# Filter calls
github_posts = env.calls('github', method='POST')
assert len(github_posts) == 1
assert 'Bug' in github_posts[0]['body']['title']
```

### Snapshot & Reset

**TypeScript:**

```typescript
env.reset();                    // Restore to seed state
const snap = env.snapshot();    // Capture current state
await runAgent(env);
env.restore(snap);              // Undo agent mutations
```

**Python:**

```python
env.reset()
snap = env.snapshot()
run_agent(env)
env.restore(snap)
```

---

## Usage Examples

### Example 1: Testing a GitHub Bot

**TypeScript:**

```typescript
import { GhostEnv, github } from 'ghost-env';
import { describe, it, expect, beforeEach } from 'vitest';
import { IssueLabeler } from '../src/issue-labeler';

describe('IssueLabeler', () => {
  let env: GhostEnv;

  beforeEach(() => {
    env = new GhostEnv({
      seed: 123,
      providers: [
        github({
          orgs: [{ name: 'acme', repos: ['api'] }],
          issues: [
            { repo: 'acme/api', title: 'TypeError in auth middleware',
              body: 'Stack trace: TypeError: Cannot read property...', labels: [] },
            { repo: 'acme/api', title: 'Add dark mode support',
              body: 'It would be nice to have a dark mode option...', labels: [] },
          ],
        }),
      ],
    });
  });

  it('labels bug reports as "bug"', async () => {
    const labeler = new IssueLabeler({ fetch: env.fetch });
    await labeler.processNewIssues('acme/api');

    expect(env).toHaveCalled('github', {
      method: 'POST',
      path: '/repos/acme/api/issues/1/labels',
      body: { labels: expect.arrayContaining(['bug']) },
    });
  });

  it('labels feature requests as "enhancement"', async () => {
    const labeler = new IssueLabeler({ fetch: env.fetch });
    await labeler.processNewIssues('acme/api');

    expect(env).toHaveCalled('github', {
      method: 'POST',
      path: '/repos/acme/api/issues/2/labels',
      body: { labels: expect.arrayContaining(['enhancement']) },
    });
  });
});
```

**Python:**

```python
import pytest
from ghost_env import GhostEnv, github
from my_app.issue_labeler import IssueLabeler

@pytest.fixture
def env():
    return GhostEnv(
        seed=123,
        providers=[
            github(
                orgs=[{'name': 'acme', 'repos': ['api']}],
                issues=[
                    {'repo': 'acme/api', 'title': 'TypeError in auth middleware',
                     'body': 'Stack trace: TypeError...', 'labels': []},
                    {'repo': 'acme/api', 'title': 'Add dark mode support',
                     'body': 'It would be nice...', 'labels': []},
                ],
            ),
        ],
    )

def test_labels_bug_reports(env):
    labeler = IssueLabeler(fetch=env.fetch)
    labeler.process_new_issues('acme/api')

    assert env.was_called('github',
        method='POST',
        path='/repos/acme/api/issues/1/labels',
    )
    call = env.calls('github', path='/repos/acme/api/issues/1/labels')[0]
    assert 'bug' in call['body']['labels']

def test_labels_feature_requests(env):
    labeler = IssueLabeler(fetch=env.fetch)
    labeler.process_new_issues('acme/api')

    call = env.calls('github', path='/repos/acme/api/issues/2/labels')[0]
    assert 'enhancement' in call['body']['labels']
```

### Example 2: E-commerce Agent (Multi-Service)

**TypeScript:**

```typescript
import { GhostEnv, stripe, postgres, slack } from 'ghost-env';

const env = new GhostEnv({
  seed: 999,
  providers: [
    postgres({
      tables: {
        customers: [
          { id: 'cust_1', email: 'angry@example.com', name: 'Angry Customer', plan: 'pro' },
        ],
        orders: [
          { id: 'ord_1', customer_id: 'cust_1', total: 9999, status: 'shipped', tracking: 'TRK123' },
          { id: 'ord_2', customer_id: 'cust_1', total: 4999, status: 'refunded' },
        ],
      },
    }),
    stripe({
      customers: [{
        id: 'cust_1',
        email: 'angry@example.com',
        charges: [
          { amount: 9999, status: 'succeeded', created: '2025-01-15' },
          { amount: 4999, status: 'refunded', created: '2025-01-10' },
        ],
      }],
    }),
    slack({
      channels: [{ name: 'support', messages: [] }],
    }),
  ],
});

const agent = new SupportAgent({ fetch: env.fetch, db: env.db('postgres') });
await agent.handleTicket({
  customer_email: 'angry@example.com',
  message: "Where's my order?",
});

expect(env).toHaveQueried(/SELECT.*FROM customers.*WHERE email/);
expect(env).toHaveQueried(/SELECT.*FROM orders.*WHERE customer_id/);
expect(env).toHaveCalled('stripe', { path: /\/charges/ });
expect(env).toHaveCalled('slack', {
  method: 'POST',
  path: '/api/chat.postMessage',
  body: { text: expect.stringContaining('TRK123') },
});
```

**Python:**

```python
from ghost_env import GhostEnv, stripe, postgres, slack

env = GhostEnv(
    seed=999,
    providers=[
        postgres(tables={
            'customers': [
                {'id': 'cust_1', 'email': 'angry@example.com', 'name': 'Angry Customer'},
            ],
            'orders': [
                {'id': 'ord_1', 'customer_id': 'cust_1', 'total': 9999,
                 'status': 'shipped', 'tracking': 'TRK123'},
            ],
        }),
        stripe(customers=[{
            'id': 'cust_1',
            'email': 'angry@example.com',
            'charges': [{'amount': 9999, 'status': 'succeeded'}],
        }]),
        slack(channels=[{'name': 'support', 'messages': []}]),
    ],
)

agent = SupportAgent(fetch=env.fetch, db=env.db('postgres'))
agent.handle_ticket(
    customer_email='angry@example.com',
    message="Where's my order?",
)

assert env.was_queried(r'SELECT.*FROM customers.*WHERE email')
assert env.was_queried(r'SELECT.*FROM orders.*WHERE customer_id')
assert env.was_called('stripe', path_pattern=r'/charges')
slack_calls = env.calls('slack', method='POST', path='/api/chat.postMessage')
assert 'TRK123' in slack_calls[0]['body']['text']
```

### Example 3: Agent Eval Suite

**TypeScript:**

```typescript
import { GhostEnv, github, defineScenario, runEval } from 'ghost-env';

const scenarios = [
  defineScenario({
    name: 'close-duplicate-issue',
    seed: 1,
    providers: [
      github({
        issues: [
          { repo: 'acme/api', number: 1, title: 'Login broken', state: 'open' },
          { repo: 'acme/api', number: 2, title: 'Cannot log in', state: 'open' },
        ],
      }),
    ],
    agentTask: 'Find and close duplicate issues in acme/api',
    assertions: [
      { type: 'called', provider: 'github', method: 'PATCH',
        path: /issues\/2/, body: { state: 'closed' } },
      { type: 'not_called', provider: 'github', method: 'PATCH',
        path: /issues\/1.*state/ },
    ],
  }),

  defineScenario({
    name: 'assign-reviewer-by-expertise',
    seed: 2,
    providers: [
      github({
        users: [
          { login: 'alice', expertise: ['auth', 'api'] },
          { login: 'bob', expertise: ['frontend', 'css'] },
        ],
        pulls: [
          { repo: 'acme/api', number: 10, title: 'Fix OAuth token refresh',
            files: ['src/auth/oauth.ts'] },
        ],
      }),
    ],
    agentTask: 'Assign the best reviewer for PR #10 in acme/api',
    assertions: [
      { type: 'called', provider: 'github', method: 'POST',
        path: /pulls\/10\/requested_reviewers/,
        body: { reviewers: ['alice'] } },
    ],
  }),
];

const report = await runEval({
  scenarios,
  agent: (env, task) => new MyAgent({ fetch: env.fetch }).run(task),
  concurrency: 10,
  timeout: 30_000,
});

console.log(report.summary);
// { total: 2, passed: 2, passRate: 1.0, avgDuration: 2340, avgToolCalls: 4.2 }
```

**Python:**

```python
from ghost_env import GhostEnv, github, define_scenario, run_eval

scenarios = [
    define_scenario(
        name='close-duplicate-issue',
        seed=1,
        providers=[
            github(issues=[
                {'repo': 'acme/api', 'number': 1, 'title': 'Login broken', 'state': 'open'},
                {'repo': 'acme/api', 'number': 2, 'title': 'Cannot log in', 'state': 'open'},
            ]),
        ],
        agent_task='Find and close duplicate issues in acme/api',
        assertions=[
            {'type': 'called', 'provider': 'github', 'method': 'PATCH',
             'path': r'issues/2', 'body': {'state': 'closed'}},
            {'type': 'not_called', 'provider': 'github', 'method': 'PATCH',
             'path': r'issues/1.*state'},
        ],
    ),
]

report = run_eval(
    scenarios=scenarios,
    agent=lambda env, task: MyAgent(fetch=env.fetch).run(task),
    concurrency=10,
    timeout=30_000,
)

print(report.summary)
# {'total': 1, 'passed': 1, 'pass_rate': 1.0, 'avg_duration': 2340}
```

### Example 4: Custom Provider (Your Own API)

**TypeScript:**

```typescript
import { GhostEnv, defineProvider } from 'ghost-env';

const inventoryAPI = defineProvider({
  name: 'inventory',
  baseUrl: 'https://inventory.internal.acme.com',

  entities: {
    product: {
      fields: { id: 'string', name: 'string', sku: 'string', quantity: 'number' },
    },
  },

  routes: [
    {
      method: 'GET',
      path: '/products',
      handler: (req, world) => {
        const products = world.list('product');
        return { status: 200, body: products };
      },
    },
    {
      method: 'POST',
      path: '/products/:id/restock',
      handler: (req, world) => {
        const product = world.get('product', req.params.id);
        if (!product) return { status: 404, body: { error: 'Not found' } };
        world.update('product', req.params.id, {
          quantity: product.quantity + req.body.quantity,
        });
        return { status: 200, body: world.get('product', req.params.id) };
      },
    },
  ],
});

const env = new GhostEnv({
  seed: 42,
  providers: [
    inventoryAPI({
      products: [
        { id: 'p1', name: 'Widget', sku: 'WDG-001', quantity: 5 },
      ],
    }),
  ],
});

const resp = await env.fetch('https://inventory.internal.acme.com/products');
const products = await resp.json();
// [{ id: 'p1', name: 'Widget', sku: 'WDG-001', quantity: 5 }]
```

**Python:**

```python
from ghost_env import GhostEnv, define_provider

inventory_api = define_provider(
    name='inventory',
    base_url='https://inventory.internal.acme.com',
    entities={
        'product': {
            'fields': {'id': 'string', 'name': 'string', 'sku': 'string', 'quantity': 'number'},
        },
    },
    routes=[
        {
            'method': 'GET',
            'path': '/products',
            'handler': lambda req, world: {'status': 200, 'body': world.list('product')},
        },
        {
            'method': 'POST',
            'path': '/products/{id}/restock',
            'handler': lambda req, world: {
                'status': 200,
                'body': world.update('product', req['params']['id'], {
                    'quantity': world.get('product', req['params']['id'])['quantity'] + req['body']['quantity'],
                }),
            },
        },
    ],
)

env = GhostEnv(
    seed=42,
    providers=[
        inventory_api(products=[
            {'id': 'p1', 'name': 'Widget', 'sku': 'WDG-001', 'quantity': 5},
        ]),
    ],
)

resp = env.fetch('https://inventory.internal.acme.com/products')
products = resp.json()
```

### Example 5: Fake OpenAI (Test Orchestration Logic)

**TypeScript:**

```typescript
import { GhostEnv, openai } from 'ghost-env';

const env = new GhostEnv({
  providers: [
    openai({
      responses: [
        {
          match: { model: 'gpt-4o' },
          response: {
            choices: [{
              message: {
                role: 'assistant',
                tool_calls: [{ function: { name: 'get_weather', arguments: '{"city":"NYC"}' } }],
              },
            }],
            usage: { prompt_tokens: 50, completion_tokens: 20 },
          },
        },
        {
          match: { model: 'gpt-4o' },
          response: {
            choices: [{
              message: { role: 'assistant', content: 'The weather in NYC is sunny, 72°F.' },
            }],
            usage: { prompt_tokens: 100, completion_tokens: 30 },
          },
        },
      ],
    }),
  ],
});

const orchestrator = new AgentOrchestrator({
  fetch: env.fetch,
  tools: { get_weather: async ({ city }) => `${city}: sunny, 72°F` },
});

const result = await orchestrator.run('What is the weather in NYC?');
expect(result).toBe('The weather in NYC is sunny, 72°F.');

const openaiCalls = env.calls('openai');
expect(openaiCalls).toHaveLength(2);
```

**Python:**

```python
from ghost_env import GhostEnv, openai

env = GhostEnv(providers=[
    openai(responses=[
        {
            'match': {'model': 'gpt-4o'},
            'response': {
                'choices': [{
                    'message': {
                        'role': 'assistant',
                        'tool_calls': [{'function': {'name': 'get_weather', 'arguments': '{"city":"NYC"}'}}],
                    },
                }],
                'usage': {'prompt_tokens': 50, 'completion_tokens': 20},
            },
        },
        {
            'match': {'model': 'gpt-4o'},
            'response': {
                'choices': [{
                    'message': {'role': 'assistant', 'content': 'The weather in NYC is sunny, 72°F.'},
                }],
                'usage': {'prompt_tokens': 100, 'completion_tokens': 30},
            },
        },
    ]),
])

orchestrator = AgentOrchestrator(
    fetch=env.fetch,
    tools={'get_weather': lambda city: f'{city}: sunny, 72°F'},
)

result = orchestrator.run('What is the weather in NYC?')
assert result == 'The weather in NYC is sunny, 72°F.'
assert len(env.calls('openai')) == 2
```

### Example 6: Test Framework Integration

**TypeScript (Vitest):**

```typescript
// vitest.config.ts
import { ghostEnvPlugin } from 'ghost-env/vitest';

export default defineConfig({
  plugins: [ghostEnvPlugin()],
});

// my-agent.test.ts
import { useGhostEnv, github, stripe } from 'ghost-env';

const env = useGhostEnv({
  seed: 42,
  providers: [github({ ... }), stripe({ ... })],
});

it('agent processes refund correctly', async () => {
  const agent = new RefundAgent({ fetch: env.fetch, db: env.db('postgres') });
  await agent.processRefund('charge_123');

  expect(env).toHaveCalled('stripe', {
    method: 'POST',
    path: '/v1/refunds',
    body: { charge: 'charge_123' },
  });
});
```

**Python (Pytest):**

```python
# conftest.py
from ghost_env.integrations.pytest_plugin import ghost_env_fixture
from ghost_env import github, stripe

@ghost_env_fixture(seed=42, providers=[github(...), stripe(...)])
def env():
    pass  # auto-configured, auto-reset between tests

# test_agent.py
def test_processes_refund(env):
    agent = RefundAgent(fetch=env.fetch, db=env.db('postgres'))
    agent.process_refund('charge_123')

    assert env.was_called('stripe', method='POST', path='/v1/refunds')
    call = env.calls('stripe', path='/v1/refunds')[0]
    assert call['body']['charge'] == 'charge_123'
```

---

## Implementation: TypeScript (npm)

### Core Technologies

- **World State:** Plain JS `Map<EntityType, Map<Id, Entity>>` with event emitter for consistency triggers.
- **HTTP interception:** Custom `fetch()` function that matches URLs against registered providers. Falls through to real `fetch()` for unmatched URLs (configurable: throw or pass-through).
- **Database:** [sql.js](https://sql.js.org/) (SQLite in WASM) for real SQL execution. `pg-adapter` translates Postgres-specific syntax (`$1` params, `RETURNING`, `ILIKE`) to SQLite equivalents.
- **Deterministic seeding:** Mulberry32 PRNG seeded from the config `seed` value. All generated IDs, timestamps, and data flow from this.
- **Recording:** Every provider call appended to an in-memory array with `{ timestamp, provider, method, url, request, response, duration }`.

### World State Consistency Model

Consistency is opt-in and declarative:

```typescript
const env = new GhostEnv({
  consistency: [
    { on: 'github.user.create', do: (user, world) => {
      world.insert('postgres.users', { github_login: user.login, email: `${user.login}@example.com` });
    }},
    { on: 'stripe.charge.create', do: (charge, world) => {
      world.insert('postgres.audit_log', { action: 'charge', amount: charge.amount });
    }},
  ],
});
```

By default, providers are independent. You add rules only for cross-service relationships your agent depends on.

### Memory & Performance

- Entities stored in plain JS Maps — no external DB, no disk.
- 10,000 entities across all providers ≈ 5MB memory.
- Response generation is synchronous — a fetch intercept returns in <1ms.
- SQL queries against sql.js with 10K rows ≈ 1–5ms.
- Target: 1000 eval scenarios in <30 seconds.

---

## Implementation: Python (pip)

The Python package is a **native implementation** — no Node.js dependency, no WASM. It uses tools Python already has.

### Core Technologies

- **World State:** `dict[str, dict[str, dict]]` — same shape as the TS version, pure Python.
- **HTTP interception:** Wraps `httpx.Client` / `requests.Session`. The `env.fetch()` function checks URLs against providers. `env.intercept()` context manager monkey-patches `httpx.get`/`httpx.post`/etc. for convenience (similar to the `responses` library pattern).
- **Database:** Python's built-in `sqlite3` module. Same approach as TS — full SQL execution, pg-adapter translates Postgres-isms.
- **Deterministic seeding:** Python `random.Random(seed)` instance (not global `random`). Same Mulberry32 algorithm available if exact cross-language reproducibility matters.
- **Recording:** List of dicts, same schema as TS.

### Key Differences from TypeScript Version

- **No WASM** — `sqlite3` is in Python's stdlib, no sql.js needed.
- **HTTP interception pattern** — uses `httpx` transport mocking or `responses` library patterns instead of replacing `globalThis.fetch`.
- **Test framework** — pytest fixtures and `assert` helpers instead of Vitest custom matchers.
- **Async optional** — all APIs have both sync and async variants (`env.fetch()` is sync by default, `await env.async_fetch()` for async agents).

### Python Package Dependencies

```toml
# pyproject.toml
[project]
name = "ghost-env"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []  # Zero runtime deps for core (sqlite3 is stdlib)

[project.optional-dependencies]
httpx = ["httpx>=0.25"]         # For httpx interception
requests = ["responses>=0.25"]  # For requests interception
pytest = ["pytest>=7.0"]        # For pytest plugin
eval = ["tqdm>=4.0"]            # For eval runner progress bars
```

### Python Class Structure

```python
# src/ghost_env/__init__.py
from .ghost_env import GhostEnv
from .providers.presets.github import github
from .providers.presets.stripe import stripe
from .providers.presets.openai_preset import openai
from .providers.presets.s3 import s3
from .providers.presets.slack import slack
from .providers.database import postgres
from .eval.scenario import define_scenario
from .eval.runner import run_eval
from .providers.base import define_provider

# src/ghost_env/ghost_env.py
class GhostEnv:
    def __init__(self, *, seed=None, providers=None, consistency=None): ...

    def fetch(self, url, *, method='GET', headers=None, json=None, body=None): ...
    def async_fetch(self, url, **kwargs): ...  # async variant

    def db(self, name='postgres'): ...
    def connection(self, name='postgres'): ...  # psycopg2-compatible

    def calls(self, provider=None, **filters): ...
    def was_called(self, provider, **filters) -> bool: ...
    def was_queried(self, pattern) -> bool: ...

    def reset(self): ...
    def snapshot(self) -> str: ...
    def restore(self, snapshot_id: str): ...

    def intercept(self): ...  # context manager for global patching
```

---

## Implementation Phases

### Phase 1: Core + HTTP Provider (Weeks 1–3)

**Goal:** `env.fetch()` intercepts HTTP and returns responses from a generic provider. Both TS and Python.

- [ ] `WorldState` — entity store with CRUD, cross-references (TS + Python)
- [ ] `Recorder` — log every interaction (TS + Python)
- [ ] `GhostEnv` class — config, provider registration, intercepted fetch (TS + Python)
- [ ] Generic `HttpProvider` — route definitions, pattern matching, response building (TS + Python)
- [ ] `seed.ts` / `seed.py` — deterministic PRNG, entity factories
- [ ] Basic tests: create env, seed data, fetch intercepted URL, assert response

### Phase 2: Presets — GitHub + Stripe (Weeks 4–5)

**Goal:** Two production-quality service simulations.

- [ ] `github.ts` / `github.py` — repos, issues, PRs, comments, labels, users, orgs
- [ ] `stripe.ts` / `stripe.py` — customers, charges, refunds, subscriptions
- [ ] Cross-provider consistency
- [ ] Tests: full agent workflows against each preset

### Phase 3: Database Provider (Weeks 6–7)

**Goal:** `env.db('postgres').query(sql)` works.

- [ ] `DbProvider` — SQL execution via sql.js (TS) / sqlite3 (Python)
- [ ] `pg-adapter` — Postgres syntax → SQLite translation
- [ ] WorldState ↔ SQLite sync
- [ ] Multi-provider integration tests

### Phase 4: Assertions + Eval Runner (Weeks 8–9)

- [ ] `assertions.ts` / `assertions.py` — structured assertion helpers
- [ ] `vitest.ts` / `pytest_plugin.py` — test framework integration
- [ ] `scenario` + `runner` — batch eval execution
- [ ] `metrics` — pass rate, cost estimation, regression detection

### Phase 5: More Presets + Ship (Weeks 10–12)

- [ ] `s3`, `slack`, `redis`, `openai` presets (TS + Python)
- [ ] `defineProvider` / `define_provider` for custom APIs
- [ ] `export` — recordings as JSON, Markdown, HAR
- [ ] README, examples, npm publish, pip publish
- [ ] Performance benchmarks

---

## Technical Decisions

### fetch() Interception Strategy

**TypeScript:** Two modes.
1. **Explicit** (recommended): Pass `env.fetch` to your agent. No global mutation.
2. **Global** (tests): `env.intercept()` monkey-patches `globalThis.fetch`.

**Python:** Three modes.
1. **Explicit**: Pass `env.fetch` as a callable.
2. **Context manager**: `with env.intercept():` patches `httpx` / `requests` globally for the block.
3. **Transport**: `env.as_httpx_transport()` returns an `httpx.BaseTransport` you can pass to `httpx.Client(transport=...)`.

### Why SQLite for the DB Provider

Real SQL semantics are hard. Agents write real SQL. sql.js / Python's `sqlite3` gives us full SQLite, which is close enough to Postgres/MySQL for 95% of agent queries. The pg-adapter translates `$1` params, `RETURNING`, and `ILIKE` to SQLite equivalents.

### Deterministic Seeding

All randomness flows from a single seed. Same seed + same agent actions = same results. This makes evals reproducible across runs, machines, and CI.

---

## Future Extensions (Post-MVP)

- **GraphQL provider:** Auto-generate resolvers from World State schema.
- **Webhook simulation:** Ghost-env calls your webhook handlers with fake events.
- **Record & replay:** Record real API interactions → replay as ghost-env fixtures.
- **Community presets:** Registry of contributed service simulations (Jira, Linear, Notion, Twilio).
- **Chaos mode:** Inject random failures, slow responses, rate limits to test agent resilience.
