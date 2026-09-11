// Single registry built from the per-dimension files above. Add a new
// dimension by creating js/metrics/<name>.js (export CATEGORY + METRICS)
// and adding it to GROUPS here - the dropdown, legend, histogram, and
// detail panel all pick it up automatically.
import * as evacuation from "./evacuation.js";
import * as hurricane from "./hurricane.js";
import * as housingEquity from "./housingEquity.js";
import * as tenure from "./tenure.js";
import * as costBurden from "./costBurden.js";
import * as demographics from "./demographics.js";
import * as educationIncome from "./educationIncome.js";
import * as household from "./household.js";
import * as political from "./political.js";
import * as access from "./access.js";

const GROUPS = [
  evacuation,
  hurricane,
  housingEquity,
  tenure,
  costBurden,
  demographics,
  educationIncome,
  household,
  political,
  access,
];

export const CATEGORIES = GROUPS.map((g) => ({ name: g.CATEGORY, metrics: g.METRICS }));

export const METRICS_BY_FIELD = Object.fromEntries(GROUPS.flatMap((g) => g.METRICS).map((m) => [m.field, m]));

export const DEFAULT_METRIC_FIELD = evacuation.METRICS[0].field;
