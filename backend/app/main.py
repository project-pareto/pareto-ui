import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(flowsheets.router)
fake_scenario_data = ['New Scenario 1', 'Base Scenario 2', 'Base Scenario 1']

@app.get("/")
async def root():
    return {"message": "Hello Pareto"}

@app.get("/scenarios")
async def scenarios():
    return {"data": fake_scenario_data}