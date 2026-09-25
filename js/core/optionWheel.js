// Reusable "Option Wheel" content-disclosure control: a vertical spinning
// picker of labeled items, faithfully ported from reactbits.dev's Option
// Wheel component (exponential-smoothed position, sin/cos curve+tilt,
// distance-based opacity/blur/color-mix). Picking (click, wheel-scroll,
// drag, or arrow keys) an item reveals that topic's panel and hides the
// rest, so a page's material is explored one section at a time instead of
// being handed to the reader all at once. Used on every content page except
// Page 3, which already has its own interactive map/dropdown.
//
// Markup contract (see index.html) - unchanged from v1, so no HTML edits
// were needed for this rewrite:
//   <div class="option-wheel" data-wheel-default="<id>" id="...">
//     <div class="wheel-dial-wrap">
//       <div class="wheel-hub"><p class="wheel-hub-label"></p></div>  <!-- v1 leftover, CSS-hidden -->
//       <div class="wheel-dial" role="tablist" aria-label="..."></div>
//     </div>
//     <div class="wheel-panels">
//       <div class="wheel-panel" data-wheel-panel="<id>" data-wheel-label="Short label">
//         ...content, unchanged from the flat layout this replaces...
//       </div>
//       ...
//     </div>
//   </div>
// Items are generated from each .wheel-panel's data-wheel-label, in
// document order - so a page's wheel always matches its actual panels
// rather than needing to be kept in sync by hand. data-wheel-default picks
// which panel is shown first; omit it to default to the first panel.
//
// Dispatches a "wheel:show" CustomEvent on the .option-wheel root every time
// a panel is shown (detail: { id, panelEl, first }) - callers use this for
// per-panel lazy work that needs the panel actually visible, the same
// lazy-init pattern js/app.js already uses per-page (e.g. Leaflet's
// invalidateSize() after a display:none container becomes visible again).
export function initOptionWheel(rootEl) {
  if (!rootEl || rootEl.dataset.wheelInit) return null;
  rootEl.dataset.wheelInit = "1";

  const dial = rootEl.querySelector(".wheel-dial");
  const panels = [...rootEl.querySelectorAll(".wheel-panel")];
  if (!dial || panels.length === 0) return null;

  // Physics constants ported from the verified reactbits.dev source (see
  // /components/option-wheel) - a compact sidebar-sized tuning rather than
  // their big hero-list demo's defaults.
  const cfg = {
    fontSizePx: 14,
    spacing: 1.7,
    curve: 1,
    tilt: 6,
    blur: 2,
    fade: 0.26,
    minOpacity: 0.08,
    smoothing: 180,
    textColor: "#7d7d7d",
    activeColor: "#ffffff",
  };
  cfg.rowH = Math.max(cfg.fontSizePx * cfg.spacing, 1);

  dial.setAttribute("tabindex", "0");

  const buttons = panels.map((panel, i) => {
    const id = panel.dataset.wheelPanel || `panel-${i}`;
    const label = panel.dataset.wheelLabel || `Topic ${i + 1}`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "wheel-btn";
    btn.textContent = label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.tabIndex = -1;
    btn.dataset.wheelTarget = id;
    btn.dataset.wheelIndex = String(i);
    dial.appendChild(btn);
    return btn;
  });

  const n = buttons.length;
  const tiltRad = (cfg.tilt * Math.PI) / 180;
  const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

  let pos = 0;
  let target = 0;
  let raf = null;
  let last = 0;
  let shownIndex = -1;
  const shown = new Set();

  function showByIndex(i) {
    shownIndex = i;
    const panel = panels[i];
    const id = panel.dataset.wheelPanel || `panel-${i}`;
    for (const p of panels) p.classList.toggle("wheel-panel--active", p === panel);
    for (const b of buttons) {
      const active = b === buttons[i];
      b.classList.toggle("wheel-btn--active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    }
    const first = !shown.has(id);
    shown.add(id);
    rootEl.dispatchEvent(new CustomEvent("wheel:show", { detail: { id, panelEl: panel, first } }));
  }

  function runFrame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);
    let next = pos + (target - pos) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    pos = next;

    buttons.forEach((btn, i) => {
      const d = i - pos;
      const dist = Math.abs(d);
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (ang * 180) / Math.PI;
      }
      btn.style.transform = `translateY(-50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`;
      btn.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      btn.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : "none";
      const p = Math.max(0, 1 - Math.min(dist, 1));
      btn.style.color = `color-mix(in srgb, ${cfg.activeColor} ${(p * 100).toFixed(1)}%, ${cfg.textColor})`;
      btn.classList.toggle("wheel-btn--near", Math.round(pos) === i);
    });

    const idx = Math.round(pos);
    if (idx !== shownIndex) showByIndex(idx);

    raf = settled ? null : requestAnimationFrame(runFrame);
  }

  function startLoop() {
    if (raf != null) cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(runFrame);
  }

  function applyTarget(v, snap) {
    v = Math.min(Math.max(v, 0), n - 1);
    if (snap) v = Math.round(v);
    target = v;
    startLoop();
  }

  function activate(id, { focus = false } = {}) {
    const idx = buttons.findIndex((b) => b.dataset.wheelTarget === id);
    if (idx < 0) return;
    applyTarget(idx, true);
    if (focus) buttons[idx].focus();
  }

  // --- click (a drag that moved counts as a drag, not a click) ---
  let dragMoved = false;
  dial.addEventListener("click", (e) => {
    if (dragMoved) return;
    const btn = e.target.closest(".wheel-btn");
    if (!btn) return;
    applyTarget(Number(btn.dataset.wheelIndex), true);
  });

  // --- mouse-wheel: one step per notch, debounced snap after scrolling stops ---
  let wheelTimer = null;
  dial.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const step = Math.max(-1, Math.min(1, e.deltaY / cfg.rowH));
      applyTarget(target + step, false);
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => applyTarget(target, true), 140);
    },
    { passive: false }
  );

  // --- pointer drag ---
  let dragState = null;
  dial.addEventListener("pointerdown", (e) => {
    dragState = { y: e.clientY, start: target };
    dragMoved = false;
    dial.classList.add("dragging");
  });
  dial.addEventListener("pointermove", (e) => {
    if (!dragState) return;
    const dy = e.clientY - dragState.y;
    if (!dragMoved && Math.abs(dy) > 4) dragMoved = true;
    if (dragMoved) applyTarget(dragState.start - dy / cfg.rowH, false);
  });
  window.addEventListener("pointerup", () => {
    if (dragState && dragMoved) applyTarget(target, true);
    dragState = null;
    dial.classList.remove("dragging");
  });

  // --- keyboard ---
  dial.addEventListener("keydown", (e) => {
    let delta = null;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") delta = -1;
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") delta = 1;
    if (delta == null) return;
    e.preventDefault();
    applyTarget(Math.round(target) + delta, true);
  });

  const defaultId = rootEl.dataset.wheelDefault;
  const defaultIdx = defaultId ? buttons.findIndex((b) => b.dataset.wheelTarget === defaultId) : 0;
  pos = target = defaultIdx >= 0 ? defaultIdx : 0;
  showByIndex(pos);
  runFrame(performance.now());

  return { activate };
}

// Citation links (#ref-N / #ref6-N / #ref7-N) can point at an <li> that now
// lives inside a not-currently-shown wheel panel (e.g. the References
// panel). A hidden target can't be natively scrolled to, so switch its
// wheel to that panel first, then let the click's own hash-jump proceed.
// One listener covers every wheel on the page - call once from app.js.
export function initWheelCitationJump() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#ref"]');
    if (!link) return;
    const targetEl = document.getElementById(link.getAttribute("href").slice(1));
    if (!targetEl) return;
    const panel = targetEl.closest(".wheel-panel");
    if (!panel || panel.classList.contains("wheel-panel--active")) return;
    const wheelRoot = panel.closest(".option-wheel");
    const id = panel.dataset.wheelPanel;
    const btn = wheelRoot?.querySelector(`.wheel-btn[data-wheel-target="${id}"]`);
    if (btn) btn.click();
    // The panel just switched from display:none to block - give layout a
    // frame to settle before scrolling, since the browser's own hash-jump
    // (not prevented here) can't find a target that was hidden at click time.
    requestAnimationFrame(() => targetEl.scrollIntoView({ block: "center" }));
  });
}
