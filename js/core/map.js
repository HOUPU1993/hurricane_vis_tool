import { computeDomain, colorForValue } from "./colorScale.js";

export function initMap(containerId) {
  const map = L.map(containerId, { zoomControl: true }).setView([27.3, -82.4], 8);
  // Esri World Dark Gray Canvas - a genuinely dark basemap (not a filtered
  // light one), free with no API key/account. Falls back to CSS-darkened
  // OSM tiles (see .leaflet-tile-pane in main.css) if this ever stops
  // resolving - swap the URL back to the OSM one in git history.
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
      maxZoom: 14,
    }
  ).addTo(map);
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
