// Interactive parts of the "Adding Jev: small decisions, made fast" post (ported from the slapify blog).
(function () {
const D = BLOG_DATA, B = D.bench;
const pct = (v) => Math.round(v * 100) + "%";
document.getElementById("s-lat").textContent = `${B.all.jev_ms_median} vs ${B.all.llm_ms_median} ms`;
document.getElementById("s-cost").textContent = `$${B.all.jev_cost_per_1k.toFixed(2)} vs $${B.all.llm_cost_per_1k.toFixed(2)}`;
document.getElementById("bench-body").innerHTML = ["element", "check", "popup", "all"].map((k) => {
  const r = B[k];
  return `<tr><td>${k === "all" ? "<b>All</b>" : k === "element" ? "Find element" : k === "check" ? "Page check" : "Popup check"}</td><td class="num">${r.n}</td><td class="num">${pct(r.jev_acc)}</td><td class="num">${pct(r.jev_confident_acc)} <span style="color:var(--muted)">on ${pct(r.jev_confident_share)}</span></td><td class="num">${pct(r.llm_acc)}</td><td class="num">${r.jev_ms_median} ms</td><td class="num">${r.llm_ms_median} ms</td></tr>`;
}).join("");

function width(el) { return Math.max(280, el.clientWidth - (el.classList.contains("panel") ? 36 : 0)); }

function drawLatency() {
  const el = document.getElementById("lat-chart");
  el.querySelector("svg")?.remove();
  const W = width(el), H = 150, L = 76, R = 10, max = 6000;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `Jev median ${B.all.jev_ms_median} ms, Sonnet 5 median ${B.all.llm_ms_median} ms` }, el);
  const x = (ms) => L + (ms / max) * (W - L - R);
  for (const t of [0, 1000, 2000, 3000, 4000, 5000, 6000]) {
    svg("line", { x1: x(t), x2: x(t), y1: 10, y2: H - 24, stroke: css("--border") }, s);
    if (W > 420 || t % 2000 === 0) svg("text", { x: x(t), y: H - 6, "text-anchor": "middle", text: t / 1000 + "s" }, s);
  }
  [["Jev", D.lat.jev, css("--accent"), 40], ["Sonnet 5", D.lat.llm, css("--blue"), 90]].forEach(([name, arr, color, y]) => {
    svg("text", { x: 0, y: y + 4, text: name, style: "fill:" + css("--text") + ";font-weight:600" }, s);
    arr.forEach((ms, i) => svg("circle", { cx: x(ms), cy: y + ((i * 37) % 21) - 10, r: 3.2, fill: color, opacity: 0.7 }, s));
    const med = [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
    svg("line", { x1: x(med), x2: x(med), y1: y - 16, y2: y + 16, stroke: css("--text"), "stroke-width": 2 }, s);
  });
}

function drawConf() {
  const el = document.getElementById("conf-chart");
  el.innerHTML = "";
  const t = +document.getElementById("conf-t").value;
  document.getElementById("conf-t-v").textContent = t.toFixed(2);
  const E = D.elements, W = width(document.getElementById("conf-panel")), H = 120, L = 60, R = 10;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Element decisions by Jev confidence" }, el);
  const x = (c) => L + ((c - 0.3) / 0.7) * (W - L - R);
  svg("rect", { x: x(t), y: 6, width: W - R - x(t), height: H - 34, fill: css("--accent-soft") }, s);
  svg("line", { x1: x(t), x2: x(t), y1: 6, y2: H - 28, stroke: css("--accent"), "stroke-width": 2 }, s);
  for (const v of [0.3, 0.5, 0.7, 0.9, 1]) svg("text", { x: x(v), y: H - 8, "text-anchor": "middle", text: v.toFixed(1) }, s);
  [["reply", 30], ["like", 70]].forEach(([k, y]) => {
    svg("text", { x: 0, y: y + 4, text: k === "reply" ? "Reply box" : "Like button", style: "fill:" + css("--text") }, s);
    E.filter((e) => e.kind === k).forEach((e, i) => svg("circle", { cx: x(Math.min(1, e.conf)), cy: y + ((i * 7) % 15) - 7, r: 5, fill: e.correct ? css("--good") : css("--bad"), stroke: css("--surface"), "stroke-width": 1.5 }, s));
  });
  const trusted = E.filter((e) => e.conf >= t);
  document.getElementById("conf-share").textContent = pct(trusted.length / E.length);
  document.getElementById("conf-acc").textContent = trusted.length ? pct(trusted.filter((e) => e.correct).length / trusted.length) : "–";
  document.getElementById("conf-all").textContent = pct(E.filter((e) => (e.conf >= t ? e.correct : e.llmCorrect)).length / E.length);
}

function drawCal() {
  const el = document.getElementById("cal-chart");
  el.innerHTML = "";
  let lo = +document.getElementById("cal-lo").value, hi = +document.getElementById("cal-hi").value;
  if (hi <= lo) { hi = Math.min(0.98, lo + 0.05); document.getElementById("cal-hi").value = hi; }
  document.getElementById("cal-lo-v").textContent = lo.toFixed(2);
  document.getElementById("cal-hi-v").textContent = hi.toFixed(2);
  const C = D.checks, W = width(document.getElementById("cal-panel")), H = 96, L = 10, R = 10;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Page checks by Jev probability" }, el);
  const x = (p) => L + p * (W - L - R);
  svg("rect", { x: x(lo), y: 8, width: x(hi) - x(lo), height: H - 36, fill: css("--warn-soft") }, s);
  svg("text", { x: (x(lo) + x(hi)) / 2, y: 22, "text-anchor": "middle", text: "look for yourself" }, s);
  for (const v of [0, 0.25, 0.5, 0.75, 1]) svg("text", { x: x(v), y: H - 8, "text-anchor": "middle", text: v }, s);
  C.forEach((c, i) => svg("circle", { cx: x(c.p), cy: 46 + ((i * 5) % 16) - 8, r: 5.5, fill: c.truth ? css("--good") : css("--bad"), stroke: css("--surface"), "stroke-width": 1.5 }, s));
  const conf = C.filter((c) => c.p < lo || c.p > hi), right = conf.filter((c) => (c.p > hi) === c.truth).length;
  document.getElementById("cal-out").innerHTML = `Jev answers <b>${conf.length}</b> of 16 itself, <b>${right}</b> correctly (${conf.length - right} wrong). <b>${16 - conf.length}</b> go back to the agent. For comparison, Sonnet 5 answered all 16 and got <b>${C.filter((c) => c.llm === c.truth).length}</b> right.`;
}

const RS = 0.0149, JEV = 0.0002, SNAP = 825 / 163, BASE = 36.44 / 163;
function drawSave() {
  const share = +document.getElementById("sv-share").value;
  const saved = SNAP * share * (RS - JEV);
  document.getElementById("sv-share-v").textContent = Math.round(share * 100) + "%";
  document.getElementById("sv-new").textContent = "$" + (BASE - saved).toFixed(2);
  document.getElementById("sv-pct").textContent = "−" + Math.round((saved / BASE) * 100) + "%";
}

document.getElementById("conf-t").oninput = drawConf;
document.getElementById("cal-lo").oninput = drawCal;
document.getElementById("cal-hi").oninput = drawCal;
document.getElementById("sv-share").oninput = drawSave;
function drawAll() { drawLatency(); drawConf(); drawCal(); }
drawAll(); drawSave();
document.addEventListener("themechange", drawAll);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawAll);
onWidthChange(drawAll);
Player(document.getElementById("chirp-player"), { dir: "/blog/media/chirp", name: "chirp", steps: BLOG_DATA.chirp, count: 30 });
})();
