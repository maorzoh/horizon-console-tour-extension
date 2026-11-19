// Omnissa Admin Console Tour: content script (English UI only).
// Covers the Horizon admin console and the Unified Access Gateway dashboard (26.09 and later).
// Explain mode: hover any menu item or setting to see what it does.
// Map mode: records only the places YOU click, once each. The script never clicks anything itself.
// Never reads input values, never sends data anywhere.
(() => {
  "use strict";
  if (window.__hzTourLoaded) return;
  window.__hzTourLoaded = true;

  const STEPS = TOUR_DATA.steps;
  const STATUS = {
    full: ["Documented", "#17703a", "#dcf5e4"],
    partial: ["Partly documented", "#8a5a00", "#fff3c4"],
    desc: ["Overview only", "#4f5b6b", "#e9edf2"],
    todo: ["Not documented yet", "#b42318", "#fde7e4"],
    covered: ["Covered elsewhere", "#5b4bc4", "#ece9fb"],
    missing: ["Not in live menu", "#8a5a00", "#fff3c4"]
  };
  // Clicks on these words are not recorded in Map mode (they change data or open forms).
  const ACTION_RE = /\b(delete|remove|save|apply|edit|add|enable|disable|reset|restart|log ?off|shut ?down|create|register|archive|import|export|submit|confirm|cancel|sign ?out|log ?out|send|release|purge|unassign|push|schedule|backup|restore|upload|download|generate|update|assign|stop|forcibly|disconnect|end process|clear)\b/i;

  // Left-menu items (NAV_LOOKUP) and everything else (LOOKUP) are kept apart,
  // so "Machines" in the menu and "Machines" in a dropdown get different text.
  const NAV_LOOKUP = new Map();
  const LOOKUP = new Map();
  for (const [label, e] of Object.entries(TOUR_DATA.explanations || {})) {
    if (label.trim() === label) LOOKUP.set(label, { kind: "item", title: label, desc: e.desc });
  }
  for (const s of STEPS) {
    if (s.item && s.group && !NAV_LOOKUP.has(s.item)) {
      NAV_LOOKUP.set(s.item, { kind: "menu", title: s.group + " > " + s.item, st: s.st, desc: s.desc, url: s.url });
    }
    for (const set of s.settings || []) {
      if (!LOOKUP.has(set.name)) {
        LOOKUP.set(set.name, { kind: "setting", title: set.name, page: s.item || s.group || "", desc: set.desc, def: set.default });
      }
    }
  }

  // Labels that have only an explanation (tabs, headings, buttons, columns, dialog titles).
  for (const [label, e] of Object.entries(TOUR_DATA.explanations || {})) {
    if (label.trim() === label && !LOOKUP.has(label)) {
      LOOKUP.set(label, { kind: "item", title: label, desc: e.desc });
    }
  }

  // Exact text first; then the same text without a trailing count ("Preparing 0") or a name suffix ("Edit Pool - Win10").
  function isNavArea(el) {
    if (el.closest("nav,aside,[role=navigation]")) return true;
    const r = el.getBoundingClientRect();
    return r.left < 240 && !el.closest("[role=dialog],[role=menu],[role=listbox],[role=option],[class*=dropdown],[class*=popup],[class*=dialog]");
  }
  function lookupIn(map, t) {
    return map.get(t)
      || map.get(t.replace(/\s+\d+$/, ""))              // "Sessions 0" -> "Sessions"
      || map.get(t.replace(/\s*\.\.\.$/, ""))           // truncated "Problem Capacity Provider ..."
      || map.get(t.replace(/\s+-\s+.*$/, ""))           // "Edit Pool - Win10" -> "Edit Pool"
      || map.get(t.replace(/^Updated .*$/, "Updated"))  // "Updated 11/18/2026, 9:42 AM" -> "Updated"
      || null;
  }
  // Which console is open: "horizon", "uag" (dashboard only) or null. Set by syncVisibility().
  let page = null;
  const UAG_LOOKUP = new Map();
  for (const [label, e] of Object.entries(TOUR_DATA.uagExplanations || {})) {
    if (label.trim() === label) UAG_LOOKUP.set(label, { kind: "item", title: label, desc: e.desc });
  }
  // UAG labels that mean different things in different cards ("Edit", "Name", "Trusted Certificates").
  // Keyed by the card or window heading the control sits under.
  const UAG_CONTEXTS = new Map();   // heading text -> Map(label -> info)
  for (const [heading, labels] of Object.entries(TOUR_DATA.uagContexts || {})) {
    const m = new Map();
    for (const [label, e] of Object.entries(labels)) {
      if (label.trim() === label) m.set(label, { kind: "item", title: label, desc: e.desc, ctx: heading });
    }
    UAG_CONTEXTS.set(heading, m);
  }
  // The nearest heading above the element, inside the closest container that has one.
  function uagContextOf(el) {
    let n = el;
    for (let up = 0; n && up < 12; up++, n = n.parentElement) {
      let best = null;
      for (const h of n.querySelectorAll("h1,h2,h3,h4,[role=heading]")) {
        if (h === el || host.contains(h) || !(el.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_PRECEDING)) continue;
        const t = norm(h.innerText);
        if (UAG_CONTEXTS.has(t)) best = t;
      }
      if (best) return best;
    }
    return null;
  }
  function lookupText(text, el) {
    const t = text.replace(/^(Step\s+)?\d+\s+/, "");   // wizard steps: "1 Type" -> "Type"
    if (page === "uag") {
      const ctx = el ? uagContextOf(el) : null;
      const inCtx = ctx ? UAG_CONTEXTS.get(ctx) : null;
      if (inCtx) {
        const hit = lookupIn(inCtx, text) || lookupIn(inCtx, t);
        if (hit) return hit;
      }
      return lookupIn(UAG_LOOKUP, text) || lookupIn(UAG_LOOKUP, t);
    }
    const pools = el && isNavArea(el) ? [NAV_LOOKUP, LOOKUP] : [LOOKUP];
    for (const m of pools) {
      const hit = lookupIn(m, text) || lookupIn(m, t);
      if (hit) return hit;
    }
    return null;
  }

  let explaining = false;
  
  const seenPlaces = new Set();   // "route|text" keys already recorded
  const seenDialogs = new Set();  // dialog titles already captured
  let lastPageJson = "";          // to avoid storing the same page labels twice
  

  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  // Text of a control: its visible text, or for icon-only controls its aria-label or title.
  const textOf = (e) => norm(e.innerText) || norm((e.getAttribute && (e.getAttribute("aria-label") || e.getAttribute("title"))) || "");
  const uniq = (a) => [...new Set(a)];
  const isVisible = (e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
  };

  // ---------- own UI, inside a shadow root so the console CSS cannot touch it ----------
  const host = document.createElement("div");
  host.id = "hz-tour-host";
  document.documentElement.appendChild(host);
  const sr = host.attachShadow({ mode: "open" });
  sr.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif; }
      button { font: inherit; cursor: pointer; }
      .bar { position: fixed; top: 0; height: 64px; left: 21.5vw; z-index: 2147483647; display: flex; gap: 4px; flex-wrap: nowrap; align-items: center; }
      .bar button { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; padding: 5px 10px; color: #fff; background: #1f6feb; box-shadow: 0 1px 4px rgba(0,0,0,.25); font-size: 12px; white-space: nowrap; }
      .bar button.on { background: #17703a; }
      .bar button.off { background: #6b7280; }
      .bar button .dot { width: 9px; height: 9px; flex: none; border-radius: 50%; border: 2px solid #fff; box-sizing: border-box; }
      .bar button.on .dot { background: #fff; }
      .bar button.off .dot { background: transparent; }
      .bar button.map { background: #17703a; }
      .bar button[aria-pressed="true"] { outline: 3px solid #fff; }
      .bar[hidden] { display: none; }
      .bar.uag { left: auto; right: 250px; }   /* UAG: sits between the search box and the user menu */
      #tip {
        position: fixed; z-index: 2147483647; max-width: 360px; background: #1b2330; color: #fff;
        border-radius: 8px; padding: 9px 11px; font-size: 13px; line-height: 1.45; pointer-events: none;
        box-shadow: 0 4px 14px rgba(0,0,0,.3);
      }
      #tip[hidden] { display: none; }
      #tip .t { font-weight: 700; margin-bottom: 2px; }
      #tip .k { font-size: 11px; color: #b7c3d4; margin-bottom: 4px; }
      #tip .s { display: inline-block; font-size: 11px; padding: 0 7px; border-radius: 999px; margin-bottom: 4px; }
      #tip .d { white-space: pre-wrap; }
      #tip .f { color: #b7c3d4; font-size: 12px; margin-top: 4px; }
      #panel {
        position: fixed; bottom: 16px; right: 16px; width: min(400px, calc(100vw - 32px));
        max-height: 60vh; overflow: auto; z-index: 2147483647; background: #fff; color: #1b2330;
        border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.25); padding: 14px;
        font-size: 14px; line-height: 1.5; text-align: left;
      }
      #panel[hidden] { display: none; }
      .head { display: flex; justify-content: space-between; align-items: center; color: #5a6575; font-size: 12px; }
      .x { border: 0; background: transparent; font-size: 16px; color: #5a6575; }
      .info { color: #1b2330; margin: 6px 0; }
      .muted { color: #5a6575; font-size: 13px; }
      textarea { width: 100%; height: 180px; font-family: Consolas, monospace; font-size: 11px; margin-top: 8px; }
    </style>
    <div class="bar">
      <button id="explainBtn" class="off" title="Omnissa Admin Console Tour. When on, hover any menu item, tab, label or button to see what it does."><span class="dot"></span>Omnissa Admin Console Tour</button>

    </div>
    <div id="tip" hidden></div>
    <div id="panel" hidden></div>
  `;

  const $ = (sel) => sr.querySelector(sel);

  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : String(v));
    }
    kids.flat().forEach((c) => n.append(c instanceof Node ? c : document.createTextNode(String(c))));
    return n;
  }

  // ---------- explain mode: hover a menu item or setting ----------
  const tip = $("#tip");
  function showTip(e, info) {
    tip.textContent = "";
    tip.append(h("div", { class: "t", text: info.title }));
    const kindLine = info.kind === "menu" ? "Menu item" : info.kind === "setting" ? "Setting on: " + info.page : info.ctx ? "Console item, in " + info.ctx : "Console item";
    tip.append(h("div", { class: "k", text: kindLine }));
    tip.append(h("div", { class: "d", text: info.desc || "No description yet." }));
    if (info.kind === "setting") tip.append(h("div", { class: "f", text: "Default: " + (info.def || "not stated") }));
    tip.hidden = false;
    placeTip(e);
  }
  function placeTip(e) {
    const pad = 14;
    const w = tip.offsetWidth, hgt = tip.offsetHeight;
    let x = e.clientX + pad, y = e.clientY + pad;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y + hgt > window.innerHeight - 8) y = e.clientY - hgt - pad;
    tip.style.left = Math.max(8, x) + "px";
    tip.style.top = Math.max(8, y) + "px";
  }
  function hideTip() { tip.hidden = true; }

  document.addEventListener("mouseover", (e) => {
    if (!explaining) return;
    const t = e.target;
    if (!(t instanceof Element) || host.contains(t)) return;
    // Try the element under the pointer, then the control that contains it (menu items, tabs, wizard steps).
    const control = t.closest("button,a,li,[role=menuitem],[role=option],[role=tab],[role=treeitem],label,th,td");
    let info = null;
    for (const cand of [t, control]) {
      if (!cand) continue;
      const txt = textOf(cand);
      if (!txt || txt.length > 80) continue;
      info = lookupText(txt, cand);
      if (info) break;
    }
    if (!info) { hideTip(); return; }
    showTip(e, info);
  }, true);
  // Hover also works on disabled (greyed-out) controls: check what is under the pointer, not only the event target.
  let lastProbe = 0;
  document.addEventListener("mousemove", (e) => {
    if (!explaining) return;
    const now = performance.now();
    if (now - lastProbe < 50) return;
    lastProbe = now;
    let info = null;
    for (const el of document.elementsFromPoint(e.clientX, e.clientY).slice(0, 8)) {
      if (!(el instanceof Element) || host.contains(el)) continue;
      const control = el.closest("button,a,li,[role=menuitem],[role=option],[role=tab],[role=treeitem],label,th,td");
      for (const cand of [el, control]) {
        if (!cand) continue;
        const txt = textOf(cand);
        if (!txt || txt.length > 80) continue;
        info = lookupText(txt, cand);
        if (info) break;
      }
      if (info) break;
    }
    if (!info) {
      // Greyed-out controls can be skipped by elementsFromPoint, so also check every control whose box holds the pointer.
      let best = null, bestArea = Infinity;
      for (const c of document.querySelectorAll("button,a,label,th,td,li,span,h1,h2,h3,h4,[role=tab],[role=menuitem],[role=radio],[role=checkbox],[role=option]")) {
        if (host.contains(c)) continue;
        const r = c.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) continue;
        const txt = textOf(c);
        if (!txt || txt.length > 80) continue;
        const hit = lookupText(txt, c);
        if (hit && r.width * r.height < bestArea) { best = hit; bestArea = r.width * r.height; }
      }
      info = best;
    }
    if (info) {
      if (tip.hidden || tip.dataset.key !== info.title) { showTip(e, info); tip.dataset.key = info.title; }
      else placeTip(e);
    } else {
      hideTip();
      tip.dataset.key = "";
    }
  }, true);
  document.addEventListener("mousemove", (e) => { if (explaining && !tip.hidden) placeTip(e); }, true);
  document.addEventListener("mouseout", () => { if (explaining) hideTip(); }, true);

  // The explain state is remembered per console address, so a reload keeps it.
  const PREF_KEY = "hzTourExplain";
  let explainPref = false;
  try { explainPref = localStorage.getItem(PREF_KEY) === "1"; } catch (e) { /* storage unavailable */ }
  function applyExplain(on) {
    explaining = on;
    const btn = $("#explainBtn");
    btn.className = on ? "on" : "off";
    btn.setAttribute("aria-pressed", String(on));
    if (!on) hideTip();
  }
  function setExplain(on) {
    explainPref = on;
    try { localStorage.setItem(PREF_KEY, on ? "1" : "0"); } catch (e) { /* storage unavailable */ }
    applyExplain(on);
  }
  // The bar sits in the console header and is vertically centred on it.
  function positionBar() {
    const bar = $(".bar");
    const hdr = document.querySelector("header, [role=banner]");
    const r = hdr ? hdr.getBoundingClientRect() : null;
    if (r && r.height > 0) { bar.style.top = r.top + "px"; bar.style.height = r.height + "px"; }
    else if (page === "uag") { bar.style.top = "0px"; bar.style.height = "58px"; }   // UAG header height
  }
  window.addEventListener("resize", positionBar);
  $("#explainBtn").addEventListener("click", () => setExplain(!explaining));

  // Show the buttons only inside the console, never on the login page.
  // Inside the console the hash is not a login route and the menu text is present.
  function consoleReady() {
    if (/\/login/i.test(location.hash)) return false;
    const text = document.body ? document.body.innerText : "";
    return /\bInventory\b/.test(text) && /\bMonitor\b/.test(text);
  }
  // Unified Access Gateway: the /admin address on port 9443, every page inside it, version 26.09 (2609) or later,
  // and only after sign-in (the login page is hidden).
  function uagVersion() {
    const m = /Unified Access Gateway\s*v?(\d{2})\.(\d{2})/i.exec(document.body ? document.body.innerText : "");
    return m ? Number(m[1]) * 100 + Number(m[2]) : 0;
  }
  function isUagAddress() {
    return location.port === "9443" && /^\/admin(\/|$)/.test(location.pathname);
  }
  function uagSignedIn() {
    if (/\/login/i.test(location.hash)) return false;
    const text = document.body ? document.body.innerText : "";
    // The side menu only appears after sign-in.
    return /\bEdge Services\b/.test(text) && /\bAppliance Configuration\b/.test(text);
  }
  function currentPage() {
    if (consoleReady()) return "horizon";
    if (isUagAddress() && uagSignedIn() && uagVersion() >= 2609) return "uag";
    return null;
  }
  function syncVisibility() {
    page = currentPage();
    const ready = page !== null;
    const bar = $(".bar");
    bar.hidden = !ready;
    bar.classList.toggle("uag", page === "uag");
    if (ready) {
      positionBar();
      if (explainPref && !explaining) applyExplain(true);   // restore the remembered state
    }
    if (!ready) {
      applyExplain(false);   // off on the login page, but the remembered state is kept
      
      hideTip();
      hidePanel();
    }
  }
  setInterval(syncVisibility, 500);
  window.addEventListener("hashchange", syncVisibility);
  syncVisibility();

  // ---------- panel ----------
  function showPanel() { $("#panel").hidden = false; }
  function hidePanel() { $("#panel").hidden = true; }
  function panelHead(title) {
    return h("div", { class: "head" }, [
      h("span", { text: title }),
      h("button", { class: "x", title: "Close", text: "✕", onclick: () => hidePanel() })
    ]);
  }

  

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { setExplain(false); hidePanel(); }
  });

  

  // Toolbar button (background.js) turns explain mode on or off.
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "toggle-explain") setExplain(!explaining);
  });
})();
