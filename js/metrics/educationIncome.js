import { fmtCount, fmtPct } from "../core/format.js";

export const CATEGORY = "Education & Income";
export const CATEGORY_COLOR = "#4a3aa7"; // one hue per dimension, not all blue

export const METRICS = [
  {
    // Raw count, not a rate, per your field list - larger block groups will
    // read "higher" regardless of the share of residents with a degree.
    // pct_college exists in the source data if you'd rather plot a rate.
    field: "pop_college",
    label: "Population with a College Degree (count)",
    category: CATEGORY,
    format: fmtCount,
    clipLow: 2,
    clipHigh: 98,
  },
  { field: "pct_inc_q1", label: "Household Income - Quintile 1 (lowest)", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_inc_q2", label: "Household Income - Quintile 2", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_inc_q3", label: "Household Income - Quintile 3", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_inc_q4", label: "Household Income - Quintile 4", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_inc_q5", label: "Household Income - Quintile 5 (highest)", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
];
