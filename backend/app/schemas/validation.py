"""Validation evidence, separate from input structure and solver result tables."""
from typing import Literal

from .base import PayloadModel


class ValidationHelp(PayloadModel):
    rule: str
    steps: list[str]


class ValidationIssue(PayloadModel):
    code: str
    section: str
    severity: Literal['error', 'warning']
    message: str
    table: str | None = None
    row: list[str] | None = None
    period: str | None = None
    area: str | None = None
    help: ValidationHelp | None = None
    actual: object = None
    expected: object = None


class ValidationSection(PayloadModel):
    id: str
    title: str
    error_count: int
    warning_count: int
    fillable_count: int | None = None


class ScenarioValidation(PayloadModel):
    revision: str | None = None
    state: str | None = None
    valid: bool | None = None
    issues: list[ValidationIssue] | None = None
    error_count: int | None = None
    warning_count: int | None = None
    truncated: bool | None = None
    catalog_version: int | None = None
    model_version: str | None = None
    model_check: str | None = None
    feasibility: str | None = None
    termination_condition: str | None = None
    slacks_disabled: bool | None = None
    sections: list[ValidationSection] | None = None
    units: dict[str, str] | None = None
    periods: list[str] | None = None
    missing_tables: list[str] | None = None
    tables_with_issues: list[str] | None = None
    check_for_missing_tables: bool | None = None
    check_for_minimum_required_tables: bool | None = None
    check_for_infeasibility: bool | None = None
    error: str | None = None


class ConstraintViolationRecord(PayloadModel):
    violation: int | float
    side: str | None
    constraint: str
    lower_bound: int | float | None
    body_value: int | float | None
    upper_bound: int | float | None


class ConstraintViolationsSummary(PayloadModel):
    count: int
    tolerance: int | float
    relative_tolerance: int | float | None = None
    relative_tolerance_scope: Literal['linear_currency_equalities'] | None = None
    violations: list[ConstraintViolationRecord]
    logged_count: int | None = None
    status: Literal['complete', 'partial', 'unavailable'] | None = None
    evaluated_count: int | None = None
    skipped_count: int | None = None
    returned_count: int | None = None
    truncated: bool | None = None
    reason: str | None = None
    solution_state: Literal['solver_solution', 'current_model_values'] | None = None
