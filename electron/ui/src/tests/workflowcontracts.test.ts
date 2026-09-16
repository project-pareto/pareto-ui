import fixture from './fixtures/scenario-contract.json';
import {modelBuilt, readiness} from './fixtures/validation';
import {advanceToOptimizationSetup, checkScenarioFeasibility, checkTasks, fillScenarioInputs, getScenarioReadiness,
  runModel, savePlanningHorizon, validateScenario} from '../services/app.service';

const originalFetch = global.fetch;
beforeEach(() => {global.fetch = jest.fn();});
afterEach(() => {global.fetch = originalFetch;});
function response(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ok: status >= 200 && status < 300, status, json: async () => body});
}

test.each([getScenarioReadiness, validateScenario, checkScenarioFeasibility])('live validation requires evidence instead of accepting an empty object (%#)', async request => {
  for (const body of [{}, {...readiness, valid: undefined}, {...readiness, revision: ''},
    {...readiness, error_count: -1}, {...readiness, issues: [{}]}, {...readiness, sections: 'broken'},
    {...readiness, model_check: 'probably'}, {...readiness, feasibility: true}]) {
    response(body);
    await expect(request(50011, '0')).rejects.toMatchObject({code: 'invalid_response'});
  }
});

test('readiness cancellation is forwarded and normalization preserves distinct validation evidence', async () => {
  const controller = new AbortController();
  response(readiness);
  await expect(getScenarioReadiness(50011, '0', controller.signal)).resolves.toEqual(readiness);
  expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:50011/scenario_readiness/0', {signal: controller.signal});
  response(modelBuilt);
  await expect(validateScenario(50011, 0)).resolves.toMatchObject({model_check: 'passed', feasibility: 'not_run'});
  const inconclusive = {...modelBuilt, state: 'not_determined', feasibility: 'not_determined', error: 'Solve budget reached.'};
  response(inconclusive);
  await expect(checkScenarioFeasibility(50011, 0)).resolves.toEqual(inconclusive);
  response({...modelBuilt, valid: false, state: 'infeasible', feasibility: 'infeasible'});
  await expect(checkScenarioFeasibility(50011, 0)).resolves.toMatchObject({state: 'infeasible', valid: false});
});

const fill = {section: 'costs', revision: fixture.input_revision, value: 0, apply: false as const};
const preview = {revision: fill.revision, value: 0, cell_count: 1, tables: [{name: 'Cost', cell_count: 1, unit: 'USD/bbl'}]};
test('autofill decodes preview and apply separately and keeps explicit zero and revision', async () => {
  response(preview);
  await expect(fillScenarioInputs(50011, 0, fill)).resolves.toEqual(preview);
  response(fixture);
  await expect(fillScenarioInputs(50011, 0, {...fill, apply: true})).resolves.toEqual(fixture);
  expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)).toEqual({...fill, apply: true});
});

test.each([
  {}, {...preview, value: 1}, {...preview, revision: 'different'}, {...preview, cell_count: 2},
  {...preview, tables: [{name: 'Cost', cell_count: -1, unit: ''}]},
  {...preview, cell_count: 2, tables: [...preview.tables, ...preview.tables]},
])('rejects malformed or mismatched fill preview %#', async body => {
  response(body);
  await expect(fillScenarioInputs(50011, 0, fill)).rejects.toMatchObject({code: 'invalid_response'});
});

test('planning periods, autofill apply, and advance require saved scenarios with matching identity', async () => {
  response(fixture);
  await expect(savePlanningHorizon(50011, '0', ['T01'], fixture.input_revision)).resolves.toEqual(fixture);
  response({data: fixture});
  await expect(advanceToOptimizationSetup(50011, '0')).resolves.toEqual({data: fixture});
  response({...fixture, id: 1});
  await expect(fillScenarioInputs(50011, 0, {...fill, apply: true})).rejects.toMatchObject({code: 'invalid_response'});
  response({...fixture, input_revision: undefined});
  await expect(savePlanningHorizon(50011, 0, ['T01'])).rejects.toMatchObject({code: 'invalid_response'});
  response({data: {...fixture, id: 1}});
  await expect(advanceToOptimizationSetup(50011, 0)).rejects.toMatchObject({code: 'invalid_response'});
});

test('conflicts preserve server recovery instructions without retrying mutations', async () => {
  response({detail: 'Inputs changed. Refresh completion and preview the fill again.'}, 409);
  await expect(fillScenarioInputs(50011, 0, {...fill, apply: true})).rejects.toMatchObject({
    code: 'conflict', status: 409, message: expect.stringContaining('preview the fill again'),
  });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('task checks require numeric scenario IDs including zero', async () => {
  response({tasks: [0, 12]});
  await expect(checkTasks(50011)).resolves.toEqual({tasks: [0, 12]});
  for (const body of [{}, {tasks: null}, {tasks: ['0']}, {tasks: [false]}, {tasks: [-1]}, {tasks: [0.5]}]) {
    response(body);
    await expect(checkTasks(50011)).rejects.toMatchObject({code: 'invalid_response'});
  }
});

test('a run acknowledgement matches scenario and run IDs, including completed retries and legacy labels', async () => {
  for (const status of ['Preparing inputs', 'Solving Model', 'Generating Output', 'Optimized', 'failure', 'Infeasible']) {
    const saved = {...fixture, results: {data: {}, run_id: 'attempt', status}};
    response(saved);
    await expect(runModel(50011, {scenario: fixture, run_id: 'attempt'})).resolves.toEqual(saved);
  }
  await expect(runModel(50011, {scenario: fixture, run_id: ''})).rejects.toMatchObject({code: 'invalid_request'});
  expect(global.fetch).toHaveBeenCalledTimes(6);
});
