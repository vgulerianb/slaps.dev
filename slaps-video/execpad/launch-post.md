# execpad — launch post (LinkedIn / blog)

**Optional headline:** A runtime that treats your repo as the workspace.

---

Agents and copilots are only as good as the sandbox you give them. Most demos run in a toy environment. Real work happens against **your** tree — with boundaries you can explain to security and to the model.

**execpad** is a small open-source runtime that runs **bash, Python, JavaScript, and SQL** against a real directory. It’s built for:

- **Overlay mode** — try changes in a temp copy, then apply or discard.  
- **Read-only and glob allowlists** — scope what matters.  
- **Structured output and a session run log** — debug what the agent actually did.  
- **OpenAI-style tool helpers** — ship function-calling without reinventing the loop.

Same ideas in **TypeScript** (`npm install execpad`) and **Python** (`pip install execpad`).

Docs and examples live on the site — no wall of markdown on GitHub.

**Try it:** [slaps.dev/execpad](https://slaps.dev/execpad)  
**Docs:** [slaps.dev/docs/execpad](https://slaps.dev/docs/execpad/)  
**Code:** [github.com/vgulerianb/execpad](https://github.com/vgulerianb/execpad)

Apache-2.0. We’d love feedback from anyone building agent tooling or CI that runs user code.

— slaps.dev

---

### Short variant (X / thread opener)

Shipped **execpad**: run bash / Python / Node / SQL on a **real** project dir — overlay, allowlists, run log, OpenAI tool helpers. TS + Python. [slaps.dev/execpad](https://slaps.dev/execpad)
