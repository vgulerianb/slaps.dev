# stubfetch — launch posts

---

## 1. Official post (slaps.dev page — LinkedIn / X)

---

We just shipped **stubfetch** — deterministic in-process fakes for any HTTP API.

If you're building agents or toolchains that call GitHub, Stripe, OpenAI, or anything over HTTP — your tests are probably slow, expensive, and flaky.

stubfetch fixes that. It intercepts `fetch` at the process level and returns **seeded, deterministic responses** — no live network, no surprises.

→ **7 built-in presets** — GitHub, Stripe, OpenAI, Anthropic, S3, Slack, Postgres
→ **Seed-based** — same seed, same result, every run, on any machine
→ **Recording + replay** — capture real API calls and play them back as fixtures
→ **Eval mode** — define scenarios and run assertions against them
→ **Chaos mode** — inject latency and failure rates to stress your logic
→ **Zero runtime dependencies** on the JS side

Available for **TypeScript** and **Python**. Apache-2.0.

```
npm install stubfetch
pip install stubfetch
```

Full docs + examples → slaps.dev/stubfetch

---

## 2. Personal repost (founder account — LinkedIn / X)

---

Repost from @slaps.dev ↑

Here's the problem that made us build stubfetch:

I was writing integration tests for an agent that called the GitHub API, Stripe, and an LLM in the same flow. To run the tests locally I needed all three to be live — which meant rate limits, billing, and tests that failed on Friday afternoons because the API was slow.

Mocking each `fetch` call manually was worse. The shape of the response drifted from reality after two weeks. I didn't trust the tests anymore.

stubfetch is the middle ground. It looks exactly like `fetch`. It returns responses shaped like the real APIs. But it's fully in-process, seeded, and deterministic. You can record a real session once and replay it forever. You can inject chaos to see what breaks. You can define eval scenarios and assert on them.

The zero-dependency build on the JS side was a non-negotiable for me — I wanted it droppable into any project without managing a version tree.

If you're testing agents or anything that talks to HTTP, I think this will make your life meaningfully better.

→ github.com/vgulerianb/stubfetch
→ slaps.dev/docs/stubfetch

#openSource #aiAgents #testing #typescript #python

---

## X / short variant

**Official:**
Shipped stubfetch — fake `fetch` in-process.
GitHub, Stripe, LLMs, S3, Slack… deterministic, recordable, replayable.
Seed 42 → same result forever. TS + Python. Zero deps.
→ slaps.dev/stubfetch

**Personal:**
I was tired of tests that called real APIs.
Rate limits. Billing. Results that changed on Friday.
Built stubfetch to fix it — seeded in-process fakes that look exactly like the real thing.
→ slaps.dev/stubfetch
