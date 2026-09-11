import { fmtPct, fmtDensity } from "../core/format.js";

export const CATEGORY = "Population & Race";

export const METRICS = [
  { field: "pct_65p", label: "Population 65+", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
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
  { field: "pct_disability", label: "Population with a Disability", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
];
