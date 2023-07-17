import json
import os
import time
import datetime
import logging
from pareto.strategic_water_management.strategic_produced_water_optimization import (
    create_model,
    Objectives,
    solve_model,
    PipelineCost,
    PipelineCapacity,
    WaterQuality
)
from pyomo.opt import TerminationCondition
from pareto.utilities.get_data import get_data
from pareto.utilities.results import generate_report, PrintValues, OutputUnits, is_feasible, nostdout
import idaes.logger as idaeslog

from app.internal.get_data import get_input_lists
from app.internal.scenario_handler import (
    scenario_handler,
)


# _log = idaeslog.getLogger(__name__)
_log = logging.getLogger(__name__)

## this code will be in PARETO repo eventually
from pyomo.environ import Var, Binary, units as pyunits
def fix_vars(model, vars_to_fix, indexes, v_val, upper_bound=None, lower_bound=None, fixvar=True):
    _log.info('inside fix vars')
    for var in model.component_objects(Var):
        if var.name in vars_to_fix:
            _log.info("\nFixing this variable")
            _log.info(var)
            for index in var:
                if index == indexes:
                    if fixvar is True:
                        if var[index].domain is Binary:
                            var[index].fix(v_val)
                        else:
                            v_val = pyunits.convert_value(
                                                v_val,
                                                from_units=model.user_units["volume_time"],
                                                to_units=model.model_units["volume_time"],
                                            )
                            var[index].fix(v_val)
                    else:
                        #TODO check units
                        var[index].setlb(lower_bound)
                        var[index].setub(upper_bound)
                else:
                    pass
            else:
                pass
        else:
            continue
##


def run_strategic_model(input_file, output_file, id, modelParameters, overrideValues={}):
    start_time = datetime.datetime.now()

    [set_list, parameter_list] = get_input_lists()
    
    _log.info(f"getting data from excel sheet")
    [df_sets, df_parameters] = get_data(input_file, set_list, parameter_list)

    _log.info(f"creating model")
    strategic_model = create_model(
        df_sets,
        df_parameters,
        default={
            "objective": Objectives[modelParameters["objective"]],
            "pipeline_cost": PipelineCost[modelParameters["pipelineCost"]],
            "pipeline_capacity": PipelineCapacity.input,
            "node_capacity": True,
            "water_quality": WaterQuality[modelParameters["waterQuality"]],
            # "build_units": BuildUnits[modelParameters["build_units"]]
        },
    )
    
    scenario = scenario_handler.get_scenario(int(id))
    results = {"data": {}, "status": "Solving model"}
    scenario["results"] = results
    scenario_handler.update_scenario(scenario)
    try:
        optimality_gap = int(modelParameters["optimalityGap"])/100
    except:
        optimality_gap = 0
    _log.info(f'optimality gap is {optimality_gap}')
    options = {
        "deactivate_slacks": True,
        "scale_model": modelParameters["scale_model"],
        "scaling_factor": 1000,
        "running_time": modelParameters["runtime"],
        "gap": optimality_gap,
        "solver": modelParameters["solver"]
    }

    if options["solver"] not in ["cbc", "gurobi", "gurobi_direct"]:
        _log.info('deleting solver as it doesnt match any of the proper solver names')
        del options["solver"]

    _log.info(f"solving model with options: {options}")

    # check for any override values and fix those variables in the model before running solve
    _log.info(f"checking for override values: ")
    # _log.info(overrideValues)
    for variable in overrideValues:
        if len(overrideValues[variable]) > 0:
            for idx in overrideValues[variable]:
                override_object = overrideValues[variable][idx]
                _log.info(f"overriding {override_object['variable'].replace('_dict','')} with indexes {override_object['indexes']} and value {override_object['value']}")
                fix_vars(
                    model=strategic_model, 
                    vars_to_fix=[override_object['variable'].replace('_dict','')], 
                    indexes=tuple(override_object['indexes']), 
                    v_val=float(override_object['value'])
                )


    model_results = solve_model(model=strategic_model, options=options)
    with nostdout():
        feasibility_status = is_feasible(strategic_model)

    if not feasibility_status:
        _log.error(f"feasibility status check failed, setting termination condition to infeasible")
        termination_condition = "infeasible"
    else:
        print("\nModel results validated and found to pass feasibility tests\n" + "-" * 60)
        termination_condition = model_results.solver.termination_condition


    scenario = scenario_handler.get_scenario(int(id))
    results = {"data": {}, "status": "Generating output", "terminationCondition": termination_condition}
    scenario["results"] = results

    ## RESET override_values
    ## ADD them to a different key 
    scenario['override_values'] = {
                    "vb_y_overview_dict": {},
                    "v_F_Piped_dict": {},
                    "v_F_Sourced_dict": {},
                    "v_F_Trucked_dict": {},
                    "v_L_Storage_dict": {},
                    "v_L_PadStorage_dict": {},
                    "vb_y_Pipeline_dict": {},
                    "vb_y_Disposal_dict": {},
                    "vb_y_Storage_dict": {},
                    "vb_y_Treatment_dict": {}
                }
    scenario['optimized_override_values'] = overrideValues

    scenario_handler.update_scenario(scenario)

    print("\nConverting to Output Units and Displaying Solution\n" + "-" * 60)
    """Valid values of parameters in the generate_report() call
    is_print: [PrintValues.detailed, PrintValues.nominal, PrintValues.essential]
    output_units: [OutputUnits.user_units, OutputUnits.unscaled_model_units]
    """
    [model, results_dict] = generate_report(
        strategic_model,
        results_obj=model_results,
        # is_print=[PrintValues.essential],
        output_units=OutputUnits.user_units,
        fname=output_file,
    )

    total_time = datetime.datetime.now() - start_time
    _log.info(f"total process took {total_time.seconds} seconds")

    return results_dict

OVERRIDE_PRESET_VALUES = {
  "vb_y_Pipeline_dict": {
      "row_name": "Pipeline Construction",
      "input_table": "PipelineDiameterValues",
      "indexes": [1, 2],
      "unit": "in",
  },
  "vb_y_Storage_dict": {
      "row_name": "Storage Facility",
      "input_table": "StorageCapacityIncrements",
      "indexes": [1],
      "unit": "bbl",
  },
  "vb_y_Disposal_dict": {
      "row_name": "Disposal Facility",
      "input_table": "TreatmentCapacityIncrements",
      "indexes": [1],
      "unit": "bbl/d",
  },
  "vb_y_Treatment_dict": {
      "row_name": "Treatment Facility",
      "input_table": "TreatmentCapacityIncrements",
      "indexes": [1,5],
      "unit": "bbl/d",
  },
}

def handle_run_strategic_model(input_file, output_file, id, modelParameters, overrideValues={}):
    try:
        results_dict = run_strategic_model(input_file, output_file, id, modelParameters, overrideValues)
        _log.info(f'successfully ran model for id #{id}, updating scenarios')
        scenario = scenario_handler.get_scenario(int(id))
        results = scenario["results"]
        results['data'] = results_dict


        #ONLY DESIGNED FOR INFRASTRUCTURE BUILDOUT
        overrideValues = scenario['optimized_override_values']
        try:
            for variable in overrideValues:
                if len(overrideValues[variable]) > 0:
                    for idx in overrideValues[variable]:
                        override_object = overrideValues[variable][idx]
                        variable = override_object['variable']
                        indexes = override_object['indexes']
                        value = override_object['value']

                        # if value is from infrastructure buildout
                        row_name = OVERRIDE_PRESET_VALUES[variable]['row_name']
                        unit = OVERRIDE_PRESET_VALUES[variable]['unit']
                        indexes_idx = 0
                        new_row = [row_name, '--', '--', '', unit, '--']
                        for row_idx in OVERRIDE_PRESET_VALUES[variable]['indexes']:
                            new_row[row_idx] = indexes[indexes_idx]
                            indexes_idx += 1
                        new_row[3] = indexes[indexes_idx]
                        _log.info('new row')
                        _log.info(new_row)
                        new_table_idx = len(results['data']["vb_y_overview_dict"])
                        results['data']["vb_y_overview_dict"].append(tuple(new_row))

                        #else if from another table

        except Exception as e:
            _log.error('unable to add infrastructure rows back in')
        


        if results['terminationCondition'] == "infeasible":
            results['status'] = 'Infeasible'
        else:
            results['status'] = 'Optimized'
        scenario["results"] = results
        scenario_handler.update_scenario(scenario)
        scenario_handler.check_for_diagram(id)
    except Exception as e:
        _log.error(f"unable to run strategic model: {e}")
        time.sleep(2)
        scenario = scenario_handler.get_scenario(int(id))
        results = {"data": {}, "status": "failure", "error": str(e)}
        scenario["results"] = results
        scenario_handler.update_scenario(scenario)
    try:
        _log.info(f'removing id {id} from background tasks')
        scenario_handler.remove_background_task(id)
    except Exception as e:
        _log.error(f"unable to remove id {id} from background tasks: {e}")
