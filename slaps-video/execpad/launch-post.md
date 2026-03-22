# agentpad — launch posts

---

## 1. Official post (slaps.dev page — LinkedIn / X)

---

We just shipped **agentpad** — a multi-language runtime for AI agents and developer tooling.

Most agent sandboxes fake the environment. agentpad doesn't.

It runs **bash, Python, JavaScript, and SQL** directly against a real project directory — with the guardrails you actually need in production:

→ **Overlay mode** — stage changes in a temp copy, then `apply()` or discard
→ **Read-only mode** — prevent writes at the library level
→ **Glob allowlists + timeouts** — scope exactly what the agent can touch
→ **Structured output** — every run returns `stdout`, `stderr`, `exitCode`, and a list of files written
→ **Session run log** — inspect the full history of what an agent actually did
→ **OpenAI tool helpers** — function-calling without rewriting the loop

Available for **TypeScript** and **Python**. Apache-2.0.

```
npm install agentpad
pip install agentpad
```

Full docs + examples → slaps.dev/agentpad · docs → slaps.dev/docs/agentpad

---

## 2. Personal repost (founder account — LinkedIn / X)

---

Repost from @slaps.dev ↑

I want to share why we built this.

Every agent demo I've seen runs code in some isolated toy box — no real files, no real state, no real output. That's fine for a demo. It's useless in production.

When I was integrating an AI copilot into a real project, I kept running into the same wall: the agent needed to *actually run things* — run a test suite, check the git log, query a local DB, write a file. But no existing library gave me structured output + workspace control + Python parity in one package.

So I built agentpad.

The thing I'm most proud of is **overlay mode** — the agent gets a full temp copy of your working directory, makes changes, and you choose whether to apply or throw away the whole thing. It's the mental model that finally made agent file edits feel safe.

If you're building agent tooling, CI runners, or any system that needs to run user code against real files — give it a try. I'd genuinely love to hear what you think.

→ github.com/vgulerianb/agentpad
→ slaps.dev/docs/agentpad

#openSource #aiAgents #developerTools #typescript #python

---

## X / short variant

**Official:**
Shipped agentpad — run bash / Python / Node / SQL on a real project dir.
Overlay mode, allowlists, run log, OpenAI tool helpers. TS + Python.
→ slaps.dev/agentpad

**Personal:**
We built agentpad because every agent sandbox I tried was fake.
Real files. Real output. Real control.
Overlay mode is the thing — stage agent changes, apply or discard.
→ slaps.dev/agentpad
