# ghost-env — launch post (LinkedIn / blog)

**Optional headline:** The network never leaves the process.

---

Integration tests for agents and tools have a problem: the **real** GitHub, Stripe, or LLM APIs are slow, expensive, and non-deterministic. Turning them off entirely means you’re not testing the shape of reality.

**ghost-env** is an in-process layer that **looks like `fetch`** but serves **deterministic** responses. Wire presets for common APIs — GitHub, Stripe, OpenAI, Anthropic, S3, Slack, Postgres-shaped calls — all from a **seed**, so the same test run behaves the same way every time.

You also get **recording**, **replay**, **eval scenarios**, and optional **chaos** (latency and failure rates) so you can stress the behaviour you care about — without touching the public internet.

Ships for **TypeScript** and **Python**. Zero runtime npm dependencies on the JS side.

**Try it:** [slaps.dev/ghost-env](https://slaps.dev/ghost-env)  
**Docs:** [slaps.dev/docs/ghost-env](https://slaps.dev/docs/ghost-env/)  
**Code:** [github.com/vgulerianb/ghost-env](https://github.com/vgulerianb/ghost-env)

Apache-2.0. If you’re testing agents or toolchains that call HTTP, we built this for you.

— slaps.dev

---

### Short variant (X / thread opener)

**ghost-env** — fake `fetch` in-process: GitHub, Stripe, LLMs, S3, Slack… deterministic, recordable, replayable, with eval + chaos. No live network. TS + Python. [slaps.dev/ghost-env](https://slaps.dev/ghost-env)
