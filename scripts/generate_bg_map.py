"""Render a static, decorative SVG of the evacuation-rate choropleth for the
homepage's cursor-spotlight background. This is NOT the interactive Page 3
map - just a faint colored silhouette of the study area used as background
art, mirroring js/core/colorScale.js's ramp so it matches the map's palette.

Run after scripts/prepare_data.py:
    python3 scripts/generate_bg_map.py
"""

import json
import pathlib

SRC = "data/blockgroups.geojson"
DST = "assets/evac-rate-bg.svg"
FIELD = "evacuation_rate"
CLIP_LOW, CLIP_HIGH = 2, 98  # matches js/metrics/evacuation.js
BASE_HUE_HEX = "#2a78d6"  # same base hue as the evacuation-rate map ramp
VIEW_W, VIEW_H = 1200, 800


def percentile(sorted_vals, p):
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


def hex_to_rgb(hex_str):
    n = int(hex_str[1:], 16)
    return ((n >> 16) & 255, (n >> 8) & 255, n & 255)


def rgb_to_hex(rgb):
    return "#" + "".join(f"{max(0, min(255, round(c))):02x}" for c in rgb)


def rgb_to_hsl(rgb):
    r, g, b = (c / 255 for c in rgb)
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        h = s = 0
    else:
        d = mx - mn
        s = d / (1 - abs(2 * l - 1))
        if mx == r:
            h = ((g - b) / d) % 6
        elif mx == g:
            h = (b - r) / d + 2
        else:
            h = (r - g) / d + 4
        h *= 60
        if h < 0:
            h += 360
    return h, s, l


def hsl_to_rgb(h, s, l):
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if h < 60:
        rgb = (c, x, 0)
    elif h < 120:
        rgb = (x, c, 0)
    elif h < 180:
        rgb = (0, c, x)
    elif h < 240:
        rgb = (0, x, c)
    elif h < 300:
        rgb = (x, 0, c)
    else:
        rgb = (c, 0, x)
    return tuple((v + m) * 255 for v in rgb)


# Same fixed lightness/saturation-multiplier stops as js/core/colorScale.js.
LIGHTNESS_STOPS = [0.9, 0.72, 0.54, 0.36, 0.2]
SAT_MULT = [0.55, 0.8, 1.0, 0.9, 0.75]


def ramp(base_hex):
    h, s, _l = rgb_to_hsl(hex_to_rgb(base_hex))
    sat_base = min(max(s, 0.45), 0.85)
    return [rgb_to_hex(hsl_to_rgb(h, sat_base * m, l)) for l, m in zip(LIGHTNESS_STOPS, SAT_MULT)]


def interpolate_ramp(t, colors):
    t = min(max(t, 0), 1)
    n = len(colors) - 1
    scaled = t * n
    i = min(int(scaled), n - 1)
    frac = scaled - i
    c0, c1 = hex_to_rgb(colors[i]), hex_to_rgb(colors[i + 1])
    return rgb_to_hex(tuple(a + (b - a) * frac for a, b in zip(c0, c1)))


def color_for_value(value, lo, hi, colors):
    if value is None:
        return "#111111"
    t = 0.5 if hi == lo else (value - lo) / (hi - lo)
    return interpolate_ramp(t, colors)


def main():
    with open(SRC) as f:
        data = json.load(f)
    feats = data["features"]

    values = sorted(v for feat in feats if (v := feat["properties"].get(FIELD)) is not None)
    lo = percentile(values, CLIP_LOW)
    hi = percentile(values, CLIP_HIGH)
    colors = ramp(BASE_HUE_HEX)

    # Project lon/lat -> SVG space (plain equirectangular; this is a
    # decorative backdrop, not a reference map, so no real projection is
    # needed). Flip Y since latitude increases north but SVG y increases
    # downward.
    lons, lats = [], []
    for feat in feats:
        geom = feat["geometry"]
        rings = geom["coordinates"] if geom["type"] == "Polygon" else [r for poly in geom["coordinates"] for r in poly]
        for ring in rings:
            for lon, lat in ring:
                lons.append(lon)
                lats.append(lat)
    min_lon, max_lon = min(lons), max(lons)
    min_lat, max_lat = min(lats), max(lats)
    lon_span = max_lon - min_lon or 1
    lat_span = max_lat - min_lat or 1

    pad = 0.04  # small margin so shapes don't touch the canvas edge
    scale = min(VIEW_W * (1 - 2 * pad) / lon_span, VIEW_H * (1 - 2 * pad) / lat_span)
    off_x = (VIEW_W - lon_span * scale) / 2
    off_y = (VIEW_H - lat_span * scale) / 2

    def project(lon, lat):
        x = (lon - min_lon) * scale + off_x
        y = (max_lat - lat) * scale + off_y
        return round(x, 1), round(y, 1)

    def ring_to_path(ring):
        pts = [project(lon, lat) for lon, lat in ring]
        return f"M{pts[0][0]},{pts[0][1]} " + " ".join(f"L{x},{y}" for x, y in pts[1:]) + " Z"

    path_els = []
    for feat in feats:
        value = feat["properties"].get(FIELD)
        color = color_for_value(value, lo, hi, colors)
        geom = feat["geometry"]
        rings = geom["coordinates"] if geom["type"] == "Polygon" else [r for poly in geom["coordinates"] for r in poly]
        d = " ".join(ring_to_path(ring) for ring in rings)
        path_els.append(f'<path d="{d}" fill="{color}"/>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW_W} {VIEW_H}" '
        f'preserveAspectRatio="xMidYMid slice">'
        f'<rect width="{VIEW_W}" height="{VIEW_H}" fill="#000000"/>'
        + "".join(path_els)
        + "</svg>"
    )

    pathlib.Path(DST).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(DST).write_text(svg)
    print(f"Wrote {DST}: {len(feats)} shapes, {len(svg)} bytes")


if __name__ == "__main__":
    main()
