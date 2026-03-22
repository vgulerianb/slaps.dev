# Visual spec — agentpad & stubfetch launches

Minimal, aligned with [slaps.dev](https://slaps.dev) UI.

## Palette

- Background: `#ffffff` or `#fafafa`
- Primary text: `#0a0a0a`
- Secondary: `#666666`
- Hairline rules: `rgba(0,0,0,0.08)`
- Accent: black buttons / dots only — **no extra brand colors**

## Type

- **Inter** (or system UI sans). Title weight 600–700, body 400–500.
- Package names on screen: **`agentpad`**, **`stubfetch`** (npm/PyPI). Product pages may still use URLs **`/execpad`** and **`/ghost-env`**.

## Motion

- Cuts on **phrase boundaries**, not every word.
- Prefer **hard cuts** over wipes. Optional 200ms crossfade between sections.
- No flying 3D logos. One **end card**: wordmark or `slaps.dev` + URL.

## B-roll pattern

1. Full-screen type on neutral field (hook).
2. Tight terminal: real commands from the script (large font, high contrast).
3. Browser: product hero on slaps.dev (static or slow scroll).
4. End card.

## Do / don’t

- Do: real installs (`npm install agentpad` / `stubfetch`), real doc URLs (`/docs/agentpad`, `/docs/stubfetch`).
- Don’t: fake “AI generated” UIs, stock footage of random hackers, loud whoosh SFX every cut.
- On-screen code must be **valid** (e.g. `rt.run("javascript", ...)` not `"js"`; single space after commas).
