import sys
import os
import logging
import subprocess
from subprocess import CalledProcessError
import certifi
import idaes.logger as idaeslog
from idaes.util.download_bin import download_binaries
from idaes.config import default_binary_release

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
_f = logging.FileHandler('paretoui-backendlogs.log')
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
    print('inside get extensions')
    extensions_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)),'idaes-extensions')
    print(f'extensions_dir{extensions_dir}')
    try:
        if(sys.platform == "darwin"):
            #XXX doesnt work on idaes 2.0.0 - unsupported darwin-x86_64
            print('mac')
            print('trying to download binaries')
            download_binaries(url=f'file://{extensions_dir}')
            print(f'extensions have been gotten')
        else:
            print('not mac')
            print(f'trying to download binaries')
            download_binaries(release=default_binary_release)
            print(f'extensions have been gotten')
        print('successfully installed idaes extensions')
    except Exception as e:
        print(f'unable to install extensions: {e}')
        return False
    return True

if __name__ == '__main__':
    if('i' in sys.argv or 'install' in sys.argv):
        _log.info('running get_extensions()')
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