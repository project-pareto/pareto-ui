import type {
  Scenario, ScenarioMap, ScenarioDataInput, ScenarioOptimization, ScenarioResults, ScenarioOverrides,
  ScenarioValidation, ConstraintViolationsSummary, ScenarioAIDiagnosis, MapData, MapNode,
  MapArc, ArcNodeRef, DfParameters,
} from '../../types';
import {array, boolean, DecodeError, Decoder, either, literal, nullable, number, object,
  optional, record, string, unknown} from './decode';

const strings = array(string);
const coordinate = either(string, number);
const coordinates = array(coordinate);
const cell = nullable(coordinate);
const table = record(array(cell));

// These two v3 metadata dictionaries are scalar; other parameter columns are arrays.
export const decodeParameters: Decoder<DfParameters> = (value, path) => {
  const tables = record(unknown)(value, path);
  Object.entries(tables).forEach(([name, data]) => {
    const decode = name === 'Units' || name === 'DesalinationSurrogate' ? either(table, record(cell)) : table;
    decode(data, `${path}.${name}`);
  });
  return tables as DfParameters;
};

const node: Decoder<MapNode> = object({
  node_type: string, name: optional(string), nodeType: optional(string),
  longitude: optional(coordinate), latitude: optional(coordinate), altitude: optional(coordinate),
  coordinates: optional(coordinates), TreatmentTechnology: optional(string),
  Capacity: optional(cell), PadWaterQuality: optional(cell), PadStorageInitialWaterQuality: optional(cell),
  StorageInitialWaterQuality: optional(cell), ExternalWaterQuality: optional(cell),
  InitialDisposalCapacity: optional(cell), InitialStorageCapacity: optional(cell),
  CompletionsPadStorage: optional(cell), PadOffloadingCapacity: optional(cell), NodeCapacities: optional(cell),
  DisposalOperationalCost: optional(cell), ReuseOperationalCost: optional(cell), ExternalSourcingCost: optional(cell),
  TruckingHourlyCost: optional(cell), DesalinationSites: optional(cell), BeneficialReuseCost: optional(cell),
  BeneficialReuseCredit: optional(cell), CompletionsPadOutsideSystem: optional(cell), Elevation: optional(cell),
  SWDDeep: optional(cell), SWDAveragePressure: optional(cell), SWDProxPAWell: optional(cell),
  SWDProxInactiveWell: optional(cell), SWDProxEQ: optional(cell), SWDProxFault: optional(cell),
  SWDProxHpOrLpWell: optional(cell),
});
const nodes = record(node);
const arcNode: Decoder<ArcNodeRef> = object({
  name: string, incoming: optional(boolean), outgoing: optional(boolean), coordinates: optional(coordinates),
  incoming_nodes: optional(strings), outgoing_nodes: optional(strings), segment_coordinates: optional(array(coordinates)),
});
const arc: Decoder<MapArc> = object({
  name: optional(string), node_type: optional(string), coordinates: optional(array(coordinates)),
  nodes: optional(array(arcNode)), lengths: optional(array(number)), length: optional(coordinate), diameter: optional(coordinate),
});
export const decodeMap: Decoder<MapData> = object({
  // Older saved maps may contain connections without separate arc geometry.
  all_nodes: nodes, arcs: optional(record(arc)),
  connections: object({all_connections: record(strings), connection_metadata: optional(record(object({
    pipeline_capacity: optional(cell), pipeline_length: optional(cell), pipeline_diameter: optional(cell),
  })))}),
  ProductionPads: optional(nodes), CompletionsPads: optional(nodes), NetworkNodes: optional(nodes),
  SWDSites: optional(nodes), TreatmentSites: optional(nodes), StorageSites: optional(nodes),
  ExternalWaterSources: optional(nodes), ReuseOptions: optional(nodes), other_nodes: optional(nodes),
  units: optional(record(string)),
  defaultNode: optional(string), time_periods: optional(strings), _node_renames: optional(record(string)),
});

export const decodeValidation: Decoder<ScenarioValidation> = object({
  revision: optional(string),
  state: optional(literal('not_checked', 'inputs_complete', 'needs_input', 'outdated', 'model_built',
    'not_determined', 'infeasible', 'feasible', 'build_failed')),
  catalog_version: optional(number), model_version: optional(string), termination_condition: optional(string),
  slacks_disabled: optional(boolean), error_count: optional(number), warning_count: optional(number), truncated: optional(boolean),
  model_check: optional(literal('not_run', 'passed', 'failed')),
  feasibility: optional(literal('not_run', 'not_supported', 'not_determined', 'infeasible', 'feasible')),
  issues: optional(array(object({
    code: string, section: string, severity: literal('error', 'warning'), message: string,
    table: optional(nullable(string)), row: optional(strings), period: optional(nullable(string)), area: optional(string),
    actual: unknown, expected: unknown, help: optional(nullable(object({rule: string, steps: strings}))),
  }))),
  sections: optional(array(object({id: string, title: string, error_count: number, warning_count: number, fillable_count: optional(number)}))),
  units: optional(record(string)), periods: optional(strings), valid: optional(nullable(boolean)),
  missing_tables: optional(strings), tables_with_issues: optional(strings),
  check_for_missing_tables: optional(nullable(boolean)), check_for_minimum_required_tables: optional(nullable(boolean)),
  check_for_infeasibility: optional(nullable(boolean)), error: optional(nullable(string)),
});

const violations: Decoder<ConstraintViolationsSummary> = object({
  count: number, tolerance: number, relative_tolerance: optional(number),
  relative_tolerance_scope: optional(literal('linear_currency_equalities')), logged_count: optional(number),
  status: optional(literal('complete', 'partial', 'unavailable')), evaluated_count: optional(number),
  skipped_count: optional(number), returned_count: optional(number), truncated: optional(boolean), reason: optional(string),
  solution_state: optional(literal('solver_solution', 'current_model_values')),
  violations: array(object({violation: number, side: nullable(string), constraint: string,
    lower_bound: nullable(number), body_value: nullable(number), upper_bound: nullable(number)})),
});
export const decodeDiagnosis: Decoder<ScenarioAIDiagnosis> = object({
  status: literal('success'), summary: string, likelyCauses: strings, cautionNotes: strings, diagnosedAt: string,
  nextSteps: array(object({title: string, instruction: string, reason: optional(nullable(string)), appArea: optional(nullable(string))})),
  sourceErrorMessage: optional(string), outdated: optional(boolean), outdatedAt: optional(string), outdatedReason: optional(string),
});
const override = optional(record(object({variable: string, indexes: strings, value: number,
  isZero: optional(boolean), number_value: optional(number)})));
const overrides: Decoder<ScenarioOverrides> = object({
  vb_y_overview_dict: override, v_F_Piped_dict: override, v_F_Sourced_dict: override, v_F_Trucked_dict: override,
  v_L_Storage_dict: override, v_L_PadStorage_dict: override, vb_y_Pipeline_dict: override,
  vb_y_Disposal_dict: override, vb_y_Storage_dict: override, vb_y_Treatment_dict: override,
});
const inputs: Decoder<ScenarioDataInput> = object({
  df_sets: record(strings), df_parameters: decodeParameters, display_units: optional(record(string)),
  units: optional(record(string)), map_data: optional(nullable(decodeMap)), origin: optional(string),
});
const optimization: Decoder<ScenarioOptimization> = object({
  objective: optional(string), runtime: optional(coordinate), pipeline_cost: optional(string),
  pipelineCostCalculation: optional(string), waterQuality: optional(either(string, boolean)),
  hydraulics: optional(either(string, boolean)), solver: optional(string), build_units: optional(string),
  optimalityGap: optional(coordinate), scale_model: optional(boolean),
});
const results: Decoder<ScenarioResults> = object({
  data: optional(record(array(array(either(cell, boolean))))), status: optional(nullable(string)), run_id: optional(nullable(string)),
  input_revision: optional(nullable(string)), failure_stage: optional(nullable(string)), error: optional(nullable(string)),
  terminationCondition: optional(nullable(string)), solution_status: optional(nullable(string)), constraints_violations: optional(nullable(violations)),
});

export const decodeScenarioId: Decoder<number> = (value, path) => {
  const id = number(value, path);
  if (!Number.isSafeInteger(id) || id < 0) throw new DecodeError(path, 'a nonnegative integer scenario ID');
  return id;
};

export const decodeScenario: Decoder<Scenario> = object({
  id: decodeScenarioId, name: string, date: optional(string), data_input: inputs, optimization, results,
  input_revision: optional(string), validation: optional(decodeValidation), override_values: optional(overrides),
  optimized_override_values: optional(overrides), aiDiagnosis: optional(decodeDiagnosis), previousAIDiagnosis: optional(decodeDiagnosis),
  inputDiagramExtension: optional(string), outputDiagramExtension: optional(string),
});

export const decodeScenarioMap: Decoder<ScenarioMap> = (value, path) => {
  const scenarios = record(decodeScenario)(value, path);
  Object.entries(scenarios).forEach(([id, scenario]) => {
    if (String(scenario.id) !== id) throw new DecodeError(`${path}.${id}.id`, 'the scenario ID matching its list key');
  });
  return scenarios;
};

export const decodeScenarioList = object({data: decodeScenarioMap});

export const decodeSavedScenario: Decoder<Scenario> = (value, path) => {
  const scenario = decodeScenario(value, path);
  if (!scenario.input_revision?.trim()) throw new DecodeError(`${path}.input_revision`, 'a saved input revision');
  return scenario;
};

export const scenarioFor = (id: number, saved = false): Decoder<Scenario> => (value, path) => {
  const scenario = (saved ? decodeSavedScenario : decodeScenario)(value, path);
  if (scenario.id !== id) throw new DecodeError(`${path}.id`, 'the requested scenario ID');
  return scenario;
};
