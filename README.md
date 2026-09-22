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

- **Color scale**: one hue per dimension (see `CATEGORY_COLOR` in each
  `js/metrics/*.js` file), not blue for everything - `js/core/colorScale.js`
  turns each hue into a light-to-dark ramp the same way (HSL, fixed
  lightness/saturation steps), so every metric is built consistently even
  though the hues differ.
- **Percentile-clipped domain**: several fields (evacuation distance, home
  equity, mortgage remaining, population density) are extremely
  right-skewed, so the color domain is clipped per metric (2nd-98th
  percentile by default, 5th-95th for the more skewed ones - see
  `clipLow`/`clipHigh` in each metric file) rather than raw min/max. A value
  outside the clipped range still renders, clamped to the ramp's end color;
  the exact, unclipped value is always shown in the detail panel on click.
- **Fill opacity is a flat 0.85 for every metric.** An earlier version
  scaled evacuation-metric opacity by detection `confidence`, but that made
  those maps too faint to compare block groups against each other.
  `confidence` is still its own selectable metric if you want to see sample
  coverage directly.
- Units for `proximity` and `peak_wind` (Hurricane Characteristics) are not
  yet confirmed in `js/metrics/hurricane.js` - fill those in before sharing.
- `pct_disability` was dropped (not plotted): it was null for all 915
  block groups in the source data (`disab_count`/`disab_universe` are both
  0 upstream, in `vis_vbs.geojson`) and not needed for this dashboard.

## Rollback points

Tagged milestones in this repo (`git tag -l`, `git checkout <tag>` to view,
`git reset --hard <tag>` to actually roll back):

- `v1-dark-milestone` - dark Esri basemap, no CBG borders (hover-only shows
  a white outline), real block-group data, single blue hue for every
  metric, confidence-weighted opacity on evacuation metrics.
- `v2-black-sidebar` (current default going forward) - each of the 10
  metric categories has its own color hue, flat/consistent 0.85 fill
  opacity across all metrics, `pct_disability` removed (all-null in
  source), sidebar background is pure black.

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
