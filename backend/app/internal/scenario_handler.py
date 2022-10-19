import logging
import json
import io
import os
import datetime
import math
from pathlib import Path
from xml.etree.ElementTree import VERSION
import tinydb
from tinydb import where
from fastapi import HTTPException

import idaes.logger as idaeslog

from pareto.utilities.results import plot_bars

from app.internal.get_data import get_data, get_input_lists
from app.internal.settings import AppSettings

# _log = idaeslog.getLogger(__name__)
_log = logging.getLogger(__name__)

class ScenarioHandler:
    """Manage the saved scenarios."""

    SCENARIO_DB_FILE = "scenarios.json"
    VERSION = 2
    LOCKED = False

    def __init__(self, **kwargs) -> None:

        _log.info(f"initializing scenario handler")
        self.app_settings = AppSettings(**kwargs)

        self.scenario_list = {}
        self.next_id = 0
        self.background_tasks = []
        self.data_directory_path = self.app_settings.data_basedir
        self.scenarios_path = os.path.join(self.data_directory_path, self.SCENARIO_DB_FILE)
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

        # Connect to DB
        path = self.scenarios_path
        self._db = tinydb.TinyDB(path)

        self.retrieve_scenarios()

    def retrieve_scenarios(self):
        _log.info(f"retrieving scenarios")
        # check if db is in use. if so, wait til its done being used
        locked = self.LOCKED
        while(locked):
            locked = self.LOCKED
        self.LOCKED = True
        query = tinydb.Query()
        scenarios = self._db.search((query.id_ != None) & (query.version == self.VERSION))
        scenario_list = {}
        _log.info(f'found {len(scenarios)} scenarios')
        if len(scenarios) > 0:
            for each in scenarios:
                scenario_list[each["id_"]] =  each['scenario']
            self.scenario_list=scenario_list
        else:
            self.scenario_list={}
            
        try:
            _log.info(f"searching for next id")
            next_id_list = self._db.search((query.next_id != None) & (query.version == self.VERSION))
            if len(next_id_list) > 0:
                self.next_id = next_id_list[0]['next_id']
            else:
                _log.info(f"setting next id in tinydb")
                self._db.insert({"next_id": self.next_id, "version": self.VERSION})
            _log.info(f"next_id is {self.next_id}")
        except Exception as e:
            _log.info(f"unable to find next id: {e}")
            _log.info(f"setting next id in tinydb")
            self._db.insert({"next_id": self.next_id, "version": self.VERSION})
        self.LOCKED = False
        
    def update_scenario(self, updatedScenario):
        _log.info(f"Updating scenario list")

        # check if db is in use. if so, wait til its done being used
        locked = self.LOCKED
        while(locked):
            locked = self.LOCKED
        self.LOCKED = True
        query = tinydb.Query()
        self._db.upsert(
            {"scenario": updatedScenario, 'id_': updatedScenario['id'], 'version': self.VERSION},
            ((query.id_ == updatedScenario['id']) & (query.version == self.VERSION)),
        )

        self.LOCKED = False

        self.retrieve_scenarios()
    
    def upload_excelsheet(self, output_path, filename, id):
        _log.info(f"Uploading excel sheet: {filename}")

        [set_list, parameter_list] = get_input_lists()

        # read in data from uploaded excel sheet
        [df_sets, df_parameters, frontend_parameters] = get_data(output_path, set_list, parameter_list)
        del frontend_parameters['Units']

        # create plots
        plots = [
            {   'title': 'Completion Pad Demand', 
                'paramaterName': 'CompletionsDemand', 
                'labels': [("Completion Pad", "Time", "Demand Water (bbl/Day)")]
            },
            {   'title': 'Production Forecast', 
                'paramaterName': 'PadRates', 
                'labels': [("PW Production Forecast", "Time", "Demand Water (bbl/Day)")]
            },
            {   'title': 'Flowback Forecast', 
                'paramaterName': 'FlowbackRates', 
                'labels': [("PW Flowback Forecast", "Time", "Demand Water (bbl/Day)")]
            },
            ]
        for plot in plots:
            output_file = f"{self.outputs_path}/{id}_{plot['paramaterName']}_plot.html"
            _log.info(f'output file for plot is: {output_file}')
            try:
                parameterName = plot['paramaterName']
                args = {"plot_title": plot['title'],
                "output_file": output_file,
                "print_data": False}
                input_data = {"pareto_var": df_parameters[parameterName],
                            "labels": plot["labels"]
                            }
                _log.info(f'plotting bars to {output_file}')
                plot_bars(input_data, args)
            except Exception as e:
                _log.error(f'unable to create completions demand plot: {e}')

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
        return_object = {
            "name": filename, 
            "id": self.next_id, 
            "date": date,
            "data_input": {"df_sets": df_sets, "df_parameters": frontend_parameters}, 
            "optimization": {"objective":"cost", "runtime": 180, "pipelineCostCalculation": "distance_based", "waterQuality": "false"}, 
            "results": {"status": "none", "data": {}}
            }

        # check if db is in use. if so, wait til its done being used
        locked = self.LOCKED
        while(locked):
            locked = self.LOCKED
        self.LOCKED = True
        query = tinydb.Query()
        self._db.insert({'id_': self.next_id, "scenario": return_object, 'version': self.VERSION})
        self._db.upsert(
            {"next_id": self.next_id+1, 'version': self.VERSION},
            ((query.next_id == self.next_id) & (query.version == self.VERSION)),
        )
        self.LOCKED = False
        self.retrieve_scenarios()
        
        return return_object

    def delete_scenario(self, index):
        _log.info(f"Deleting scenario #{index}")
        # check if db is in use. if so, wait til its done being used
        locked = self.LOCKED
        while(locked):
            locked = self.LOCKED
        self.LOCKED = True
        try:
            index = int(index)
            query = tinydb.Query()
            self._db.remove((query.id_ == index) & (query.version == self.VERSION))
            self.LOCKED = False

            # remove input excel sheet
            excel_sheet = "{}/{}.xlsx".format(self.excelsheets_path,index)
            os.remove(excel_sheet)
        except Exception as e:
            _log.error(f"unable to delete scenario #{index}: {e}")

        # remove output excel sheet
        try:
            excel_sheet = "{}/{}.xlsx".format(self.outputs_path,index)
            os.remove(excel_sheet)
        except Exception as e:
            _log.error(f"unable to remove output for #{index}: {e}")

        # remove completions demand plot
        try:
            plot_file = "{}/{}_plot.html".format(self.outputs_path,index)
            os.remove(plot_file)
        except Exception as e:
            _log.error(f"unable to delete completions demand plot for #{index}: {e}")

        # update scenario list
        self.retrieve_scenarios()

    def get_scenario(self, id):
        try:
            # check if db is in use. if so, wait til its done being used
            locked = self.LOCKED
            while(locked):
                locked = self.LOCKED
            self.LOCKED = True
            query = tinydb.Query()
            scenario = self._db.search((query.id_ == id) & (query.version == self.VERSION))
            self.LOCKED = False
            return scenario[0]['scenario']
        except Exception as e:
            _log.error(f'unable to get scenario with id {id}: {e}')
            return {'error': f'unable to get scenario with id {id}: {e}'}

    def get_plots(self, id):
        return_object = {}
        plot_files = {
            'CompletionsDemand': 'Completion Pad Demand', 
            "PadRates": "Production Forecast", 
            "FlowbackRates": "Flowback Forecast"
        }
        for each in plot_files:
            try:
                key = plot_files[each]
                plot_file = f"{self.outputs_path}/{id}_{each}_plot.html"
                with open(plot_file, 'r') as f:
                    plot_html = f.read()
                    return_object[key] = plot_html
            except Exception as e:
                _log.error(f"unable to get plot for id{id}: {e}")
                raise HTTPException(
                    500, f"unable to find plot: {e}"
                )
        return return_object

    def add_background_task(self, id):
        self.background_tasks.append(id)
        return self.background_tasks

    def remove_background_task(self, id):
        if id in self.background_tasks: 
            self.background_tasks.remove(id)
        else:
            _log.error(f'id #{id} is not in background tasks list')
        return self.background_tasks

    def get_list(self):
        return self.scenario_list

    def get_next_id(self):
        nextid = self.next_id
        return nextid
    
    def get_background_tasks(self):
        return self.background_tasks


scenario_handler = ScenarioHandler()
