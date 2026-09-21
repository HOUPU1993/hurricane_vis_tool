// Sequential color scale, one hue per metric category (not one blue for
// everything). Each category file exports a base hue hex (a slot from the
// validated categorical palette); this module turns that single hex into a
// light->dark ramp via HSL, so every metric gets a *consistent* scale built
// the same way, not hand-picked per metric.
export const NO_DATA_COLOR = "#e1e0d9";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}
const lerp = (a, b, t) => a + (b - a) * t;

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgbToHex(rgb.map((v) => (v + m) * 255));
}

// Fixed lightness/saturation-multiplier stops, light -> dark. Same shape for
// every hue, so all ~30 metrics read as one consistent system rather than
// each looking custom-tuned.
const LIGHTNESS_STOPS = [0.9, 0.72, 0.54, 0.36, 0.2];
const SAT_MULT = [0.55, 0.8, 1.0, 0.9, 0.75];

export function generateRamp(baseHex) {
  const [h, s] = hexToHsl(baseHex);
  const satBase = Math.min(Math.max(s, 0.45), 0.85);
  return LIGHTNESS_STOPS.map((l, i) => hslToHex(h, satBase * SAT_MULT[i], l));
}

const rampCache = new Map();
export function ramp(baseHex) {
  if (!rampCache.has(baseHex)) rampCache.set(baseHex, generateRamp(baseHex));
  return rampCache.get(baseHex);
}

export function interpolateRamp(t, colorRamp) {
  const clamped = Math.max(0, Math.min(1, t));
  const n = colorRamp.length - 1;
  const seg = Math.min(n - 1, Math.floor(clamped * n));
  const localT = clamped * n - seg;
  const c0 = hexToRgb(colorRamp[seg]);
  const c1 = hexToRgb(colorRamp[seg + 1]);
  return rgbToHex(c0.map((c, i) => lerp(c, c1[i], localT)));
}

export function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return null;
  const idx = Math.min(sortedValues.length - 1, Math.max(0, Math.floor((p / 100) * (sortedValues.length - 1))));
  return sortedValues[idx];
}

// Domain is clipped to [clipLow, clipHigh] percentiles (not raw min/max) so
// one or two extreme block groups can't stretch the whole ramp and wash out
// the differences between everyone else. Values outside the domain still
// render - just clamped to the ramp's end color. The raw sorted values are
// returned too, for the histogram (which shows the true, unclipped spread).
export function computeDomain(features, metric) {
  const values = features
    .map((f) => f.properties[metric.field])
    .filter((v) => v != null)
    .sort((a, b) => a - b);
  return {
    lo: percentile(values, metric.clipLow),
    hi: percentile(values, metric.clipHigh),
    values,
  };
}

export function colorForValue(value, domain, baseHex) {
  if (value == null) return NO_DATA_COLOR;
  const { lo, hi } = domain;
  const colorRamp = ramp(baseHex);
  if (hi === lo) return interpolateRamp(0.5, colorRamp);
  return interpolateRamp((value - lo) / (hi - lo), colorRamp);
}
