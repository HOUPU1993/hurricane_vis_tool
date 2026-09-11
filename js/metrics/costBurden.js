import { fmtPct } from "../core/format.js";

export const CATEGORY = "Housing Cost Burden";

export const METRICS = [
  {
    field: "pct_cost_burden_50p",
    label: "Cost-Burdened Households (>50% income on housing)",
    category: CATEGORY,
    format: fmtPct,
    clipLow: 2,
    clipHigh: 98,
  },
];
