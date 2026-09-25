// Page 4: one card per metric summarizing its distribution across all 915
// block groups (min / 25th pct / median / mean / 75th pct / max, plus the
// same histogram shown on Page 3) - a numeric + visual snapshot of the
// study area, independent of the map.
// Built with DOM calls + textContent (not innerHTML) since metric labels
// can contain "&" and similar characters that shouldn't be treated as markup.
import { computeDomain } from "./colorScale.js";
import { renderHistogram } from "./histogram.js";
import { renderScatterRow } from "./scatterPlot.js";
import { SCATTER_FEATURE_FIELD, SCATTER_DV_FIELD } from "../metrics/scatterFields.js";

// The three core outcome variables (see js/metrics/evacuation.js) - every
// other category's cards get a scatter of feature-vs-outcome for each of
// these three; the evacuation category itself is skipped below since its
// own metrics ARE these outcomes, so plotting them against themselves would
// be meaningless.
const OUTCOME_FIELDS = ["evacuation_rate", "median_evacuation_distance_km", "median_return_days"];
const EVACUATION_CATEGORY = "Mobile Phone Evacuation Detection";

// The scatter plots alone read from this modeling-ready extract (real
// per-block-group pairs, standardized/log-transformed to match the actual
// regression variables) rather than data/blockgroups.geojson - see
// js/metrics/scatterFields.js for why and the field-by-field crosswalk.
// Everything else on this page (stats table, histogram) keeps using the raw
// blockgroups.geojson data, untouched.
const SCATTER_DATA_URL = "data/vis_vbs_for_scatter.geojson";

const ROWS = [
  ["Min", "min"],
  ["25th pct", "p25"],
  ["Median", "median"],
  ["Mean", "mean"],
  ["75th pct", "p75"],
  ["Max", "max"],
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function renderProfileCards(container, categories) {
  container.textContent = "";
  const loading = document.createElement("p");
  loading.className = "placeholder";
  loading.textContent = "Loading study area data...";
  container.appendChild(loading);

  let stats;
  let geoData;
  try {
    const [statsRes, geoRes] = await Promise.all([fetch("data/summary_stats.json"), fetch("data/blockgroups.geojson")]);
    [stats, geoData] = await Promise.all([statsRes.json(), geoRes.json()]);
  } catch (err) {
    container.textContent = "";
    const errEl = document.createElement("p");
    errEl.className = "placeholder";
    errEl.textContent = `Could not load study area data - ${err.message}`;
    container.appendChild(errEl);
    return;
  }

  container.textContent = "";

  // Fetched separately from the two above, and its own failure doesn't take
  // the whole page down with it - a stats-table-and-histogram profile is
  // still useful on its own, it just loses the scatter rows.
  let scatterFeatures = null;
  try {
    const scatterRes = await fetch(SCATTER_DATA_URL);
    scatterFeatures = (await scatterRes.json()).features;
  } catch (err) {
    console.warn(`Could not load scatter data (${SCATTER_DATA_URL}) - relationship-to-outcomes plots will be skipped.`, err);
  }

  const evacCategory = categories.find((c) => c.name === EVACUATION_CATEGORY);
  const dvMetrics = evacCategory ? evacCategory.metrics.filter((m) => OUTCOME_FIELDS.includes(m.field)) : [];
  const scatterDvMetrics = dvMetrics
    .map((dv) => (SCATTER_DV_FIELD[dv.field] ? { ...dv, field: SCATTER_DV_FIELD[dv.field] } : null))
    .filter(Boolean);

  for (const cat of categories) {
    const section = document.createElement("section");
    // Doubles as an Option Wheel panel: js/core/optionWheel.js reads
    // data-wheel-panel/-label off each .wheel-panel it finds, so one
    // category = one wheel button, generated straight from this same
    // CATEGORIES list rather than a hand-kept-in-sync duplicate.
    section.className = "profile-category wheel-panel";
    section.dataset.wheelPanel = slugify(cat.name);
    section.dataset.wheelLabel = cat.name;

    const heading = document.createElement("h3");
    heading.textContent = cat.name;
    heading.style.setProperty("--cat-color", cat.color);
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "profile-grid";

    for (const metric of cat.metrics) {
      const s = stats[metric.field];
      const card = document.createElement("article");
      card.className = "profile-card";
      card.style.setProperty("--cat-color", metric.color);

      const title = document.createElement("h4");
      title.textContent = metric.label;
      card.appendChild(title);

      if (!s || s.n === 0) {
        const empty = document.createElement("p");
        empty.className = "profile-empty";
        empty.textContent = "No data";
        card.appendChild(empty);
        grid.appendChild(card);
        continue;
      }

      const dl = document.createElement("dl");
      dl.className = "profile-stats";
      for (const [label, key] of ROWS) {
        const stat = document.createElement("div");
        stat.className = "profile-stat";
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = metric.format(s[key]);
        stat.appendChild(dt);
        stat.appendChild(dd);
        dl.appendChild(stat);
      }
      card.appendChild(dl);

      // Same distribution chart as Page 3's map sidebar - the full,
      // unclipped spread of this metric with dashed lines at the
      // clipLow/clipHigh percentile bounds.
      const histWrap = document.createElement("div");
      histWrap.className = "profile-hist";
      const domain = computeDomain(geoData.features, metric);
      renderHistogram(histWrap, domain, metric);
      card.appendChild(histWrap);

      // Scatter against each of the three outcomes - every category except
      // the outcomes' own (see OUTCOME_FIELDS/EVACUATION_CATEGORY above),
      // and only for metrics with a processed counterpart in the scatter
      // dataset (see js/metrics/scatterFields.js).
      const scatterField = SCATTER_FEATURE_FIELD[metric.field];
      if (
        cat.name !== EVACUATION_CATEGORY &&
        scatterField &&
        scatterFeatures &&
        scatterDvMetrics.length === OUTCOME_FIELDS.length
      ) {
        renderScatterRow(card, { ...metric, field: scatterField }, scatterDvMetrics, scatterFeatures);
      }

      const nEl = document.createElement("p");
      nEl.className = "profile-n";
      nEl.textContent =
        s.n < s.n_total
          ? `n = ${s.n.toLocaleString()} of ${s.n_total.toLocaleString()}`
          : `n = ${s.n.toLocaleString()}`;
      card.appendChild(nEl);

      grid.appendChild(card);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }
}
