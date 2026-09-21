import { fmtPct } from "../core/format.js";

export const CATEGORY = "Party Registration";
export const CATEGORY_COLOR = "#eb6834"; // one hue per dimension, not all blue

export const METRICS = [
  { field: "party_dem_pct", label: "Registered Democrat", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "party_rep_pct", label: "Registered Republican", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
  { field: "party_npp_pct", label: "No Party Preference", category: CATEGORY, format: fmtPct, clipLow: 2, clipHigh: 98 },
];
