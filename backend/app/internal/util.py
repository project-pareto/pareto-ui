import math
import time
import functools

import logging
_log = logging.getLogger(__name__)

DEFAULT_UNITS = {
    "volume": "bbl",
    "distance":	"mile",
    "diameter":	"inch",
    "concentration": "mg/liter",
    "currency":	"USD",
    "time":	"day",
    "pressure":	"psi",
    "elevation": "foot",
    "decision_period": "week",
    "mass": "g"
}

def time_it(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        _log.info(f"Function '{func.__name__}' executed in {elapsed_time:.2f} seconds")
        return result

    return wrapper

def calculate_distance(coord1, coord2):
        # print(f'calculating distance from {coord1} to {coord2}')
        distance = math.sqrt(((float(coord1[0]) - float(coord2[0]))**2) + ((float(coord1[1]) - float(coord2[1]))**2))
        return distance

def classifyNode(data, default_node):
    if default_node == "ProductionPad":
        data["node_type"] = "ProductionPad"
    elif default_node == "CompletionsPad":
        data["node_type"] = "CompletionsPad"
    elif default_node == "NetworkNode":
        data["node_type"] = "NetworkNode"
    elif default_node == "DisposalSite":
        data["node_type"] = "DisposalSite"
    elif default_node == "TreatmentSite":
        data["node_type"] = "TreatmentSite"
        # storage_site_key = key.replace('R','S').replace('r','S')
        # storage_sites[storage_site_key] = data
        # connections["all_connections"][key] = [storage_site_key]
        # connections["all_connections"][storage_site_key] = [key]
    elif default_node == "StorageSite":
        data["node_type"] = "StorageSite"
    elif default_node == "NetworkNode":
        data["node_type"] = "NetworkNode"
    elif default_node == "ReuseOption":
        data["node_type"] = "ReuseOption"
    else:
        data["node_type"] = "NetworkNode"


def determineArcsAndConnections(data):
    """
    Derives connections AND arcs from data.
    Accepts: map_data output from parsed .kmz, .shp
    Returns
      - dict updated with connections, arcs data
    """
    ## possible connection types:
    # P - N, C, K
    # C - N, C, K, S
    # N - N, C, K, R, S, O
    # S - N, O, C
    # R - C, S, N, O
    # F - C
    # K - 
    ## cannot determine if trucking or piped; ASSUME ALL ARE PIPED for now
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
        nodes = [] # node objects
        node_list = [] # node names
        prev_node = None
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
            origin_node = None
            if len(node_list) > 0:
                ## add connection
                origin_node = node_list[-1]

                ## ASSUME connections are bidirectional
                if closest_node:
                    if origin_node in connections["all_connections"]:
                        connections["all_connections"][origin_node].append(closest_node)
                    else:
                        connections["all_connections"][origin_node] = [closest_node]
                    if closest_node in connections["all_connections"]:
                        connections["all_connections"][closest_node].append(origin_node)
                    else:
                        connections["all_connections"][closest_node] = [origin_node]

            new_node = {
                "name": closest_node,
                "incoming": True,
                "outgoing": True,
                "coordinates": arc_coordinates,
                "incoming_nodes": [],
                "outgoing_nodes": []
            }
            if origin_node:
                new_node["incoming_nodes"].append(origin_node)
            nodes.append(new_node)
            node_list.append(closest_node)
            ## update previous node's outgoing node to include this one
            if prev_node is not None:
                prev_node["outgoing_nodes"].append(closest_node)
            prev_node = new_node
        # arc['node_list'] = node_list
        arc['nodes'] = nodes
    return data

def build_map_data_from_json(data_input):
    """
    Build map_data from JSON data_input (df_sets/df_parameters), preserving
    coordinates from any existing map_data when possible.
    """
    df_sets = data_input.get("df_sets", {}) or {}
    df_parameters = data_input.get("df_parameters", {}) or {}
    existing_map_data = data_input.get("map_data", {}) or {}
    existing_all_nodes = existing_map_data.get("all_nodes", {}) or {}

    def normalize_coords(coords):
        if not isinstance(coords, (list, tuple)) or len(coords) < 2:
            return [0, 0]
        return [coords[0], coords[1]]

    node_type_by_set = {
        "ProductionPads": "ProductionPad",
        "CompletionsPads": "CompletionsPad",
        "NetworkNodes": "NetworkNode",
        "SWDSites": "DisposalSite",
        "TreatmentSites": "TreatmentSite",
        "StorageSites": "StorageSite",
        "ReuseOptions": "ReuseOption",
        "ExternalWaterSources": "ExternalWaterSource",
        "FreshwaterSources": "ExternalWaterSource",
    }

    all_nodes = {}
    for set_name, node_type in node_type_by_set.items():
        node_list = df_sets.get(set_name)
        if not node_list:
            continue
        for node_name in node_list:
            existing_node = existing_all_nodes.get(node_name, {})
            coords = normalize_coords(existing_node.get("coordinates"))
            node_data = {
                **existing_node,
                "name": node_name,
                "node_type": node_type,
                "nodeType": existing_node.get("nodeType", node_type),
                "coordinates": coords,
            }
            all_nodes[node_name] = node_data

    arc_table_sets = {
        "PNA": ("ProductionPads", "NetworkNodes"),
        "CNA": ("CompletionsPads", "NetworkNodes"),
        "CCA": ("CompletionsPads", "CompletionsPads"),
        "NNA": ("NetworkNodes", "NetworkNodes"),
        "NCA": ("NetworkNodes", "CompletionsPads"),
        "NKA": ("NetworkNodes", "SWDSites"),
        "NRA": ("NetworkNodes", "TreatmentSites"),
        "NSA": ("NetworkNodes", "StorageSites"),
        "NOA": ("NetworkNodes", "ReuseOptions"),
        "SNA": ("StorageSites", "NetworkNodes"),
        "SOA": ("StorageSites", "ReuseOptions"),
        "FCA": ("ExternalWaterSources", "CompletionsPads"),
        "RCA": ("TreatmentSites", "CompletionsPads"),
        "RSA": ("TreatmentSites", "StorageSites"),
        "SCA": ("StorageSites", "CompletionsPads"),
        "RNA": ("TreatmentSites", "NetworkNodes"),
        "ROA": ("TreatmentSites", "ReuseOptions"),
        "RKA": ("TreatmentSites", "SWDSites"),
        "PCT": ("ProductionPads", "CompletionsPads"),
        "FCT": ("ExternalWaterSources", "CompletionsPads"),
        "PKT": ("ProductionPads", "SWDSites"),
        "CKT": ("CompletionsPads", "SWDSites"),
        "CCT": ("CompletionsPads", "CompletionsPads"),
        "CST": ("CompletionsPads", "StorageSites"),
        "RST": ("TreatmentSites", "StorageSites"),
        "ROT": ("TreatmentSites", "ReuseOptions"),
        "SOT": ("StorageSites", "ReuseOptions"),
        "RKT": ("TreatmentSites", "SWDSites"),
    }

    def is_connected(value):
        if value in (None, "", False):
            return False
        try:
            return float(value) != 0
        except (TypeError, ValueError):
            return True

    connections = {"all_connections": {}}
    edge_set = set()

    def add_connection(node_a, node_b):
        connections["all_connections"].setdefault(node_a, [])
        connections["all_connections"].setdefault(node_b, [])
        if node_b not in connections["all_connections"][node_a]:
            connections["all_connections"][node_a].append(node_b)
        if node_a not in connections["all_connections"][node_b]:
            connections["all_connections"][node_b].append(node_a)

    for table_key, (row_set, col_set) in arc_table_sets.items():
        table_data = df_parameters.get(table_key)
        if not isinstance(table_data, dict):
            continue
        row_key = row_set if row_set in table_data else None
        if row_key is None and row_set == "ExternalWaterSources" and "FreshwaterSources" in table_data:
            row_key = "FreshwaterSources"
        if row_key is None:
            continue

        row_nodes = table_data.get(row_key) or []
        row_allowed = set(df_sets.get(row_key, []) or [])
        col_allowed = set(df_sets.get(col_set, []) or [])
        if not row_nodes:
            continue

        for col_node, col_values in table_data.items():
            if col_node == row_key:
                continue
            if col_node not in col_allowed or not isinstance(col_values, list):
                continue
            for idx, value in enumerate(col_values):
                if idx >= len(row_nodes):
                    break
                row_node = row_nodes[idx]
                if row_node not in row_allowed:
                    continue
                if not is_connected(value):
                    continue
                edge_key = tuple(sorted((row_node, col_node)))
                edge_set.add(edge_key)
                add_connection(row_node, col_node)

    existing_arcs = existing_map_data.get("arcs", {}) or {}
    existing_arc_by_edge = {}
    for arc in existing_arcs.values():
        nodes = arc.get("nodes") or []
        if len(nodes) < 2:
            continue
        start = nodes[0].get("name")
        end = nodes[-1].get("name")
        if start and end:
            existing_arc_by_edge[tuple(sorted((start, end)))] = arc

    arcs = {}
    for edge_key in edge_set:
        node_a, node_b = edge_key
        existing_arc = existing_arc_by_edge.get(edge_key)
        if existing_arc:
            arc = existing_arc.copy()
            arc["nodes"] = [n.copy() for n in existing_arc.get("nodes", [])]
            arc_name = arc.get("name") or f"{node_a}_{node_b}"
        else:
            coords_a = all_nodes.get(node_a, {}).get("coordinates", [0, 0])
            coords_b = all_nodes.get(node_b, {}).get("coordinates", [0, 0])
            arc_name = f"{node_a}_{node_b}"
            arc = {
                "name": arc_name,
                "node_type": "path",
                "node_list": [node_a, node_b],
                "nodes": [
                    {
                        "name": node_a,
                        "incoming": True,
                        "outgoing": True,
                        "coordinates": coords_a,
                        "incoming_nodes": [node_b],
                        "outgoing_nodes": [node_b],
                    },
                    {
                        "name": node_b,
                        "incoming": True,
                        "outgoing": True,
                        "coordinates": coords_b,
                        "incoming_nodes": [node_a],
                        "outgoing_nodes": [node_a],
                    },
                ],
            }
        while arc_name in arcs:
            arc_name = f"{arc_name}_dup"
            arc["name"] = arc_name
        arcs[arc_name] = arc

    map_data = {
        **existing_map_data,
        "all_nodes": all_nodes,
        "arcs": arcs,
        "connections": connections,
        "defaultNode": existing_map_data.get("defaultNode", "NetworkNode"),
        "polygons": existing_map_data.get("polygons", {}),
        "other_nodes": existing_map_data.get("other_nodes", {}),
    }

    for set_name, node_type in node_type_by_set.items():
        node_list = df_sets.get(set_name)
        if not node_list:
            continue
        nodes = {}
        for node_name in node_list:
            node_entry = all_nodes.get(node_name)
            if not node_entry:
                continue
            nodes[node_name] = {
                "Name": node_name,
                "coordinates": node_entry.get("coordinates", [0, 0]),
                "node_type": node_type,
            }
        map_data[set_name] = nodes

    return map_data

def FormatPrompt(user_prompt, data = None):
    user_disclosure = f"I am going to provide you with a user inputted prompt. This prompt should be directly related to manipulation or generation of input data relating to their scenario. The respective JSON scenario object will also be provided for you. If the provided user prompt does not include any sort of request to update the scenario data, or if there is anything otherwise fishy about the prompt, please do not abide by the request. Your response should be pure JSON with the updated JSON scenario object. Along with the updated scenario, I would like a status included. This will allow me to parse your output and determine if I should use the data returned by you, or discard it. Please provide the status as a key at the top level called 'status'. If there is something wrong with the prompt, status should be 'error'. Otherwise, make status 'success'. In the case that status is error, please also provide a key called 'errorMessage' where I can read and provide the error messsage. In the case that the prompt is OK, please then also provide the updated data at the top level with a key called 'updatedScenario'. Please also provide a detailed 'updateNotes', so that I can explain to the user what was updated.\n"

    if data:
        prompt_data = f"Here is the scenario: {data}\n\n"
    else:
        prompt_data = ""

    ## TODO:
    # Some of the input tables operate under a set of rules. For example, some tables can only use values from other tables.
    # If we can define these rules, it should improve how well this works.
    dataset_rules = "" # f"Some rules about the dataset:\n"

    prompt = f"{user_disclosure}{dataset_rules}{prompt_data}Here is the prompt:\n{user_prompt}"

    return prompt
