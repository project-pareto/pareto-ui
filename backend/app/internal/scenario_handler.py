import logging
from watertap.ui.api import find_flowsheet_interfaces, WorkflowActions
from .flowsheet import Flowsheet

_log = logging.getLogger(__name__)
_h = logging.StreamHandler()
_h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
_log.addHandler(_h)
# for debugging, force level
_log.setLevel(logging.DEBUG)


class ScenarioHandler:
    def __init__(self) -> None:
        self.scenario_list = []
        # self.retrieve_scenarios()


scenario_handler = ScenarioHandler()
