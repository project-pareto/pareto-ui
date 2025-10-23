import math


def calculate_distance(coord1, coord2):
        # print(f'calculating distance from {coord1} to {coord2}')
        distance = math.sqrt(((float(coord1[0]) - float(coord2[0]))**2) + ((float(coord1[1]) - float(coord2[1]))**2))
        return distance


def determineArcsAndConnections(data):
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
        nodes = []
        node_list = []
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
        arc['node_list'] = node_list
        arc['nodes'] = nodes
    return data