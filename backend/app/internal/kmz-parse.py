from zipfile import ZipFile
import pprint
import xml.sax, xml.sax.handler
import math

# pandas: geoparse
def ParseKMZ(filename = "Demo_network_correct.kmz"):

    ## check if kmz or kml
    if filename[-3:] == 'kmz':
        kmz = ZipFile(filename, 'r')
        kml = kmz.open('doc.kml', 'r')
    elif filename[-3:] == 'kml':
        print('file type is kml')
        kml = open(filename, 'r')
    else:
        print('filetype is not kmz or kml')
        return {}

    class PlacemarkHandler(xml.sax.handler.ContentHandler):
        def __init__(self):
            self.inName = False # handle XML parser events
            self.inPlacemark = False
            self.mapping = {}
            self.buffer = ""
            self.name_tag = ""
        
        def startElement(self, name, attributes):
            if name == "Placemark": # on start Placemark tag
                self.inPlacemark = True
                self.buffer = ""
            if self.inPlacemark:
                if name == "name": # on start title tag
                    self.inName = True # save name text to follow
            
        def characters(self, data):
            if self.inPlacemark: # on text within tag
                self.buffer += data # save text if in title
            
        def endElement(self, name):
            self.buffer = self.buffer.strip('\n\t')
        
            if name == "Placemark":
                self.inPlacemark = False
                self.name_tag = "" #clear current name
        
            elif name == "name" and self.inPlacemark:
                self.inName = False # on end title tag           
                self.name_tag = self.buffer.strip()
                self.mapping[self.name_tag] = {}
            elif self.inPlacemark:
                if name in self.mapping[self.name_tag]:
                    self.mapping[self.name_tag][name] += self.buffer
                else:
                    self.mapping[self.name_tag][name] = self.buffer
            self.buffer = ""

    parser = xml.sax.make_parser()
    handler = PlacemarkHandler()
    parser.setContentHandler(handler)
    parser.parse(kml)
    kmz.close()

    # this is the object that contains all the data for each point on the map
    result_object = handler.mapping

    data = {}
    all_nodes = {}
    production_pads = {}
    completion_pads = {}
    network_nodes = {}
    disposal_sites = {}
    treatment_sites = {}
    other_nodes = {}
    arcs = {}

    for key in result_object:
        # data[key] = {}
        coordinates_string = result_object[key]["coordinates"]
        coordinates_split = coordinates_string.split(' ')
        coordinates_list = []
        for each in coordinates_split:
            # coords = []
            if len(each) > 0:
                coordinates_list.append(each.split(','))
        result_object[key]["coordinates"] = coordinates_list

        # print(coordinates_list)

        if len(coordinates_list) > 1:
            result_object[key]["node_type"] = "path"
            arcs[key] = result_object[key]

        else:
            result_object[key]["node_type"] = "point"
            result_object[key]["coordinates"] = result_object[key]["coordinates"][0]
            ## determine what kind of node it is:
            if key[0:2].upper() == 'PP':
                production_pads[key] = result_object[key]
            elif key[0:2].upper() == 'CP':
                completion_pads[key] = result_object[key]
            elif key[0].upper() == 'N':
                network_nodes[key] = result_object[key]
            elif key[0].upper() == 'K':
                disposal_sites[key] = result_object[key]
            elif key[0].upper() == 'R':
                treatment_sites[key] = result_object[key]
            else:
                other_nodes[key] = result_object[key]
            all_nodes[key] = result_object[key]

    def calculate_distance(coord1, coord2):
        # print(f'calculating distance from {coord1} to {coord2}')
        distance = math.sqrt(((float(coord1[0]) - float(coord2[0]))**2) + ((float(coord1[1]) - float(coord2[1]))**2))
        return distance

    connections = {
        "all_connections": [],
        "P": {
            "C": [],
            "N": [],
            "K": [],
        }, 
        "C": {
            "C": [],
            "N": [],
            "K": [],
            "S": [],
        }, 
        "N": {
            "C": [],
            "N": [],
            "K": [],
            "S": [],
            "R": [],
            "O": [],
            "P": [],
        },
        "S": {
            "C": [],
            "N": [],
            "O": [],
        }, 
        "R": {
            "C": [],
            "N": [],
            "O": [],
            "S": [],
            "R": [],
        }, 
        "F": {
            "C": [],
        }
    }

    ## possible connection types:
    # P - N, C, K
    # C - N, C, K, S
    # N - N, C, K, R, S, O
    # S - N, O, C
    # R - C, S, N, O
    # F - C
    # K - 
    ## cannot determine if trucking or piped; ASSUME ALL ARE PIPED for now


    ## for each arc endpoint, determine the nearest node
    for arc_key in arcs:
        arc = arcs[arc_key]
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
                    # print(f'closest node is {node_key}')
            if len(node_list) > 0:
                ## add connection
                origin_node = node_list[-1]
                connection = [origin_node, closest_node]
                # origin_node_data = all_nodes[origin_node]
                # destination_node_data = all_nodes[closest_node]

                connections["all_connections"].append(connection)
                try:
                    connections[origin_node[0]][closest_node[0]].append(connection)
                except:
                    print(f'unable to add connection: {connection}')



            node_list.append(closest_node)
        arc['node_list'] = node_list

    data['all_nodes'] = all_nodes
    data['production_pads'] = production_pads
    data['completion_pads'] = completion_pads
    data['network_nodes'] = network_nodes
    data['disposal_sites'] = disposal_sites
    data['treatment_sites'] = treatment_sites
    data['other_nodes'] = other_nodes
    data['arcs'] = arcs
    data['connections'] = connections


    return data 



data = ParseKMZ(filename="Demo_network_correct.kmz")
pp = pprint.PrettyPrinter(indent=1)
pp.pprint(data['production_pads'])



# def build_table(mapping):
#     sep = ','
#     output = 'Name' + sep + 'Coordinates\n'
#     points = ''
#     lines = ''
#     shapes = ''
#     for key in mapping:
#         coord_str = mapping[key]['coordinates'] + sep
#         if 'LookAt' in mapping[key]: #points
#             points += key + sep + coord_str + "\n"
#         elif 'LineString' in mapping[key]: #lines
#             lines += key + sep + coord_str + "\n"
#         else: #shapes
#             shapes += key + sep + coord_str + "\n"
#     output += points + lines + shapes
#     return output

# outstr = build_table(handler.mapping)