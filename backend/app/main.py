import sys
import os
import logging
import subprocess
from subprocess import CalledProcessError
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
    _log.info(f'current working directory {os.getcwd()}')
    home_dir = os.path.expanduser("~")
    _log.info('changing to home directory')
    os.chdir(home_dir)
    _log.info(f'new working directory {os.getcwd()}')
    subprocess_output = open("subprocess_output.txt","a")
    subprocess_error = open("subprocess_error.txt","a")
    return_code = 0
    try:
        if(sys.platform == "darwin"):
            _log.info('mac')
            # _log.info('trying to pip install idaes first')
            # _log.info(subprocess.check_output([sys.executable, "-m", "pip", "install", 'idaes-pse']))
            # _log.info(f'trying to download extensions from {home_dir}/Downloads')
            # _log.info(subprocess.check_output(['which', 'idaes']))
            _log.info(subprocess.check_output(['idaes', 'get-extensions','--url',f'file://{home_dir}/Downloads'], stderr=subprocess_error))
            # return_code = os.system(f'idaes get-extensions --url file://{home_dir}/Downloads')
            # _log.info(f'return code : {return_code}')
        else:
            _log.info('not mac')
            _log.info(f'trying to download extensions from web')
            _log.info(subprocess.check_output(['idaes', 'get-extensions'], stderr=subprocess_error))
        _log.info('successfully installed idaes extensions')
    except CalledProcessError as e:
        _log.error(f'unable to install extensions, calledprocesserror: {e.output}')
        return False
    except Exception as e:
        _log.error(f'unable to install extensions: {e}')
        return False
    # if (return_code != 0):
    #     return False
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
                sys.exit(0)
            else:
                _log.error('unable to install idaes extensions :(')
                sys.exit(1)

    else:
        _log.info(f"\nstarting app!!")
        multiprocessing.freeze_support()
        uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)