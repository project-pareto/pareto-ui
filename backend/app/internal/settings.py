"""
Configuration for the backend
"""
from pathlib import Path
import logging
from pydantic import (
    BaseSettings,
    validator
)


class AppSettings(BaseSettings):
    #: List of package names in which to look for flowsheets
    data_basedir: Path = None
    log_dir: Path = None

    @validator("data_basedir", always=True)
    def validate_data_basedir(cls, v):
        if v is None:
            v = Path.home() / ".pareto" 
        v.mkdir(parents=True, exist_ok=True)
        return v

    @validator("log_dir", always=True)
    def validate_log_dir(cls, v):
        if v is None:
            v = Path.home() / ".pareto" / "logs"
        v.mkdir(parents=True, exist_ok=True)
        
        loggingFormat = "[%(levelname)s] %(asctime)s %(name)s (%(filename)s:%(lineno)s): %(message)s"
        loggingFileHandler = logging.handlers.RotatingFileHandler(v / "ui_backend_logs.log", backupCount=2, maxBytes=5000000)
        logging.basicConfig(level=logging.INFO, format=loggingFormat, handlers=[loggingFileHandler, logging.StreamHandler()])
        return v

    class Config:
        env_prefix = "pareto_"
