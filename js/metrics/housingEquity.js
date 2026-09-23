import { fmtCurrency, fmtPct, fmtMonthsAsYears } from "../core/format.js";

export const CATEGORY = "Home Equity & Mortgage";
export const CATEGORY_COLOR = "#1baf7a"; // one hue per dimension, not all blue

export const METRICS = [
  {
    field: "median_equity",
    label: "Median Home Equity",
    category: CATEGORY,
    format: fmtCurrency,
    clipLow: 5,
    clipHigh: 95, // heavy right tail
  },
  {
    field: "median_mtg_remaining",
    label: "Median Mortgage Remaining",
    category: CATEGORY,
    format: fmtCurrency,
    clipLow: 5,
    clipHigh: 95,
  },
  {
    field: "active_mortgage_share",
    label: "Active Mortgage Share",
    category: CATEGORY,
    format: fmtPct,
    clipLow: 2,
    clipHigh: 98,
  },
  {
    field: "median_loan_term_remaining",
    label: "Median Loan Term Remaining",
    category: CATEGORY,
    format: fmtMonthsAsYears, // raw field is in months
    clipLow: 2,
    clipHigh: 98,
  },
];
