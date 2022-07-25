import json
import os
import datetime

from pareto.strategic_water_management.strategic_produced_water_optimization import (
    create_model,
    Objectives,
    solve_model,
    PipelineCost,
    PipelineCapacity,
    IncludeNodeCapacity,
)
from pareto.utilities.get_data import get_data, set_consistency_check, od_matrix
from pareto.utilities.results import generate_report, PrintValues, OutputUnits, plot_sankey
from pareto.case_studies.toy_case_study import create_model as create_toy_model
from importlib import resources

def run_strategic_model(input_file = "../data/excelsheets/small_strategic_case_study.xlsx", output_file = "../data/outputs/model_output.xlsx", objective = 'reuse'):

    start_time = datetime.datetime.now()

    # import set and parameter lists
    print('importing json data')
    f = open('../data/pareto_data.json')
    data = json.load(f)
    set_list = data['set_list']
    parameter_list = data['parameter_list']
    f.close()

    print('getting data from excel sheet')
    [df_sets, df_parameters] = get_data(input_file, set_list, parameter_list)

    print('creating model')
    strategic_model = create_model(
        df_sets,
        df_parameters,
        default={
            "objective": Objectives[objective],
            "pipeline_cost": PipelineCost.distance_based,
            "pipeline_capacity": PipelineCapacity.input,
            "node_capacity": IncludeNodeCapacity.true,
        },
    )

    options = {
        "deactivate_slacks": True,
        "scale_model": True,
        "scaling_factor": 1000,
        "running_time": 60,
        "gap": 0,
        "water_quality": True,
    }

    print('solving model')
    solve_model(model=strategic_model, options=options)

    print("\nConverting to Output Units and Displaying Solution\n" + "-" * 60)
    """Valid values of parameters in the generate_report() call
    is_print: [PrintValues.detailed, PrintValues.nominal, PrintValues.essential]
    output_units: [OutputUnits.user_units, OutputUnits.unscaled_model_units]
    """
    [model, results_dict] = generate_report(
        strategic_model,
        is_print=[PrintValues.essential],
        output_units=OutputUnits.unscaled_model_units,
        fname=output_file,
    )

    # This shows how to read data from PARETO reports
    # set_list = []
    # parameter_list = ["v_F_Trucked", "v_C_Trucked"]
    # fname = output_file
    # [sets_reports, parameters_report] = get_data(fname, set_list, parameter_list)
    
    total_time = datetime.datetime.now() - start_time
    print('total process took {} seconds'.format(total_time.seconds))

    return results_dict