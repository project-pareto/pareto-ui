import sys
import os
import logging
import subprocess
import certifi

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scenarios
import uvicorn
import multiprocessing

_log = logging.getLogger(__name__)

_h = logging.StreamHandler()
_h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
_f = logging.FileHandler('backendlogs.log')
_f.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
_log.addHandler(_h)
_log.addHandler(_f)
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

def get_extensions():
    _log.info('inside get extensions')
    _log.info('setting environment variables')
    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
    os.environ["SSL_CERT_FILE"] = certifi.where()
    home_dir = os.path.expanduser("~")

    try:
        _log.info('trying to download extensions')
        if(sys.platform == "darwin"):
            _log.info('mac')
            subprocess.check_call(['idaes', 'get-extensions','--url',f'file://{home_dir}/Downloads'])
        else:
            _log.info('not mac')
            subprocess.check_call(['idaes', 'get-extensions'])
        _log.info('successfully installed idaes extensions')
    except Exception as e:
        _log.error('unable to install extensions')
        return False
    return True

def check__for_extensions():
    # check for ~/.idaes
    home_dir = os.path.expanduser("~")
    idaes_dir = os.path.join(home_dir, ".idaes/")
    if os.path.exists(idaes_dir):
        return True
    else:
        return False

if __name__ == '__main__':
    if('i' in sys.argv or 'install' in sys.argv):
        _log.info('check for idaes installers')
        if check__for_extensions():
            _log.info('found installers - ready to start backend')
        else:
            _log.info('installers not found, running get_extensions()')
            if get_extensions():
                _log.info('SUCCESS: idaes extensions installed')
            else:
                _log.error('unable to install idaes extensions :(')

    else:
        _log.info(f"\n\n\nstarting app!!")
        multiprocessing.freeze_support()
        uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)