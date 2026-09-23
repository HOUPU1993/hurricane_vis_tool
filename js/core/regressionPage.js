// Page 5 (Regression Results): wires the static regression output data
// (js/data/regressionResults.js, extracted from the notebook - nothing
// here is computed in the browser) into the VIF table, the Model 0-4
// comparison tables, the Model 4 coefficient plots, and the correlation
// matrix. Called once, lazily, on first visit - see js/app.js.
import { DEP_VARS, FEATURE_META, VIF_TABLE, MODEL4, MODEL_COMPARISON, CORR_MATRIX } from "../data/regressionResults.js";
import { renderCoefficientPlot } from "./coefficientPlot.js";
import { renderCorrHeatmap } from "./corrHeatmap.js";

function vifFlag(vif) {
  if (vif > 10) return { text: "High", cls: "vif-flag--high" };
  if (vif > 5) return { text: "Moderate", cls: "vif-flag--moderate" };
  return { text: "OK", cls: "vif-flag--ok" };
}

function renderVifTable(container) {
  const rows = VIF_TABLE.map((row) => {
    const meta = FEATURE_META[row.feature];
    const flag = vifFlag(row.vif);
    return `
      <tr>
        <td>${meta?.label ?? row.feature}</td>
        <td class="data-table--num">${row.vif.toFixed(2)}</td>
        <td><span class="vif-flag ${flag.cls}">${flag.text}</span></td>
      </tr>`;
  }).join("");
  const nHigh = VIF_TABLE.filter((r) => r.vif > 10).length;
  const nModerate = VIF_TABLE.filter((r) => r.vif > 5 && r.vif <= 10).length;
  container.innerHTML = `
    <p class="vif-summary">
      ${nHigh} feature(s) with VIF &gt; 10 (serious concern), ${nModerate} with 5 &ndash; 10 (worth a look) -
      out of ${VIF_TABLE.length} predictors in Model 4. No sign of problematic multicollinearity.
    </p>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Feature</th><th>VIF</th><th>Flag</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

const KEY_ORDER = ["z_log_median_equity", "z_pct_active_mortgage", "z_median_loan_term_remaining", "z_lor_to_2022_owner"];
const MODEL_NAMES = ["Model 0", "Model 1", "Model 2", "Model 3", "Model 4"];

function renderComparisonTable(container, dv) {
  const comp = MODEL_COMPARISON[dv.key];
  const rows = KEY_ORDER.map((feat) => {
    const meta = FEATURE_META[feat];
    const kf = comp.keyFeatures[feat];
    const cellByModel = new Array(5).fill("<span class=\"cmp-empty\">&ndash;</span>");
    kf.modelIndex.forEach((modelIdx, i) => {
      cellByModel[modelIdx] = `<span class="cmp-coef">${kf.coef[i]}</span><br><span class="cmp-se">${kf.se[i]}</span>`;
    });
    return `<tr><td>${meta.label}</td>${cellByModel.map((c) => `<td class="data-table--num">${c}</td>`).join("")}</tr>`;
  }).join("");

  const infoRow = (label, values) =>
    `<tr class="cmp-info-row"><td>${label}</td>${values.map((v) => `<td class="data-table--num">${v}</td>`).join("")}</tr>`;

  container.innerHTML = `
    <h5>${dv.label}</h5>
    <div class="table-wrap">
      <table class="data-table data-table--compact">
        <thead><tr><th>Key feature</th>${MODEL_NAMES.map((m) => `<th>${m}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows}
          ${infoRow("R²", comp.r2)}
          ${infoRow("Adj. R²", comp.adjR2)}
          ${infoRow("N", comp.n)}
        </tbody>
      </table>
    </div>`;
}

export function initRegressionPage() {
  const vifEl = document.getElementById("vif-table");
  if (vifEl) renderVifTable(vifEl);

  const comparisonEl = document.getElementById("model-comparison");
  if (comparisonEl) {
    comparisonEl.innerHTML = "";
    for (const dv of DEP_VARS) {
      const panel = document.createElement("div");
      panel.className = "cmp-panel";
      comparisonEl.appendChild(panel);
      renderComparisonTable(panel, dv);
    }
  }

  const coefEl = document.getElementById("coefficient-plots");
  if (coefEl) {
    coefEl.innerHTML = "";
    for (const dv of DEP_VARS) {
      const panel = document.createElement("div");
      panel.className = "coef-panel";
      coefEl.appendChild(panel);
      renderCoefficientPlot(panel, {
        dvKey: dv.key,
        dvLabel: dv.label,
        note: dv.note,
        rows: MODEL4[dv.key],
        featureMeta: FEATURE_META,
      });
    }
  }

  const corrEl = document.getElementById("corr-heatmap");
  if (corrEl) renderCorrHeatmap(corrEl, CORR_MATRIX);
}
