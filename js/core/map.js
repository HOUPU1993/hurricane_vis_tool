import { computeDomain, colorForValue } from "./colorScale.js";

export function initMap(containerId) {
  const map = L.map(containerId, { zoomControl: true }).setView([27.3, -82.4], 8);
  // CartoDB Dark Matter: free, no API key, high contrast so choropleth fills
  // stay readable and land/ocean recede instead of competing with the data.
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 14,
  }).addTo(map);
  return map;
}

// Redraws the choropleth for one metric. `layerRef` is a { current } box so
// the caller can remove the previous layer before adding the new one.
//
// Opacity trick: for metrics flagged with `opacityField` (currently the
// evacuation-detection metrics + `confidence`), fill opacity is scaled by
// how much of the block group's population the mobile-phone panel actually
// captured (n_evacuees / ACS population). Low-confidence block groups render
// more transparent, so a striking color in a nearly-empty-sample area
// doesn't read as equally certain as one backed by a large sample.
//
// No border by default: with ~900 block groups, some tiny, a stroke around
// every polygon reads as more ink than data at this zoom. A border appears
// only on hover, as feedback that a shape is interactive.
export function drawChoropleth({ map, layerRef, data, metric, onFeatureClick }) {
  const domain = computeDomain(data.features, metric);
  const opacityDomain = metric.opacityField
    ? computeDomain(data.features, { field: metric.opacityField, clipLow: 5, clipHigh: 95 })
    : null;

  if (layerRef.current) map.removeLayer(layerRef.current);

  const baseStyle = (feature) => {
    const value = feature.properties[metric.field];
    let fillOpacity = 0.85;
    if (opacityDomain) {
      const conf = feature.properties[metric.opacityField];
      if (conf == null) {
        fillOpacity = 0.15;
      } else {
        const { lo, hi } = opacityDomain;
        const t = hi === lo ? 1 : Math.max(0, Math.min(1, (conf - lo) / (hi - lo)));
        fillOpacity = 0.25 + t * 0.65;
      }
    }
    return { fillColor: colorForValue(value, domain), stroke: false, fillOpacity };
  };

  layerRef.current = L.geoJSON(data, {
    style: baseStyle,
    onEachFeature: (feature, layer) => {
      layer.on("click", () => onFeatureClick(feature));
      layer.on("mouseover", () => layer.setStyle({ stroke: true, weight: 1.5, color: "#ffffff" }));
      layer.on("mouseout", () => layerRef.current.resetStyle(layer));
    },
  }).addTo(map);

  return domain;
}
