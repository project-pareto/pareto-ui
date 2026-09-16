import type {ScenarioValidationResult} from '../../types';

export const readiness: ScenarioValidationResult = {
  revision: 'fixture-revision', valid: true, state: 'inputs_complete', model_check: 'not_run', feasibility: 'not_run',
  error_count: 0, warning_count: 0, issues: [], sections: [], periods: ['T01', 'T02'],
  units: {volume: 'bbl', time: 'day', 'decision period': 'week'},
};
export const modelBuilt: ScenarioValidationResult = {...readiness, state: 'model_built', model_check: 'passed'};
