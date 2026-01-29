#####################################################################################################
# PARETO was produced under the DOE Produced Water Application for Beneficial Reuse Environmental
# Impact and Treatment Optimization (PARETO), and is copyright (c) 2021-2024 by the software owners:
# The Regents of the University of California, through Lawrence Berkeley National Laboratory, et al.
# All rights reserved.
#
# NOTICE. This Software was developed under funding from the U.S. Department of Energy and the U.S.
# Government consequently retains certain rights. As such, the U.S. Government has been granted for
# itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in
# the Software to reproduce, distribute copies to the public, prepare derivative works, and perform
# publicly and display publicly, and to permit others to do so.
#####################################################################################################
"""
Configuration for the backend
"""
from pathlib import Path
import logging
import logging.handlers
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    #: List of package names in which to look for flowsheets
    data_basedir: Path | None = None
    log_dir: Path | None = None

    # Settings config: env prefix (replaces class Config in v1)
    model_config = SettingsConfigDict(env_prefix="pareto_")

    @field_validator("data_basedir", mode="after")
    def validate_data_basedir(cls, v: Path | None) -> Path:
        # If unset, default to ~/.pareto and ensure it exists
        if v is None:
            v = Path.home() / ".pareto"
        v.mkdir(parents=True, exist_ok=True)
        return v

    @field_validator("log_dir", mode="after")
    def validate_log_dir(cls, v: Path | None) -> Path:
        # If unset, default to ~/.pareto/logs and ensure it exists
        if v is None:
            v = Path.home() / ".pareto" / "logs"
        v.mkdir(parents=True, exist_ok=True)

        logging_format = "[%(levelname)s] %(asctime)s %(name)s (%(filename)s:%(lineno)s): %(message)s"
        log_file_path = v / "ui_backend_logs.log"

        # RotatingFileHandler wants a filename (str); convert explicitly for safety
        rotating_handler = logging.handlers.RotatingFileHandler(str(log_file_path),
                                                               backupCount=2,
                                                               maxBytes=5_000_000)

        # Configure basic logging once (this will affect global logging config)
        logging.basicConfig(
            level=logging.INFO,
            format=logging_format,
            handlers=[rotating_handler, logging.StreamHandler()]
        )

        return v
