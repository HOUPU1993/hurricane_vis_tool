import { fmtPct } from "../core/format.js";

export const CATEGORY = "Vehicle & Broadband Access";
export const CATEGORY_COLOR = "#1baf7a"; // one hue per dimension, not all blue

export const METRICS = [
  { field: "pct_hh_has_vehicle", label: "Households with a Vehicle", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_broadband", label: "Households with Broadband", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
];
