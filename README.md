# Hurricane Ian Evacuation Study

A narrative research site: seven pages walking through the study, from
background to conclusion, plus an interactive map. Built as a static site
(plain HTML + ES modules, no build step, no framework) so it stays fast and
never crashes the way earlier Streamlit/leafmap attempts did.

## Site structure

`index.html` is a single-page app with a hash router (`js/core/router.js`):
each "page" is a `<section id="page-N">`, shown/hidden by the URL hash
(`#/1`, `#/2`, ...). The landing screen (`#/home`) gives a two-sentence
summary of the study and a clickable grid linking to all seven pages.

- **Home** - landing screen: study summary + navigation grid
- **Page 1 - Research Background** - disaster context, the government's
  evacuation-order timeline for Hurricane Ian, the place-attachment
  framework, and the three research questions, with numbered citations
- **Page 2 - Data & Methodology** - placeholder, content pending
- **Page 3 - Visualization Patterns** - the original interactive dashboard
  (map + metric dropdown + legend + distribution histogram + per-block-group
  detail panel), unchanged from before, just relocated into the multi-page
  shell. The map initializes lazily, the first time this page is opened
  (Leaflet needs a visible container to size itself correctly).
- **Page 4 - Study Area Profile** - one card per metric (grouped by the same
  10 dimensions as Page 3), showing min / 25th percentile / median / mean /
  75th percentile / max across all 915 block groups. Cards are built from
  `data/summary_stats.json` (see below), not from the map.
- **Pages 5-7 - Regression Results / Conclusion / Next Steps** -
  placeholders, content pending

Everything is dark: black background, white text, one accent hue per
category (same palette as the map). Page transitions, the landing grid, and
the Page 1 timeline/research-question cards animate in via CSS + a small
scroll-reveal helper (`js/core/reveal.js`, IntersectionObserver-based).

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

`data/summary_stats.json` (used by Page 4) is generated from
`data/blockgroups.geojson` by `scripts/compute_summary_stats.py` - min,
25th/50th/75th percentile, mean, and max for every field. Re-run it after
`prepare_data.py` any time the underlying data or field list changes:

```bash
python3 scripts/prepare_data.py
python3 scripts/compute_summary_stats.py
```

`vis_vbs.geojson` itself is git-ignored: it carries ~70 more fields than the
site uses.

## Structure

- `index.html` - all seven pages + landing screen + nav bar
- `css/main.css` - site-wide theme (nav, page transitions, timeline,
  citations, profile cards, landing grid) plus the Page 3 dashboard styles
- `js/app.js` - entry point: wires up the router, lazily initializes the
  Page 3 map and the Page 4 profile cards the first time each is opened
- `js/core/router.js` - hash router driving which page section is visible
- `js/core/reveal.js` - scroll-triggered fade-in for `.reveal` elements
- `js/main.js` - `initDashboard()`: builds the metric dropdown, wires up the
  map/legend/histogram/detail panel (this is the former page shell, now
  called lazily from `js/app.js` instead of running on load)
- `js/core/` - reusable dashboard pieces, independent of any one metric:
  - `map.js` - Leaflet init + choropleth rendering
  - `colorScale.js` - percentile-clipped sequential color scale
  - `legend.js` - gradient legend with tick labels
  - `histogram.js` - metric distribution chart
  - `detailPanel.js` - full per-block-group profile on click
  - `profileCards.js` - Page 4 summary-stat cards
  - `format.js` - value formatters (%, $, days, km, ...)
- `js/metrics/` - one file per dimension (evacuation, hurricane, home equity,
  tenure, cost burden, demographics, education/income, household, party
  registration, access). Each exports `CATEGORY` + `METRICS`; `index.js`
  combines them into the registry everything else (map, Page 4 cards) reads
  from. Add a metric by editing its dimension file; add a dimension by
  adding a new file here and listing it in `index.js`.
- `data/blockgroups.geojson` - data consumed by the Page 3 map
- `data/summary_stats.json` - data consumed by the Page 4 cards
- `scripts/prepare_data.py` - regenerates `data/blockgroups.geojson`
- `scripts/compute_summary_stats.py` - regenerates `data/summary_stats.json`

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
- `v2-black-sidebar` - each of the 10 metric categories has its own color
  hue, flat/consistent 0.85 fill opacity across all metrics,
  `pct_disability` removed (all-null in source), sidebar background is pure
  black. This was still the single-page dashboard (no multi-page shell yet).

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
