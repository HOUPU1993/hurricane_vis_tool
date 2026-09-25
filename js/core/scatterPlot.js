// Page 4 profile cards: for every feature outside the "Mobile Phone Evacuation
// Detection" category (that category's metrics ARE the outcomes below - it
// makes no sense to plot them against themselves), show how that feature
// relates to each of the study's three core outcomes, one small scatter per
// outcome, real block-group pairs rather than a summary stat alone.
//
// Same real-SVG-via-innerHTML convention as js/core/histogram.js (see that
// file) rather than canvas - point counts per panel top out at n~915, well
// within what a handful of small inline SVGs render without visible cost,
// and it keeps every chart on this page built the same way. Deliberately no
// per-point hover: with up to 84 of these tiny thumbnails on one page (28
// features x 3 outcomes), a full nearest-point tooltip layer on each would
// be real complexity for a snapshot that's meant to be read at a glance, not
// interrogated point-by-point - the caption's n/r already carries the
// numbers that matter, and Page 5's regression page is where the modeling
// happens for real.
import { percentile } from "./colorScale.js";

const PANEL_W = 96;
const PANEL_H = 88;
const PAD = 4;

// Short axis captions for the three outcomes - reuses the same shorthand
// already established on the home terrain's metric tabs (js/core/terrainScene.js)
// so the same variable reads the same way everywhere on the site.
const SHORT_DV_LABEL = {
  evacuation_rate: "Evac. Rate",
  median_evacuation_distance_km: "Evac. Distance",
  // Also keyed by the log-transformed field name js/metrics/scatterFields.js
  // resolves distance to for the scatter dataset - same short label either
  // way, it's still distance, just plotted on a friendlier scale.
  log_median_evacuation_distance_km: "Evac. Distance",
  median_return_days: "Return Days",
};

function domainFor(values, clipLow, clipHigh) {
  const sorted = [...values].sort((a, b) => a - b);
  return { lo: percentile(sorted, clipLow), hi: percentile(sorted, clipHigh) };
}

// Pearson r + a simple OLS fit, both from the full raw (unclipped) pairs -
// the visual clipping below only narrows what's *drawn*, never what's
// counted or fit, so n/r stay honest even when a couple of extreme block
// groups get pinned to the plot's edge.
function fitStats(points) {
  const n = points.length;
  if (n < 3) return { n, r: null, slope: null, intercept: null };
  let sx = 0, sy = 0;
  for (const [x, y] of points) { sx += x; sy += y; }
  const mx = sx / n, my = sy / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of points) {
    const dx = x - mx, dy = y - my;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  }
  const denom = Math.sqrt(sxx * syy);
  return {
    n,
    r: denom ? sxy / denom : null,
    slope: sxx ? sxy / sxx : null,
    intercept: sxx ? my - (sxy / sxx) * mx : null,
  };
}

function svgFor(points, xDomain, yDomain, colorHex, xLabel, yLabel, fit) {
  const w = PANEL_W, h = PANEL_H;
  const xSpan = xDomain.hi - xDomain.lo || 1;
  const ySpan = yDomain.hi - yDomain.lo || 1;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const toX = (v) => PAD + ((clamp(v, xDomain.lo, xDomain.hi) - xDomain.lo) / xSpan) * (w - PAD * 2);
  const toY = (v) => h - PAD - ((clamp(v, yDomain.lo, yDomain.hi) - yDomain.lo) / ySpan) * (h - PAD * 2);

  const dots = points
    .map(([x, y]) => `<circle cx="${toX(x).toFixed(1)}" cy="${toY(y).toFixed(1)}" r="1.3" fill="${colorHex}" fill-opacity="0.45"/>`)
    .join("");

  let line = "";
  if (fit.slope != null && isFinite(fit.slope)) {
    const y1 = fit.intercept + fit.slope * xDomain.lo;
    const y2 = fit.intercept + fit.slope * xDomain.hi;
    line = `<line x1="${toX(xDomain.lo).toFixed(1)}" y1="${toY(y1).toFixed(1)}" x2="${toX(xDomain.hi).toFixed(1)}" y2="${toY(y2).toFixed(1)}" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-dasharray="2,2"/>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" class="scatter-svg" role="img" aria-label="${xLabel} vs ${yLabel}">${dots}${line}</svg>`;
}

// dvMetrics: the three outcome metric objects (field/label/format/clipLow/
// clipHigh/color), already carrying their own category color - see
// js/metrics/evacuation.js. features: the full blockgroups.geojson feature
// array, so each panel does its own paired-value join and drops any block
// group missing either side rather than assuming the two metrics share the
// same null pattern.
export function renderScatterRow(container, featureMetric, dvMetrics, features) {
  const wrap = document.createElement("div");
  wrap.className = "profile-scatters";

  const caption = document.createElement("div");
  caption.className = "legend-title";
  caption.textContent = "Relationship to outcomes";
  wrap.appendChild(caption);

  const row = document.createElement("div");
  row.className = "scatter-row";

  const rawX = [];
  for (const f of features) {
    const v = f.properties[featureMetric.field];
    if (v != null) rawX.push(v);
  }
  const xDomain = domainFor(rawX, featureMetric.clipLow, featureMetric.clipHigh);

  for (const dv of dvMetrics) {
    const panel = document.createElement("div");
    panel.className = "scatter-panel";

    const label = document.createElement("div");
    label.className = "scatter-label";
    label.textContent = SHORT_DV_LABEL[dv.field] || dv.label;
    panel.appendChild(label);

    const points = [];
    for (const f of features) {
      const x = f.properties[featureMetric.field];
      const y = f.properties[dv.field];
      if (x != null && y != null) points.push([x, y]);
    }

    if (points.length < 3 || rawX.length < 3) {
      const empty = document.createElement("div");
      empty.className = "scatter-empty";
      empty.textContent = "Not enough paired data";
      panel.appendChild(empty);
      row.appendChild(panel);
      continue;
    }

    const yDomain = domainFor(points.map((p) => p[1]), dv.clipLow, dv.clipHigh);
    const fit = fitStats(points);

    const svgHolder = document.createElement("div");
    svgHolder.innerHTML = svgFor(points, xDomain, yDomain, featureMetric.color, featureMetric.label, dv.label, fit);
    panel.appendChild(svgHolder.firstElementChild);

    const stat = document.createElement("div");
    stat.className = "scatter-stat";
    stat.textContent = `n=${fit.n}${fit.r != null ? `, r=${fit.r.toFixed(2)}` : ""}`;
    panel.appendChild(stat);

    row.appendChild(panel);
  }

  wrap.appendChild(row);
  container.appendChild(wrap);
}
