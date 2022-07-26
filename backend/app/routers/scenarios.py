import io
import os
import aiofiles
import json
import time
from fastapi import Body, Request, APIRouter, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional

from pareto.utilities.get_data import get_data
from app.internal.pareto_stategic_model import run_strategic_model
from app.internal.scenario_handler import (
    scenario_handler,
)


router = APIRouter(
    prefix="",
    tags=["scenarios"],
    responses={404: {"description": "Scenario not found"}},
)

@router.get("/scenarios")
async def scenarios():
    scenarios = scenario_handler.get_list()
    return {'data' : scenarios}

@router.post("/update")
async def update(request: Request):
    data = await request.json()
    updated_scenarios = data['updatedScenarios']
    scenario_handler.update_scenario_list(updated_scenarios)

    return {"data": updated_scenarios}

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    new_id = len(scenario_handler.get_list())
    output_path = "{}{}.xlsx".format(scenario_handler.excelsheets_path,new_id)

    # get file contents
    async with aiofiles.open(output_path, 'wb') as out_file:
        content = await file.read()  # async read
        await out_file.write(content) 

    return scenario_handler.upload_excelsheet(output_path=output_path, filename=file.filename)

@router.post("/run_model")
async def run_model(request: Request):
    data = await request.json()
    try:
        excel_path = "{}{}.xlsx".format(scenario_handler.excelsheets_path,data['id'])
        results_dict = run_strategic_model(input_file=excel_path)
    except:
        print('unable to find and run given excel sheet')
        results_dict = json.load(open('../data/example_results_dict2.json'))

    return results_dict



