// Page 5: Pearson correlation matrix, all 23 standardized predictors +
// the 3 dependent variables (26x26). Rebuilt as a real HTML table (not an
// embedded image) so it reads as one system with the rest of the dark-theme
// site; values and the diverging color scale are taken directly from
// CORR_MATRIX in regressionResults.js (exported from the notebook's own
// corr_matrix DataFrame - not recomputed here). Lower triangle only, same
// as the notebook's masked heatmap.

// Same diverging pair the notebook used (corr_cmap in cell 49/52): dark
// blue -> off-white -> red, linearly interpolated in RGB per half.
const NEG = [0x0d, 0x36, 0x6b];
const MID = [0xf0, 0xef, 0xec];
const POS = [0xe3, 0x49, 0x48];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function colorFor(r) {
  const t = Math.max(-1, Math.min(1, r));
  const [c0, c1] = t < 0 ? [NEG, MID] : [MID, POS];
  const localT = t < 0 ? t + 1 : t; // 0..1 within the chosen half
  const rgb = [0, 1, 2].map((i) => lerp(c0[i], c1[i], localT));
  return rgb;
}

function textColorFor([r, g, b]) {
  // relative luminance, quick WCAG-ish threshold
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#111" : "#fff";
}

export function renderCorrHeatmap(container, { labels, matrix }) {
  const n = labels.length;
  const rows = [];

  // header row - full coded z_*/z_log_* predictor names (not shortened),
  // so it's unambiguous these are the standardized variables actually
  // estimated. The 3 dependent variables have no z_ prefix - they aren't
  // themselves standardized.
  const headerCells = labels
    .map((l) => `<th class="corr-col-head"><span>${l}</span></th>`)
    .join("");
  rows.push(`<tr><th class="corr-corner"></th>${headerCells}</tr>`);

  for (let i = 0; i < n; i++) {
    const cells = [];
    for (let j = 0; j < n; j++) {
      if (j > i) {
        cells.push('<td class="corr-cell corr-cell--empty"></td>');
        continue;
      }
      const r = matrix[i][j];
      const rgb = colorFor(r);
      const bg = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      const fg = textColorFor(rgb);
      const diag = i === j ? " corr-cell--diag" : "";
      cells.push(
        `<td class="corr-cell${diag}" style="background:${bg};color:${fg};"><span title="${labels[i]} × ${labels[j]}: r=${r.toFixed(3)}">${r.toFixed(2)}</span></td>`
      );
    }
    rows.push(`<tr><th class="corr-row-head">${labels[i]}</th>${cells.join("")}</tr>`);
  }

  container.innerHTML = `<table class="corr-table">${rows.join("")}</table>`;
}
