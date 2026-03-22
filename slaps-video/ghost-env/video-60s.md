# ghost-env — ~60 second launch video

**Target:** 58–60s including 2s end card.  
**VO pace:** calm, ~2.0–2.2 words/sec.

---

## On-screen text (burn-in suggestions)

| Time | Text |
|------|------|
| 0:00–0:05 | No live APIs. Real tests. |
| 0:16–0:20 | ghost-env |
| 0:20–0:26 | same shape as fetch |
| 0:32–0:38 | GitHub · Stripe · LLMs · S3 · Slack |
| 0:42–0:48 | record · replay · eval · chaos |
| 0:50–0:54 | npm install ghost-env |
| 0:54–1:00 | slaps.dev/ghost-env |

---

## Voiceover script (~140 words → trim if long)

**(0:00)** Your tests shouldn’t depend on the public internet. But they **should** depend on **real request shapes** — URLs, headers, JSON.

**(0:10)** **ghost-env** intercepts **`fetch`** in-process. You get predictable responses from a **seed**. Same run, same outcome — every time.

**(0:22)** Drop in presets for **GitHub**, **Stripe**, **OpenAI**, **Anthropic**, **S3**, **Slack**, **Postgres-style** calls — without opening a socket.

**(0:34)** Record what was called. Replay fixtures. Script **eval** scenarios. Dial in **chaos** — latency, random failures — and see if your agent still holds up.

**(0:46)** TypeScript and Python. No runtime npm deps on the JS package.

**(0:52)** **ghost-env** — [slaps.dev/ghost-env](https://slaps.dev/ghost-env)

---

## Shot list (minimal)

1. **0:00–0:10** — White field + hook caption. Quick flash: red “network error” icon **crossed out** (simple line, not stock) → cut to calm terminal.
2. **0:10–0:22** — Terminal: `npm install ghost-env` → snippet with `new GhostEnv({ seed: 42, providers: [...] })` → `env.fetch("https://api.github.com/...")` (visual only).
3. **0:22–0:32** — Browser: [slaps.dev/ghost-env](https://slaps.dev/ghost-env) hero; hold on product name.
4. **0:32–0:40** — Same page: presets grid or code block with two provider names visible.
5. **0:40–0:50** — Docs sidebar visible: [slaps.dev/docs/ghost-env/getting-started](https://slaps.dev/docs/ghost-env/getting-started) — slight scroll past “Recording” or “Chaos”.
6. **0:50–0:54** — Terminal: `npm install ghost-env` / `pip install ghost-env` (two-line cut).
7. **0:54–1:00** — End card: `slaps.dev/ghost-env`.

---

## SFX / music

- Same as execpad: soft bed optional; VO forward.

---

## Checklist before export

- [ ] Don’t show real API keys or tokens on screen.
- [ ] Seed value visible in code (`42` is fine — on brand for “deterministic”).
- [ ] End card 2s minimum.
