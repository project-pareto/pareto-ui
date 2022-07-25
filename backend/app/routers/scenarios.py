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


router = APIRouter(
    prefix="",
    tags=["scenarios"],
    responses={404: {"description": "Scenario not found"}},
)

@router.get("/scenarios")
async def scenarios():
    with open('../data/scenarios.json', 'r') as f:
        scenario_data = json.load(f)
    data = []
    for scenario in scenario_data:
        data.append(scenario)
    return {"data": scenario_data}

@router.post("/update")
async def update(request: Request):
    data = await request.json()

    updated_scenario = data['updatedScenario']
    index = data['index']

    # read in data from scenarios json
    with open('../data/scenarios.json', 'r') as f:
        scenario_data = json.load(f)

    # update scenario
    scenario_data[index] = updated_scenario

    # update scenarios json
    with open('../data/scenarios.json', 'w') as f:
        json.dump(scenario_data,f, indent=4)

    return {"data": scenario_data}

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    # recreate file on backend
    out_file_path = '../data/excelsheets/{}'.format(file.filename)

    async with aiofiles.open(out_file_path, 'wb') as out_file:
        content = await file.read()  # async read
        await out_file.write(content) 
    
    # get default set and parameter lists
    f = open('../data/pareto_data.json')
    data = json.load(f)
    set_list = data['set_list']
    parameter_list = data['parameter_list']
    f.close()

    # read in data from excel sheet
    [df_sets, _] = get_data(out_file_path, set_list, parameter_list)
    return_object = {"name": file.filename, "data_input": df_sets, "optimization": {}, "results": {}}
    for key in return_object['data_input']:
        return_object['data_input'][key] = return_object['data_input'][key].tolist()

    # update json containing scenarios
    try:
        with open('../data/scenarios.json', 'r') as f:
            scenario_data = json.load(f)
    except:
        scenario_data=[]
    scenario_data.append(return_object)
    with open('../data/scenarios.json', 'w') as f:
        json.dump(scenario_data,f, indent=4)
    # os.remove(out_file_path)
    
    return return_object

@router.get("/run_model")
async def run_model():
    # results_dict = run_strategic_model()

    # use an example of results for quicker loading
    print('sleeping for 10')
    time.sleep(5)
    results_dict = json.load(open('../data/example_results_dict2.json'))
    return results_dict



