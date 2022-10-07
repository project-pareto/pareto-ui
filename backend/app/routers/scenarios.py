import io
import os
# import aiofiles
from fastapi import Body, Request, APIRouter, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse

import logging
import idaes.logger as idaeslog

import app.internal.aiofiles as aiofiles
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

    # get file contents
    async with aiofiles.open(output_path, 'wb') as out_file:
        content = await file.read()  # async read
        await out_file.write(content) 
    try:
        return scenario_handler.upload_excelsheet(output_path=output_path, filename=file.filename)

    except Exception as e:
        return {"error" : str(e)}

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
        background_tasks.add_task(handle_run_strategic_model, input_file=excel_path, objective=data['objective'], id=data['scenario']['id'], output_file=output_path)
        scenario_handler.add_background_task(data['scenario']['id'])
        scenario = data['scenario']
        results = {"data": {}, "status": "initialized"}
        scenario["results"] = results
        scenario_handler.update_scenario(scenario)
    except Exception as e:
        _log.error(f"unable to find and run given excel sheet id{data['scenario']['id']}: {e}")
        raise HTTPException(
            500, f"unable to find and run given excel sheet id: {data['scenario']['id']}: {e}"
        )
    return scenario

@router.get("/check_tasks")
async def check_tasks(request: Request):
    """Get list of currently running background tasks

    Returns:
        List of scenario ids that are currently being optimized. 
    """
    return {'tasks' : scenario_handler.get_background_tasks()}
