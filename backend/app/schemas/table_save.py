"""Live table-save contracts; no workbook, readiness or model checks here."""
import re

from pydantic import Field, ValidationInfo, field_validator

from .base import PayloadModel
from .scenario import ParameterData, Scenario, check_parameter_table

# Match the frontend's safe integer IDs, including persisted scenario zero.
MAX_SCENARIO_ID = 2**53 - 1


class UpdateExcelRequest(PayloadModel):
    id: int = Field(ge=0, le=MAX_SCENARIO_ID)
    tableKey: str = Field(min_length=1, pattern=r'\S')
    updatedTable: ParameterData
    # Older callers omit the revision or send null/empty text. A supplied
    # nonempty revision still goes through the existing conflict check.
    revision: str | None = None

    @field_validator('id', mode='before', json_schema_input_type=int | str)
    @classmethod
    def parse_id(cls, value: object) -> object:
        # Normalize canonical decimal IDs only; never coerce bools/fractions.
        # The length bound also avoids converting arbitrarily large integers.
        if isinstance(value, str) and re.fullmatch(r'0|[1-9][0-9]{0,15}', value):
            return int(value)
        return value

    @field_validator('updatedTable')
    @classmethod
    def check_columns(cls, table: ParameterData, info: ValidationInfo) -> ParameterData:
        return check_parameter_table(info.data.get('tableKey', ''), table)


class SavedTableScenario(Scenario):
    """The existing full scenario response with a required save acknowledgement."""
    id: int = Field(ge=0, le=MAX_SCENARIO_ID)
    input_revision: str = Field(min_length=1, pattern=r'\S')
