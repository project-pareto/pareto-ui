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
import xml.sax, xml.sax.handler
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter
from .util import determineArcsAndConnections

# pandas: geoparse
def ParseKMZ(filename):
    global NODE_NAMES
    NODE_NAMES = set()

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
            # result_object[key]["node_type"] = "point"
            result_object[key]["coordinates"] = result_object[key]["coordinates"][0]
            ## determine what kind of node it is:
            if key[0:2].upper() == 'PP':
                result_object[key]["node_type"] = "ProductionPad"
                production_pads[key] = result_object[key]
            elif key[0:2].upper() == 'CP':
                result_object[key]["node_type"] = "CompletionsPad"
                completion_pads[key] = result_object[key]
            elif key[0].upper() == 'N':
                result_object[key]["node_type"] = "NetworkNode"
                network_nodes[key] = result_object[key]
            elif key[0].upper() == 'K':
                result_object[key]["node_type"] = "DisposalSite"
                disposal_sites[key] = result_object[key]
            elif key[0].upper() == 'R':
                result_object[key]["node_type"] = "TreatmentSite"
                treatment_sites[key] = result_object[key]
                storage_site_key = key.replace('R','S').replace('r','S')
                storage_sites[storage_site_key] = result_object[key]
                connections["all_connections"][key] = [storage_site_key]
                connections["all_connections"][storage_site_key] = [key]
            elif key[0].upper() == 'S' and len(key) < 4:
                result_object[key]["node_type"] = "StorageSite"
                storage_sites[key] = result_object[key]
            elif key[0].upper() == 'F':
                result_object[key]["node_type"] = "NetworkNode"
                freshwater_sources[key] = result_object[key]
            elif key[0].upper() == 'O' and len(key) < 4:
                result_object[key]["node_type"] = "ReuseOption"
                reuse_options[key] = result_object[key]
            else:
                result_object[key]["node_type"] = "NetworkNode"
                other_nodes[key] = result_object[key]
            all_nodes[key] = result_object[key]

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
    data['connections'] = connections
    data['arcs'] = arcs


    data = determineArcsAndConnections(data)

    return data 