// Hurricane evacuation dashboard: Leaflet choropleth with a switchable metric.
// Replace data/counties.geojson with real output from scripts/prepare_data.py.

const METRICS = {
  svi: {
    label: "Social Vulnerability Index",
    field: "svi",
    colors: ["#f7fbff", "#c6dbef", "#6baed6", "#2171b5", "#08306b"],
    format: (v) => v.toFixed(2),
  },
  evacuation_rate: {
    label: "Evacuation Rate",
    field: "evacuation_rate",
    colors: ["#fff5eb", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
    format: (v) => `${(v * 100).toFixed(1)}%`,
  },
  displacement_days: {
    label: "Displacement Duration (days)",
    field: "displacement_days",
    colors: ["#f7fcf5", "#a1d99b", "#41ab5d", "#238b45", "#00441b"],
    format: (v) => `${v.toFixed(1)} days`,
  },
};

let currentMetric = "svi";
let geojsonLayer = null;
let countyData = null;

const map = L.map("map", { zoomControl: true }).setView([27.8, -82.5], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 12,
}).addTo(map);

function getBreaks(field) {
  const values = countyData.features.map((f) => f.properties[field]).sort((a, b) => a - b);
  const n = values.length;
  return [0, 0.2, 0.4, 0.6, 0.8].map((p) => values[Math.floor(p * (n - 1))]);
}

function colorFor(value, breaks, colors) {
  for (let i = breaks.length - 1; i >= 0; i--) {
    if (value >= breaks[i]) return colors[i];
  }
  return colors[0];
}

function styleFeature(breaks, metric) {
  return (feature) => ({
    fillColor: colorFor(feature.properties[metric.field], breaks, metric.colors),
    weight: 1,
    color: "#ffffff",
    fillOpacity: 0.85,
  });
}

function renderLegend(breaks, metric) {
  const el = document.getElementById("legend");
  el.innerHTML = `<strong>${metric.label}</strong>`;
  breaks.forEach((b, i) => {
    el.innerHTML += `
      <div class="legend-row">
        <span class="swatch" style="background:${metric.colors[i]}"></span>
        <span>&ge; ${metric.format(b)}</span>
      </div>`;
  });
}

function showCountyInfo(props) {
  const el = document.getElementById("county-info");
  el.innerHTML = `
    <h2>${props.county_name}, ${props.state}</h2>
    <div class="metric-row"><span>SVI</span><span>${props.svi.toFixed(2)}</span></div>
    <div class="metric-row"><span>Evacuation rate</span><span>${(props.evacuation_rate * 100).toFixed(1)}%</span></div>
    <div class="metric-row"><span>Displacement</span><span>${props.displacement_days.toFixed(1)} days</span></div>
  `;
}

function drawLayer() {
  const metric = METRICS[currentMetric];
  const breaks = getBreaks(metric.field);
  if (geojsonLayer) map.removeLayer(geojsonLayer);
  geojsonLayer = L.geoJSON(countyData, {
    style: styleFeature(breaks, metric),
    onEachFeature: (feature, layer) => {
      layer.on("click", () => showCountyInfo(feature.properties));
      layer.on("mouseover", () => layer.setStyle({ weight: 2, color: "#222" }));
      layer.on("mouseout", () => geojsonLayer.resetStyle(layer));
    },
  }).addTo(map);
  renderLegend(breaks, metric);
}

fetch("data/counties.geojson")
  .then((res) => res.json())
  .then((data) => {
    countyData = data;
    drawLayer();
    map.fitBounds(geojsonLayer.getBounds());
  })
  .catch((err) => {
    document.getElementById("county-info").innerHTML =
      `<p class="placeholder">Could not load data/counties.geojson - ${err.message}</p>`;
  });

document.getElementById("metric-select").addEventListener("change", (e) => {
  currentMetric = e.target.value;
  if (countyData) drawLayer();
});
