"""Compute descriptive stats (min, p25, median, mean, p75, max, n) for every
metric field in data/blockgroups.geojson, for the Page 4 study-area-profile
cards. Pure stdlib, run after scripts/prepare_data.py.

Run from the project root:
    python3 scripts/compute_summary_stats.py
"""

import json

SRC = "data/blockgroups.geojson"
DST = "data/summary_stats.json"

# Every property except the id. Independent of prepare_data.py's KEEP_FIELDS
# list so this script keeps working even if that list changes shape.
SKIP_FIELDS = {"GEO10"}


def percentile(sorted_vals, p):
    """Linear-interpolation percentile (numpy's default 'linear' method)."""
    if not sorted_vals:
        return None
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    k = (len(sorted_vals) - 1) * (p / 100)
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    if f == c:
        return sorted_vals[f]
    return sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * (k - f)


def stats_for(values):
    vals = sorted(v for v in values if v is not None)
    n_total = len(values)
    if not vals:
        return {
            "min": None, "p25": None, "median": None, "mean": None,
            "p75": None, "max": None, "n": 0, "n_total": n_total,
        }
    return {
        "min": vals[0],
        "p25": percentile(vals, 25),
        "median": percentile(vals, 50),
        "mean": sum(vals) / len(vals),
        "p75": percentile(vals, 75),
        "max": vals[-1],
        "n": len(vals),
        "n_total": n_total,
    }


def main():
    with open(SRC) as f:
        data = json.load(f)

    features = data["features"]
    if not features:
        raise SystemExit(f"No features in {SRC}")

    fields = [k for k in features[0]["properties"].keys() if k not in SKIP_FIELDS]

    out = {}
    for field in fields:
        values = [feat["properties"].get(field) for feat in features]
        out[field] = stats_for(values)

    with open(DST, "w") as f:
        json.dump(out, f, indent=2, sort_keys=True)

    print(f"Wrote {DST}: {len(fields)} fields, {len(features)} features")


if __name__ == "__main__":
    main()
