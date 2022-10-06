import json
import os
import datetime
import logging
from pareto.strategic_water_management.strategic_produced_water_optimization import (
    create_model,
    Objectives,
    solve_model,
    PipelineCost,
    PipelineCapacity,
    IncludeNodeCapacity,
)
# from .get_data import get_data
from pareto.utilities.get_data import get_data
from pareto.utilities.results import generate_report, PrintValues, OutputUnits
from app.internal.get_data import get_input_lists
import idaes.logger as idaeslog

_log = idaeslog.getLogger(__name__)


def run_strategic_model(input_file, output_file = "ParetoUI_Data/outputs/PARETO_report.xlsx", objective = 'reuse'):
    start_time = datetime.datetime.now()

    [set_list, parameter_list] = get_input_lists()

    _log.info(f"getting data from excel sheet")
    [df_sets, df_parameters] = get_data(input_file, set_list, parameter_list)

    _log.info(f"creating model")
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

    _log.info(f"solving model")
    solve_model(model=strategic_model, options=options)

    print("\nConverting to Output Units and Displaying Solution\n" + "-" * 60)
    """Valid values of parameters in the generate_report() call
    is_print: [PrintValues.detailed, PrintValues.nominal, PrintValues.essential]
    output_units: [OutputUnits.user_units, OutputUnits.unscaled_model_units]
    """
    [model, results_dict] = generate_report(
        strategic_model,
        is_print=[PrintValues.essential],
        output_units=OutputUnits.user_units,
        fname=output_file,
    )

    # This shows how to read data from PARETO reports
    # set_list = []
    # parameter_list = ["v_F_Trucked", "v_C_Trucked"]
    # fname = output_file
    # [sets_reports, parameters_report] = get_data(fname, set_list, parameter_list)
    
    total_time = datetime.datetime.now() - start_time
    _log.info(f"total process took {total_time.seconds} seconds")

    return results_dict