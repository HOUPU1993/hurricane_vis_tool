// Reusable "Option Wheel" content-disclosure control: a ring of labeled
// buttons around a center hub. Clicking one reveals that topic's panel and
// hides the rest, so a page's material is explored one section at a time
// instead of being handed to the reader all at once. Used on every content
// page except Page 3, which already has its own interactive map/dropdown.
//
// Markup contract (see index.html):
//   <div class="option-wheel" data-wheel-default="<id>" id="...">
//     <div class="wheel-dial-wrap">
//       <div class="wheel-hub"><p class="wheel-hub-label"></p></div>
//       <div class="wheel-dial" role="tablist" aria-label="..."></div>
//     </div>
//     <div class="wheel-panels">
//       <div class="wheel-panel" data-wheel-panel="<id>" data-wheel-label="Short label">
//         ...content, unchanged from the flat layout this replaces...
//       </div>
//       ...
//     </div>
//   </div>
// Buttons are generated from each .wheel-panel's data-wheel-label, in
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

  const dialWrap = rootEl.querySelector(".wheel-dial-wrap");
  const dial = rootEl.querySelector(".wheel-dial");
  const hubLabel = rootEl.querySelector(".wheel-hub-label");
  const panels = [...rootEl.querySelectorAll(".wheel-panel")];
  if (!dial || panels.length === 0) return null;

  const RADIUS_PCT = 42;
  const shown = new Set();

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

    // Evenly spaced around the circle, starting at 12 o'clock, clockwise -
    // plain trigonometry computed once here rather than in CSS, since
    // CSS's sin()/cos() trig functions aren't reliably supported yet.
    const angle = (i / panels.length) * 2 * Math.PI - Math.PI / 2;
    btn.style.left = `${(50 + Math.cos(angle) * RADIUS_PCT).toFixed(2)}%`;
    btn.style.top = `${(50 + Math.sin(angle) * RADIUS_PCT).toFixed(2)}%`;

    dial.appendChild(btn);
    return btn;
  });

  function activate(id, { focus = false } = {}) {
    const panel = panels.find((p) => (p.dataset.wheelPanel || "") === id);
    if (!panel) return;
    for (const p of panels) p.classList.toggle("wheel-panel--active", p === panel);
    for (const b of buttons) {
      const active = b.dataset.wheelTarget === id;
      b.classList.toggle("wheel-btn--active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
      if (active && focus) b.focus();
    }
    if (hubLabel) {
      const text = panel.dataset.wheelLabel || "";
      hubLabel.textContent = text;
      // Longer category names need a smaller face to stay inside the hub's
      // circle - a narrow rectangular fit (see the CSS max-width) still
      // overflows a 4-word label like "Mobile Phone Evacuation Detection"
      // at the base size.
      hubLabel.classList.toggle("wheel-hub-label--sm", text.length > 18 && text.length <= 28);
      hubLabel.classList.toggle("wheel-hub-label--xs", text.length > 28);
    }

    const first = !shown.has(id);
    shown.add(id);
    rootEl.dispatchEvent(new CustomEvent("wheel:show", { detail: { id, panelEl: panel, first } }));
  }

  dial.addEventListener("click", (e) => {
    const btn = e.target.closest(".wheel-btn");
    if (!btn) return;
    activate(btn.dataset.wheelTarget);
  });

  dial.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const currentIndex = buttons.findIndex((b) => b.classList.contains("wheel-btn--active"));
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = buttons[(currentIndex + dir + buttons.length) % buttons.length];
    activate(next.dataset.wheelTarget, { focus: true });
  });

  if (dialWrap) dialWrap.setAttribute("role", "presentation");

  const defaultId = rootEl.dataset.wheelDefault || (panels[0].dataset.wheelPanel ?? "panel-0");
  activate(defaultId);

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
