// Shared value formatters. Every formatter handles null/undefined as "N/A"
// so a missing value never crashes the legend, histogram, or detail panel.
export const fmtPct = (v) => (v == null ? "N/A" : `${(v * 100).toFixed(1)}%`);
export const fmtNum = (v, d = 1) => (v == null ? "N/A" : v.toFixed(d));
export const fmtCurrency = (v) => (v == null ? "N/A" : `$${Math.round(v).toLocaleString()}`);
export const fmtDays = (v) => (v == null ? "N/A" : `${v.toFixed(1)} days`);
export const fmtKm = (v) => (v == null ? "N/A" : `${v.toFixed(1)} km`);
export const fmtYears = (v) => (v == null ? "N/A" : `${v.toFixed(1)} yrs`);
// median_loan_term_remaining comes out of the source data in months, not
// years - this converts before formatting rather than fixing the raw field,
// so it's a one-line, display-only change.
export const fmtMonthsAsYears = (v) => (v == null ? "N/A" : `${(v / 12).toFixed(1)} yrs`);
export const fmtPeople = (v) => (v == null ? "N/A" : `${v.toFixed(1)} people`);
export const fmtCount = (v) => (v == null ? "N/A" : Math.round(v).toLocaleString());
export const fmtDensity = (v) => (v == null ? "N/A" : `${Math.round(v).toLocaleString()}/km²`);
