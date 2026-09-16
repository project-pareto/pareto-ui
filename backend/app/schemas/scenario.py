"""Existing scenario JSON, mirrored by electron/ui/src/types/scenario.ts.

Absent optional fields stay absent through to_payload(). Dynamic PARETO tables
retain blank cells and numeric strings; checking their physical meaning belongs
to internal.validation, not these structural contracts.
"""
from pydantic import Field, field_validator

from app.internal.scenarios.input_schema import SCALAR_PARAMETER_NAMES
from .base import PayloadModel
from .map import MapData
from .validation import ConstraintViolationsSummary, ScenarioValidation

Cell = str | int | float | None
Scalar = str | int | float | bool | None
ParameterTable = dict[str, list[Cell]]
ScalarParameterData = dict[str, Cell]
ParameterData = ParameterTable | ScalarParameterData
ResultsTable = list[list[Scalar]]


def check_parameter_table(name: str, table: ParameterData) -> ParameterData:
    """Only known legacy metadata can use scalar values instead of columns."""
    if name not in SCALAR_PARAMETER_NAMES and any(not isinstance(column, list) for column in table.values()):
        raise ValueError(f'{name}: parameter table columns must be arrays.')
    return table


class ScenarioDataInput(PayloadModel):
    df_sets: dict[str, list[str]]
    df_parameters: dict[str, ParameterData]
    display_units: dict[str, str] = Field(default_factory=dict)
    units: dict[str, str] | None = None
    map_data: MapData | None = None
    origin: str | None = None

    @field_validator('df_parameters')
    @classmethod
    def preserve_legacy_metadata(cls, parameters: dict[str, ParameterData]) -> dict[str, ParameterData]:
        # Older v3 readers included these scalar dictionaries alongside column
        # tables. Keep their original representation; other tables still require
        # arrays so malformed table data cannot pass as generic metadata.
        for name, table in parameters.items():
            check_parameter_table(name, table)
        return parameters


class ScenarioOptimization(PayloadModel):
    objective: str | None = None
    runtime: int | float | str | None = None
    pipeline_cost: str | None = None
    # Retained in bundled older scenarios; no automatic migration to pipeline_cost.
    pipelineCostCalculation: str | None = None
    waterQuality: str | bool | None = None
    hydraulics: str | bool | None = None
    solver: str | None = None
    build_units: str | None = None
    optimalityGap: int | float | str | None = None
    scale_model: bool | None = None


class OverrideEntry(PayloadModel):
    variable: str
    indexes: list[str]
    value: int | float
    isZero: bool | None = None
    number_value: int | float | None = None


class ScenarioResults(PayloadModel):
    data: dict[str, ResultsTable] = Field(default_factory=dict)
    status: str | None = None
    run_id: str | None = None
    input_revision: str | None = None
    terminationCondition: str | None = None
    solution_status: str | None = None
    failure_stage: str | None = None
    error: str | None = None
    constraints_violations: ConstraintViolationsSummary | None = None


class Scenario(PayloadModel):
    id: int
    name: str
    date: str | None = None
    data_input: ScenarioDataInput
    optimization: ScenarioOptimization
    results: ScenarioResults
    input_revision: str | None = None
    validation: ScenarioValidation | None = None
    override_values: dict[str, dict[str, OverrideEntry]] | None = None
    optimized_override_values: dict[str, dict[str, OverrideEntry]] | None = None
    inputDiagramExtension: str | None = None
    outputDiagramExtension: str | None = None
