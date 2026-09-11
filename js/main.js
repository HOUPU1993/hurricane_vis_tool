import { CATEGORIES, METRICS_BY_FIELD, DEFAULT_METRIC_FIELD } from "./metrics/index.js";
import { initMap, drawChoropleth } from "./core/map.js";
import { renderLegend } from "./core/legend.js";
import { renderHistogram } from "./core/histogram.js";
import { renderDetailPanel } from "./core/detailPanel.js";

const select = document.getElementById("metric-select");
const legendEl = document.getElementById("legend");
const histogramEl = document.getElementById("histogram");
const detailEl = document.getElementById("detail-panel");

// Build the dropdown from the metric registry (grouped with <optgroup> so
// ~30 metrics across 10 dimensions stay navigable in one control).
for (const cat of CATEGORIES) {
  const group = document.createElement("optgroup");
  group.label = cat.name;
  for (const m of cat.metrics) {
    const opt = document.createElement("option");
    opt.value = m.field;
    opt.textContent = m.label;
    group.appendChild(opt);
  }
  select.appendChild(group);
}
select.value = DEFAULT_METRIC_FIELD;

const map = initMap("map");
const layerRef = { current: null };
let geoData = null;
renderDetailPanel(detailEl, null);

function draw() {
  const metric = METRICS_BY_FIELD[select.value];
  const domain = drawChoropleth({
    map,
    layerRef,
    data: geoData,
    metric,
    onFeatureClick: (feature) => renderDetailPanel(detailEl, feature),
  });
  renderLegend(legendEl, metric, domain);
  renderHistogram(histogramEl, domain, metric);
}

fetch("data/blockgroups.geojson")
  .then((res) => res.json())
  .then((data) => {
    geoData = data;
    draw();
    map.fitBounds(layerRef.current.getBounds());
  })
  .catch((err) => {
    detailEl.innerHTML = `<p class="placeholder">Could not load data/blockgroups.geojson - ${err.message}</p>`;
  });

select.addEventListener("change", () => {
  if (geoData) draw();
});
