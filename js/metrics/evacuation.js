import { fmtPct, fmtKm, fmtDays } from "../core/format.js";

export const CATEGORY = "Mobile Phone Evacuation Detection";

export const METRICS = [
  {
    field: "evacuation_rate",
    label: "Evacuation Rate",
    category: CATEGORY,
    format: fmtPct,
    clipLow: 2,
    clipHigh: 98,
    opacityField: "confidence",
  },
  {
    field: "median_evacuation_distance_km",
    label: "Median Evacuation Distance",
    category: CATEGORY,
    format: fmtKm,
    clipLow: 5,
    clipHigh: 95, // heavy right tail (p99 is ~30x the median) - clip harder
    opacityField: "confidence",
  },
  {
    field: "median_return_days",
    label: "Displacement Duration (Return Days)",
    category: CATEGORY,
    format: fmtDays,
    clipLow: 2,
    clipHigh: 98,
    opacityField: "confidence",
  },
  {
    // n_evacuees / ACS population, capped at 1 (see scripts/prepare_data.py).
    // Small by construction - a GPS panel only ever covers a slice of the
    // real population - so this reads as *relative* sample coverage across
    // block groups, not an absolute detection rate.
    field: "confidence",
    label: "Detection Confidence (evacuees / population)",
    category: CATEGORY,
    format: fmtPct,
    clipLow: 2,
    clipHigh: 98,
  },
];
