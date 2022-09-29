import sys
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import multiprocessing
import certifi
from routers import scenarios
from internal.get_extensions import check_for_idaes_extensions, get_idaes_extensions

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

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




if __name__ == '__main__':
    if('i' in sys.argv or 'install' in sys.argv):
        try:
            _log.info(f'setting requests_ca_bundle and ssl_cert_file to certifi.where(): {certifi.where()}')
            os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
            os.environ["SSL_CERT_FILE"] = certifi.where()
        except Exception as e:
            _log.info(f'unable to set requests_ca_bundle and ssl_cert_file:\n{e}')
        _log.info('running get_extensions()')
        if not check_for_idaes_extensions():
            get_idaes_extensions()

    else:
        _log.info(f"\nstarting app!!")
        multiprocessing.freeze_support()
        uvicorn.run(app, host="127.0.0.1", port=8001, reload=False)
