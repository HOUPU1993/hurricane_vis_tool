import { fmtPct, fmtPeople } from "../core/format.js";

export const CATEGORY = "Household Structure";
export const CATEGORY_COLOR = "#e34948"; // one hue per dimension, not all blue

export const METRICS = [
  { field: "pct_hh_children", label: "Households with Children", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "avg_household_size", label: "Average Household Size", category: CATEGORY, format: fmtPeople, clipLow: 2, clipHigh: 98 },
];
