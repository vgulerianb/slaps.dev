// Interactive parts of the "We built a Twitter reply agent without Jev. Here's what broke." post (ported from the slapify blog).
(function () {
const D = BLOG_DATA;

// ── Incident log ────────────────────────────────────────────────
const INCIDENTS = [
  { t: "Browser closes", seen: "In a visible browser window, x.com opened and the window closed a moment later. Headless worked fine.",
    why: "Launch options (profile, user agent, stealth flags) were passed as environment variables, which the browser layer mishandles when launching headed: the browser landed on a blank or error page and the session gave up.",
    fix: "Launch options go on the command line of the first navigation, which works in both modes. Environment variables are kept only for headless, where they're reliable." },
  { t: "Can't read tweets", seen: "The agent reported that the page 'isn't returning readable tweet content' and concluded it was logged out.",
    why: "The interactive snapshot lists controls, not body text, so a feed of posts looks almost empty. Worse, snapshots were trimmed before being added to history, so even the controls were cut off.",
    fix: "A get_page_text() tool for reading, get_links() for real URLs, and history trimming that only shrinks older results. The rules now say plainly that a sparse snapshot does not mean the page failed." },
  { t: "Loop guard deadlock", seen: "After a few replies the agent was refused every tool, including ones it hadn't used, and stalled.",
    why: "The guard counted identical calls and blocked them. Pressing the same submit shortcut on ten different posts looked like a loop. Once tripped, it walled off everything.",
    fix: "Replaced with tool admission: calls are keyed by the page they run on, nothing is blocked for repeating, repeated failures get guidance, and only an irreversible action that already succeeded on the same page is held." },
  { t: "Busy doing nothing", seen: "A whole cycle went by with lots of activity and zero replies: re-checking, re-reading, researching.",
    why: "The prompt invited caution, and verifying is always the 'safe' next step. Finding a post's reply button in a long feed of identical buttons also failed often.",
    fix: "Verify at most once, then assume it worked and move on. Navigate to each post's own page (via get_links) instead of hunting in the feed. Be greedy: ten replies is the goal." },
  { t: "Truncated responses", seen: "Tool calls arrived cut off mid-JSON, and the turn failed.",
    why: "Long memory values made responses long enough to hit the output limit mid-string.",
    fix: "Truncated JSON is repaired (closing open strings, arrays and objects) and the valid calls recovered. The rules now ask for one-line memory values." },
  { t: "Finished by accident", seen: "The run ended with 'task complete' in the middle of a cycle.",
    why: "A response cut off before the tool's name parsed as zero tool calls with empty text, and a turn with no tool calls counts as the model's final answer.",
    fix: "A reply that is empty or still contains tool-call syntax is never treated as final; the model is asked to try again. Persistent mode goes further: done() is refused and prose counts as a pause." },
  { t: "272 restarts", seen: "Overnight, the supervisor restarted the process 272 times, each run lasting seconds.",
    why: "The model provider hit a usage limit. The process exited on the error, the supervisor restarted it at once, and it failed at once again.",
    fix: "Inside the process, a usage limit now means waiting patiently (1, 2, 4, then every 5 minutes) and one Telegram message after ten minutes. Outside, the supervisor backs off and gives up after eight fast failures." },
  { t: "Em dashes return", seen: "Replies started containing em dashes after the first hour, despite a clear rule.",
    why: "Compaction paraphrased the goal, and the paraphrase softened the rule.",
    fix: "The goal is kept verbatim through compaction, and text_filters enforce the rule at the keyboard." },
  { t: "Ten became three", seen: "Replies per cycle dropped from ten to three and stayed there.",
    why: "Two things: a one-off Telegram request for a lighter cycle was saved to memory and applied every cycle after, and strict dedupe plus a fixed query rotation meant fewer fresh posts each hour.",
    fix: "Live instructions are scoped to the cycle they arrive in unless the user says they're lasting. Dedupe now only prevents answering the same post twice, and queries rotate more widely." },
];
(function () {
  const seg = document.querySelector("#incidents .seg"), body = document.getElementById("incident-body");
  INCIDENTS.forEach((inc, i) => {
    const b = document.createElement("button");
    b.textContent = `${i + 1}. ${inc.t}`;
    b.onclick = () => show(i);
    seg.appendChild(b);
  });
  function show(i) {
    [...seg.children].forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
    const x = INCIDENTS[i];
    body.innerHTML = `<table class="data" style="margin:0"><tbody>
      <tr><th style="width:120px">What we saw</th><td></td></tr><tr><th>Why</th><td></td></tr><tr><th>The fix</th><td></td></tr></tbody></table>`;
    const tds = body.querySelectorAll("td");
    tds[0].textContent = x.seen; tds[1].textContent = x.why; tds[2].textContent = x.fix;
  }
  show(0);
})();

// ── Em dash chart ───────────────────────────────────────────────
function drawDash() {
  const el = document.getElementById("dash-chart");
  el.querySelector("svg")?.remove(); el.querySelector(".legend")?.remove();
  const rows = [
    { label: "Before first compaction", d: D.dash.before.d, n: D.dash.before.n, note: "0 of 290" },
    { label: "After compaction, rule in prompt only", d: D.dash.after.d, n: D.dash.after.n, note: `${D.dash.after.d} of ${D.dash.after.n}` },
    { label: "Worst single run", d: D.dash.worst.d, n: D.dash.worst.n, note: `${D.dash.worst.d} of ${D.dash.worst.n}` },
    { label: "With text_filters (published)", d: 0, n: 248, note: "0 of 248 posted; the model typed 7, all 7 corrected" },
  ];
  const W = Math.max(280, el.clientWidth - 36), rowH = 58, H = rows.length * rowH, L = 0, barW = W - 56;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Share of replies with an em dash" }, el);
  rows.forEach((r, i) => {
    const y = i * rowH, pct = r.d / r.n, w = barW * pct;
    svg("text", { x: 0, y: y + 14, text: r.label, style: "fill:" + css("--text") + ";font-size:13px;font-weight:600" }, s);
    svg("rect", { x: L, y: y + 20, width: barW, height: 18, rx: 4, fill: css("--surface-2") }, s);
    svg("rect", { x: L, y: y + 20, width: Math.max(w, 3), height: 18, rx: 4, fill: pct > 0 ? css("--bad") : css("--good") }, s);
    svg("text", { x: L + Math.max(w, 3) + 8, y: y + 34, text: (pct * 100).toFixed(0) + "%", style: "fill:" + css("--text") + ";font-weight:600" }, s);
    svg("text", { x: 0, y: y + 52, text: r.note, style: "font-size:11px" }, s);
  });
}

// ── Cycle chart ─────────────────────────────────────────────────
function drawCycles() {
  const el = document.getElementById("cycle-chart");
  el.querySelector("svg")?.remove(); el.querySelector(".readout")?.remove();
  const t = D.run.cycleTypes, mins = D.run.cycleMin, calls = D.run.cycleCalls;
  const W = Math.max(300, el.clientWidth - 36), H = 240, L = 30, B = 30, max = 12, bw = (W - L) / t.length;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Replies per cycle; ten in the first two cycles, then three to four." }, el);
  for (const v of [0, 5, 10]) {
    const y = H - B - (v / max) * (H - B - 10);
    svg("line", { x1: L, x2: W, y1: y, y2: y, stroke: css("--border") }, s);
    svg("text", { x: L - 8, y: y + 4, "text-anchor": "end", text: v }, s);
  }
  const target = H - B - (10 / max) * (H - B - 10);
  svg("line", { x1: L, x2: W, y1: target, y2: target, stroke: css("--accent"), "stroke-dasharray": "5 4" }, s);
  svg("text", { x: W, y: target - 6, "text-anchor": "end", text: "goal: 10 per cycle", style: "fill:" + css("--accent") }, s);
  const out = document.createElement("div"); out.className = "readout"; out.style.marginTop = "8px";
  out.innerHTML = "Cycle <b>–</b>"; el.appendChild(out);
  t.forEach((v, i) => {
    const h = (v / max) * (H - B - 10), x = L + i * bw + 2;
    const r = svg("rect", { x, y: H - B - h, width: bw - 4, height: h, rx: 2, fill: i < 2 ? css("--good") : css("--blue"), tabindex: 0 }, s);
    const tell = () => { out.innerHTML = `Cycle <b>${i + 1}</b>: <b>${v}</b> replies, ${calls[i]} model calls, ${mins[i]} minutes of work before sleeping`; s.querySelectorAll("rect[tabindex]").forEach((q) => q.setAttribute("opacity", q === r ? 1 : 0.55)); };
    r.addEventListener("mouseenter", tell); r.addEventListener("focus", tell); r.addEventListener("click", tell);
    if (i % 5 === 0) svg("text", { x: x + bw / 2 - 2, y: H - 10, "text-anchor": "middle", text: i + 1 }, s);
  });
}

// ── Tool chart ──────────────────────────────────────────────────
function drawTools() {
  const el = document.getElementById("tool-chart");
  el.querySelector("svg")?.remove();
  const entries = Object.entries(D.run.tools).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const W = Math.max(290, el.clientWidth - 36), rowH = 26, L = 130, max = entries[0][1];
  const s = svg("svg", { viewBox: `0 0 ${W} ${entries.length * rowH + 4}`, role: "img", "aria-label": "Tool calls by type" }, el);
  entries.forEach(([name, n], i) => {
    const y = i * rowH, w = (W - L - 60) * (n / max);
    svg("text", { x: L - 10, y: y + 17, "text-anchor": "end", text: name, style: "font-family:var(--mono);fill:" + css("--text") }, s);
    svg("rect", { x: L, y: y + 5, width: w, height: 16, rx: 3, fill: name === "get_page_state" ? css("--accent") : css("--muted"), opacity: name === "get_page_state" ? 1 : 0.5 }, s);
    svg("text", { x: L + w + 8, y: y + 17, text: n.toLocaleString() }, s);
  });
}

// ── Runs table + calculator ─────────────────────────────────────
document.getElementById("runs-body").innerHTML = D.runs.map((r) =>
  `<tr><td>${r.h}-hour run</td><td class="num">${r.h}</td><td class="num">${r.calls.toLocaleString()}</td><td class="num">${r.replies}</td><td class="num">$${r.uncached.toFixed(2)}</td><td class="num"><b>$${r.cached.toFixed(2)}</b></td><td class="num">$${(r.cached / r.replies).toFixed(2)}</td></tr>`).join("");

const PRICES = { haiku: [1, 5], sonnet: [2, 10], opus: [5, 25] };
let model = "sonnet";
function calc() {
  const rpd = +document.getElementById("c-rpd").value, cache = document.getElementById("c-cache").checked;
  const [pin, pout] = PRICES[model];
  const callsPerReply = 2583 / 163, inTok = 36101, outTok = 57, share = 0.92;
  const inCost = cache ? inTok * ((1 - share) * pin * 1.25 + share * pin * 0.1) : inTok * pin;
  const perReply = (callsPerReply * (inCost + outTok * pout)) / 1e6;
  const f = (v) => (v < 10 ? "$" + v.toFixed(2) : "$" + Math.round(v).toLocaleString());
  document.getElementById("c-rpd-v").textContent = rpd;
  document.getElementById("c-reply").textContent = f(perReply);
  document.getElementById("c-day").textContent = f(perReply * rpd);
  document.getElementById("c-month").textContent = f(perReply * rpd * 30);
}
document.querySelectorAll("#c-model button").forEach((b) => (b.onclick = () => {
  model = b.dataset.m;
  document.querySelectorAll("#c-model button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  calc();
}));
document.getElementById("c-rpd").oninput = calc;
document.getElementById("c-cache").onchange = calc;

function drawAll() { drawDash(); drawCycles(); drawTools(); }
drawAll(); calc();
onWidthChange(drawAll);
document.addEventListener("themechange", drawAll);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawAll);
})();
