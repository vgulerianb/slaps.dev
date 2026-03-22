# agentpad — ~60 second launch video

**Target:** 58–60s including 2s end card.  
**VO pace:** calm, ~2.0–2.2 words/sec.

---

## On-screen text (burn-in suggestions)

| Time | Text (keep short) |
|------|-------------------|
| 0:00–0:04 | Your repo. Their runtime. |
| 0:18–0:22 | agentpad |
| 0:22–0:28 | bash · python · javascript · sql |
| 0:36–0:42 | overlay · allowlists · run log |
| 0:48–0:52 | npm install agentpad |
| 0:54–1:00 | slaps.dev/agentpad |

---

## Voiceover script (~145 words → trim to ~125 if over)

**(0:00)** Agents don’t need another toy sandbox. They need a **real workspace** — with rules.

**(0:08)** **agentpad** runs shell, Python, Node, and SQL **against your project directory**. One API. Four engines.

**(0:18)** Use **normal** mode on the live tree, **read-only** when you want guardrails, or **overlay** — work in a copy, then apply changes when you’re sure.

**(0:30)** **Glob allowlists**, timeouts, and capped output keep runs bounded. Every run can feed a **session log** you can export — so you can see exactly what happened.

**(0:42)** If you’re on OpenAI-style tools, there are helpers to wire **function calling** without reinventing the loop.

**(0:50)** TypeScript and Python. Install from npm or PyPI. Docs on the site.

**(0:56)** **agentpad** — [slaps.dev/agentpad](https://slaps.dev/agentpad)

---

## Shot list (minimal)

1. **0:00–0:08** — White field + first caption. Optional: subtle cursor blink in empty terminal.
2. **0:08–0:18** — Terminal: `npm install agentpad` then a short snippet: `import { Runtime } from "agentpad"` → `new Runtime("./project")` → `await rt.run("python", "import sys; print(sys.version)")` → `await rt.run("bash", "git log --oneline -5")` (spacing clean; don’t read code aloud; VO carries it).
3. **0:18–0:28** — Browser full-width: [slaps.dev/agentpad](https://slaps.dev/agentpad) hero; pause on product name **agentpad**.
4. **0:28–0:36** — Same page, scroll to “Languages” or feature grid; or terminal showing `readonly` / `overlay` in comments.
5. **0:36–0:48** — Docs: [slaps.dev/docs/agentpad/getting-started](https://slaps.dev/docs/agentpad/getting-started) — slow scroll one screen.
6. **0:48–0:54** — Terminal again: `npm install agentpad` + `pip install agentpad` on two lines (stacked cuts OK).
7. **0:54–1:00** — End card: `slaps.dev/agentpad` + **agentpad** wordmark; pills: View on npm · GitHub · Docs.

---

## SFX / music

- Optional: single low piano or ambient pad, **−18 LUFS** under VO.
- No SFX on cuts.

---

## Checklist before export

- [ ] Captions readable on phone (min 42px equivalent at 1080 wide).
- [ ] All URLs click-tested.
- [ ] End card 2s minimum.
- [ ] On-screen code: valid TS (e.g. `javascript` not `js` for `rt.run`).
