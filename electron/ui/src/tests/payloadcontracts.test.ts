import payload from './fixtures/scenario-contract.json';
import type {Scenario} from '../types';
import {applyScenarioEdits, copyScenario, scenarioEdits} from '../scenarioEdits';

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
  expect(rebased.optimization.hydraulics).toBe(false);
  expect(rebased.optimization.waterQuality).toBe('false');
  expect(rebased).not.toHaveProperty('optimized_override_values');
});
