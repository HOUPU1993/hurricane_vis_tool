// Page 4: one card per metric summarizing its distribution across all 915
// block groups (min / 25th pct / median / mean / 75th pct / max, plus the
// same histogram shown on Page 3) - a numeric + visual snapshot of the
// study area, independent of the map.
// Built with DOM calls + textContent (not innerHTML) since metric labels
// can contain "&" and similar characters that shouldn't be treated as markup.
import { computeDomain } from "./colorScale.js";
import { renderHistogram } from "./histogram.js";

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
