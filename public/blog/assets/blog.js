// Shared pieces for the Slapify blog: replay player,
// before/after compare, and a tiny SVG helper. No dependencies.

// Chart colours come from the blog wrapper, so they follow the slaps.dev palette.
window.css = (name) =>
  getComputedStyle(document.querySelector(".blog-page") || document.documentElement).getPropertyValue(name).trim();

/** Build SVG elements: svg("rect", {x:1}, parent) */
window.svg = function (tag, attrs = {}, parent) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") el.textContent = v;
    else el.setAttribute(k, v);
  }
  if (parent) parent.appendChild(el);
  return el;
};

/** Step-through replay of a real session: frames + the tool calls behind them. */
window.Player = function (el, { dir, name, steps, count }) {
  const frames = Array.from({ length: count }, (_, i) => `${dir}/${name}-${String(i).padStart(2, "0")}.jpg`);
  frames.forEach((src) => { const i = new Image(); i.src = src; });
  const t0 = new Date(steps[0].ts).getTime();
  const label = (s) => {
    const a = s.args || {};
    if (a.filtered) return `"${a.filtered}" (text filter replaced an em dash)`;
    return a.description || a.url || a.statement || (a.text ? `"${a.text}"` : "") || (a.option ? `"${a.option}"` : "") ||
      (a.ref ? a.ref + (a.checked !== undefined ? ` → ${a.checked ? "checked" : "unchecked"}` : "") : "") || a.key || a.summary || "";
  };
  el.classList.add("player");
  el.innerHTML = `<div class="stage"><img alt=""></div>
    <div class="bar"><button class="btn primary" data-play>▶ Play</button><button class="btn" data-prev aria-label="Previous step">←</button><button class="btn" data-next aria-label="Next step">→</button>
    <input type="range" min="0" max="${count - 1}" value="0" aria-label="Step"><span class="readout"></span></div>
    <div class="steps" role="list"></div>`;
  const img = el.querySelector("img"), range = el.querySelector("input"), readout = el.querySelector(".readout"), list = el.querySelector(".steps"), play = el.querySelector("[data-play]");
  const rows = [...steps, { tool: "done", args: { summary: "task complete" }, ts: steps[steps.length - 1].ts }].slice(0, count).map((s, i) => {
    const r = document.createElement("div");
    r.className = "step"; r.setAttribute("role", "listitem");
    const secs = Math.round((new Date(s.ts).getTime() - t0) / 1000);
    r.innerHTML = `<span class="t">+${secs}s</span><span class="n"></span><span class="d"></span>`;
    r.querySelector(".n").textContent = s.tool;
    r.querySelector(".d").textContent = label(s);
    r.onclick = () => { stop(); show(i); };
    list.appendChild(r);
    return r;
  });
  let cur = 0, timer = null;
  function show(i) {
    cur = Math.max(0, Math.min(count - 1, i));
    img.src = frames[cur];
    img.alt = `Step ${cur + 1}: ${rows[cur].querySelector(".n").textContent} ${rows[cur].querySelector(".d").textContent}`;
    range.value = cur;
    readout.innerHTML = `step <b>${cur + 1}</b> / ${count}`;
    rows.forEach((r, j) => r.setAttribute("aria-current", j === cur ? "true" : "false"));
    const r = rows[cur];
    if (r.offsetTop < list.scrollTop || r.offsetTop > list.scrollTop + list.clientHeight - r.offsetHeight) list.scrollTop = r.offsetTop - 40;
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = "▶ Play"; }
  play.onclick = () => {
    if (timer) return stop();
    if (cur >= count - 1) show(0);
    play.textContent = "❚❚ Pause";
    timer = setInterval(() => (cur >= count - 1 ? stop() : show(cur + 1)), 1500);
  };
  el.querySelector("[data-prev]").onclick = () => { stop(); show(cur - 1); };
  el.querySelector("[data-next]").onclick = () => { stop(); show(cur + 1); };
  range.oninput = () => { stop(); show(+range.value); };
  show(0);
};

/** Drag-to-compare two screenshots. */
window.Compare = function (el) {
  const top = el.querySelector(".top"), handle = el.querySelector(".handle"), topImg = top.querySelector("img");
  const set = (f) => {
    f = Math.max(0.02, Math.min(0.98, f));
    top.style.width = f * 100 + "%";
    handle.style.left = `calc(${f * 100}% - 1px)`;
    topImg.style.width = el.clientWidth + "px";
  };
  let drag = false;
  const move = (x) => { const r = el.getBoundingClientRect(); set((x - r.left) / r.width); };
  el.addEventListener("pointerdown", (e) => { drag = true; move(e.clientX); });
  addEventListener("pointermove", (e) => drag && move(e.clientX));
  addEventListener("pointerup", () => (drag = false));
  el.tabIndex = 0;
  let f = 0.5;
  el.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") set((f -= 0.05));
    if (e.key === "ArrowRight") set((f += 0.05));
  });
  addEventListener("resize", () => set(parseFloat(top.style.width) / 100 || 0.5));
  set(0.5);
};

/** Call fn when the page width changes (more reliable than window resize). */
window.onWidthChange = function (fn) {
  let last = document.body.clientWidth, t;
  new ResizeObserver(() => {
    const w = document.body.clientWidth;
    if (w === last) return;
    last = w;
    clearTimeout(t);
    t = setTimeout(fn, 120);
  }).observe(document.body);
};
