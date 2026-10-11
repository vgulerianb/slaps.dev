// Interactive parts of the "Stealth mode: patch nothing that isn't already a tell" post (ported from the slapify blog).
(function () {
Compare(document.getElementById("cmp"));

const CONDS = [
  { id: "webdriver", label: "navigator.webdriver reports true" },
  { id: "noChrome", label: "window.chrome is missing" },
  { id: "noPlugins", label: "navigator.plugins is empty" },
  { id: "noLangs", label: "navigator.languages is empty" },
  { id: "swgl", label: "WebGL renderer is software (SwiftShader, llvmpipe)" },
  { id: "headlessUA", label: "User agent contains HeadlessChrome" },
];
const PATCHES = [
  { name: "navigator.webdriver → false", on: "webdriver", why: ["Already false natively: nothing to fix", "Still true: set to false (not undefined, the property must exist)"] },
  { name: "window.chrome stub", on: "noChrome", why: ["Present already", "Missing: add a realistic chrome object"] },
  { name: "Plugins and MIME types", on: "noPlugins", why: ["Real plugin list present", "Empty: rebuild on the real PluginArray and Plugin prototypes"] },
  { name: "navigator.languages", on: "noLangs", why: ["Languages present", "Empty: report en-US, en"] },
  { name: "WebGL vendor/renderer", on: "swgl", why: ["Real GPU: no wrapper installed at all", "Software rasteriser: report an Intel Iris GPU instead"] },
  { name: "User agent (at launch)", on: "headlessUA", why: ["Clean already", "Relaunch once with 'Headless' removed, so header and JS agree"] },
];
const state = {};
const inputs = document.getElementById("gate-inputs");
CONDS.forEach((c) => {
  const l = document.createElement("label");
  l.style.cssText = "display:flex;gap:8px;align-items:flex-start;color:var(--text)";
  l.innerHTML = `<input type="checkbox" data-id="${c.id}" style="margin-top:4px"> <span></span>`;
  l.querySelector("span").textContent = c.label;
  l.querySelector("input").onchange = (e) => { state[c.id] = e.target.checked; render(); };
  inputs.appendChild(l);
});
function set(v) { CONDS.forEach((c) => { state[c.id] = v[c.id] || false; inputs.querySelector(`[data-id=${c.id}]`).checked = state[c.id]; }); render(); }
document.getElementById("gate-modern").onclick = () => set({ headlessUA: true });
document.getElementById("gate-old").onclick = () => set({ webdriver: true, noChrome: true, noPlugins: true, noLangs: true, swgl: true, headlessUA: true });
function render() {
  const rows = PATCHES.map((p) => { const on = !!state[p.on]; return `<tr><td>${p.name}</td><td style="color:${on ? "var(--accent)" : "var(--muted)"};font-weight:600">${on ? "yes" : "no"}</td><td>${p.why[on ? 1 : 0]}</td></tr>`; });
  const jsPatched = PATCHES.slice(0, 5).some((p) => state[p.on]);
  rows.push(`<tr><td>Function.prototype.toString cloak</td><td style="color:${jsPatched ? "var(--accent)" : "var(--muted)"};font-weight:600">${jsPatched ? "yes" : "no"}</td><td>${jsPatched ? "Something was patched, so hide the patched getters" : "Nothing patched, so nothing to hide (the cloak is itself detectable)"}</td></tr>`);
  document.getElementById("gate-body").innerHTML = rows.join("");
  const n = PATCHES.slice(0, 5).filter((p) => state[p.on]).length + (jsPatched ? 1 : 0);
  document.getElementById("gate-out").innerHTML = n === 0
    ? "<b>0 JavaScript patches.</b> The injected script inspects the page and leaves everything alone: nothing for a tampering detector to find."
    : `<b>${n} JavaScript patch${n > 1 ? "es" : ""}</b> installed. Each one is a value that was already giving the browser away.`;
}
set({ headlessUA: true });
})();
