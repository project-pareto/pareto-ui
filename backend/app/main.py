import sys
import os
import logging

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scenarios
import uvicorn
import multiprocessing

_log = logging.getLogger(__name__)
_log.setLevel(logging.DEBUG)
logging.basicConfig(filename="backend_logs.log",
                    filemode='a',
                    format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
                    datefmt='%H:%M:%S',
                    level=logging.DEBUG)
_h = logging.StreamHandler()
_h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
_log.addHandler(_h)
# for debugging, force level
_log.setLevel(logging.DEBUG)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)

@app.get("/")
async def root():
    return {"message": "Hello Pareto"}

if __name__ == '__main__':
    _log.info(f"\n\n\nstarting app!!")
    multiprocessing.freeze_support()
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
