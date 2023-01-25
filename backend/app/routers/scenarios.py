import io
import os
import aiofiles
from fastapi import Body, Request, APIRouter, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse

import logging
import idaes.logger as idaeslog

from app.internal.pareto_stategic_model import run_strategic_model, handle_run_strategic_model
from app.internal.scenario_handler import (
    scenario_handler,
)

# _log = idaeslog.getLogger(__name__)
_log = logging.getLogger(__name__)

router = APIRouter(
    prefix="",
    tags=["scenarios"],
    responses={404: {"description": "Scenario not found"}},
)

@router.get("/get_scenario_list")
async def get_scenario_list():
    """
    Get basic information about all saved scenarios.
    """
    scenarios = scenario_handler.get_list()
    return {'data' : scenarios}

@router.post("/update")
async def update(request: Request):
    """Update a given scenario.

    Args:
        request.json()['updatedScenario']: Scenario to be updated

    Returns:
        Updated scenario
    """
    data = await request.json()
    updated_scenario = data['updatedScenario']
    scenario_handler.update_scenario(updated_scenario)

    return {"data": updated_scenario}

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Upload an excel sheet and create corresponding scenario.

    Args:
        file: excel sheet to be uploaded

    Returns:
        New scenario data
    """
    new_id = scenario_handler.get_next_id()
    output_path = "{}/{}.xlsx".format(scenario_handler.excelsheets_path,new_id)

    try:
    # get file contents
        async with aiofiles.open(output_path, 'wb') as out_file:
            content = await file.read()  # async read
            await out_file.write(content) 
        return scenario_handler.upload_excelsheet(output_path=output_path, filename=file.filename, id=new_id)

    except Exception as e:
        _log.error(f"error on file upload: {str(e)}")
        raise HTTPException(400, detail=f"File upload failed: {e}")

@router.post("/delete_scenario")
async def delete_scenario(request: Request):
    """Delete a given scenario.

    Args:
        request.json()['id']: id of scenario to be deleted

    Returns:
        List of remaining scenarios
    """
    data = await request.json()
    
    scenario_handler.delete_scenario(data['id'])

    return {'data' : scenario_handler.get_list()}
    
@router.post("/run_model")
async def run_model(request: Request, background_tasks: BackgroundTasks):
    """Runs strategic model for given scenario.
        The optimization of the model is added as a background task
        and run asynchronously.

    Args:
        request.json()['scenario']: scenario to be optimized

    Returns:
        Given scenario with updated status
    """
    data = await request.json()
    _log.info(f"running model on : \n{data['scenario']['id']}")
    try:
        excel_path = "{}/{}.xlsx".format(scenario_handler.excelsheets_path,data['scenario']['id'])
        output_path = "{}/{}.xlsx".format(scenario_handler.outputs_path,data['scenario']['id'])
        modelParameters = {
            "objective": data['scenario']['optimization']['objective'],
            "runtime": data['scenario']['optimization']['runtime'],
            "pipelineCost": data['scenario']['optimization']['pipelineCostCalculation'],
            "waterQuality": data['scenario']['optimization']['waterQuality']
        }
        defaultParams = {'solver': None, 'build_units': 'user_units', 'optimalityGap': 0, 'scale_model': True}
        for param in ['solver', 'build_units', 'optimalityGap', 'scale_model']:
            try:
                modelParameters[param]=data['scenario']['optimization'][param]
            except:
                _log.error(f'unable to find {param}, using {defaultParams[param]}')
                modelParameters[param]=defaultParams[param]

        # modelParameters = {
        #     "objective": data['scenario']['optimization']['objective'],
        #     "runtime": data['scenario']['optimization']['runtime'],
        #     "pipelineCost": data['scenario']['optimization']['pipelineCostCalculation'],
        #     "waterQuality": data['scenario']['optimization']['waterQuality'],
        #     "solver": solver,
        #     "build_units": build_units,
        #     "optimalityGap": optimalityGap,
        #     "scale_model": scale_model
        # }

        _log.info(f"modelParameters: {modelParameters}")

        background_tasks.add_task(
            handle_run_strategic_model, 
            input_file=excel_path,
            output_file=output_path,
            id=data['scenario']['id'],
            modelParameters=modelParameters
        )
        
        # add id to scenario handler task list to keep track of running tasks
        scenario_handler.add_background_task(data['scenario']['id'])
        scenario = data['scenario']
        results = {"data": {}, "status": "Initializing"}
        scenario["results"] = results
        scenario_handler.update_scenario(scenario)
    except Exception as e:
        _log.error(f"unable to find and run given excel sheet id{data['scenario']['id']}: {e}")
        raise HTTPException(
            500, f"unable to find and run given excel sheet id: {data['scenario']['id']}: {e}"
        )
    return scenario

@router.get("/get_plots/{scenario_id}")
async def get_plots(scenario_id: int):
    """Get completions demand plot

    Args:
        scenario_id: scenario id for given completions demand plot

    Returns:
        Raw html of completions demand plot
    """
    return scenario_handler.get_plots(scenario_id)

@router.get("/check_tasks")
async def check_tasks():
    """Get list of currently running background tasks

    Returns:
        List of scenario ids that are currently being optimized. 
    """
    return {'tasks' : scenario_handler.get_background_tasks()}

@router.get("/copy/{scenario_id}")
async def copy(scenario_id: int):
    """Create a copy of scenario for given scenario id

    Args:
        scenario_id: scenario id for given completions demand plot

    Returns:
        Newly created scenario. 
    """
    scenarios, new_id = scenario_handler.copy_scenario(scenario_id)
    return {"scenarios": scenarios, "new_id": new_id}

@router.post("/update_excel")
async def update_excel(request: Request):
    """Update excel sheet for given scenario and accompanying table.

    Args:
        request.json()['id']: scenario id to be updated
        request.json()['tableKey']: key for table to be updated inside scenario
        request.json()['updatedTable']: dictionary containing updated values

    Returns:
        Given scenario with updated status
    """
    data = await request.json()
    try:
        return scenario_handler.update_excel(data['id'], data['tableKey'], data['updatedTable'])
        
    except Exception as e:
        _log.error(f"unable to find and run given excel sheet id{data['id']}: {e}")
        raise HTTPException(
            500, f"unable to find and run given excel sheet id: {data['id']}: {e}"
        )
    
@router.get("/get_diagram/{diagram_type}/{id}")
async def get_diagram(diagram_type: str, id: int):
    """Fetch network diagram

    Args:
        id: scenario id

    Returns:
        Network diagram
    """
    data = scenario_handler.get_diagram(diagram_type, id)
    return {"data":data}
    # return StreamingResponse(io.BytesIO(data), media_type=f"image/{diagramFileType}")

@router.post("/upload_diagram/{diagram_type}/{id}")
async def upload_diagram(diagram_type: str, id: int, file: UploadFile = File(...)):
    """Upload a network diagram.

    Args:
        file: diagram to be uploaded

    Returns:
        New scenario data
    """
    diagram_extension = file.filename.split('.')[-1]
    if diagram_type == "input":
        output_path = f"{scenario_handler.input_diagrams_path}/{id}.{diagram_extension}"
    elif diagram_type == "output":
        output_path = f"{scenario_handler.output_diagrams_path}/{id}.{diagram_extension}"
    try:
    # get file contents
        async with aiofiles.open(output_path, 'wb') as out_file:
            content = await file.read()  # async read
            await out_file.write(content) 
        return scenario_handler.upload_diagram(output_path=output_path, id=id, diagram_type=diagram_type)

    except Exception as e:
        _log.error(f"error on file upload: {str(e)}")
        raise HTTPException(400, detail=f"File upload failed: {e}")

@router.get("/delete_diagram/{diagram_type}/{id}")
async def delete_diagram(diagram_type: str, id: int):
    """Delete network diagram

    Args:
        id: scenario id

    Returns:
        Scenario
    """
    data = scenario_handler.delete_diagram(diagram_type, id)
    return {"data":data}