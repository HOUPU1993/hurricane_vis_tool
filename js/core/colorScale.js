// Sequential blue ramp (light -> dark), a subset of the validated default
// palette's sequential steps. One hue for every metric keeps the map legible
// regardless of which of the ~30 metrics is selected.
const RAMP = ["#cde2fb", "#6da7ec", "#256abf", "#0d366b"];
export const NO_DATA_COLOR = "#e1e0d9";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}
const lerp = (a, b, t) => a + (b - a) * t;

export function interpolateRamp(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const n = RAMP.length - 1;
  const seg = Math.min(n - 1, Math.floor(clamped * n));
  const localT = clamped * n - seg;
  const c0 = hexToRgb(RAMP[seg]);
  const c1 = hexToRgb(RAMP[seg + 1]);
  return rgbToHex(c0.map((c, i) => lerp(c, c1[i], localT)));
}

export function ramp() {
  return RAMP;
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

export function colorForValue(value, domain) {
  if (value == null) return NO_DATA_COLOR;
  const { lo, hi } = domain;
  if (hi === lo) return interpolateRamp(0.5);
  return interpolateRamp((value - lo) / (hi - lo));
}
