import { fmtPct, fmtDensity } from "../core/format.js";

export const CATEGORY = "Population & Race";
export const CATEGORY_COLOR = "#008300"; // one hue per dimension, not all blue

export const METRICS = [
  { field: "pct_65p", label: "Population 65+", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_homeownership", label: "Homeownership Rate", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_white", label: "White (non-Hispanic)", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_black", label: "Black (non-Hispanic)", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_asian", label: "Asian (non-Hispanic)", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "pct_hispanic", label: "Hispanic", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  {
    field: "pop_density",
    label: "Population Density",
    category: CATEGORY,
    format: fmtDensity,
    clipLow: 5,
    clipHigh: 95, // heavy right tail
  },
];
