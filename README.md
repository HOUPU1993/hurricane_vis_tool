# Hurricane Evacuation Visualization

Interactive dashboard visualizing hurricane evacuation behavior research:
social vulnerability / demographic profile, evacuation rate, and
displacement duration, by county.

## Status

Early scaffold. `data/counties.geojson` currently contains **fictitious
placeholder values for a handful of Florida counties** so the map and
metric switcher can be built and tested end-to-end before the real
research output is wired in. Replace it with the output of
`scripts/prepare_data.py` once the real pipeline is ready.

## Structure

- `index.html` — page shell (sidebar + map)
- `css/main.css` — layout and styling
- `js/main.js` — Leaflet map, choropleth styling, metric switcher, legend, county detail panel
- `data/counties.geojson` — county polygons + attributes consumed by the map (placeholder for now)
- `scripts/prepare_data.py` — stub for exporting real research output (geopandas) into the GeoJSON schema `main.js` expects

## Running locally

Opening `index.html` directly (`file://`) will not load the data due to
browser CORS restrictions on local `fetch`. Serve the folder instead:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Data note

This repo is public. Do not commit raw or proprietary source data
(Cuebiq mobile GPS, ATTOM property records, restricted Census
microdata, etc.) here — only the small, aggregated, already-shareable
`counties.geojson` used by the front end belongs in this repository.

## Deployment

Intended to be hosted via GitHub Pages once the content is in place
(Settings → Pages → deploy from the `main` branch).
