#####################################################################################################
# PARETO was produced under the DOE Produced Water Application for Beneficial Reuse Environmental
# Impact and Treatment Optimization (PARETO), and is copyright (c) 2021-2024 by the software owners:
# The Regents of the University of California, through Lawrence Berkeley National Laboratory, et al.
# All rights reserved.
#
# NOTICE. This Software was developed under funding from the U.S. Department of Energy and the U.S.
# Government consequently retains certain rights. As such, the U.S. Government has been granted for
# itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in
# the Software to reproduce, distribute copies to the public, prepare derivative works, and perform
# publicly and display publicly, and to permit others to do so.
#####################################################################################################
from zipfile import ZipFile
import pprint
import xml.sax, xml.sax.handler
import shutil
import math
import os
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

# pandas: geoparse
def ParseKMZ(filename):
    global NODE_NAMES
    NODE_NAMES = set()

    def calculate_distance(coord1, coord2):
        # print(f'calculating distance from {coord1} to {coord2}')
        distance = math.sqrt(((float(coord1[0]) - float(coord2[0]))**2) + ((float(coord1[1]) - float(coord2[1]))**2))
        return distance

    ## check if kmz or kml
    if filename[-3:] == 'kmz':
        kmz = ZipFile(filename, 'r')
        kml = kmz.open('doc.kml', 'r')
        kmz.close()
    elif filename[-3:] == 'kml':
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
                while self.name_tag in NODE_NAMES:
                    self.name_tag = f'{self.name_tag}_'
                NODE_NAMES.add(self.name_tag)
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
        

    # this is the object that contains all the data for each point on the map
    result_object = handler.mapping

    data = {}
    all_nodes = {}
    production_pads = {}
    completion_pads = {}
    network_nodes = {}
    disposal_sites = {}
    treatment_sites = {}
    # storage_sites = {}
    # freshwater_sources = {}
    # reuse_options = {}
    storage_sites = {}
    freshwater_sources = {}
    reuse_options = {}
    other_nodes = {}
    arcs = {}
    connections = {
        "all_connections": {},
    }

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
                storage_site_key = key.replace('R','S').replace('r','S')
                storage_sites[storage_site_key] = result_object[key]
                connections["all_connections"][key] = [storage_site_key]
                connections["all_connections"][storage_site_key] = [key]
            elif key[0].upper() == 'S' and len(key) < 4:
                storage_sites[key] = result_object[key]
            elif key[0].upper() == 'F':
                freshwater_sources[key] = result_object[key]
            elif key[0].upper() == 'O' and len(key) < 4:
                reuse_options[key] = result_object[key]
            else:
                other_nodes[key] = result_object[key]
            all_nodes[key] = result_object[key]

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
                    # print(f'closest node is {node_key}')
            if len(node_list) > 0:
                ## add connection
                origin_node = node_list[-1]
                connection = [origin_node, closest_node]
                # origin_node_data = all_nodes[origin_node]
                # destination_node_data = all_nodes[closest_node]

                # connections["all_connections_list"].append(connection)

                ## ASSUME connections are bidirectional
                if origin_node in connections["all_connections"]:
                    connections["all_connections"][origin_node].append(closest_node)
                else:
                    connections["all_connections"][origin_node] = [closest_node]
                if closest_node in connections["all_connections"]:
                    connections["all_connections"][closest_node].append(origin_node)
                else:
                    connections["all_connections"][closest_node] = [origin_node]
                # try:
                #     connections[origin_node[0]][closest_node[0]].append(connection)
                # except:
                #     print(f'unable to add connection: {connection}')


            nodes.append({
                "name": closest_node,
                "incoming": True,
                "outgoing": True,
                "coordinates": arc_coordinates,
            })
            node_list.append(closest_node)
        arc['node_list'] = node_list
        arc['nodes'] = nodes

    data['all_nodes'] = all_nodes
    data['ProductionPads'] = production_pads
    data['CompletionsPads'] = completion_pads
    data['NetworkNodes'] = network_nodes
    data['SWDSites'] = disposal_sites
    data['TreatmentSites'] = treatment_sites
    data['StorageSites'] = storage_sites
    data['FreshwaterSources'] = freshwater_sources
    data['ReuseOptions'] = reuse_options
    data['other_nodes'] = other_nodes
    data['arcs'] = arcs
    data['connections'] = connections


    return data 


def WriteDataToExcel(data, output_file_name="kmz_scenario", template_location = None):
    if template_location is None:
        template_location = f'{os.path.dirname(os.path.abspath(__file__))}/assets/pareto_input_template.xlsx'

    # some defaults:
    treatment_technologies = {
        "CB": {"TreatmentOperationalCost": 0.2, "TreatmentEfficiency": 0.95, "RemovalEfficiency": 0, "DesalinationTechnologies": 0, "TreatmentExpansionCost": 75},
        "CB-EV": {"TreatmentOperationalCost": 0.3, "TreatmentEfficiency": 0.95, "RemovalEfficiency": 0, "DesalinationTechnologies": 0, "TreatmentExpansionCost": 100},
        "MVC": {"TreatmentOperationalCost": 0.5, "TreatmentEfficiency": 0.5, "RemovalEfficiency": 0.99, "DesalinationTechnologies": 1, "TreatmentExpansionCost": 1000},
        "MD": {"TreatmentOperationalCost": 1.0, "TreatmentEfficiency": 0.5, "RemovalEfficiency": 0.99, "DesalinationTechnologies": 1, "TreatmentExpansionCost": 500},
    }

    treatment_capacities = {
        "J0": {"TreatmentExpansionLeadTime": 0, "TreatmentCapacityIncrements": 0},
        "J1": {"TreatmentExpansionLeadTime": 68, "TreatmentCapacityIncrements": 10000},
        "J2": {"TreatmentExpansionLeadTime": 70, "TreatmentCapacityIncrements": 20000},
        "J3": {"TreatmentExpansionLeadTime": 72, "TreatmentCapacityIncrements": 50000},
    }

    pipeline_diameters = {
        "D0": {"PipelineCapacityIncrements": 0, "PipelineDiameterValues": 0, "PipelineExpansionLeadTime_Capac": 0},
        "D4": {"PipelineCapacityIncrements": 14286, "PipelineDiameterValues": 4, "PipelineExpansionLeadTime_Capac": 1},
        "D6": {"PipelineCapacityIncrements": 35714, "PipelineDiameterValues": 6, "PipelineExpansionLeadTime_Capac": 2},
        "D8": {"PipelineCapacityIncrements": 42857, "PipelineDiameterValues": 8, "PipelineExpansionLeadTime_Capac": None},
        "D12": {"PipelineCapacityIncrements": 50000, "PipelineDiameterValues": 12, "PipelineExpansionLeadTime_Capac": None},
    }

    storage_capacities = {
        "C0": {"StorageCapacityIncrements": 0, "StorageExpansionLeadTime": 0},
        "C1": {"StorageCapacityIncrements": 50000, "StorageExpansionLeadTime": 88},
        "C2": {"StorageCapacityIncrements": 100000, "StorageExpansionLeadTime": 89},
        "C3": {"StorageCapacityIncrements": 350000, "StorageExpansionLeadTime": 90},
    }

    injection_capacities = {
        "I0": {"DisposalCapacityIncrements": 0, "DisposalExpansionLeadTime": 0},
        "I1": {"DisposalCapacityIncrements": 7143, "DisposalExpansionLeadTime": 45},
        "I2": {"DisposalCapacityIncrements": 14286, "DisposalExpansionLeadTime": None},
        "I3": {"DisposalCapacityIncrements": 50000, "DisposalExpansionLeadTime": None},
    }

    defaults = {
        "TreatmentTechnologies": treatment_technologies,
        "TreatmentCapacities": treatment_capacities,
        "PipelineDiameters": pipeline_diameters,
        "StorageCapacities": storage_capacities,
        "InjectionCapacities": injection_capacities,
    }


    # input_path = "./assets/pareto_input_template.xlsx"
    excel_path = f'{output_file_name}.xlsx'
    print(f'writing data to excel at {excel_path}')

    ## step 1: copy pareto_input_template to new file for writing
    shutil.copyfile(template_location, excel_path)

    ## step 2: open excel workbook
    wb = load_workbook(excel_path, data_only=True)

    ## step 3: add nodes
    node_keys = [
        'ProductionPads', 'CompletionsPads', 'SWDSites', 'FreshwaterSources', 
        'StorageSites', 'TreatmentSites', 'NetworkNodes', "ReuseOptions"
    ]

    column = 1
    for node_key in node_keys:
        row = 2
        ws = wb[node_key]
        for node in data[node_key]:
            print(f'{node_key}: adding {node}')
            cellLocation = f'{get_column_letter(column)}{row}'
            ws[cellLocation] = node
            row+=1

    ## step 4: add arcs
    piped_arcs = {
        "PNA": ["ProductionPads", "NetworkNodes"],
        "CNA": ["CompletionsPads", "NetworkNodes"],
        "CCA": ["CompletionsPads", "CompletionsPads"],
        "NNA": ["NetworkNodes", "NetworkNodes"],
        "NCA": ["NetworkNodes", "CompletionsPads"],
        "NKA": ["NetworkNodes", "SWDSites"],
        "NRA": ["NetworkNodes", "TreatmentSites"],
        "NSA": ["NetworkNodes", "StorageSites"],
        "NOA": ["NetworkNodes", "ReuseOptions"],
        "SNA": ["StorageSites", "NetworkNodes"],
        "SOA": ["StorageSites", "ReuseOptions"],
        "FCA": ["FreshwaterSources", "CompletionsPads"],
        "RCA": ["TreatmentSites", "CompletionsPads"],
        "RSA": ["TreatmentSites", "StorageSites"],
        "SCA": ["StorageSites", "CompletionsPads"],
        "RNA": ["TreatmentSites", "NetworkNodes"],
        "ROA": ["TreatmentSites", "ReuseOptions"],
    }

    for piped_arc in piped_arcs: ## assume all connections on map are for pipes
        ws = wb[piped_arc]
        piped_arc_node1 = piped_arcs[piped_arc][0]
        piped_arc_node2 = piped_arcs[piped_arc][1]
        column = 1
        row = 3
        row_nodes = []
        if len(data[piped_arc_node1]) > 0 and len(data[piped_arc_node2]) > 0:
            print(f'{piped_arc}: adding {piped_arc_node1}')
            for node in data[piped_arc_node1]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                row_nodes.append(node)
                row+=1
            column = 2
            row = 2
            print(f'{piped_arc}: adding {piped_arc_node2}')
            for node in data[piped_arc_node2]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                # print('checking for connections')
                ind = 3
                for row_node in row_nodes:
                    if row_node in data["connections"]["all_connections"]:
                        if node in data["connections"]["all_connections"][row_node]:
                            # print(f'adding connection for {row_node}:{node}')
                            cellLocation = f'{get_column_letter(column)}{ind}'
                            # print(f'adding to cell location: {cellLocation}')
                            ws[cellLocation] = 1

                    ind+=1
                column+=1
        else:
            print(f'removing header for {piped_arc}')
            cellLocation = f'{get_column_letter(1)}{2}'
            ws[cellLocation] = None

    trucked_arcs = {
        "PCT": ["ProductionPads", "CompletionsPads"],
        "FCT": ["FreshwaterSources", "CompletionsPads"],
        "PKT": ["ProductionPads", "SWDSites"],
        "CKT": ["CompletionsPads", "SWDSites"],
        "CCT": ["CompletionsPads", "CompletionsPads"],
        "CST": ["CompletionsPads", "StorageSites"],
        "RST": ["TreatmentSites", "StorageSites"],
        "ROT": ["TreatmentSites", "ReuseOptions"],
        "SOT": ["StorageSites", "ReuseOptions"],
    }

    for trucked_arc in trucked_arcs:
        ws = wb[trucked_arc]
        trucked_arc_node1 = trucked_arcs[trucked_arc][0]
        trucked_arc_node2 = trucked_arcs[trucked_arc][1]
        column = 1
        row = 3
        if len(data[trucked_arc_node1]) > 0 and len(data[trucked_arc_node2]) > 0:
            print(f'{trucked_arc}: adding {trucked_arc_node1}')
            for node in data[trucked_arc_node1]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                row+=1
            column = 2
            row = 2
            print(f'{trucked_arc}: adding {trucked_arc_node2}')
            for node in data[trucked_arc_node2]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                ind = 3
                column+=1
        else:
            print(f'removing header for {trucked_arc}')
            cellLocation = f'{get_column_letter(1)}{2}'
            ws[cellLocation] = None

    ## step 5: add elevations:
    elevation_nodes = [
        'ProductionPads', 'CompletionsPads', 'SWDSites', 'FreshwaterSources', 
        'StorageSites', 'TreatmentSites', 'ReuseOptions', 'NetworkNodes'
    ]

    column = 1
    row = 3
    ws = wb["Elevation"]
    for node_key in elevation_nodes:
        for node in data[node_key]:
            print(f'{node_key}: adding {node} elevation')
            nodeCellLocation = f'{get_column_letter(column)}{row}'
            valueCellLocation = f'{get_column_letter(column+1)}{row}'
            ws[nodeCellLocation] = node
            try:
                ws[valueCellLocation] = float(data[node_key][node]['altitude'])
            except:
                print('unable to convert elevation to float. adding it as is')
                ws[valueCellLocation] = data[node_key][node]['altitude']
            row+=1

    ## step 6: add forecasts (with empty values)
    forecast_tabs = {
        "CompletionsDemand": ["CompletionsPads"],
        "PadRates": ["ProductionPads"],
        "FlowbackRates": ["CompletionsPads"],
        "WellPressure": ["ProductionPads", "CompletionsPads"],
        "ReuseMinimum": ["ReuseOptions"],
        "ReuseCapacity": ["ReuseOptions"],
        "FreshwaterSourcingAvailability": ["FreshwaterSources"],
        "DisposalOperatingCapacity": ["SWDSites"], ## AUTOFILL with ones?
    }

    column = 1
    for forecast_tab_key in forecast_tabs:
        ws = wb[forecast_tab_key]
        row = 3
        for node_key in forecast_tabs[forecast_tab_key]:
            print(f'{forecast_tab_key}: adding {node_key}')
            for node in data[node_key]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                row+=1

    ## step 7: add initial pipelines, capacities, ...
    initial_pipeline_tabs = {
        "InitialPipelineCapacity": [
            ["ProductionPads", "CompletionsPads", "NetworkNodes", "StorageSites", "FreshwaterSources", "TreatmentSites"], 
            ["NetworkNodes", "SWDSites", "TreatmentSites", "StorageSites", "ReuseOptions", "CompletionsPads"],
        ],
        "InitialPipelineDiameters": [
            ["ProductionPads", "CompletionsPads", "NetworkNodes", "StorageSites", "FreshwaterSources", "TreatmentSites"], 
            ["NetworkNodes", "SWDSites", "TreatmentSites", "StorageSites", "ReuseOptions", "CompletionsPads"],
        ],
        "PipelineOperationalCost": [
            ["ProductionPads", "CompletionsPads", "NetworkNodes", "StorageSites", "FreshwaterSources", "TreatmentSites"], 
            ["NetworkNodes", "SWDSites", "TreatmentSites", "StorageSites", "ReuseOptions", "CompletionsPads"],
        ],
        "PipelineExpansionDistance": [
            ["ProductionPads", "CompletionsPads", "NetworkNodes", "StorageSites", "FreshwaterSources", "TreatmentSites"], 
            ["NetworkNodes", "SWDSites", "TreatmentSites", "StorageSites", "ReuseOptions", "CompletionsPads"],
        ],
        "TruckingTime": [
            ["ProductionPads", "CompletionsPads"], 
            ["SWDSites"],
        ],
    }
    
    for initial_pipeline_tab in initial_pipeline_tabs:
        ws = wb[initial_pipeline_tab]

        # write row indexes
        column = 1
        row = 3
        node_keys = initial_pipeline_tabs[initial_pipeline_tab][0]
        for node_key in node_keys:
            print(f'{initial_pipeline_tab}: adding {node_key}')
            for node in data[node_key]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                row+=1
        
        # write column indexes
        node_keys = initial_pipeline_tabs[initial_pipeline_tab][1]
        column = 2
        row = 2
        for node_key in node_keys:
            print(f'{initial_pipeline_tab}: adding {node_key}')
            for node in data[node_key]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                column+=1

    initial_capacity_tabs = {
        "InitialDisposalCapacity": "SWDSites",
        "InitialStorageCapacity": "StorageSites",
        "CompletionsPadStorage": "CompletionsPads",
        "PadOffloadingCapacity": "CompletionsPads",
        "NodeCapacities": "NetworkNodes",
    }
    column = 1
    for initial_capacity_tab in initial_capacity_tabs:
        ws = wb[initial_capacity_tab]
        node_key = initial_capacity_tabs[initial_capacity_tab]
        row = 3
        print(f'{initial_capacity_tab}: adding {node_key}')
        for node in data[node_key]:
            cellLocation = f'{get_column_letter(column)}{row}'
            ws[cellLocation] = node
            row+=1

    single_value_tabs = {
        "DisposalOperationalCost": ["SWDSites"], ## AUTOFILL 0.35?
        "ReuseOperationalCost": ["CompletionsPads"], ## AUTOFILL 0?
        "FreshSourcingCost": ["FreshwaterSources"],
        "TruckingHourlyCost": ["ProductionPads", "CompletionsPads", "FreshwaterSources"],
        "DesalinationSites": ["TreatmentSites"], ## AUTOFILL 0's or 1's?
        "BeneficialReuseCredit": ["ReuseOptions"],
        "CompletionsPadOutsideSystem": ["CompletionsPads"],

    }

    column = 1
    for single_value_tab in single_value_tabs:
        ws = wb[single_value_tab]
        row = 3
        for node_key in single_value_tabs[single_value_tab]:
            print(f'{single_value_tab}: adding {node_key}')
            for node in data[node_key]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                row+=1

    water_quality_tabs = { ## AUTOFILL all these to ~150,000.00?
        "PadWaterQuality": ["ProductionPads", "CompletionsPads"],
        "StorageInitialWaterQuality": ["StorageSites"],
        "PadStorageInitialWaterQuality": ["CompletionsPads"],
    }

    column = 1
    for water_quality_tab in water_quality_tabs:
        ws = wb[water_quality_tab]
        row = 3
        for node_key in water_quality_tabs[water_quality_tab]:
            print(f'{water_quality_tab}: adding {node_key}')
            for node in data[node_key]:
                cellLocation = f'{get_column_letter(column)}{row}'
                ws[cellLocation] = node
                row+=1


    ## step 8: add tabs that rely on TreatmentTechnologies, Capacities, Diameters
    expansion_tabs = {
        "DisposalExpansionCost": {"node": "SWDSites", "default": "InjectionCapacities"},
        "StorageExpansionCost": {"node": "StorageSites", "default": "StorageCapacities"},
        "DisposalExpansionLeadTime": {"node": "SWDSites", "default": "InjectionCapacities"},
        "StorageExpansionLeadTime": {"node": "StorageSites", "default": "StorageCapacities"},
    }

    for expansion_tab in expansion_tabs:
        ws = wb[expansion_tab]
        node_key = expansion_tabs[expansion_tab]["node"]
        # add column headers
        column = 2
        for header in defaults[expansion_tabs[expansion_tab]["default"]]:
            columnHeaderCellLocation = f'{get_column_letter(column)}{2}'
            ws[columnHeaderCellLocation] = header
            column+=1
        row = 3
        print(f'{expansion_tab}: adding {node_key}')
        for node in data[node_key]:
            cellLocation = f'{get_column_letter(1)}{row}'
            ws[cellLocation] = node
            row+=1
    
    capacity_increments_tabs = {
        "DisposalCapacityIncrements": {"default": "InjectionCapacities"},
        "StorageCapacityIncrements": {"default": "StorageCapacities"},
        "PipelineDiameterValues": {"default": "PipelineDiameters"},
        "PipelineCapacityIncrements": {"default": "PipelineDiameters"},
        "DesalinationTechnologies": {"default": "TreatmentTechnologies"},
    }

    for capacity_increments_tab in capacity_increments_tabs:
        ws = wb[capacity_increments_tab]
        default_values = defaults[capacity_increments_tabs[capacity_increments_tab]["default"]]
        row = 3
        try:
            for each in default_values:
                print(f'{capacity_increments_tab}: adding {each}')
                keyCellLocation = f'{get_column_letter(1)}{row}'
                valueCellLocation = f'{get_column_letter(2)}{row}'
                ws[keyCellLocation] = each
                ws[valueCellLocation] = default_values[each][capacity_increments_tab]
                row+=1
        except Exception as e:
            print(f'unable to add {capacity_increments_tab}: {e}')

    capacity_increments_tabs = {
        "TreatmentCapacityIncrements": {"node": "SWDSites", "default": "TreatmentCapacities"},
    }

    for capacity_increments_tab in capacity_increments_tabs:
        ws = wb[capacity_increments_tab]
        node_key = capacity_increments_tabs[capacity_increments_tab]["node"]
        row = 3
        for tech in treatment_technologies:
            techCellLocation = f'{get_column_letter(1)}{row}'
            ws[techCellLocation] = tech
            default_values = defaults[capacity_increments_tabs[capacity_increments_tab]["default"]]
            column = 2
            for each in default_values:
                print(f'{capacity_increments_tab}: adding {each}')

                # add header
                headerCellLocation = f'{get_column_letter(column)}{2}'
                ws[headerCellLocation] = each

                valueCellLocation = f'{get_column_letter(column)}{row}'
                ws[valueCellLocation] = default_values[each][capacity_increments_tab]
                column+=1
            row+=1

    ## CODE TO GET TREATMENT TECHNOLOGIES. WE ARE DEFAULTING TO CB, CB-EV, MVC, and MD; so hard code those with corresponding values for now

    # treatment_technologies = []
    # ws = wb["TreatmentTechnologies"]
    # column = 1
    # row = 2
    # cellLocation = f'{get_column_letter(column)}{row}'
    # technology = ws[cellLocation].value
    # while technology is not None and technology != "" and row < 100: # just wanna make sure this doesnt get caught in an infinite loop
    #     print(f'adding technology: {technology}')
    #     treatment_technologies.append(technology)
    #     row += 1
    #     cellLocation = f'{get_column_letter(column)}{row}'
    #     technology = ws[cellLocation].value

    tabs = {
        "InitialTreatmentCapacity": "TreatmentSites"
    }
    
    for tab in tabs:
        ws = wb[tab]
        node_key = tabs[tab]
        # add column header
        column = 2
        for tech in treatment_technologies:
            columnHeaderCellLocation = f'{get_column_letter(column)}{2}'
            ws[columnHeaderCellLocation] = tech
            column+=1
        row = 3
        print(f'{tab}: adding {node_key}')
        for node in data[node_key]:
            cellLocation = f'{get_column_letter(1)}{row}'
            ws[cellLocation] = node
            row+=1
    
    tabs = {
        "TreatmentOperationalCost": "TreatmentSites",
        "TreatmentEfficiency": "TreatmentSites",
        "RemovalEfficiency": "TreatmentSites",
    }
    column = 2
    for tab in tabs:
        ws = wb[tab]
        node_key = tabs[tab]
        row = 3
        for technology in treatment_technologies:
            value = treatment_technologies[technology][tab]
            print(f'{tab}: adding {technology}')
            for node in data[node_key]:
                treatmentCellLocation = f'{get_column_letter(column-1)}{row}'
                technologyCellLocation = f'{get_column_letter(column)}{row}'
                valueCellLocation = f'{get_column_letter(column+1)}{row}'
                ws[treatmentCellLocation] = node
                ws[technologyCellLocation] = technology
                ws[valueCellLocation] = value
                row+=1

    tabs = {
        "TreatmentExpansionLeadTime": "TreatmentSites"
    }
    
    for tab in tabs:
        ws = wb[tab]
        node_key = tabs[tab]
        row = 3
        column = 3
        # add column header
        for cap in treatment_capacities:
            columnHeaderCellLocation = f'{get_column_letter(column)}{2}'
            ws[columnHeaderCellLocation] = cap
            column+=1
        for technology in treatment_technologies:
            print(f'{tab}: adding {technology}')
            for node in data[node_key]:
                treatmentCellLocation = f'{get_column_letter(1)}{row}'
                technologyCellLocation = f'{get_column_letter(2)}{row}'
                ws[treatmentCellLocation] = node
                ws[technologyCellLocation] = technology
                i = 3
                for treatmentCapacity in treatment_capacities:
                    value = treatment_capacities[treatmentCapacity][tab]
                    cellLocation = f'{get_column_letter(i)}{row}'
                    ws[cellLocation] = value
                    i+=1
                row+=1

    tabs = {
        "TreatmentExpansionCost": {"node": "TreatmentSites", "default": "TreatmentTechnologies"}
    }
    
    for tab in tabs:
        ws = wb[tab]
        node_key = tabs[tab]["node"]
        row = 3
        column = 3
        # add column headers
        for cap in treatment_capacities:
            columnHeaderCellLocation = f'{get_column_letter(column)}{2}'
            ws[columnHeaderCellLocation] = cap
            column+=1
        
        for default in defaults[tabs[tab]["default"]]:
            default_values = defaults[tabs[tab]["default"]][default]
            print(f'{tab}: adding {default}')
            for node in data[node_key]:
                treatmentCellLocation = f'{get_column_letter(1)}{row}'
                technologyCellLocation = f'{get_column_letter(2)}{row}'
                ws[treatmentCellLocation] = node
                ws[technologyCellLocation] = default
                i = 3
                value = default_values[tab]
                for treatmentCapacity in treatment_capacities:
                    valueCellLocation = f'{get_column_letter(i)}{row}'
                    ws[valueCellLocation] = value
                    i+=1
                row+=1


    tabs = {
        "PipelineCapexCapacityBased": {"node": "connections", "default": "PipelineDiameters"},
        "PipelineExpansionLeadTime_Capac": {"node": "connections", "default": "PipelineDiameters"},
    }
    for tab in tabs:
        ws = wb[tab]
        node_key = tabs[tab]["node"]
        row = 2
        column = 3
        default_values = defaults[tabs[tab]["default"]]
        # add column headers
        for each in default_values:
            cellLocation = f'{get_column_letter(column)}{row}'
            ws[cellLocation] = each
            column+=1
        row = 3
        for location in data[node_key]['all_connections']:
            for destination in data[node_key]['all_connections'][location]:
                print(f'{tab}: adding {location}:{destination} arc')
                locationCellLocation = f'{get_column_letter(1)}{row}'
                destinationCellLocation = f'{get_column_letter(2)}{row}'
                ws[locationCellLocation] = location
                ws[destinationCellLocation] = destination
                row+=1

    ## final step: Save and close
    wb.save(excel_path)
    wb.close()


# data = ParseKMZ(filename="Demo_network_correct.kmz")
# # print('got data')
# pp = pprint.PrettyPrinter(indent=1)
# pp.pprint(data['arcs'])
# WriteDataToExcel(data)
