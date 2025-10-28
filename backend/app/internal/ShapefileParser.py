import math
import geopandas as gpd
from shapely.geometry import Point
import re
from geopy.point import Point
import zipfile, tempfile, os
import pprint
from collections.abc import Mapping
from .util import determineArcsAndConnections


def parse_coord(coord):
    """
    Accepts a float, numeric string, DMS string, or tuple/list of two values.
    Returns decimal degrees (float or tuple).
    """
    if isinstance(coord, (float, int)):
        return float(coord)
    if isinstance(coord, (tuple, list)) and len(coord) == 2:
        return (parse_coord(coord[0]), parse_coord(coord[1]))
    if isinstance(coord, str) and "°" in coord:
        # Try geopy parsing
        p = Point(coord) if " " not in coord else Point(coord.strip())
        # Here, coord likely contains both lat/lon if spaced together
        # If it's only one value, geopy won't work: need a DMS-specific converter
        return p.latitude if 'N' in coord or 'S' in coord else p.longitude
    if isinstance(coord, str):
        return float(coord)
    raise ValueError(f"Unsupported coordinate type: {coord}")

def dms_to_dd(lat, lon=None):
    """
    Converts lat/lon in decimal or DMS formats to decimal degrees using parse_coord.
    Can accept:
      - Two separate lat/lon values
      - A tuple/list (lat, lon)
      - A geopy-friendly string containing both
    """
    if lon is None:
        if isinstance(lat, (tuple, list)) and len(lat) == 2:
            return (parse_coord(lat[0]), parse_coord(lat[1]))
        elif isinstance(lat, str) and " " in lat:
            # Combined string containing lat+lon (e.g. "31°43’19.17”N 97°07’22.09”W")
            p = Point(lat)
            return (p.latitude, p.longitude)
        else:
            raise ValueError("If only one argument is given, it must be a tuple/list or geopy-friendly string.")
    else:
        return (parse_coord(lat), parse_coord(lon))

def ParseShapefile(filename):
    """
    Parses a single .shp file
    Can accept:
      - .shp file
    Returns:
      - dict object containing all_nodes, connections, polygons, ...
    """

    gdf = gpd.read_file(filename)

    # reproject geometries to WGS84 (EPSG:4326)
    try:
        gdf = gdf.to_crs(epsg=4326)
    except:
        print("Warning: Could not reproject — CRS missing, assuming already EPSG:4326.")

    all_nodes, production_pads, completion_pads, network_nodes, disposal_sites, \
    treatment_sites, storage_sites, freshwater_sources, reuse_options, \
    other_nodes, arcs, polygons = [{} for _ in range(12)]
    # all_nodes, arcs, polygons = {}, {}, {}

    connections = {"all_connections": {}}

    for idx, row in gdf.iterrows():
        props = row.drop(labels='geometry').to_dict()

        # Support case where coords are stored in DMS in attributes instead of geometry
        geometry = row.geometry
        feature_name = str(props.get("Name", f"feature_{idx}"))

        if geometry.geom_type == "Point":
            coords = (geometry.x, geometry.y)
            props["coordinates"] = parse_coord(coords)
            
            if feature_name.upper().startswith('PP'):
                props["node_type"] = "ProductionPad"
                production_pads[feature_name] = props
            elif feature_name.upper().startswith('CP'):
                props["node_type"] = "CompletionsPad"
                completion_pads[feature_name] = props
            elif feature_name.upper().startswith('N'):
                props["node_type"] = "NetworkNode"
                network_nodes[feature_name] = props
            elif feature_name.upper().startswith('K'):
                props["node_type"] = "DisposalSite"
                disposal_sites[feature_name] = props
            elif feature_name.upper().startswith('R'):
                props["node_type"] = "TreatmentSite"
                treatment_sites[feature_name] = props
                storage_site_key = feature_name.replace('R','S').replace('r','S')
                storage_sites[storage_site_key] = props
                connections["all_connections"][feature_name] = [storage_site_key]
                connections["all_connections"][storage_site_key] = [feature_name]
            elif feature_name.upper().startswith('S') and len(feature_name) < 4:
                props["node_type"] = "StorageSite"
                storage_sites[feature_name] = props
            elif feature_name.upper().startswith('F'):
                props["node_type"] = "NetworkNode"
                freshwater_sources[feature_name] = props
            elif feature_name.upper().startswith('O') and len(feature_name) < 4:
                props["node_type"] = "ReuseOption"
                reuse_options[feature_name] = props
            else:
                props["node_type"] = "NetworkNode"
                other_nodes[feature_name] = props
            all_nodes[feature_name] = props

        elif geometry.geom_type in ("LineString", "MultiLineString"):
            if geometry.geom_type == "LineString":
                coords_list = [
                    (parse_coord(x), parse_coord(y)) for x, y in geometry.coords
                ]
            else:
                coords_list = []
                for line in geometry:
                    coords_list.extend([
                        (parse_coord(x), parse_coord(y)) for x, y in line.coords
                    ])
            props["coordinates"] = coords_list
            props["node_type"] = "path"
            arcs[feature_name] = props

        elif geometry.geom_type in ("Polygon", "MultiPolygon"):
            if geometry.geom_type == "Polygon":
                exterior_coords = [
                    (parse_coord(x), parse_coord(y)) for x, y in geometry.exterior.coords
                ]
                interiors_coords = [
                    [(parse_coord(x), parse_coord(y)) for x, y in interior.coords]
                    for interior in geometry.interiors
                ]
            else:
                exterior_coords = []
                interiors_coords = []
                for poly in geometry.geoms:
                    exterior_coords.extend([
                        (parse_coord(x), parse_coord(y)) for x, y in poly.exterior.coords
                    ])
                    interiors_coords.extend([
                        [(parse_coord(x), parse_coord(y)) for x, y in interior.coords]
                        for interior in poly.interiors
                    ])

            props["coordinates"] = {
                "exterior": exterior_coords,
                "interiors": interiors_coords
            }
            props["node_type"] = "polygon_area"
            polygons[feature_name] = props
        else:
            print(f"other geometry.geom_type: {geometry.geom_type}")

    result = {
        'all_nodes': all_nodes,
        'arcs': arcs,
        'polygons': polygons,
        'ProductionPads': production_pads,
        'CompletionsPads': completion_pads,
        'NetworkNodes': network_nodes,
        'SWDSites': disposal_sites,
        'TreatmentSites': treatment_sites,
        'StorageSites': storage_sites,
        'FreshwaterSources': freshwater_sources,
        'ReuseOptions': reuse_options,
        'other_nodes': other_nodes,
        'connections': connections
    }

    return result

def merge_parsed_data(data1, data2):
    """
    Recursively merges two parsed shapefile (or kml map?) outputs.
    Any dict keys from both will be combined.
    - Dict values are merged key-by-key
    - List values are merged with duplicates removed
    - Other values: prefer data2's value when conflicting
    Returns: dict file containing combined data
    TODO: 
        - Move this to agnostic file?
        - This should work for kml data, and we might want
        -  to be able to combine different outputs later on.
    """
    result = {}

    all_keys = set(data1.keys()) | set(data2.keys())

    for key in all_keys:
        val1 = data1.get(key)
        val2 = data2.get(key)

        # If both values are dicts, merge recursively
        if isinstance(val1, Mapping) and isinstance(val2, Mapping):
            merged_dict = {**val1}  # copy val1
            for subk, subv in val2.items():
                if subk in merged_dict:
                    # If both are lists, merge sets
                    if isinstance(merged_dict[subk], list) and isinstance(subv, list):
                        merged_dict[subk] = list(set(merged_dict[subk]) | set(subv))
                    # If both are dict, merge deeply
                    elif isinstance(merged_dict[subk], Mapping) and isinstance(subv, Mapping):
                        merged_dict[subk] = merge_parsed_data(merged_dict[subk], subv)
                    else:
                        merged_dict[subk] = subv  # overwrite
                else:
                    merged_dict[subk] = subv
            result[key] = merged_dict

        # If both values are lists, merge without duplicates
        elif isinstance(val1, list) and isinstance(val2, list):
            result[key] = list(set(val1) | set(val2))

        # If one value is missing, use the one that exists
        elif val1 is None:
            result[key] = val2
        elif val2 is None:
            result[key] = val1

        # If both exist but are not dict/list, choose val2
        else:
            result[key] = val2

    return result

def extract_shp_paths(zip_path):
    """
    Extracts .shp file paths from a .zip.
    Can accept:
      - .zip file
    Returns:
      - list of .shp file paths
    """
    tmpdir = tempfile.mkdtemp()
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(tmpdir)
    shp_files = []
    for root, _, files in os.walk(tmpdir):
        for f in files:
            if f.endswith(".shp"):
                shp_files.append(os.path.join(root, f))
    return shp_files

def parseShapefiles(shp_paths):
    """
    Parses and a list of .shp files and merges data into single object.
    Can accept:
      - list of .shp files
    Returns
      - dict containing map data parsed from all files
    """
    map_data = {}
    for shp_path in shp_paths:
        print(f"parsing: {shp_path}")
        result = ParseShapefile(shp_path)
        map_data = merge_parsed_data(map_data, result)
    print(f'got shape data: {len(map_data)}')
    map_data = determineArcsAndConnections(map_data)
    return map_data

# Example usage
# zip_path = "Downloads/mygeodata.zip"
# zip_path = "Downloads/Parks.zip"
# shp_paths = extract_shp_paths(zip_path)

# all_results = {}
# for shp_path in shp_paths:
#     ## TODO: we have to merge all the results
#     print(f"parsing: {shp_path}")
#     result = ParseShapefile(shp_path)
#     all_results = merge_parsed_data(all_results, result)
# all_results = determineArcConnections(all_results)
# pprint.pprint(all_results, indent=0.5)