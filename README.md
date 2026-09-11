# Hurricane Evacuation Visualization

Interactive dashboard for hurricane evacuation research: evacuation
behavior detected from mobile phone location data, displacement duration,
hurricane characteristics, and social/demographic/housing vulnerability -
by Census block group.

## Data

`data/blockgroups.geojson` is generated from the lab's research output
(`vis_vbs.geojson`, not committed here - see below) by
`scripts/prepare_data.py`, which:

- keeps only the ~30 fields the dashboard plots (out of ~100 in the source),
  grouped to match `js/metrics/*.js`
- derives `confidence` = n_evacuees / ACS population, capped at 1 - how much
  of a block group's population the phone panel actually captured
- simplifies polygon geometry (Douglas-Peucker) and rounds coordinates to
  shrink the file for fast loading (~1.3MB vs. ~6.7MB raw)

`vis_vbs.geojson` itself is git-ignored: it carries ~70 more fields than the
site uses. If you regenerate it, re-run `python3 scripts/prepare_data.py`
from the project root to refresh `data/blockgroups.geojson`.

## Structure

- `index.html` - page shell (sidebar + map)
- `css/main.css` - layout and styling
- `js/main.js` - entry point: builds the metric dropdown, wires up the map/legend/histogram/detail panel
- `js/core/` - reusable pieces, independent of any one metric:
  - `map.js` - Leaflet init + choropleth rendering
  - `colorScale.js` - percentile-clipped sequential color scale
  - `legend.js` - gradient legend with tick labels
  - `histogram.js` - metric distribution chart
  - `detailPanel.js` - full per-block-group profile on click
  - `format.js` - value formatters (%, $, days, km, ...)
- `js/metrics/` - one file per dimension (evacuation, hurricane, home equity,
  tenure, cost burden, demographics, education/income, household, party
  registration, access). Each exports `CATEGORY` + `METRICS`; `index.js`
  combines them into the registry everything else reads from. Add a metric
  by editing its dimension file; add a dimension by adding a new file here
  and listing it in `index.js`.
- `data/blockgroups.geojson` - data consumed by the map
- `scripts/prepare_data.py` - regenerates `data/blockgroups.geojson` from the raw research output

## Design notes

- **Color scale**: continuous, one hue (blue), light = low, dark = high.
  Several fields (evacuation distance, home equity, mortgage remaining,
  population density) are extremely right-skewed, so the color domain is
  clipped to a percentile range per metric (2nd-98th by default, 5th-95th
  for the more skewed ones - see `clipLow`/`clipHigh` in each metric file)
  rather than raw min/max. A value outside the clipped range still renders,
  clamped to the ramp's end color; the exact, unclipped value is always
  shown in the detail panel on click.
- **Confidence-weighted opacity**: for the evacuation-detection metrics,
  fill opacity also scales with `confidence` (sample coverage), so a
  striking color backed by a tiny sample reads as less certain than the
  same color backed by a large one.
- Units for `proximity` and `peak_wind` (Hurricane Characteristics) are not
  yet confirmed in `js/metrics/hurricane.js` - fill those in before sharing.

## Running locally

Opening `index.html` directly (`file://`) will not load the data due to
browser CORS restrictions on local `fetch`. Serve the folder instead:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Intended to be hosted via GitHub Pages (Settings -> Pages -> deploy from
the `main` branch).
