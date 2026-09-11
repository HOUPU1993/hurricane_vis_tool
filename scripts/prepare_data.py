"""Trim vis_vbs.geojson (raw research output, ~100 fields) down to the ~30
fields the dashboard plots, simplify geometry, and round coordinates so the
file loads fast in the browser. Pure stdlib (no geopandas needed).

Run from the project root:
    python3 scripts/prepare_data.py
"""

import json
import math

SRC = "vis_vbs.geojson"
DST = "data/blockgroups.geojson"

# Coordinate precision: 5 decimal degrees is ~1.1m, far finer than this map
# ever needs (regional / block-group choropleth).
COORD_DECIMALS = 5

# Douglas-Peucker tolerance in degrees. ~0.0005 deg =~ 55m: shapes stay
# recognizable at county/regional zoom while cutting vertex count ~90%.
# Raise it for a smaller file / blockier shapes, lower it for more detail.
SIMPLIFY_TOLERANCE = 0.0005

# Fields to keep, grouped to match js/metrics/*.js. Edit both places together
# if you add/remove a metric.
KEEP_FIELDS = [
    # Mobile phone evacuation detection
    "evacuation_rate",
    "median_evacuation_distance_km",
    "median_return_days",
    # Hurricane characteristics
    "proximity",
    "peak_wind",
    # Home equity & mortgage
    "median_equity",
    "median_mtg_remaining",
    "active_mortgage_share",
    "median_loan_term_remaining",
    # Tenure length
    "lor_to_2022_owner",
    # Housing cost burden
    "pct_cost_burden_50p",
    # Population & race
    "pct_65p",
    "pct_white",
    "pct_black",
    "pct_asian",
    "pct_hispanic",
    "pop_density",
    "pct_disability",
    # Education & income
    "pop_college",
    "pct_inc_q1",
    "pct_inc_q2",
    "pct_inc_q3",
    "pct_inc_q4",
    "pct_inc_q5",
    # Household structure
    "pct_hh_children",
    "avg_household_size",
    # Party registration
    "party_dem_pct",
    "party_rep_pct",
    "party_npp_pct",
    # Vehicle & broadband access
    "pct_hh_has_vehicle",
    "pct_broadband",
]


def _perp_dist(pt, a, b):
    (x, y), (x1, y1), (x2, y2) = pt, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
    t = max(0, min(1, t))
    px, py = x1 + t * dx, y1 + t * dy
    return math.hypot(x - px, y - py)


def _rdp(points, eps):
    """Douglas-Peucker line simplification on a single ring/line."""
    if len(points) < 3:
        return points
    dmax, idx = 0, 0
    for i in range(1, len(points) - 1):
        d = _perp_dist(points[i], points[0], points[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        left = _rdp(points[: idx + 1], eps)
        right = _rdp(points[idx:], eps)
        return left[:-1] + right
    return [points[0], points[-1]]


def simplify_geometry(geometry, eps):
    """Simplify a Polygon or MultiPolygon's rings with Douglas-Peucker."""
    gtype = geometry["type"]
    coords = geometry["coordinates"]
    if gtype == "Polygon":
        rings = [_rdp(ring, eps) for ring in coords]
    elif gtype == "MultiPolygon":
        rings = [[_rdp(ring, eps) for ring in poly] for poly in coords]
    else:
        rings = coords  # leave other geometry types untouched
    return {"type": gtype, "coordinates": rings}


def round_coords(coords):
    """Recursively round a GeoJSON coordinates array to COORD_DECIMALS."""
    if isinstance(coords[0], (int, float)):
        return [round(c, COORD_DECIMALS) for c in coords]
    return [round_coords(c) for c in coords]


def confidence(props):
    """How much of the block group's population the phone panel actually
    observed evacuating: n_evacuees / ACS population, capped at 1 so a
    small/undercounted population can't produce a >100% "confidence"."""
    n_evacuees = props.get("n_evacuees")
    pop_total = props.get("pop_total")
    if not n_evacuees or not pop_total:
        return None
    return min(n_evacuees / pop_total, 1.0)


def main():
    with open(SRC) as f:
        src = json.load(f)

    out_features = []
    for feat in src["features"]:
        props = feat["properties"]
        new_props = {"GEO10": props.get("GEO10")}
        for field in KEEP_FIELDS:
            new_props[field] = props.get(field)
        new_props["confidence"] = confidence(props)

        geometry = simplify_geometry(feat["geometry"], SIMPLIFY_TOLERANCE)
        geometry["coordinates"] = round_coords(geometry["coordinates"])

        out_features.append({
            "type": "Feature",
            "properties": new_props,
            "geometry": geometry,
        })

    out = {
        "type": "FeatureCollection",
        "crs": src.get("crs"),
        "features": out_features,
    }

    with open(DST, "w") as f:
        json.dump(out, f, separators=(",", ":"))

    print(f"Wrote {DST}: {len(out_features)} features, "
          f"{len(KEEP_FIELDS) + 2} properties each")


if __name__ == "__main__":
    main()
