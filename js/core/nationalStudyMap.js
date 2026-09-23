// Page 7: a lightweight status map for the national-study expansion - one
// marker per state, colored by whether its evacuation-zone GIS data has
// been downloaded, collected manually (PDFs only), or is still pending a
// county EMA contact. Deliberately NOT the zone polygons themselves - those
// run 100+MB per state raw and aren't simplified/normalized across states
// yet (see js/data/nationalStudy.js). Same Leaflet + Esri dark basemap as
// js/core/map.js, but its own init since the view/zoom and marker style
// are unrelated to the block-group choropleth.
import { STATE_STATUS, STATUS_META } from "../data/nationalStudy.js";

export function initNationalStudyMap(containerId) {
  const map = L.map(containerId, { zoomControl: true, scrollWheelZoom: false }).setView([31.8, -87.5], 5);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap contributors", maxZoom: 10 }
  ).addTo(map);

  for (const s of STATE_STATUS) {
    const meta = STATUS_META[s.status];

    L.circleMarker([s.lat, s.lon], {
      radius: 16,
      color: meta.color,
      weight: 2,
      fillColor: meta.color,
      fillOpacity: 0.3,
    })
      .addTo(map)
      .bindTooltip(`<strong>${s.name}</strong><br>${meta.label}<br>${s.note}`, { direction: "top", offset: [0, -10] });

    L.marker([s.lat, s.lon], {
      icon: L.divIcon({ className: "state-label", html: s.code, iconSize: [30, 16], iconAnchor: [15, 8] }),
      interactive: false,
    }).addTo(map);
  }

  return map;
}
