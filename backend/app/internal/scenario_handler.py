import logging
import json
import io
import os
import datetime
from pareto.utilities.get_data import get_data

_log = logging.getLogger(__name__)
_h = logging.StreamHandler()
_h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
_log.addHandler(_h)
# for debugging, force level
_log.setLevel(logging.DEBUG)


class ScenarioHandler:
    def __init__(self) -> None:
        self.scenario_list = []
        self.pareto_data_path = "../data/pareto_data.json"
        self.scenarios_path = "../data/scenarios.json"
        self.excelsheets_path = "../data/excelsheets/"
        self.retrieve_scenarios()

    def retrieve_scenarios(self):
        _log.info(f"retrieving scenarios")
        try:
            with open(self.scenarios_path, 'r') as f:
                self.scenario_list = json.load(f)
        except:
            _log.info(f"no scenarios available")
        
    def update_scenario_list(self, updatedScenarios):
        _log.info(f"Updating scenario list")
        self.scenario_list = updatedScenarios.copy()

        # update scenarios json
        with open(self.scenarios_path, 'w') as f:
            json.dump(updatedScenarios,f, indent=4)
    
    def upload_excelsheet(self, output_path, filename):
        _log.info(f"Uploading excel sheet: {filename}")

        # get default set and parameter lists
        f = open(self.pareto_data_path,'r')
        data = json.load(f)
        set_list = data['set_list']
        parameter_list = data['parameter_list']
        f.close()

        # read in data from uploaded excel sheet
        [df_sets, _] = get_data(output_path, set_list, parameter_list)

        # create scenario object
        current_day = datetime.date.today()
        date = datetime.date.strftime(current_day, "%m/%d/%Y")
        return_object = {"name": filename, "id": len(self.scenario_list), "date": date,"data_input": df_sets, "optimization": {"objective":"reuse"}, "results": {}}
        for key in return_object['data_input']:
            return_object['data_input'][key] = return_object['data_input'][key].tolist()

        # update json containing scenarios
        self.scenario_list.append(return_object)
        with open(self.scenarios_path, 'w') as f:
            json.dump(self.scenario_list,f, indent=4)
        
        return return_object

    def delete_scenario(self, index):
        _log.info(f"Deleting scenario #{index}")

        # remove excel sheet
        excel_sheet = "{}{}.xlsx".format(self.excelsheets_path,index)
        os.remove(excel_sheet)
        for i in range(index+1, len(self.scenario_list)):
            previous_name = "{}{}.xlsx".format(self.excelsheets_path,i)
            new_name = "{}{}.xlsx".format(self.excelsheets_path,i-1)
            _log.info(f"Moving {previous_name} to {new_name}")
            os.rename(previous_name, new_name)
        
        # update scenario list
        del self.scenario_list[index]
        with open(self.scenarios_path, 'w') as f:
            json.dump(self.scenario_list,f, indent=4)

    def get_list(self):
        return self.scenario_list


scenario_handler = ScenarioHandler()
