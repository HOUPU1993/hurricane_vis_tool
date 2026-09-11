"""Export research output into the GeoJSON schema js/main.js expects.

Expected output: data/counties.geojson, a FeatureCollection where each
feature's properties include at least:
    county_name (str), state (str),
    svi (float), evacuation_rate (float, 0-1), displacement_days (float)

Sketch:

    import geopandas as gpd

    gdf = gpd.read_file("path/to/your/county_level_results.gpkg")
    gdf = gdf[[
        "geometry", "county_name", "state",
        "svi", "evacuation_rate", "displacement_days",
    ]]
    gdf = gdf.to_crs(4326)
    gdf["geometry"] = gdf.geometry.simplify(0.01, preserve_topology=True)
    gdf.to_file("data/counties.geojson", driver="GeoJSON")
"""
