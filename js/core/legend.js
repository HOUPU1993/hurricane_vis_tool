import { NO_DATA_COLOR, ramp } from "./colorScale.js";

// Continuous gradient legend: a CSS gradient strip built from the same ramp
// used to color the map, with tick labels at the (percentile-clipped) low,
// mid, and high ends, plus a swatch for "no data" block groups.
export function renderLegend(container, metric, domain) {
  const gradient = `linear-gradient(to right, ${ramp().join(",")})`;
  const mid = (domain.lo + domain.hi) / 2;
  container.innerHTML = `
    <div class="legend-title">${metric.label}</div>
    <div class="legend-bar" style="background:${gradient}"></div>
    <div class="legend-ticks">
      <span>&le; ${metric.format(domain.lo)}</span>
      <span>${metric.format(mid)}</span>
      <span>&ge; ${metric.format(domain.hi)}</span>
    </div>
    <div class="legend-note">Color scale clipped to the ${metric.clipLow}&ndash;${metric.clipHigh}th percentile so a few extreme block groups don't wash out the map. Exact values are always shown on click.</div>
    <div class="legend-nodata"><span class="swatch" style="background:${NO_DATA_COLOR}"></span> No data</div>
  `;
}
