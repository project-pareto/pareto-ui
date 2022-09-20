import logging
import json
import io
import os
import datetime
import math
from pathlib import Path
from .get_data import get_data, get_input_lists

_log = logging.getLogger(__name__)
_h = logging.StreamHandler()
_h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
_log.addHandler(_h)
# for debugging, force level
_log.setLevel(logging.DEBUG)


class ScenarioHandler:
    def __init__(self) -> None:

        _log.info(f"initializing scenario handler")
        self.scenario_list = []
        self.data_directory_path = Path.home() / ".pareto-ui"
        self.pareto_data_path = os.path.join(self.data_directory_path, "pareto_data.json")
        self.scenarios_path = os.path.join(self.data_directory_path, "scenarios.json")
        self.excelsheets_path = self.data_directory_path / "excelsheets"
        self.outputs_path = self.data_directory_path / "outputs"

        _log.info(f"app directory: {os.path.dirname(os.path.abspath(__file__))}")
        _log.info(f"currently operating in directory: {os.getcwd()}")
        try:
            _log.info(f"changing to home directroy")
            home_dir = Path.home()
            _log.info(f"new directory: {home_dir}")
            os.chdir(home_dir)
        except Exception as e:
            _log.info(f"unable to change to app directroy: {e}")

        # create data directories
        _log.info(f"making directory: {self.data_directory_path}")
        self.data_directory_path.mkdir(parents=True, exist_ok=True)

        _log.info(f"making directory: {self.excelsheets_path}")
        self.excelsheets_path.mkdir(parents=True, exist_ok=True)

        _log.info(f"making directory: {self.outputs_path}")
        self.outputs_path.mkdir(parents=True, exist_ok=True)

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

        [set_list, parameter_list] = get_input_lists()

        # read in data from uploaded excel sheet
        [df_sets, df_parameters, frontend_parameters] = get_data(output_path, set_list, parameter_list)
        del frontend_parameters['Units']

        # convert tuple keys into dictionary values - necessary for javascript interpretation
        for key in df_parameters:
            original_value = df_parameters[key]
            new_value=[]
            for k, v in original_value.items():
                try:
                    if math.isnan(v):
                        new_value.append({'key':k, 'value': ''})
                    else:
                        new_value.append({'key':k, 'value': v})
                except:
                    new_value.append({'key':k, 'value': v})
            df_parameters[key] = new_value

        # convert pandas series into lists
        for key in df_sets:
            df_sets[key] = df_sets[key].tolist()

        # create scenario object
        current_day = datetime.date.today()
        date = datetime.date.strftime(current_day, "%m/%d/%Y")
        return_object = {"name": filename, "id": len(self.scenario_list), "date": date,"data_input": {"df_sets": df_sets, "df_parameters": frontend_parameters}, "optimization": {"objective":"reuse"}, "results": {}}

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
