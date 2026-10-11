// Interactive parts of the "A browser agent you can leave alone" post (ported from the slapify blog).
(function () {
// ── Tool-loop stepper ───────────────────────────────────────────
const STAGES = ["Contract", "Admission", "Review", "Execute", "Observe"];
const SCEN = [
  { name: "Scroll the feed", call: 'scroll({ direction: "down" })',
    s: [["pass", "navigate: moves the view, changes nothing"], ["pass", "Admitted"], ["skip", "Only irreversible actions are reviewed"], ["pass", "Scrolled 300px"], ["pass", "Nothing to add"]],
    result: '{ "ok": true }' },
  { name: 'Click "Reply" (first time)', call: 'click({ ref: "e8" })   // button "Reply"',
    s: [["on", 'irreversible: the label "Reply" commits a post'], ["pass", "Admitted: not done on this page before"], ["pass", "Jev: clear (0.83) in 1.1s"], ["pass", "Clicked, reply posted"], ["pass", "Recorded as committed on this page"]],
    result: '{ "ok": true, "clicked": "e8" }' },
  { name: "Click it again", call: 'click({ ref: "e8" })   // same button, same page',
    s: [["on", "irreversible"], ["stop", "Held: this exact action already succeeded on this page"], ["skip", "Not reached"], ["skip", "Not run"], ["skip", "—"]],
    result: '{\n  "ok": false,\n  "held": true,\n  "error": "Not run again: this exact action already succeeded on this page. Repeating it could post, send or buy twice.",\n  "do_next": "If it genuinely did not take effect, use a DIFFERENT control (for example click the Post button instead of repeating the keyboard shortcut), or move on to the next item."\n}' },
  { name: "Post a made-up claim", call: 'press({ key: "Meta+Enter" })   // composer: "React 20 ships next week"',
    s: [["on", "irreversible: Meta+Enter submits the composer"], ["pass", "Admitted"], ["stop", "Caution: may break the policy (an unverifiable factual claim)"], ["skip", "Not run"], ["skip", "—"]],
    result: '{\n  "ok": false,\n  "held": true,\n  "review": "caution",\n  "action": "press Meta+Enter",\n  "reason": "The reviewer judged this may break the policy.",\n  "do_next": "Do not repeat this action as-is. Revise what you were about to publish so it clearly follows the policy and try again, or skip this item and move on."\n}' },
  { name: "A click that keeps failing", call: 'click({ ref: "e41" })   // second identical attempt',
    s: [["pass", "mutate"], ["pass", "Admitted: repeats are never blocked"], ["skip", "Not irreversible"], ["stop", "Failed: element not found"], ["on", "Second identical failure: guidance added"]],
    result: '{\n  "ok": false,\n  "error": "Element e41 not found",\n  "guidance": "This exact call has now failed 2 times on this page. Retrying it unchanged will not work: change the arguments, pick a different element, or take a different approach."\n}' },
  { name: "Re-checking the page", call: "get_page_text()   // third time, page unchanged",
    s: [["pass", "read"], ["pass", "Admitted"], ["skip", "Not irreversible"], ["pass", "Read the page"], ["on", "Same result 3 times: guidance added"]],
    result: '{\n  "text": "…",\n  "guidance": "This returned exactly the same result 3 times in a row on this page, so nothing is changing. Stop re-checking: act on what you already have, or move on."\n}' },
  { name: "Reviewer is down", call: 'click({ ref: "e12" })   // button "Send"',
    s: [["on", 'irreversible: "Send"'], ["pass", "Admitted"], ["stop", "No reviewer could answer: held (on_unavailable: hold)"], ["skip", "Not run"], ["skip", "—"]],
    result: '{\n  "ok": false,\n  "held": true,\n  "review": "unavailable",\n  "reason": "The safety review for irreversible actions is unavailable, so this action was held rather than done unreviewed.",\n  "do_next": "Skip this item for now and carry on with other work; the review may be back shortly."\n}' },
];
let sc = 0, stage = -1;
const scen = document.getElementById("scen"), flow = document.getElementById("flow"), result = document.getElementById("result"), note = document.getElementById("step-note");
SCEN.forEach((x, i) => { const b = document.createElement("button"); b.textContent = x.name; b.onclick = () => { sc = i; stage = -1; renderLoop(); }; scen.appendChild(b); });
function renderLoop() {
  [...scen.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === sc)));
  const x = SCEN[sc];
  flow.innerHTML = STAGES.map((st, i) => {
    const [kind, text] = x.s[i];
    const cls = i > stage ? "" : kind === "skip" ? "skip" : kind;
    return `<div class="node ${cls}"><h5>${i + 1}. ${st}</h5><p>${i <= stage ? text : "&nbsp;"}</p></div>`;
  }).join("");
  const done = stage >= STAGES.length - 1 || x.s.slice(0, stage + 1).some(([k]) => k === "stop") && x.s.slice(stage + 1).every(([k]) => k === "skip");
  result.textContent = stage < 0 ? `Model calls: ${x.call}` : done ? `Result the model sees:\n${x.result}` : `Model calls: ${x.call}`;
  note.textContent = done ? "Done." : `Stage ${stage + 2} of 5`;
  document.getElementById("step-btn").disabled = done;
}
document.getElementById("step-btn").onclick = () => {
  const x = SCEN[sc];
  stage++;
  while (stage < STAGES.length - 1 && x.s[stage][0] === "skip" && x.s.slice(0, stage).some(([k]) => k === "stop")) stage++;
  renderLoop();
};
document.getElementById("reset-btn").onclick = () => { stage = -1; renderLoop(); };
renderLoop();

// ── Outage timeline ─────────────────────────────────────────────
function patient(round) { return Math.min(60 * 2 ** Math.max(0, round - 1), 300); } // seconds, mirrors recovery.ts
function drawOutage() {
  const mins = +document.getElementById("out-min").value;
  document.getElementById("out-min-v").textContent = mins + " min";
  const el = document.getElementById("outage-chart"); el.innerHTML = "";
  const W = Math.max(280, document.getElementById("outage").clientWidth - 36), H = 110, L = 10, R = 10, span = 62 * 60;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Retry timeline during an outage" }, el);
  const x = (sec) => L + (sec / span) * (W - L - R);
  svg("rect", { x: x(0), y: 34, width: x(mins * 60) - x(0), height: 22, rx: 4, fill: css("--bad-soft") }, s);
  svg("text", { x: x(0) + 6, y: 49, text: "provider refusing", style: "fill:" + css("--bad") }, s);
  for (const m of [0, 10, 20, 30, 40, 50, 60]) svg("text", { x: x(m * 60), y: H - 4, "text-anchor": "middle", text: m + "m" }, s);
  let t = 0, round = 0, tries = 0, notified = null, recovered = null;
  while (t < span) {
    tries++;
    const ok = t >= mins * 60;
    svg("circle", { cx: x(t), cy: 45, r: 5, fill: ok ? css("--good") : css("--text"), stroke: css("--surface"), "stroke-width": 1.5 }, s);
    if (ok) { recovered = t; break; }
    if (notified === null && t >= 600) { notified = t; }
    round++; t += patient(round);
  }
  if (notified !== null) {
    svg("line", { x1: x(notified), x2: x(notified), y1: 14, y2: 34, stroke: css("--accent"), "stroke-width": 2 }, s);
    svg("text", { x: x(notified), y: 10, "text-anchor": "middle", text: "📱 one Telegram message", style: "fill:" + css("--accent") }, s);
  }
  document.getElementById("out-note").innerHTML = recovered !== null
    ? `The agent checks back <b>${tries - 1}</b> time${tries - 1 === 1 ? "" : "s"} (after 1, 2 and 4 minutes, then every 5) and resumes <b>${Math.round((recovered - mins * 60) / 60)} min</b> after the outage clears. ${notified !== null ? "You get exactly one message along the way." : "Short enough that nobody is bothered."} The process never exits.`
    : "Still waiting, still running.";
}
document.getElementById("out-min").oninput = drawOutage;

// ── Compaction explorer ─────────────────────────────────────────
const MSGS = ["goal", "assistant", "tool", "assistant", "tool", "assistant", "tool", "user", "assistant", "tool", "assistant", "tool", "assistant", "tool", "assistant", "tool", "assistant", "tool", "assistant", "tool"];
let safe = true;
function cutFor(keep) { // mirrors chooseCompactionCut in runner.ts
  let cut = Math.max(1, MSGS.length - keep);
  if (safe) while (cut > 1 && MSGS[cut] === "tool") cut--;
  return cut;
}
function drawCompact() {
  const keep = +document.getElementById("keep").value;
  document.getElementById("keep-v").textContent = keep;
  const cut = cutFor(keep), box = document.getElementById("msgs");
  box.innerHTML = "";
  MSGS.forEach((m, i) => {
    const d = document.createElement("div");
    const kept = i === 0 || i >= cut, orphan = i === cut && m === "tool";
    d.style.cssText = `font-size:12px;padding:6px 8px;border-radius:7px;border:1px solid ${orphan ? "var(--bad)" : i === 0 ? "var(--accent)" : "var(--border)"};background:${orphan ? "var(--bad-soft)" : i === 0 ? "var(--accent-soft)" : kept ? "var(--surface-2)" : "transparent"};opacity:${kept ? 1 : 0.45};font-family:var(--mono)`;
    d.textContent = i === 0 ? "goal (verbatim)" : m === "tool" ? "result" : m === "assistant" ? "call" : "user";
    if (i === cut && i > 1) {
      const sum = document.createElement("div");
      sum.style.cssText = "font-size:12px;padding:6px 8px;border-radius:7px;border:1px dashed var(--accent);font-family:var(--mono);color:var(--accent)";
      sum.textContent = `summary of ${cut - 1}`;
      box.appendChild(sum);
    }
    box.appendChild(d);
  });
  const orphan = MSGS[cut] === "tool";
  document.getElementById("compact-note").innerHTML = orphan
    ? `<b style="color:var(--bad)">Orphaned result.</b> The cut lands after a call and before its result: the model would see an answer with no question.`
    : `Cut at message ${cut + 1}${safe && cut !== Math.max(1, MSGS.length - keep) ? `, moved back from ${Math.max(1, MSGS.length - keep) + 1} so a call and its result stay together` : ""}. The goal stays first, word for word.`;
}
document.getElementById("keep").oninput = drawCompact;
document.getElementById("rule-safe").onclick = () => { safe = true; document.getElementById("rule-safe").setAttribute("aria-pressed", "true"); document.getElementById("rule-naive").setAttribute("aria-pressed", "false"); drawCompact(); };
document.getElementById("rule-naive").onclick = () => { safe = false; document.getElementById("rule-safe").setAttribute("aria-pressed", "false"); document.getElementById("rule-naive").setAttribute("aria-pressed", "true"); drawCompact(); };

function drawAll() { drawOutage(); drawCompact(); }
drawAll();
document.addEventListener("themechange", drawAll);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawAll);
onWidthChange(drawAll);
})();
