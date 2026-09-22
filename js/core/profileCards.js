// Page 4: one card per metric summarizing its distribution across all 915
// block groups (min / 25th pct / median / mean / 75th pct / max) - a
// numeric snapshot of the study area, independent of the map on Page 3.
// Built with DOM calls + textContent (not innerHTML) since metric labels
// can contain "&" and similar characters that shouldn't be treated as markup.
const ROWS = [
  ["Min", "min"],
  ["25th pct", "p25"],
  ["Median", "median"],
  ["Mean", "mean"],
  ["75th pct", "p75"],
  ["Max", "max"],
];

export async function renderProfileCards(container, categories) {
  container.textContent = "";
  const loading = document.createElement("p");
  loading.className = "placeholder";
  loading.textContent = "Loading summary statistics...";
  container.appendChild(loading);

  let stats;
  try {
    const res = await fetch("data/summary_stats.json");
    stats = await res.json();
  } catch (err) {
    container.textContent = "";
    const errEl = document.createElement("p");
    errEl.className = "placeholder";
    errEl.textContent = `Could not load data/summary_stats.json - ${err.message}`;
    container.appendChild(errEl);
    return;
  }

  container.textContent = "";

  for (const cat of categories) {
    const section = document.createElement("section");
    section.className = "profile-category";

    const heading = document.createElement("h3");
    heading.textContent = cat.name;
    heading.style.setProperty("--cat-color", cat.color);
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "profile-grid";

    for (const metric of cat.metrics) {
      const s = stats[metric.field];
      const card = document.createElement("article");
      card.className = "profile-card reveal";
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
