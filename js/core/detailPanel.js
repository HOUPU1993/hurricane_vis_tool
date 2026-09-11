import { CATEGORIES } from "../metrics/index.js";

// Full profile for one clicked block group, grouped into the same
// collapsible categories as the metric dropdown (native <details>, no JS
// needed for expand/collapse).
export function renderDetailPanel(container, feature) {
  if (!feature) {
    container.innerHTML = '<p class="placeholder">Click a block group to see its full profile.</p>';
    return;
  }
  const props = feature.properties;
  const sections = CATEGORIES.map((cat) => {
    const rows = cat.metrics
      .map((m) => `<div class="metric-row"><span>${m.label}</span><span>${m.format(props[m.field])}</span></div>`)
      .join("");
    return `<details><summary>${cat.name}</summary>${rows}</details>`;
  }).join("");
  container.innerHTML = `<h2>Block Group ${props.GEO10 ?? ""}</h2>${sections}`;
}
