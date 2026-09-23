// Page 5: one coefficient (dot-and-whisker) plot per dependent variable,
// drawing Model 4 (the full model - all controls + all four key features).
// Dependency-free SVG, same spirit as histogram.js/legend.js: no charting
// library, just enough markup to be legible and hoverable.
//
// Encoding:
//   - position   = standardized coefficient (dot) and its 95% CI (whisker)
//   - row color  = the feature's existing site category color (see
//                  js/metrics/*.js / FEATURE_META in regressionResults.js)
//   - dot fill   = significance: solid = p<0.05, half-opacity = p<0.1,
//                  hollow (stroke only) = not significant at p<0.1
//   - stars      = *, **, *** next to the value, same convention as the
//                  notebook's summary_col output
//
// Rows are grouped: the four "key" hypothesis features first (highlighted),
// then controls grouped by category, in FEATURE_META's own order - not
// sorted by effect size, so a reader can find a specific variable by its
// category rather than hunting through a magnitude-sorted list.

function starsFor(p) {
  if (p < 0.01) return "***";
  if (p < 0.05) return "**";
  if (p < 0.1) return "*";
  return "";
}

function sigClass(p) {
  if (p < 0.05) return "sig-strong";
  if (p < 0.1) return "sig-weak";
  return "sig-none";
}

function groupRows(rows, featureMeta) {
  const keyRows = rows.filter((r) => featureMeta[r.feature]?.isKey);
  const controlRows = rows.filter((r) => !featureMeta[r.feature]?.isKey);

  const controlGroups = [];
  const byCategory = new Map();
  for (const r of controlRows) {
    const cat = featureMeta[r.feature]?.category ?? "Other";
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
      controlGroups.push(cat);
    }
    byCategory.get(cat).push(r);
  }

  const sections = [];
  if (keyRows.length) sections.push({ heading: "Key hypothesis variables", rows: keyRows, isKey: true });
  for (const cat of controlGroups) {
    sections.push({ heading: cat, rows: byCategory.get(cat), isKey: false });
  }
  return sections;
}

const ROW_H = 24;
const HEADER_H = 20;
const LABEL_W = 172;
const PLOT_W = 168;
const PAD = 6;
const AXIS_H = 22;

export function renderCoefficientPlot(container, { dvKey, dvLabel, note, rows, featureMeta }) {
  const sections = groupRows(rows, featureMeta);
  const totalRows = rows.length;
  const totalHeaders = sections.length;
  const plotHeight = totalRows * ROW_H + totalHeaders * HEADER_H + AXIS_H + PAD * 2;
  const width = LABEL_W + PLOT_W + PAD * 2;

  // Symmetric domain around 0, padded 12%, from this DV's own CI bounds -
  // each panel gets its own x-scale since the three DVs are on different
  // units (a rate, days, log-km) and are not comparable across panels.
  const maxAbs = Math.max(...rows.map((r) => Math.max(Math.abs(r.ciLow), Math.abs(r.ciHigh))));
  const domainMax = maxAbs * 1.12 || 1;
  const toX = (v) => LABEL_W + PAD + ((v + domainMax) / (domainMax * 2)) * PLOT_W;
  const zeroX = toX(0);

  let y = PAD;
  const svgParts = [];

  // zero-reference line spans the full plot height, drawn first (under bars)
  svgParts.push(
    `<line x1="${zeroX.toFixed(1)}" y1="${PAD}" x2="${zeroX.toFixed(1)}" y2="${(plotHeight - AXIS_H).toFixed(1)}" class="coef-zero-line" />`
  );

  for (const section of sections) {
    svgParts.push(
      `<text x="${PAD}" y="${(y + HEADER_H - 7).toFixed(1)}" class="coef-section-label${section.isKey ? " coef-section-label--key" : ""}">${section.isKey ? "★ " : ""}${section.heading}</text>`
    );
    y += HEADER_H;

    for (const r of section.rows) {
      const meta = featureMeta[r.feature] ?? { label: r.feature, color: "#999" };
      const rowMidY = y + ROW_H / 2;
      const x1 = toX(r.ciLow);
      const x2 = toX(r.ciHigh);
      const xDot = toX(r.coef);
      const sig = sigClass(r.p);
      const stars = starsFor(r.p);

      // row label, clipped with a native tooltip for the full text
      svgParts.push(
        `<text x="${PAD}" y="${(rowMidY + 4).toFixed(1)}" class="coef-row-label"><title>${meta.label} (${r.coef >= 0 ? "+" : ""}${r.coef.toFixed(4)}, p=${r.p.toFixed(3)})</title>${meta.label}</text>`
      );
      // CI whisker
      svgParts.push(
        `<line x1="${x1.toFixed(1)}" y1="${rowMidY.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${rowMidY.toFixed(1)}" stroke="${meta.color}" class="coef-whisker ${sig}" />`
      );
      // dot
      svgParts.push(
        `<circle cx="${xDot.toFixed(1)}" cy="${rowMidY.toFixed(1)}" r="4" fill="${meta.color}" stroke="${meta.color}" class="coef-dot ${sig}"><title>${meta.label}: ${r.coef >= 0 ? "+" : ""}${r.coef.toFixed(4)} [${r.ciLow.toFixed(4)}, ${r.ciHigh.toFixed(4)}], p=${r.p.toFixed(3)} ${stars}</title></circle>`
      );
      if (stars) {
        svgParts.push(
          `<text x="${(LABEL_W + PLOT_W + PAD + 4).toFixed(1)}" y="${(rowMidY + 4).toFixed(1)}" class="coef-stars">${stars}</text>`
        );
      }
      y += ROW_H;
    }
  }

  // simple 3-tick axis at the bottom
  const axisY = plotHeight - AXIS_H + 8;
  const ticks = [-domainMax, 0, domainMax];
  const axisParts = ticks
    .map((t) => {
      const x = toX(t);
      return `<text x="${x.toFixed(1)}" y="${axisY.toFixed(1)}" class="coef-axis-tick" text-anchor="${t < -domainMax * 0.5 ? "start" : t > domainMax * 0.5 ? "end" : "middle"}">${t.toFixed(t === 0 ? 0 : 3)}</text>`;
    })
    .join("");

  container.innerHTML = `
    <div class="coef-panel-head">
      <h4>${dvLabel}</h4>
      <p class="coef-panel-note">${note}</p>
    </div>
    <svg viewBox="0 0 ${width + 30} ${plotHeight}" width="100%" height="${plotHeight}" role="img" aria-label="Model 4 standardized coefficients for ${dvLabel}">
      ${svgParts.join("")}
      ${axisParts}
    </svg>
  `;
}
