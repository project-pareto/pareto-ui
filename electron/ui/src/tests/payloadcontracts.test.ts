import payload from './fixtures/scenario-contract.json';
import type {Scenario} from '../types';
import {applyScenarioEdits, copyScenario, scenarioEdits} from '../scenarioEdits';
import {getParameterTable} from '../parameterTables';

// The same JSON is checked by backend/tests/test_payload_contracts.py. Assignment
// checks the shared shape at compile time without hiding mismatches behind a cast.
const scenario: Scenario = payload;

test('queued edits preserve imported metadata and rebase onto the server revision', () => {
  const draft = copyScenario(scenario);
  draft.data_input.df_parameters.PadRates.T02 = [100];
  draft.input_revision = 'draft-must-not-own-this';

  const saved: Scenario = {...scenario, input_revision: 'new-server-revision'};
  const rebased = applyScenarioEdits(saved, scenarioEdits(scenario, draft));

  expect(rebased.input_revision).toBe('new-server-revision');
  expect(rebased.data_input.df_parameters.PadRates).toEqual({
    ProductionPads: ['P1'], T01: [0], T02: [100],
  });
  expect(rebased.data_input.map_data).toEqual(payload.data_input.map_data);
  expect(rebased.vendor).toEqual({nullable: null, code: '001'});
  expect(rebased.data_input.df_parameters.CustomInput.VALUE).toEqual([null]);
  expect(rebased.data_input.df_parameters.Units).toEqual(payload.data_input.df_parameters.Units);
  expect(rebased.data_input.df_parameters.DesalinationSurrogate).toEqual(
    payload.data_input.df_parameters.DesalinationSurrogate);
  expect(rebased.data_input.map_data.arcs.pipe.length).toBe('1.0');
  expect(rebased.optimization.hydraulics).toBe(false);
  expect(rebased.optimization.waterQuality).toBe('false');
  expect(rebased).not.toHaveProperty('optimized_override_values');
});

test('table access preserves draft references and leaves scalar metadata intact', () => {
  const draft = copyScenario(scenario);
  const parameters = draft.data_input.df_parameters;
  const original = JSON.stringify(parameters);
  expect(getParameterTable(parameters, 'Units')).toBeUndefined();
  expect(getParameterTable(parameters, 'DesalinationSurrogate')).toBeUndefined();
  expect(getParameterTable(parameters, 'Missing')).toBeUndefined();
  expect(getParameterTable(parameters, 'RKA')).toBe(parameters.RKA);
  expect(JSON.stringify(parameters)).toBe(original);

  const table = getParameterTable(parameters, 'PadRates');
  expect(table).toBe(parameters.PadRates);
  table.T02[0] = 50;
  expect(parameters.PadRates.T02).toEqual([50]);
  expect(scenario.data_input.df_parameters.PadRates.T02).toEqual(['']);
});
