// Field crosswalk for Page 4's "Relationship to outcomes" scatter plots
// (js/core/scatterPlot.js, wired in js/core/profileCards.js).
//
// The profile cards themselves (stats table + histogram) keep reading raw
// values from data/blockgroups.geojson, unchanged. The scatter plots alone
// read from data/vis_vbs_for_scatter.geojson - a modeling-ready extract
// (882 of the 915 block groups; the rest are the incomplete cases the
// regression already drops) carrying the standardized/log-transformed
// versions of the same fields, matching the KEY_FEATURES_UPDATE /
// CONTROL_FEATURES_UPDATE variable set used in the actual regression. Raw,
// heavily-skewed fields (home equity, mortgage balance, population density,
// etc.) made the earlier raw-value scatters hard to read - one or two
// extreme block groups stretched the whole axis - so plotting the same
// z-scored/log fields the model itself uses reads far more like the actual
// relationship.
//
// SCATTER_FEATURE_FIELD: profile-card metric field (as authored in
// js/metrics/*.js) -> its processed x-axis field in the scatter dataset.
// A metric with no entry here has no processed counterpart and is left
// without a scatter row (see profileCards.js).
export const SCATTER_FEATURE_FIELD = {
  // Vehicle & Broadband Access
  pct_hh_has_vehicle: "z_log_pct_hh_has_vehicle",
  pct_broadband: "z_log_pct_broadband",
  // Population & Race
  pct_65p: "z_pct_65p",
  pct_homeownership: "z_log_pct_homeownership",
  pct_white: "z_log_pct_white",
  pct_black: "z_log_pct_black",
  pct_asian: "z_log_pct_asian",
  pct_hispanic: "z_log_pct_hispanic",
  pop_density: "z_log_pop_density",
  // Education & Income (pop_college's own card is a raw count - the
  // processed dataset only carries the rate, so the scatter plots the rate
  // instead; the card's stats/histogram are untouched)
  pop_college: "z_pct_college",
  pct_inc_q1: "z_pct_inc_q1",
  pct_inc_q2: "z_pct_inc_q2",
  pct_inc_q3: "z_pct_inc_q3",
  pct_inc_q4: "z_pct_inc_q4",
  pct_inc_q5: "z_pct_inc_q5",
  // Household Structure
  pct_hh_children: "z_pct_hh_children",
  avg_household_size: "z_avg_household_size",
  // Home Equity & Mortgage
  median_equity: "z_log_median_equity",
  median_mtg_remaining: "z_log_median_mtg_remaining",
  active_mortgage_share: "z_pct_active_mortgage",
  median_loan_term_remaining: "z_median_loan_term_remaining",
  // Party Registration
  party_dem_pct: "z_party_dem_pct",
  party_rep_pct: "z_party_rep_pct",
  party_npp_pct: "z_party_npp_pct",
  // Tenure Length
  lor_to_2022_owner: "z_lor_to_2022_owner",
  // Housing Cost Burden
  pct_cost_burden_50p: "z_log_pct_cost_burden_50p",
  // Hurricane Characteristics
  proximity: "z_log_proximity",
  peak_wind: "z_peak_wind",
};

// Outcome (y-axis) field crosswalk, keyed by the evacuation category's own
// metric field (js/metrics/evacuation.js) -> its processed field in the
// scatter dataset. Rate and return-days are unchanged; distance is
// log-transformed (DEP_VAR3 = 'log_median_evacuation_distance_km') since
// its raw-km distribution has a heavy right tail.
export const SCATTER_DV_FIELD = {
  evacuation_rate: "evacuation_rate",
  median_evacuation_distance_km: "log_median_evacuation_distance_km",
  median_return_days: "median_return_days",
};
