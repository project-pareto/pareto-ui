import type {ScenarioFillPreview, ScenarioValidationResult, TaskResponse} from '../../types';
import {array, boolean, DecodeError, Decoder, number, object, string, unknown} from './decode';
import {decodeScenarioId, decodeValidation, scenarioFor} from './scenario';

// Keep saved legacy spellings until the run-status API has its own phase contract.
export const RUNNING_STATES = ['Initializing', 'Preparing inputs', 'Building model', 'Solving model', 'Generating output',
  'Solving Model', 'Generating Output'];
export const COMPLETED_STATES = ['Optimized', 'failure', 'Infeasible'];
export const isRunStatus = (status: unknown): status is string =>
  typeof status === 'string' && [...RUNNING_STATES, ...COMPLETED_STATES].includes(status);

const count: Decoder<number> = (value, path) => {
  const result = number(value, path);
  if (!Number.isSafeInteger(result) || result < 0) throw new DecodeError(path, 'a nonnegative integer count');
  return result;
};
const revision: Decoder<string> = (value, path) => {
  const result = string(value, path);
  if (!result.trim()) throw new DecodeError(path, 'a nonempty input revision');
  return result;
};

/** Live checks must supply evidence. The legacy embedded validation object may be partial. */
export const decodeValidationResult: Decoder<ScenarioValidationResult> = (value, path) => {
  const checked = decodeValidation(value, path);
  const required = object({revision, valid: boolean, error_count: count, warning_count: count,
    issues: array(unknown), sections: array(unknown), periods: array(string),
    state: string, model_check: string, feasibility: string})(value, path);
  // The broad structural decoder above checks each issue/section and the state literals.
  if (!checked.state || !checked.model_check || !checked.feasibility || !checked.issues || !checked.sections) {
    throw new DecodeError(path, 'complete validation evidence');
  }
  checked.sections.forEach((section, index) => {
    count(section.error_count, `${path}.sections[${index}].error_count`);
    count(section.warning_count, `${path}.sections[${index}].warning_count`);
    if (section.fillable_count !== undefined) count(section.fillable_count, `${path}.sections[${index}].fillable_count`);
  });
  return {...checked, revision: required.revision, valid: required.valid, error_count: required.error_count,
    warning_count: required.warning_count, periods: required.periods, state: checked.state,
    model_check: checked.model_check, feasibility: checked.feasibility, issues: checked.issues, sections: checked.sections};
};

export const decodeTasks: Decoder<TaskResponse> = object({tasks: array(decodeScenarioId)});

export const runFor = (id: number, runId: string) => {
  const decode = scenarioFor(id, true);
  return (value: unknown, path: string) => {
    const scenario = decode(value, path);
    if (scenario.results.run_id !== runId) throw new DecodeError(`${path}.results.run_id`, 'the requested run ID');
    if (!isRunStatus(scenario.results.status)) throw new DecodeError(`${path}.results.status`, 'an active or completed run status');
    return scenario;
  };
};

const preview = object({revision, value: number, cell_count: count,
  tables: array(object({name: string, cell_count: count, unit: string}))});
export const fillPreviewFor = (inputRevision: string, fillValue: number): Decoder<ScenarioFillPreview> => (value, path) => {
  const result = preview(value, path);
  if (result.revision !== inputRevision) throw new DecodeError(`${path}.revision`, 'the previewed input revision');
  if (result.value !== fillValue) throw new DecodeError(`${path}.value`, 'the requested fill value');
  if (new Set(result.tables.map(table => table.name)).size !== result.tables.length ||
      result.tables.reduce((sum, table) => sum + table.cell_count, 0) !== result.cell_count) {
    throw new DecodeError(`${path}.tables`, 'unique tables whose counts match the preview total');
  }
  return result;
};
