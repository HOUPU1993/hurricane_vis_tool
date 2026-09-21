import { computeDomain, colorForValue } from "./colorScale.js";

export function initMap(containerId) {
  const map = L.map(containerId, { zoomControl: true }).setView([27.3, -82.4], 8);
  // Esri World Dark Gray Canvas - a genuinely dark basemap (not a filtered
  // light one), free with no API key/account. Falls back to CSS-darkened
  // OSM tiles (see the commented-out rule in main.css) if this ever stops
  // resolving - swap the URL back to the OSM one in git history (tag
  // v1-dark-milestone has the CSS-filter version working end to end).
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
// Fill opacity is a flat 0.85 for every metric - it used to scale with
// evacuation-detection confidence, but that made those particular maps read
// as too faint to compare across block groups. Confidence is still its own
// selectable metric if you want to see sample coverage directly.
//
// No border by default: with ~900 block groups, some tiny, a stroke around
// every polygon reads as more ink than data at this zoom. A border appears
// only on hover, as feedback that a shape is interactive.
const FILL_OPACITY = 0.85;

export function drawChoropleth({ map, layerRef, data, metric, onFeatureClick }) {
  const domain = computeDomain(data.features, metric);

  if (layerRef.current) map.removeLayer(layerRef.current);

  layerRef.current = L.geoJSON(data, {
    style: (feature) => {
      const value = feature.properties[metric.field];
      return { fillColor: colorForValue(value, domain, metric.color), stroke: false, fillOpacity: FILL_OPACITY };
    },
    onEachFeature: (feature, layer) => {
      layer.on("click", () => onFeatureClick(feature));
      layer.on("mouseover", () => layer.setStyle({ stroke: true, weight: 1.5, color: "#ffffff" }));
      layer.on("mouseout", () => layerRef.current.resetStyle(layer));
    },
  }).addTo(map);

  return domain;
}
