// Auto-generated from 1.hurricane_ana.ipynb (regression cells 43-55).
// Numbers are extracted verbatim from the notebook's stored cell outputs
// (statsmodels WLS summaries, HC3 robust SE) and the exported correlation
// matrix CSV - nothing here is recomputed in the browser. Re-generate by
// re-running the notebook and re-extracting if the model specs change.

export const DEP_VARS = [
  { key: "evacuation_rate", label: "Evacuation Rate", note: "share of eligible devices detected evacuating" },
  { key: "median_return_days", label: "Median Return Days", note: "median days away before returning, among detected evacuees" },
  { key: "log_median_evacuation_distance_km", label: "Log Evacuation Distance", note: "log(median home-to-destination distance, km)" },
];

// One entry per standardized (z-scored) predictor used in Model 4. category/color
// mirror the site's existing metric categories (js/metrics/*.js) so the same
// variable reads as the same color on Page 3/4/5. isKey flags the four
// hypothesis-driven "key features"; everything else is a control.
export const FEATURE_META = {
  "z_log_median_equity": { label: "Median Home Equity (log)", category: "Home Equity & Mortgage", color: "#1baf7a", isKey: true },
  "z_pct_active_mortgage": { label: "Active Mortgage Share", category: "Home Equity & Mortgage", color: "#1baf7a", isKey: true },
  "z_median_loan_term_remaining": { label: "Median Loan Term Remaining", category: "Home Equity & Mortgage", color: "#1baf7a", isKey: true },
  "z_lor_to_2022_owner": { label: "Owner Length of Residence (to 2022)", category: "Tenure Length", color: "#eda100", isKey: true },
  "z_log_pct_cost_burden_50p": { label: "Cost-Burdened Households (>50% income)", category: "Housing Cost Burden", color: "#e87ba4", isKey: false },
  "z_log_pct_homeownership": { label: "Homeownership Rate", category: "Population & Race", color: "#008300", isKey: false },
  "z_log_pct_single_family_hu": { label: "Single-Family Housing Share", category: "Housing Cost Burden", color: "#e87ba4", isKey: false },
  "z_log_pct_mobile_home": { label: "Mobile Home Share", category: "Housing Cost Burden", color: "#e87ba4", isKey: false },
  "z_pct_inc_q1": { label: "Household Income – Quintile 1 (lowest)", category: "Education & Income", color: "#4a3aa7", isKey: false },
  "z_pct_inc_q2": { label: "Household Income – Quintile 2", category: "Education & Income", color: "#4a3aa7", isKey: false },
  "z_pct_inc_q3": { label: "Household Income – Quintile 3", category: "Education & Income", color: "#4a3aa7", isKey: false },
  "z_pct_inc_q4": { label: "Household Income – Quintile 4", category: "Education & Income", color: "#4a3aa7", isKey: false },
  "z_pct_65p": { label: "Population 65+", category: "Population & Race", color: "#008300", isKey: false },
  "z_pct_hh_children": { label: "Households with Children", category: "Household Structure", color: "#e34948", isKey: false },
  "z_log_pct_hh_has_vehicle": { label: "Households with a Vehicle", category: "Vehicle & Broadband Access", color: "#1baf7a", isKey: false },
  "z_pct_college": { label: "Population with a College Degree (%)", category: "Education & Income", color: "#4a3aa7", isKey: false },
  "z_log_pct_black": { label: "Black (non-Hispanic)", category: "Population & Race", color: "#008300", isKey: false },
  "z_log_pct_asian": { label: "Asian (non-Hispanic)", category: "Population & Race", color: "#008300", isKey: false },
  "z_log_pct_hispanic": { label: "Hispanic", category: "Population & Race", color: "#008300", isKey: false },
  "z_log_pct_broadband": { label: "Households with Broadband", category: "Vehicle & Broadband Access", color: "#1baf7a", isKey: false },
  "z_log_pop_density": { label: "Population Density", category: "Population & Race", color: "#008300", isKey: false },
  "z_party_rep_pct": { label: "Registered Republican", category: "Party Registration", color: "#eb6834", isKey: false },
  "z_peak_wind": { label: "Peak Wind Speed", category: "Hurricane Characteristics", color: "#eb6834", isKey: false },
};

// Variance inflation factors, full model (Model 4 predictor set). All < 5 here -
// no multicollinearity concern - but shown in full rather than just asserted.
export const VIF_TABLE = [
  { feature: "z_pct_65p", vif: 3.823 },
  { feature: "z_pct_inc_q1", vif: 3.435 },
  { feature: "z_pct_college", vif: 3.426 },
  { feature: "z_log_median_equity", vif: 3.271 },
  { feature: "z_party_rep_pct", vif: 2.606 },
  { feature: "z_log_pct_homeownership", vif: 2.575 },
  { feature: "z_pct_hh_children", vif: 2.427 },
  { feature: "z_pct_inc_q2", vif: 2.32 },
  { feature: "z_pct_active_mortgage", vif: 2.237 },
  { feature: "z_log_pct_single_family_hu", vif: 2.157 },
  { feature: "z_pct_inc_q3", vif: 1.821 },
  { feature: "z_log_pct_broadband", vif: 1.756 },
  { feature: "z_pct_inc_q4", vif: 1.717 },
  { feature: "z_log_pop_density", vif: 1.631 },
  { feature: "z_log_pct_hh_has_vehicle", vif: 1.62 },
  { feature: "z_log_pct_mobile_home", vif: 1.439 },
  { feature: "z_log_pct_black", vif: 1.437 },
  { feature: "z_peak_wind", vif: 1.434 },
  { feature: "z_median_loan_term_remaining", vif: 1.399 },
  { feature: "z_log_pct_hispanic", vif: 1.397 },
  { feature: "z_lor_to_2022_owner", vif: 1.241 },
  { feature: "z_log_pct_cost_burden_50p", vif: 1.167 },
  { feature: "z_log_pct_asian", vif: 1.103 },
];

// Model 4 (full model: all controls + all 4 key features), WLS with HC3
// robust standard errors. One row per predictor, const/intercept omitted -
// this is what the coefficient plot draws.
export const MODEL4 = {
  "evacuation_rate": [
    { feature: "z_log_pct_cost_burden_50p", coef: -0.0029, se: 0.004, p: 0.419, ciLow: -0.01, ciHigh: 0.004 },
    { feature: "z_log_pct_homeownership", coef: 0.0044, se: 0.006, p: 0.454, ciLow: -0.007, ciHigh: 0.016 },
    { feature: "z_log_pct_single_family_hu", coef: -0.0129, se: 0.006, p: 0.032, ciLow: -0.025, ciHigh: -0.001 },
    { feature: "z_log_pct_mobile_home", coef: 0.0025, se: 0.004, p: 0.512, ciLow: -0.005, ciHigh: 0.01 },
    { feature: "z_pct_inc_q1", coef: -0.0068, se: 0.006, p: 0.268, ciLow: -0.019, ciHigh: 0.005 },
    { feature: "z_pct_inc_q2", coef: -0.0044, se: 0.005, p: 0.367, ciLow: -0.014, ciHigh: 0.005 },
    { feature: "z_pct_inc_q3", coef: -0.0026, se: 0.005, p: 0.578, ciLow: -0.012, ciHigh: 0.007 },
    { feature: "z_pct_inc_q4", coef: -0.0077, se: 0.004, p: 0.055, ciLow: -0.016, ciHigh: 0.0 },
    { feature: "z_pct_65p", coef: -0.002, se: 0.008, p: 0.797, ciLow: -0.017, ciHigh: 0.013 },
    { feature: "z_pct_hh_children", coef: -0.0125, se: 0.005, p: 0.008, ciLow: -0.022, ciHigh: -0.003 },
    { feature: "z_log_pct_hh_has_vehicle", coef: 0.0066, se: 0.006, p: 0.246, ciLow: -0.005, ciHigh: 0.018 },
    { feature: "z_pct_college", coef: 0.0102, se: 0.006, p: 0.1, ciLow: -0.002, ciHigh: 0.022 },
    { feature: "z_log_pct_black", coef: -0.0112, se: 0.004, p: 0.004, ciLow: -0.019, ciHigh: -0.004 },
    { feature: "z_log_pct_asian", coef: 0.0013, se: 0.003, p: 0.688, ciLow: -0.005, ciHigh: 0.008 },
    { feature: "z_log_pct_hispanic", coef: -0.0007, se: 0.006, p: 0.896, ciLow: -0.012, ciHigh: 0.01 },
    { feature: "z_log_pct_broadband", coef: 0.0032, se: 0.005, p: 0.487, ciLow: -0.006, ciHigh: 0.012 },
    { feature: "z_log_pop_density", coef: 0.0009, se: 0.004, p: 0.837, ciLow: -0.008, ciHigh: 0.009 },
    { feature: "z_party_rep_pct", coef: -0.0574, se: 0.006, p: 0.0, ciLow: -0.069, ciHigh: -0.046 },
    { feature: "z_peak_wind", coef: 0.0081, se: 0.003, p: 0.019, ciLow: 0.001, ciHigh: 0.015 },
    { feature: "z_log_median_equity", coef: 0.0135, se: 0.007, p: 0.043, ciLow: 0.0, ciHigh: 0.026 },
    { feature: "z_pct_active_mortgage", coef: -0.0304, se: 0.007, p: 0.0, ciLow: -0.044, ciHigh: -0.017 },
    { feature: "z_median_loan_term_remaining", coef: 0.0117, se: 0.005, p: 0.019, ciLow: 0.002, ciHigh: 0.021 },
    { feature: "z_lor_to_2022_owner", coef: -0.0091, se: 0.004, p: 0.012, ciLow: -0.016, ciHigh: -0.002 },
  ],
  "median_return_days": [
    { feature: "z_log_pct_cost_burden_50p", coef: -0.1064, se: 0.081, p: 0.188, ciLow: -0.265, ciHigh: 0.052 },
    { feature: "z_log_pct_homeownership", coef: 0.0698, se: 0.1, p: 0.485, ciLow: -0.126, ciHigh: 0.266 },
    { feature: "z_log_pct_single_family_hu", coef: -0.1317, se: 0.101, p: 0.194, ciLow: -0.33, ciHigh: 0.067 },
    { feature: "z_log_pct_mobile_home", coef: -0.1207, se: 0.078, p: 0.124, ciLow: -0.274, ciHigh: 0.033 },
    { feature: "z_pct_inc_q1", coef: -0.0638, se: 0.124, p: 0.607, ciLow: -0.307, ciHigh: 0.179 },
    { feature: "z_pct_inc_q2", coef: -0.1955, se: 0.112, p: 0.08, ciLow: -0.414, ciHigh: 0.023 },
    { feature: "z_pct_inc_q3", coef: -0.0251, se: 0.096, p: 0.795, ciLow: -0.214, ciHigh: 0.164 },
    { feature: "z_pct_inc_q4", coef: -0.0445, se: 0.083, p: 0.592, ciLow: -0.207, ciHigh: 0.118 },
    { feature: "z_pct_65p", coef: 0.1976, se: 0.133, p: 0.137, ciLow: -0.063, ciHigh: 0.458 },
    { feature: "z_pct_hh_children", coef: 0.2014, se: 0.1, p: 0.043, ciLow: 0.006, ciHigh: 0.397 },
    { feature: "z_log_pct_hh_has_vehicle", coef: -0.1604, se: 0.108, p: 0.136, ciLow: -0.371, ciHigh: 0.05 },
    { feature: "z_pct_college", coef: -0.2416, se: 0.117, p: 0.04, ciLow: -0.472, ciHigh: -0.011 },
    { feature: "z_log_pct_black", coef: -0.0279, se: 0.083, p: 0.735, ciLow: -0.19, ciHigh: 0.134 },
    { feature: "z_log_pct_asian", coef: -0.0824, se: 0.068, p: 0.229, ciLow: -0.217, ciHigh: 0.052 },
    { feature: "z_log_pct_hispanic", coef: 0.0552, se: 0.093, p: 0.552, ciLow: -0.127, ciHigh: 0.237 },
    { feature: "z_log_pct_broadband", coef: -0.0128, se: 0.09, p: 0.887, ciLow: -0.189, ciHigh: 0.163 },
    { feature: "z_log_pop_density", coef: -0.1872, se: 0.11, p: 0.087, ciLow: -0.402, ciHigh: 0.027 },
    { feature: "z_party_rep_pct", coef: -0.0185, se: 0.111, p: 0.867, ciLow: -0.235, ciHigh: 0.198 },
    { feature: "z_peak_wind", coef: 1.1067, se: 0.083, p: 0.0, ciLow: 0.944, ciHigh: 1.269 },
    { feature: "z_log_median_equity", coef: -0.076, se: 0.114, p: 0.506, ciLow: -0.3, ciHigh: 0.148 },
    { feature: "z_pct_active_mortgage", coef: 0.0246, se: 0.105, p: 0.815, ciLow: -0.181, ciHigh: 0.23 },
    { feature: "z_median_loan_term_remaining", coef: 0.1952, se: 0.078, p: 0.013, ciLow: 0.041, ciHigh: 0.349 },
    { feature: "z_lor_to_2022_owner", coef: 0.0243, se: 0.076, p: 0.748, ciLow: -0.124, ciHigh: 0.173 },
  ],
  "log_median_evacuation_distance_km": [
    { feature: "z_log_pct_cost_burden_50p", coef: -0.0073, se: 0.076, p: 0.923, ciLow: -0.155, ciHigh: 0.141 },
    { feature: "z_log_pct_homeownership", coef: -0.0962, se: 0.131, p: 0.462, ciLow: -0.353, ciHigh: 0.16 },
    { feature: "z_log_pct_single_family_hu", coef: 0.0581, se: 0.125, p: 0.641, ciLow: -0.186, ciHigh: 0.302 },
    { feature: "z_log_pct_mobile_home", coef: -0.0526, se: 0.088, p: 0.549, ciLow: -0.224, ciHigh: 0.119 },
    { feature: "z_pct_inc_q1", coef: -0.0416, se: 0.133, p: 0.755, ciLow: -0.303, ciHigh: 0.219 },
    { feature: "z_pct_inc_q2", coef: -0.0196, se: 0.123, p: 0.874, ciLow: -0.261, ciHigh: 0.222 },
    { feature: "z_pct_inc_q3", coef: -0.0241, se: 0.103, p: 0.815, ciLow: -0.226, ciHigh: 0.178 },
    { feature: "z_pct_inc_q4", coef: 0.0227, se: 0.093, p: 0.807, ciLow: -0.159, ciHigh: 0.204 },
    { feature: "z_pct_65p", coef: 0.1738, se: 0.143, p: 0.225, ciLow: -0.107, ciHigh: 0.455 },
    { feature: "z_pct_hh_children", coef: 0.0688, se: 0.115, p: 0.548, ciLow: -0.156, ciHigh: 0.293 },
    { feature: "z_log_pct_hh_has_vehicle", coef: 0.005, se: 0.101, p: 0.961, ciLow: -0.193, ciHigh: 0.203 },
    { feature: "z_pct_college", coef: 0.1075, se: 0.149, p: 0.471, ciLow: -0.185, ciHigh: 0.399 },
    { feature: "z_log_pct_black", coef: 0.1004, se: 0.09, p: 0.265, ciLow: -0.076, ciHigh: 0.277 },
    { feature: "z_log_pct_asian", coef: 0.0444, se: 0.076, p: 0.562, ciLow: -0.105, ciHigh: 0.194 },
    { feature: "z_log_pct_hispanic", coef: -0.1192, se: 0.096, p: 0.214, ciLow: -0.307, ciHigh: 0.069 },
    { feature: "z_log_pct_broadband", coef: 0.1217, se: 0.114, p: 0.287, ciLow: -0.102, ciHigh: 0.346 },
    { feature: "z_log_pop_density", coef: -0.1949, se: 0.103, p: 0.058, ciLow: -0.397, ciHigh: 0.007 },
    { feature: "z_party_rep_pct", coef: 0.1879, se: 0.145, p: 0.196, ciLow: -0.097, ciHigh: 0.473 },
    { feature: "z_peak_wind", coef: 0.2865, se: 0.086, p: 0.001, ciLow: 0.118, ciHigh: 0.455 },
    { feature: "z_log_median_equity", coef: 0.0126, se: 0.158, p: 0.936, ciLow: -0.297, ciHigh: 0.322 },
    { feature: "z_pct_active_mortgage", coef: 0.1842, se: 0.148, p: 0.213, ciLow: -0.106, ciHigh: 0.474 },
    { feature: "z_median_loan_term_remaining", coef: -0.0385, se: 0.119, p: 0.746, ciLow: -0.272, ciHigh: 0.195 },
    { feature: "z_lor_to_2022_owner", coef: -0.2289, se: 0.089, p: 0.01, ciLow: -0.403, ciHigh: -0.055 },
  ],
};

// Nested model build-up (Model 0 -> 4), same shared analytic sample (N=911)
// for valid comparison. Model 0: controls only (minus household-children).
// Model 1: + household-children. Model 2: + property protection motivation
// (equity/mortgage trio). Model 3: + social network connections (tenure).
// Model 4: + both together. modelIndex says which of the 5 models each
// row's value belongs to - a key feature is only estimated in the models
// that include it, and z_pct_hh_children is absent from Model 0 only.
// controlFeatures carries the same shape for the other 19 predictors, so a
// DV panel can show its four key features by default and expand to the
// full control set on request.
export const MODEL_COMPARISON = {
  "evacuation_rate": {
    r2: [0.2230, 0.2371, 0.2791, 0.2404, 0.2850],
    adjR2: [0.2073, 0.2208, 0.2613, 0.2234, 0.2665],
    n: [911, 911, 911, 911, 911],
    keyFeatures: {
      "z_log_median_equity": { modelIndex: [2, 4], coef: ["0.0121*", "0.0135**"], se: ["(0.0067)", "(0.0066)"] },
      "z_pct_active_mortgage": { modelIndex: [2, 4], coef: ["-0.0290***", "-0.0304***"], se: ["(0.0069)", "(0.0069)"] },
      "z_median_loan_term_remaining": { modelIndex: [2, 4], coef: ["0.0133***", "0.0117**"], se: ["(0.0050)", "(0.0050)"] },
      "z_lor_to_2022_owner": { modelIndex: [3, 4], coef: ["-0.0066*", "-0.0091**"], se: ["(0.0034)", "(0.0036)"] },
    },
    controlFeatures: {
      "z_log_pct_cost_burden_50p": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0013", "-0.0019", "-0.0022", "-0.0023", "-0.0029"], se: ["(0.0037)", "(0.0037)", "(0.0036)", "(0.0037)", "(0.0036)"] },
      "z_log_pct_homeownership": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0037", "-0.0019", "0.0029", "-0.0010", "0.0044"], se: ["(0.0056)", "(0.0057)", "(0.0058)", "(0.0057)", "(0.0059)"] },
      "z_log_pct_single_family_hu": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0177***", "-0.0156***", "-0.0152**", "-0.0142**", "-0.0129**"], se: ["(0.0056)", "(0.0056)", "(0.0060)", "(0.0056)", "(0.0060)"] },
      "z_log_pct_mobile_home": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0035", "0.0042", "0.0033", "0.0037", "0.0025"], se: ["(0.0039)", "(0.0038)", "(0.0038)", "(0.0038)", "(0.0038)"] },
      "z_pct_inc_q1": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0050", "-0.0064", "-0.0076", "-0.0060", "-0.0068"], se: ["(0.0064)", "(0.0063)", "(0.0062)", "(0.0063)", "(0.0062)"] },
      "z_pct_inc_q2": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0074", "-0.0072", "-0.0054", "-0.0066", "-0.0044"], se: ["(0.0051)", "(0.0051)", "(0.0049)", "(0.0050)", "(0.0049)"] },
      "z_pct_inc_q3": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0032", "-0.0053", "-0.0025", "-0.0056", "-0.0026"], se: ["(0.0046)", "(0.0044)", "(0.0047)", "(0.0044)", "(0.0047)"] },
      "z_pct_inc_q4": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0106**", "-0.0121***", "-0.0085**", "-0.0118***", "-0.0077*"], se: ["(0.0043)", "(0.0042)", "(0.0040)", "(0.0042)", "(0.0040)"] },
      "z_pct_65p": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0208***", "0.0076", "-0.0015", "0.0079", "-0.0020"], se: ["(0.0059)", "(0.0072)", "(0.0076)", "(0.0072)", "(0.0077)"] },
      "z_pct_hh_children": { modelIndex: [1, 2, 3, 4], coef: ["-0.0188***", "-0.0125***", "-0.0189***", "-0.0125***"], se: ["(0.0049)", "(0.0048)", "(0.0048)", "(0.0047)"] },
      "z_log_pct_hh_has_vehicle": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0071", "0.0073", "0.0065", "0.0073", "0.0066"], se: ["(0.0064)", "(0.0063)", "(0.0058)", "(0.0063)", "(0.0057)"] },
      "z_pct_college": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0175***", "0.0168***", "0.0110*", "0.0165***", "0.0102"], se: ["(0.0063)", "(0.0062)", "(0.0063)", "(0.0062)", "(0.0062)"] },
      "z_log_pct_black": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0176***", "-0.0162***", "-0.0112***", "-0.0164***", "-0.0112***"], se: ["(0.0038)", "(0.0037)", "(0.0039)", "(0.0037)", "(0.0039)"] },
      "z_log_pct_asian": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0004", "0.0011", "0.0014", "0.0009", "0.0013"], se: ["(0.0034)", "(0.0034)", "(0.0033)", "(0.0034)", "(0.0033)"] },
      "z_log_pct_hispanic": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0013", "-0.0005", "0.0004", "-0.0014", "-0.0007"], se: ["(0.0051)", "(0.0051)", "(0.0055)", "(0.0052)", "(0.0055)"] },
      "z_log_pct_broadband": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0001", "0.0009", "0.0027", "0.0012", "0.0032"], se: ["(0.0047)", "(0.0046)", "(0.0046)", "(0.0046)", "(0.0046)"] },
      "z_log_pop_density": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0072", "-0.0061", "-0.0000", "-0.0057", "0.0009"], se: ["(0.0045)", "(0.0043)", "(0.0044)", "(0.0042)", "(0.0043)"] },
      "z_party_rep_pct": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0526***", "-0.0519***", "-0.0558***", "-0.0534***", "-0.0574***"], se: ["(0.0060)", "(0.0058)", "(0.0058)", "(0.0058)", "(0.0058)"] },
      "z_peak_wind": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0108***", "0.0105***", "0.0096***", "0.0094***", "0.0081**"], se: ["(0.0036)", "(0.0036)", "(0.0034)", "(0.0036)", "(0.0034)"] },
    },
  },
  "median_return_days": {
    r2: [0.3296, 0.3327, 0.3390, 0.3328, 0.3391],
    adjR2: [0.3161, 0.3185, 0.3226, 0.3178, 0.3220],
    n: [911, 911, 911, 911, 911],
    keyFeatures: {
      "z_log_median_equity": { modelIndex: [2, 4], coef: ["-0.0723", "-0.0760"], se: ["(0.1141)", "(0.1142)"] },
      "z_pct_active_mortgage": { modelIndex: [2, 4], coef: ["0.0207", "0.0246"], se: ["(0.1058)", "(0.1049)"] },
      "z_median_loan_term_remaining": { modelIndex: [2, 4], coef: ["0.1910**", "0.1952**"], se: ["(0.0752)", "(0.0785)"] },
      "z_lor_to_2022_owner": { modelIndex: [3, 4], coef: ["-0.0166", "0.0243"], se: ["(0.0747)", "(0.0757)"] },
    },
    controlFeatures: {
      "z_log_pct_cost_burden_50p": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1146", "-0.1089", "-0.1082", "-0.1101", "-0.1064"], se: ["(0.0779)", "(0.0796)", "(0.0802)", "(0.0803)", "(0.0809)"] },
      "z_log_pct_homeownership": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0997", "0.0831", "0.0739", "0.0853", "0.0698"], se: ["(0.0978)", "(0.0964)", "(0.1003)", "(0.0971)", "(0.1000)"] },
      "z_log_pct_single_family_hu": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0802", "-0.1003", "-0.1257", "-0.0968", "-0.1317"], se: ["(0.0955)", "(0.0962)", "(0.0977)", "(0.0989)", "(0.1013)"] },
      "z_log_pct_mobile_home": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1272*", "-0.1337*", "-0.1228", "-0.1349*", "-0.1207"], se: ["(0.0767)", "(0.0770)", "(0.0769)", "(0.0785)", "(0.0785)"] },
      "z_pct_inc_q1": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0466", "-0.0331", "-0.0617", "-0.0322", "-0.0638"], se: ["(0.1158)", "(0.1168)", "(0.1235)", "(0.1172)", "(0.1239)"] },
      "z_pct_inc_q2": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1822*", "-0.1834*", "-0.1928*", "-0.1819*", "-0.1955*"], se: ["(0.1045)", "(0.1072)", "(0.1112)", "(0.1072)", "(0.1117)"] },
      "z_pct_inc_q3": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0259", "-0.0055", "-0.0254", "-0.0064", "-0.0251"], se: ["(0.0950)", "(0.0942)", "(0.0961)", "(0.0937)", "(0.0962)"] },
      "z_pct_inc_q4": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0384", "-0.0240", "-0.0424", "-0.0232", "-0.0445"], se: ["(0.0813)", "(0.0803)", "(0.0824)", "(0.0807)", "(0.0829)"] },
      "z_pct_65p": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0280", "0.1540", "0.1963", "0.1547", "0.1976"], se: ["(0.1107)", "(0.1312)", "(0.1329)", "(0.1316)", "(0.1330)"] },
      "z_pct_hh_children": { modelIndex: [1, 2, 3, 4], coef: ["0.1795*", "0.2013**", "0.1794*", "0.2014**"], se: ["(0.0974)", "(0.0991)", "(0.0977)", "(0.0995)"] },
      "z_log_pct_hh_has_vehicle": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1546", "-0.1564", "-0.1603", "-0.1564", "-0.1604"], se: ["(0.1072)", "(0.1090)", "(0.1068)", "(0.1090)", "(0.1075)"] },
      "z_pct_college": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.2635**", "-0.2565**", "-0.2437**", "-0.2572**", "-0.2416**"], se: ["(0.1171)", "(0.1181)", "(0.1166)", "(0.1187)", "(0.1174)"] },
      "z_log_pct_black": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0017", "-0.0147", "-0.0277", "-0.0152", "-0.0279"], se: ["(0.0797)", "(0.0792)", "(0.0825)", "(0.0797)", "(0.0825)"] },
      "z_log_pct_asian": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0669", "-0.0728", "-0.0827", "-0.0733", "-0.0824"], se: ["(0.0683)", "(0.0685)", "(0.0685)", "(0.0684)", "(0.0685)"] },
      "z_log_pct_hispanic": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0676", "0.0596", "0.0522", "0.0573", "0.0552"], se: ["(0.0937)", "(0.0956)", "(0.0924)", "(0.0958)", "(0.0928)"] },
      "z_log_pct_broadband": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0007", "-0.0098", "-0.0115", "-0.0091", "-0.0128"], se: ["(0.0881)", "(0.0895)", "(0.0894)", "(0.0900)", "(0.0899)"] },
      "z_log_pop_density": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1669", "-0.1773", "-0.1849*", "-0.1763*", "-0.1872*"], se: ["(0.1047)", "(0.1079)", "(0.1101)", "(0.1071)", "(0.1095)"] },
      "z_party_rep_pct": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0383", "0.0318", "-0.0229", "0.0281", "-0.0185"], se: ["(0.1041)", "(0.1042)", "(0.1101)", "(0.1059)", "(0.1106)"] },
      "z_peak_wind": { modelIndex: [0, 1, 2, 3, 4], coef: ["1.1014***", "1.1049***", "1.1026***", "1.1021***", "1.1067***"], se: ["(0.0807)", "(0.0808)", "(0.0801)", "(0.0836)", "(0.0828)"] },
    },
  },
  "log_median_evacuation_distance_km": {
    r2: [0.0772, 0.0779, 0.0829, 0.0886, 0.0916],
    adjR2: [0.0586, 0.0583, 0.0601, 0.0681, 0.0681],
    n: [911, 911, 911, 911, 911],
    keyFeatures: {
      "z_log_median_equity": { modelIndex: [2, 4], coef: ["-0.0216", "0.0126"], se: ["(0.1575)", "(0.1581)"] },
      "z_pct_active_mortgage": { modelIndex: [2, 4], coef: ["0.2205", "0.1842"], se: ["(0.1502)", "(0.1479)"] },
      "z_median_loan_term_remaining": { modelIndex: [2, 4], coef: ["0.0013", "-0.0385"], se: ["(0.1174)", "(0.1189)"] },
      "z_lor_to_2022_owner": { modelIndex: [3, 4], coef: ["-0.2448***", "-0.2289**"], se: ["(0.0869)", "(0.0889)"] },
    },
    controlFeatures: {
      "z_log_pct_cost_burden_50p": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0111", "0.0139", "0.0097", "-0.0036", "-0.0073"], se: ["(0.0762)", "(0.0760)", "(0.0757)", "(0.0754)", "(0.0756)"] },
      "z_log_pct_homeownership": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1019", "-0.1099", "-0.1351", "-0.0766", "-0.0962"], se: ["(0.1293)", "(0.1290)", "(0.1310)", "(0.1283)", "(0.1309)"] },
      "z_log_pct_single_family_hu": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0309", "0.0212", "0.0015", "0.0736", "0.0581"], se: ["(0.1258)", "(0.1252)", "(0.1251)", "(0.1248)", "(0.1246)"] },
      "z_log_pct_mobile_home": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0519", "-0.0551", "-0.0327", "-0.0721", "-0.0526"], se: ["(0.0874)", "(0.0871)", "(0.0865)", "(0.0881)", "(0.0877)"] },
      "z_pct_inc_q1": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0891", "-0.0826", "-0.0611", "-0.0693", "-0.0416"], se: ["(0.1282)", "(0.1274)", "(0.1324)", "(0.1275)", "(0.1331)"] },
      "z_pct_inc_q2": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0531", "-0.0537", "-0.0456", "-0.0310", "-0.0196"], se: ["(0.1116)", "(0.1119)", "(0.1224)", "(0.1126)", "(0.1231)"] },
      "z_pct_inc_q3": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0206", "-0.0107", "-0.0209", "-0.0235", "-0.0241"], se: ["(0.1014)", "(0.1014)", "(0.1029)", "(0.1018)", "(0.1030)"] },
      "z_pct_inc_q4": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0135", "0.0204", "0.0029", "0.0319", "0.0227"], se: ["(0.0918)", "(0.0912)", "(0.0928)", "(0.0910)", "(0.0927)"] },
      "z_pct_65p": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0493", "0.1102", "0.1857", "0.1205", "0.1738"], se: ["(0.1205)", "(0.1349)", "(0.1455)", "(0.1327)", "(0.1434)"] },
      "z_pct_hh_children": { modelIndex: [1, 2, 3, 4], coef: ["0.0867", "0.0695", "0.0853", "0.0688"], se: ["(0.1148)", "(0.1141)", "(0.1149)", "(0.1145)"] },
      "z_log_pct_hh_has_vehicle": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0009", "-0.0000", "0.0039", "0.0009", "0.0050"], se: ["(0.1020)", "(0.1021)", "(0.1019)", "(0.0995)", "(0.1010)"] },
      "z_pct_college": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.1108", "0.1142", "0.1270", "0.1041", "0.1075"], se: ["(0.1373)", "(0.1375)", "(0.1487)", "(0.1376)", "(0.1490)"] },
      "z_log_pct_black": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.1383", "0.1320", "0.0979", "0.1251", "0.1004"], se: ["(0.0901)", "(0.0901)", "(0.0907)", "(0.0893)", "(0.0900)"] },
      "z_log_pct_asian": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.0554", "0.0525", "0.0477", "0.0456", "0.0444"], se: ["(0.0753)", "(0.0753)", "(0.0767)", "(0.0750)", "(0.0764)"] },
      "z_log_pct_hispanic": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.0774", "-0.0813", "-0.0909", "-0.1148", "-0.1192"], se: ["(0.0993)", "(0.0990)", "(0.0980)", "(0.0967)", "(0.0960)"] },
      "z_log_pct_broadband": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.1320", "0.1276", "0.1094", "0.1383", "0.1217"], se: ["(0.1153)", "(0.1157)", "(0.1149)", "(0.1155)", "(0.1143)"] },
      "z_log_pop_density": { modelIndex: [0, 1, 2, 3, 4], coef: ["-0.1700*", "-0.1751*", "-0.2173**", "-0.1603*", "-0.1949*"], se: ["(0.0955)", "(0.0945)", "(0.1032)", "(0.0950)", "(0.1029)"] },
      "z_party_rep_pct": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.2349*", "0.2318*", "0.2286", "0.1761", "0.1879"], se: ["(0.1346)", "(0.1343)", "(0.1444)", "(0.1371)", "(0.1453)"] },
      "z_peak_wind": { modelIndex: [0, 1, 2, 3, 4], coef: ["0.3150***", "0.3167***", "0.3247***", "0.2761***", "0.2865***"], se: ["(0.0837)", "(0.0842)", "(0.0853)", "(0.0851)", "(0.0862)"] },
    },
  },
};

// Pearson correlation matrix across all 23 standardized predictors + the 3
// dependent variables (26x26, symmetric). Exported directly from the
// notebook's corr_matrix DataFrame, not recomputed here.
export const CORR_MATRIX = {
  labels: ["z_log_median_equity", "z_pct_active_mortgage", "z_median_loan_term_remaining", "z_lor_to_2022_owner", "z_log_pct_cost_burden_50p", "z_log_pct_homeownership", "z_log_pct_single_family_hu", "z_log_pct_mobile_home", "z_pct_inc_q1", "z_pct_inc_q2", "z_pct_inc_q3", "z_pct_inc_q4", "z_pct_65p", "z_pct_hh_children", "z_log_pct_hh_has_vehicle", "z_pct_college", "z_log_pct_black", "z_log_pct_asian", "z_log_pct_hispanic", "z_log_pct_broadband", "z_log_pop_density", "z_party_rep_pct", "z_peak_wind", "evacuation_rate", "median_return_days", "log_median_evacuation_distance_km"],
  matrix: [
    [1.0, -0.0403, 0.2606, -0.0419, 0.1249, 0.2831, 0.0916, -0.2692, -0.4321, -0.4795, -0.3379, 0.0488, 0.2734, -0.2358, 0.2325, 0.7278, -0.3254, 0.0993, -0.2199, 0.3224, -0.1507, 0.4503, 0.0352, 0.1052, -0.0165, 0.1487],
    [-0.0403, 1.0, 0.228, 0.022, -0.0095, -0.0436, 0.3225, -0.3255, -0.2786, -0.141, 0.0733, 0.2249, -0.5672, 0.4575, 0.0945, 0.1044, 0.2841, 0.1251, 0.3357, 0.2706, 0.3863, -0.2266, -0.2914, -0.2414, -0.2047, 0.018],
    [0.2606, 0.228, 1.0, -0.1996, 0.0648, 0.1717, 0.1657, -0.1114, -0.1622, -0.2029, -0.067, 0.1016, 0.0401, -0.1063, 0.1801, 0.2043, -0.1287, 0.0782, -0.0627, 0.167, -0.0736, 0.328, 0.0357, -0.0128, 0.0394, 0.0314],
    [-0.0419, 0.022, -0.1996, 1.0, -0.0546, 0.025, 0.2127, -0.1416, 0.0107, 0.043, -0.0088, 0.023, -0.1545, 0.1552, -0.0054, -0.0602, 0.0569, -0.0236, 0.0261, 0.0377, 0.0935, -0.2113, -0.1607, -0.0856, -0.072, -0.1075],
    [0.1249, -0.0095, 0.0648, -0.0546, 1.0, 0.2478, 0.0946, -0.0142, 0.0456, -0.0277, -0.1079, -0.0819, 0.1618, -0.1138, 0.0654, 0.0526, -0.0063, 0.0713, -0.0471, -0.024, -0.0522, 0.1222, 0.0616, -0.0191, -0.0056, 0.0146],
    [0.2831, -0.0436, 0.1717, 0.025, 0.2478, 1.0, 0.4131, 0.0117, -0.3778, -0.3078, -0.0742, 0.1752, 0.339, -0.1727, 0.3986, 0.2352, -0.2899, -0.0013, -0.2611, 0.2194, -0.3072, 0.4985, 0.1594, -0.0781, 0.1119, 0.1195],
    [0.0916, 0.3225, 0.1657, 0.2127, 0.0946, 0.4131, 1.0, -0.2431, -0.3468, -0.2248, 0.0257, 0.1846, -0.3202, 0.3601, 0.2892, 0.0541, -0.0035, 0.0267, 0.1305, 0.305, -0.0698, 0.1231, -0.0211, -0.2626, -0.0395, 0.0737],
    [-0.2692, -0.3255, -0.1114, -0.1416, -0.0142, 0.0117, -0.2431, 1.0, 0.2883, 0.1603, -0.0064, -0.1086, 0.1733, -0.1282, -0.0517, -0.2901, -0.0086, -0.094, -0.0848, -0.2205, -0.2809, 0.0826, 0.069, 0.0604, 0.0523, -0.0123],
    [-0.4321, -0.2786, -0.1622, 0.0107, 0.0456, -0.3778, -0.3468, 0.2883, 1.0, 0.2452, -0.1531, -0.4012, 0.058, -0.0875, -0.4274, -0.4693, 0.1967, -0.1146, 0.0182, -0.5436, 0.0337, -0.3424, 0.001, 0.0624, 0.03, -0.1456],
    [-0.4795, -0.141, -0.2029, 0.043, -0.0277, -0.3078, -0.2248, 0.1603, 0.2452, 1.0, 0.092, -0.3577, 0.0005, -0.0103, -0.197, -0.5091, 0.131, -0.11, 0.0948, -0.2753, 0.0703, -0.307, 0.0098, 0.0444, 0.0172, -0.1004],
    [-0.3379, 0.0733, -0.067, -0.0088, -0.1079, -0.0742, 0.0257, -0.0064, -0.1531, 0.092, 1.0, 0.0155, -0.093, -0.006, 0.0186, -0.3519, 0.0579, -0.1141, 0.1188, 0.0185, 0.0761, -0.2088, 0.0958, -0.0201, 0.0622, -0.0269],
    [0.0488, 0.2249, 0.1016, 0.023, -0.0819, 0.1752, 0.1846, -0.1086, -0.4012, -0.3577, 0.0155, 1.0, -0.0941, 0.04, 0.2094, 0.0762, -0.0335, 0.085, 0.0326, 0.2697, 0.0374, 0.1179, 0.0337, -0.1293, 0.005, 0.0656],
    [0.2734, -0.5672, 0.0401, -0.1545, 0.1618, 0.339, -0.3202, 0.1733, 0.058, 0.0005, -0.093, -0.0941, 1.0, -0.7204, 0.0075, 0.1322, -0.3577, -0.061, -0.4786, -0.1209, -0.3289, 0.4493, 0.4216, 0.1655, 0.2585, 0.1076],
    [-0.2358, 0.4575, -0.1063, 0.1552, -0.1138, -0.1727, 0.3601, -0.1282, -0.0875, -0.0103, -0.006, 0.04, -0.7204, 1.0, 0.0473, -0.0762, 0.2715, 0.0659, 0.3673, 0.1397, 0.2404, -0.2775, -0.304, -0.2221, -0.1416, -0.0496],
    [0.2325, 0.0945, 0.1801, -0.0054, 0.0654, 0.3986, 0.2892, -0.0517, -0.4274, -0.197, 0.0186, 0.2094, 0.0075, 0.0473, 1.0, 0.2383, -0.1724, 0.0439, -0.0707, 0.489, -0.1401, 0.316, 0.0956, -0.0313, 0.0252, 0.1275],
    [0.7278, 0.1044, 0.2043, -0.0602, 0.0526, 0.2352, 0.0541, -0.2901, -0.4693, -0.5091, -0.3519, 0.0762, 0.1322, -0.0762, 0.2383, 1.0, -0.209, 0.2089, -0.1687, 0.3434, 0.0179, 0.3316, -0.1196, 0.1153, -0.1342, 0.1159],
    [-0.3254, 0.2841, -0.1287, 0.0569, -0.0063, -0.2899, -0.0035, -0.0086, 0.1967, 0.131, 0.0579, -0.0335, -0.3577, 0.2715, -0.1724, -0.209, 1.0, 0.0711, 0.2448, -0.1097, 0.2259, -0.4451, -0.237, -0.1124, -0.1409, -0.0749],
    [0.0993, 0.1251, 0.0782, -0.0236, 0.0713, -0.0013, 0.0267, -0.094, -0.1146, -0.11, -0.1141, 0.085, -0.061, 0.0659, 0.0439, 0.2089, 0.0711, 1.0, 0.0076, 0.1346, 0.0777, 0.0464, -0.1254, -0.0114, -0.1304, 0.0326],
    [-0.2199, 0.3357, -0.0627, 0.0261, -0.0471, -0.2611, 0.1305, -0.0848, 0.0182, 0.0948, 0.1188, 0.0326, -0.4786, 0.3673, -0.0707, -0.1687, 0.2448, 0.0076, 1.0, 0.0141, 0.2766, -0.3167, -0.2393, -0.1132, -0.1604, -0.0991],
    [0.3224, 0.2706, 0.167, 0.0377, -0.024, 0.2194, 0.305, -0.2205, -0.5436, -0.2753, 0.0185, 0.2697, -0.1209, 0.1397, 0.489, 0.3434, -0.1097, 0.1346, 0.0141, 1.0, -0.013, 0.2127, 0.0357, -0.0525, -0.0253, 0.1415],
    [-0.1507, 0.3863, -0.0736, 0.0935, -0.0522, -0.3072, -0.0698, -0.2809, 0.0337, 0.0703, 0.0761, 0.0374, -0.3289, 0.2404, -0.1401, 0.0179, 0.2259, 0.0777, 0.2766, -0.013, 1.0, -0.4785, -0.1758, 0.034, -0.1577, -0.1397],
    [0.4503, -0.2266, 0.328, -0.2113, 0.1222, 0.4985, 0.1231, 0.0826, -0.3424, -0.307, -0.2088, 0.1179, 0.4493, -0.2775, 0.316, 0.3316, -0.4451, 0.0464, -0.3167, 0.2127, -0.4785, 1.0, 0.2518, -0.1466, 0.1718, 0.1753],
    [0.0352, -0.2914, 0.0357, -0.1607, 0.0616, 0.1594, -0.0211, 0.069, 0.001, 0.0098, 0.0958, 0.0337, 0.4216, -0.304, 0.0956, -0.1196, -0.237, -0.1254, -0.2393, 0.0357, -0.1758, 0.2518, 1.0, 0.0606, 0.5296, 0.1603],
    [0.1052, -0.2414, -0.0128, -0.0856, -0.0191, -0.0781, -0.2626, 0.0604, 0.0624, 0.0444, -0.0201, -0.1293, 0.1655, -0.2221, -0.0313, 0.1153, -0.1124, -0.0114, -0.1132, -0.0525, 0.034, -0.1466, 0.0606, 1.0, -0.0119, -0.0408],
    [-0.0165, -0.2047, 0.0394, -0.072, -0.0056, 0.1119, -0.0395, 0.0523, 0.03, 0.0172, 0.0622, 0.005, 0.2585, -0.1416, 0.0252, -0.1342, -0.1409, -0.1304, -0.1604, -0.0253, -0.1577, 0.1718, 0.5296, -0.0119, 1.0, 0.1175],
    [0.1487, 0.018, 0.0314, -0.1075, 0.0146, 0.1195, 0.0737, -0.0123, -0.1456, -0.1004, -0.0269, 0.0656, 0.1076, -0.0496, 0.1275, 0.1159, -0.0749, 0.0326, -0.0991, 0.1415, -0.1397, 0.1753, 0.1603, -0.0408, 0.1175, 1.0],
  ],
};
