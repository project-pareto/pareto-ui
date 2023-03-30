import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import multiprocessing

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from app.internal.get_extensions import check_for_idaes_extensions, get_idaes_extensions
from app.routers import scenarios
import idaes.logger as idaeslog

_log = idaeslog.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)

if __name__ == '__main__':
    if('i' in sys.argv or 'install' in sys.argv):
        _log.info('running get_extensions()')
        if not check_for_idaes_extensions():
            get_idaes_extensions()

    elif('d' in sys.argv or 'dev' in sys.argv):
        _log.info(f"starting app")
        multiprocessing.freeze_support()
        uvicorn.run("__main__:app", host="127.0.0.1", port=8001, reload=True)

    else:
        _log.info(f"starting app")
        multiprocessing.freeze_support()
        uvicorn.run(app, host="127.0.0.1", port=8001, reload=False)
