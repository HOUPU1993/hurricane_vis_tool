import { fmtYears } from "../core/format.js";

export const CATEGORY = "Tenure Length";
export const CATEGORY_COLOR = "#eda100"; // one hue per dimension, not all blue

export const METRICS = [
  {
    field: "lor_to_2022_owner",
    label: "Owner Length of Residence (to 2022)",
    category: CATEGORY,
    format: fmtYears,
    clipLow: 2,
    clipHigh: 98,
  },
];
