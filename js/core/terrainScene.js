// Homepage hero visual: a 3D "outcome intensity" terrain built from real
// data (see js/data/homeTerrain.js - three of the study's core outcome
// variables, each aggregated from data/blockgroups.geojson into the same
// spatially-aligned grid) rather than illustration. Bars stand on a tilted
// floor plane (the classic CSS isometric-bar-chart trick: the floor is
// rotated with rotateX, and each bar cancels that rotation on itself via
// the opposite rotateX so its own `height` stays world-vertical instead of
// following the floor's tilt), then the whole scene gets a slow autonomous
// sway plus a small pointer-driven tilt on top. A tab row (see
// .terrain-metric-tabs in index.html) switches which metric drives bar
// height/color, cross-fading in place rather than rebuilding the grid, and
// auto-cycles through the three every ~6s whenever the pointer isn't over
// the terrain.
//
// To regenerate js/data/homeTerrain.js after data/blockgroups.geojson
// changes, see that file's own header comment for the exact method.
import {
  TERRAIN_COLS,
  TERRAIN_ROWS,
  TERRAIN_HEIGHTS,
  TERRAIN_HEIGHTS_DIST,
  TERRAIN_HEIGHTS_DAYS,
  TERRAIN_LABELS,
} from "../data/homeTerrain.js";

const FLOOR_TILT_DEG = 58;
const SPACING = 17;
const BAR_WIDTH = 10;
const MAX_BAR_HEIGHT = 175;
const MIN_BAR_HEIGHT = 6;
const AUTO_CYCLE_MS = 6000;

const METRICS = [
  { key: "rate", label: "Evacuation Rate", grid: TERRAIN_HEIGHTS },
  { key: "dist", label: "Evac. Distance", grid: TERRAIN_HEIGHTS_DIST },
  { key: "days", label: "Return Days", grid: TERRAIN_HEIGHTS_DAYS },
];

// A gentle built-in contrast curve (not a user-facing toggle - the same
// treatment always applies) that pushes already-low cells further toward
// the ground while leaving real peaks at their full height, so a metric's
// genuine high-value block groups stand out clearly from its low/near-zero
// ones instead of the mid-range reading as one flat, unexplained plain.
function raiseBaseline(h) {
  return Math.pow(Math.max(h, 0), 1.25);
}

function colorFor(h) {
  // low -> near-invisible slate, mid -> muted purple/blue, high -> glowing
  // pink/gold - reuses the site's existing accent palette rather than
  // introducing a new one.
  if (h < 0.18) return `rgba(40,44,58,${(0.25 + h).toFixed(3)})`;
  if (h < 0.45) {
    const t = (h - 0.18) / 0.27;
    return `linear-gradient(180deg, rgba(74,58,167,${(0.55 + t * 0.3).toFixed(3)}), rgba(42,120,214,${(0.35 + t * 0.3).toFixed(3)}))`;
  }
  if (h < 0.75) {
    const t = (h - 0.45) / 0.3;
    return `linear-gradient(180deg, rgba(232,123,164,${(0.55 + t * 0.35).toFixed(3)}), rgba(74,58,167,0.5))`;
  }
  const t = Math.min((h - 0.75) / 0.4, 1);
  return `linear-gradient(180deg, rgba(237,161,0,${(0.75 + t * 0.25).toFixed(3)}), rgba(232,123,164,0.75))`;
}

// Static screen-space label positions, tuned once against the resting
// (un-tilted) view. They don't re-project every frame as the scene sways -
// a small mismatch during interaction is an acceptable trade for staying
// pure-CSS; a future pass could project properly if that drift bothers.
// Sanibel Island is omitted here even though it's in the data - it sits
// right behind the hero title at this layout's scale, and its peak is
// close enough to Fort Myers Beach's that losing it costs little.
const LABEL_SCREEN_POS = {
  "Fort Myers Beach": { left: "38%", top: "68%", lx: 46, ly: -8 },
  "Cape Coral": { left: "55%", top: "60%", lx: 46, ly: -14 },
  "Pine Island": { left: "50%", top: "50%", lx: 44, ly: 6 },
};

export function initTerrainScene(rootEl) {
  if (!rootEl || rootEl.dataset.terrainInit) return null;
  rootEl.dataset.terrainInit = "1";

  const stage = rootEl.querySelector(".scene-stage");
  const rotator = rootEl.querySelector(".rotator");
  const floor = rootEl.querySelector(".floor");
  const labelsWrap = rootEl.querySelector(".terrain-labels");
  if (!stage || !rotator || !floor) return null;

  const frag = document.createDocumentFragment();
  const bars = []; // parallel to TERRAIN_HEIGHTS* - index = r * TERRAIN_COLS + c
  for (let r = 0; r < TERRAIN_ROWS; r++) {
    for (let c = 0; c < TERRAIN_COLS; c++) {
      const x = (c - TERRAIN_COLS / 2) * SPACING;
      const z = (r - TERRAIN_ROWS / 2) * SPACING;

      const anchor = document.createElement("div");
      anchor.className = "terrain-anchor";
      anchor.style.transform = `translate3d(${x}px,0px,${z}px)`;

      const bar = document.createElement("div");
      bar.className = "terrain-bar";
      bar.style.width = `${BAR_WIDTH}px`;
      bar.style.marginLeft = `${-BAR_WIDTH / 2}px`;
      bar.style.transform = `rotateX(${-FLOOR_TILT_DEG}deg)`;

      anchor.appendChild(bar);
      frag.appendChild(anchor);
      bars.push(bar);
    }
  }
  floor.style.transform = `rotateX(${FLOOR_TILT_DEG}deg)`;
  floor.appendChild(frag);

  // Paint every bar's height/color for one metric's grid. Called once up
  // front (rate, the default) and again on every tab switch / auto-cycle
  // tick - .terrain-bar's own CSS transition (see main.css) turns each of
  // these into a smooth cross-fade rather than a hard cut.
  function renderMetric(grid) {
    for (let i = 0; i < bars.length; i++) {
      const h = raiseBaseline(grid[i] ?? 0);
      const bar = bars[i];
      bar.style.height = `${MIN_BAR_HEIGHT + h * MAX_BAR_HEIGHT}px`;
      bar.style.background = colorFor(h);
      bar.style.boxShadow = h > 0.8 ? `0 0 ${8 + h * 10}px rgba(237,161,0,${(0.25 * h).toFixed(3)})` : "none";
    }
  }
  renderMetric(METRICS[0].grid);

  if (labelsWrap) {
    for (const label of TERRAIN_LABELS) {
      const pos = LABEL_SCREEN_POS[label.name];
      if (!pos) continue;
      const wrap = document.createElement("div");
      wrap.className = "terrain-label";
      wrap.style.left = pos.left;
      wrap.style.top = pos.top;
      const textLeft = pos.lx + (pos.lx < 0 ? -6 : 6);
      wrap.innerHTML = `
        <span class="terrain-label-dot"></span>
        <svg width="${Math.abs(pos.lx) + 4}" height="${Math.abs(pos.ly) + 4}"
             style="left:${Math.min(pos.lx, 0)}px; top:${Math.min(pos.ly, 0)}px;">
          <line x1="${pos.lx < 0 ? Math.abs(pos.lx) : 0}" y1="${pos.ly < 0 ? Math.abs(pos.ly) : 0}"
                x2="${pos.lx < 0 ? 0 : pos.lx}" y2="${pos.ly < 0 ? 0 : pos.ly}"
                stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
        </svg>
        <span class="terrain-label-txt" style="left:${textLeft}px; top:${pos.ly - 6}px;
          ${pos.lx < 0 ? "transform:translateX(-100%);" : ""}">${label.name}</span>`;
      labelsWrap.appendChild(wrap);
    }
  }

  // Gentle autonomous sway (a slow sine, not a full spin) plus a pointer-
  // driven tilt on top, lerped so it trails the cursor smoothly. Stopped
  // whenever the home page isn't the active page (see js/app.js) so it
  // never keeps animating in the background. The same pointer position also
  // decides whether the metric tabs' auto-cycle should be paused (below) -
  // the terrain itself is decorative (pointer-events: none), so hovering is
  // inferred from geometry rather than a real mouseenter/mouseleave on it.
  let raf = null;
  let t = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let hoveringTerrain = false;

  function onPointerMove(e) {
    const rect = stage.getBoundingClientRect();
    tmx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    tmy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    hoveringTerrain =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
  }
  window.addEventListener("pointermove", onPointerMove);

  function tick() {
    t += 0.006;
    mx += (tmx - mx) * 0.04;
    my += (tmy - my) * 0.04;
    const swayZ = Math.sin(t) * 6;
    const swayX = Math.sin(t * 0.6) * 1.5;
    rotator.style.transform = `rotateZ(${(swayZ + mx * 10).toFixed(2)}deg) rotateX(${(swayX + my * -4).toFixed(2)}deg)`;
    raf = requestAnimationFrame(tick);
  }
  tick();

  // Metric tabs - click to switch immediately; otherwise auto-cycle through
  // the three every AUTO_CYCLE_MS while the pointer isn't over the terrain.
  const tabsEl = document.getElementById("terrainMetricTabs");
  const tabButtons = tabsEl ? [...tabsEl.querySelectorAll(".terrain-metric-tab")] : [];
  let activeIndex = 0;
  let cycleTimer = null;

  function setActive(index, { userInitiated = false } = {}) {
    activeIndex = index;
    renderMetric(METRICS[index].grid);
    for (const btn of tabButtons) {
      const active = btn.dataset.metric === METRICS[index].key;
      btn.classList.toggle("terrain-metric-tab--active", active);
      btn.setAttribute("aria-selected", String(active));
    }
    if (userInitiated) restartCycle();
  }

  function restartCycle() {
    if (cycleTimer) clearInterval(cycleTimer);
    cycleTimer = setInterval(() => {
      if (hoveringTerrain) return; // paused while the reader's looking at it
      setActive((activeIndex + 1) % METRICS.length);
    }, AUTO_CYCLE_MS);
  }

  if (tabsEl) {
    tabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".terrain-metric-tab");
      if (!btn) return;
      const idx = METRICS.findIndex((m) => m.key === btn.dataset.metric);
      if (idx >= 0) setActive(idx, { userInitiated: true });
    });
  }
  restartCycle();

  return {
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      window.removeEventListener("pointermove", onPointerMove);
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = null;
    },
    resume() {
      if (!raf) tick();
      if (!cycleTimer) restartCycle();
    },
  };
}
