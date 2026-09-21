import { fmtNum } from "../core/format.js";

export const CATEGORY = "Hurricane Characteristics";
export const CATEGORY_COLOR = "#eb6834"; // one hue per dimension, not all blue

// TODO: confirm real units for these two fields (likely km and mph or kt)
// and update the labels/formatters once confirmed - left unitless here
// rather than guessing.
export const METRICS = [
  {
    field: "proximity",
    label: "Proximity to Storm Track",
    category: CATEGORY,
    format: (v) => fmtNum(v, 2),
    clipLow: 2,
    clipHigh: 98,
  },
  {
    field: "peak_wind",
    label: "Peak Wind Speed",
    category: CATEGORY,
    format: (v) => fmtNum(v, 1),
    clipLow: 2,
    clipHigh: 98,
  },
];
