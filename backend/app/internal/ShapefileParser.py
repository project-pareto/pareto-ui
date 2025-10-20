import math
import geopandas as gpd
from shapely.geometry import Point
import re
from geopy.point import Point
import zipfile, tempfile, os
import pprint
from collections.abc import Mapping

def dms_to_dd(lat_str, lon_str):
    p = Point(f"{lat_str} {lon_str}")
    return (p.latitude, p.longitude)

# def dms_to_dd(dms_str):
#     dms_str = dms_str.strip()
#     regex = r"(\d+)[°:\s]+(\d+)[’:\s]+([\d\.]+)[\"\s]*([NSEW])"
#     match = re.match(regex, dms_str)
#     if not match:
#         raise ValueError(f"Invalid DMS format: {dms_str}")
#     deg, minutes, seconds, hemisphere = match.groups()
#     dd = float(deg) + float(minutes) / 60 + float(seconds) / 3600
#     if hemisphere in ['S', 'W']:
#         dd *= -1
#     return dd

def calculate_distance(coord1, coord2):
    return math.sqrt(((coord1[0] - coord2[0])**2) + ((coord1[1] - coord2[1])**2))

def parse_coord(coord_str):
    if isinstance(coord_str, str) and "°" in coord_str:
        return dms_to_dd(coord_str)
    return float(coord_str)

def ParseShapefile(filename):

    gdf = gpd.read_file(filename)

    # ✅ Reproject geometries to WGS84 (EPSG:4326)
    try:
        gdf = gdf.to_crs(epsg=4326)
    except:
        print("Warning: Could not reproject — CRS missing, assuming already EPSG:4326.")

    all_nodes, production_pads, completion_pads, network_nodes, disposal_sites, \
    treatment_sites, storage_sites, freshwater_sources, reuse_options, \
    other_nodes, arcs = [{} for _ in range(11)]
    connections = {"all_connections": {}}

    for idx, row in gdf.iterrows():
        props = row.drop(labels='geometry').to_dict()

        # Support case where coords are stored in DMS in attributes instead of geometry
        geometry = row.geometry
        feature_name = str(props.get("Name", f"feature_{idx}"))

        if geometry.geom_type == "Point":
            coords = (geometry.x, geometry.y)
            props["coordinates"] = coords
            # classification logic unchanged
            if feature_name.upper().startswith('PP'):
                props["node_type"] = "ProductionPad"
                production_pads[feature_name] = props
            elif feature_name.upper().startswith('CP'):
                props["node_type"] = "CompletionPad"
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
            coords_list = list(geometry.coords) if geometry.geom_type == "LineString" else [
                tuple(pt for line in geometry for pt in line.coords)
            ]
            props["coordinates"] = coords_list
            props["node_type"] = "path"
            arcs[feature_name] = props

    # connection logic unchanged...
    

    result = {
        'all_nodes': all_nodes,
        'arcs': arcs,
        # 'ProductionPads': production_pads,
        # 'CompletionsPads': completion_pads,
        # 'NetworkNodes': network_nodes,
        # 'SWDSites': disposal_sites,
        # 'TreatmentSites': treatment_sites,
        # 'StorageSites': storage_sites,
        # 'FreshwaterSources': freshwater_sources,
        # 'ReuseOptions': reuse_options,
        # 'other_nodes': other_nodes,
        # 'connections': connections
    }

    return result

def determineArcConnections(data):
    arcs = data.get("arcs", {})
    all_nodes = data.get("all_nodes", {})
    connections = {
        "all_connections": {}
    }
    data["connections"] = connections
    # build arcs' node lists, nearest connections, etc.
    ## for each arc endpoint, determine the nearest node
    for arc_key in arcs:
        arc = arcs[arc_key]
        nodes = []
        node_list = []
        for arc_coordinates in arc["coordinates"]:
            min_distance = 100000.0
            closest_node = ""
            # check each node
            for node_key in all_nodes:
                node = all_nodes[node_key]
                node_coordinates = node["coordinates"]
                distance = calculate_distance(arc_coordinates, node_coordinates)
                if distance < min_distance:
                    closest_node = node_key
                    min_distance = distance
            if len(node_list) > 0:
                ## add connection
                origin_node = node_list[-1]

                ## ASSUME connections are bidirectional
                if origin_node in connections["all_connections"]:
                    connections["all_connections"][origin_node].append(closest_node)
                else:
                    connections["all_connections"][origin_node] = [closest_node]
                if closest_node in connections["all_connections"]:
                    connections["all_connections"][closest_node].append(origin_node)
                else:
                    connections["all_connections"][closest_node] = [origin_node]


            nodes.append({
                "name": closest_node,
                "incoming": True,
                "outgoing": True,
                "coordinates": arc_coordinates,
            })
            node_list.append(closest_node)
        arc['node_list'] = node_list
        arc['nodes'] = nodes
    return data

def merge_parsed_data(data1, data2):
    """
    Recursively merges two parsed shapefile outputs.
    Any dict keys from both will be combined.
    - Dict values are merged key-by-key
    - List values are merged with duplicates removed
    - Other values: prefer data2's value when conflicting
    """
    result = {}

    # Union of all top-level keys
    all_keys = set(data1.keys()) | set(data2.keys())

    for key in all_keys:
        val1 = data1.get(key)
        val2 = data2.get(key)

        # If both values are dicts -> merge recursively
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

        # If both values are lists -> merge without duplicates
        elif isinstance(val1, list) and isinstance(val2, list):
            result[key] = list(set(val1) | set(val2))

        # If one value is missing, use the one that exists
        elif val1 is None:
            result[key] = val2
        elif val2 is None:
            result[key] = val1

        # If both exist but are not dict/list → prefer val2
        else:
            result[key] = val2

    return result

def extract_shp_paths(zip_path):
    tmpdir = tempfile.mkdtemp()
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(tmpdir)
    shp_files = []
    for root, _, files in os.walk(tmpdir):
        for f in files:
            if f.endswith(".shp"):
                shp_files.append(os.path.join(root, f))
    return shp_files


# Example usage
# zip_path = "mygeodata.zip"
# shp_paths = extract_shp_paths(zip_path)

# all_results = {}
# for shp_path in shp_paths:
#     ## TODO: we have to merge all the results
#     result = ParseShapefile(shp_path)
#     all_results = merge_parsed_data(all_results, result)
# all_results = determineArcConnections(all_results)
# pprint.pprint(all_results, indent=0.5)