import sys
import os
import logging
import subprocess
from subprocess import CalledProcessError
from pathlib import Path
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


extensions_dir = Path.home() / ".pareto-ui" / ".idaes"
def check_for_extensions():
    print('checking for extensions')
    found_extensions = os.path.exists(extensions_dir)
    print(f'found extensions: {found_extensions}')
    return found_extensions

def get_extensions():
    print('inside get extensions')
    try:
        if(sys.platform == "darwin"):
            #XXX doesnt work on idaes 2.0.0 - unsupported darwin-x86_64
            print('mac')
            print('trying to download binaries')
            download_binaries(url=f'https://idaes-extensions.s3.us-west-1.amazonaws.com/')
            print(f'extensions have been gotten, making directory')
        else:
            print('not mac')
            print(f'trying to download binaries')
            download_binaries(release=default_binary_release)
            print(f'extensions have been gotten')
        print('successfully installed idaes extensions')
    except PermissionError as e:
        print(f'unable to install extensions, permissionerror due to idaes extensions already being present: {e}\nmaking directory')
        extensions_dir.mkdir(parents=True, exist_ok=True)
        return False
    except Exception as e:
        print(f'unable to install extensions: {e}')
        return False
    extensions_dir.mkdir(parents=True, exist_ok=True)
    return True

if __name__ == '__main__':
    if('i' in sys.argv or 'install' in sys.argv):
        _log.info('running get_extensions()')
        if not check_for_extensions():
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