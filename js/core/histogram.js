import { ramp } from "./colorScale.js";

// Minimal dependency-free SVG histogram of a metric's full (unclipped)
// distribution, with dashed guide lines marking the percentile clip bounds
// used by the map's color scale - so it's visible how many block groups sit
// outside the colored range. Bars use the same hue as the map/legend for
// this metric. Each bar carries a native <title> tooltip.
export function renderHistogram(container, domain, metric) {
  const values = domain.values;
  if (!values.length) {
    container.innerHTML = '<div class="hist-empty">No data for this metric.</div>';
    return;
  }

  const barColor = ramp(metric.color)[2]; // mid-tone of this metric's ramp

  const width = 280;
  const height = 84;
  const pad = 4;
  const min = values[0];
  const max = values[values.length - 1];
  const binCount = 20;
  const binWidth = (max - min) / binCount || 1;

  const bins = new Array(binCount).fill(0);
  for (const v of values) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx]++;
  }
  const maxCount = Math.max(...bins);
  const barW = (width - pad * 2) / binCount;

  const bars = bins
    .map((count, i) => {
      const barH = maxCount ? (count / maxCount) * (height - pad * 2) : 0;
      const x = pad + i * barW;
      const y = height - pad - barH;
      const rangeLo = (min + i * binWidth).toFixed(2);
      const rangeHi = (min + (i + 1) * binWidth).toFixed(2);
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, barW - 0.5).toFixed(1)}" height="${barH.toFixed(1)}" fill="${barColor}"><title>${rangeLo}&ndash;${rangeHi}: ${count} block groups</title></rect>`;
    })
    .join("");

  const toX = (v) => pad + ((v - min) / (max - min || 1)) * (width - pad * 2);
  const loX = toX(domain.lo).toFixed(1);
  const hiX = toX(domain.hi).toFixed(1);

  container.innerHTML = `
    <div class="legend-title">Distribution (all ${values.length} block groups)</div>
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Distribution of ${metric.label}">
      ${bars}
      <line x1="${loX}" y1="0" x2="${loX}" y2="${height}" class="hist-clip-line" />
      <line x1="${hiX}" y1="0" x2="${hiX}" y2="${height}" class="hist-clip-line" />
    </svg>
  `;
}
