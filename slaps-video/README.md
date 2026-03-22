# slaps-video (Remotion)

This folder is **gitignored** in the parent `slaps.dev` repo — keep renders and `node_modules` local.

## Compositions

| ID | Length | Description |
|----|--------|-------------|
| `execpad-launch` | 60s @ 30fps · 1920×1080 | Launch motion for **agentpad** (composition id unchanged) |
| `ghost-env-launch` | 60s @ 30fps · 1920×1080 | Launch motion for **stubfetch** (composition id unchanged) |

## Commands

```bash
cd slaps-video
npm install
npm run dev
```

Preview in Remotion Studio, then:

```bash
mkdir -p out
npm run render:execpad
npm run render:ghost-env
```

Outputs: `out/execpad-launch.mp4`, `out/ghost-env-launch.mp4`.

## Assets

End cards use a built-in **SlapsMark** (spark + `slaps.dev` type). Drop `public/slaps.dev.png` and switch components to `staticFile` if you prefer a raster logo.

## Copy for posts

Markdown scripts / LinkedIn drafts (optional): `execpad/launch-post.md`, `ghost-env/launch-post.md`, and `_shared/visual-spec.md`.
