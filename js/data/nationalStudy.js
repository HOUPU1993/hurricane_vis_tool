// Page 7: which of the 8 states in js/../hurricane_evacuation_zone (on the
// researcher's machine, not this repo - GIS files run tens of MB per state)
// have downloadable evacuation-zone data collected so far, for the national
// study's data-collection status map. Not computed from anything - this is
// a manually maintained status list, updated as more states are collected.
// Centroids are approximate (state-level, for marker placement only).

export const STATE_STATUS = [
  { code: "FL", name: "Florida", lat: 28.6, lon: -82.4, status: "downloaded", note: "2024 statewide evacuation zones (shapefile)" },
  { code: "SC", name: "South Carolina", lat: 33.9, lon: -80.9, status: "downloaded", note: "Statewide evacuation zones + Know Your Zone layer" },
  { code: "NC", name: "North Carolina", lat: 35.6, lon: -79.0, status: "downloaded", note: "Statewide evacuation zones (shapefile)" },
  { code: "TX", name: "Texas", lat: 31.0, lon: -99.9, status: "downloaded", note: "H-GAC (Houston region) zip-code zones only - not statewide" },
  { code: "AL", name: "Alabama", lat: 32.8, lon: -86.8, status: "downloaded", note: "Statewide evacuation zones" },
  { code: "LA", name: "Louisiana", lat: 31.2, lon: -92.0, status: "downloaded", note: "Statewide evacuation zones" },
  { code: "MS", name: "Mississippi", lat: 32.7, lon: -89.7, status: "manual", note: "County-level PDFs only (Harrison, Hancock, Jackson); no downloadable vector data yet" },
  { code: "GA", name: "Georgia", lat: 32.7, lon: -83.5, status: "pending", note: "Reached out to county EMA directly; no downloadable zone data yet" },
];

export const STATUS_META = {
  downloaded: { label: "Downloaded", color: "#4fd9a5" },
  manual: { label: "Manually collected", color: "#f0b93a" },
  pending: { label: "Pending EMA contact", color: "#f27f7e" },
};
