export interface ConstraintViolationRecord {
  violation: number;
  side: string | null;
  constraint: string;
  lower_bound: number | null;
  body_value: number | null;
  upper_bound: number | null;
}

export interface ConstraintViolationsSummary {
  count: number;
  tolerance: number;
  relative_tolerance?: number;
  relative_tolerance_scope?: 'linear_currency_equalities';
  logged_count?: number;
  status?: "complete" | "partial" | "unavailable";
  evaluated_count?: number;
  skipped_count?: number;
  returned_count?: number;
  truncated?: boolean;
  reason?: string;
  solution_state?: "solver_solution" | "current_model_values";
  violations: ConstraintViolationRecord[];
}

export interface ValidationSection {
  id: string;
  title: string;
  error_count: number;
  warning_count: number;
  fillable_count?: number;
}

/** Completeness, model construction and feasibility are independent evidence. */
export interface ScenarioValidation {
  revision?: string;
  state?: 'not_checked' | 'inputs_complete' | 'needs_input' | 'outdated' | 'model_built'
    | 'not_determined' | 'infeasible' | 'feasible' | 'build_failed';
  catalog_version?: number;
  model_version?: string;
  termination_condition?: string;
  slacks_disabled?: boolean;
  issues?: ValidationIssue[];
  error_count?: number;
  warning_count?: number;
  truncated?: boolean;
  model_check?: 'not_run' | 'passed' | 'failed';
  feasibility?: 'not_run' | 'not_supported' | 'not_determined' | 'infeasible' | 'feasible';
  sections?: ValidationSection[];
  units?: Record<string, string>;
  periods?: string[];
  valid?: boolean | null;
  missing_tables?: string[];
  tables_with_issues?: string[];
  check_for_missing_tables?: boolean | null;
  check_for_minimum_required_tables?: boolean | null;
  check_for_infeasibility?: boolean | null;
  error?: string | null;
}

export interface ValidationIssue {
  code: string;
  section: string;
  severity: 'error' | 'warning';
  message: string;
  table?: string | null;
  row?: string[];
  period?: string | null;
  area?: string;
  actual?: unknown;
  expected?: unknown;
  help?: {rule: string; steps: string[]} | null;
}

export interface ScenarioFillPreview {
  revision: string;
  value: number;
  cell_count: number;
  tables: Array<{name: string; cell_count: number; unit: string}>;
}
