import {readFileSync} from 'fs';
import path from 'path';
import fixture from './fixtures/scenario-contract.json';
import {ApiClientError, requestJson, scenarioId} from '../services/apiClient';
import {fetchScenario, fetchScenarios, updateExcel, updateScenario} from '../services/app.service';
import {decodeScenario, decodeScenarioList} from '../services/contracts/scenario';
import {DecodeError} from '../services/contracts/decode';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { global.fetch = originalFetch; });
function response(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ok: status >= 200 && status < 300, status, json: async () => body});
}

test('decodes the shared backend fixture without coercion, defaults, or lost metadata', () => {
  const source = clone(fixture);
  const scenario = decodeScenario(source, '$');
  expect(scenario).toBe(source);
  expect(JSON.stringify(scenario)).toBe(JSON.stringify(fixture));
  expect(scenario.id).toBe(0);
  expect(scenario).not.toHaveProperty('validation');
  expect(scenario.data_input.df_parameters.Units).toEqual({volume: 'bbl', 'decision period': 'week'});
});

test('all bundled legacy scenarios decode without adding optional fields', () => {
  const database = JSON.parse(readFileSync(path.resolve(__dirname, '../../../../backend/app/internal/assets/v1_default/scenarios.json'), 'utf8'));
  for (const entry of Object.values(database._default) as Array<{scenario: unknown}>) {
    const before = JSON.stringify(entry.scenario);
    const scenario = decodeScenario(entry.scenario, '$');
    expect(JSON.stringify(scenario)).toBe(before);
    expect(scenario.optimization.pipelineCostCalculation).toBe('distance_based');
    expect(scenario.data_input).not.toHaveProperty('map_data');
  }
});

test('failure results with no solver outcome and nullable AI step hints still load', () => {
  const source = {...clone(fixture), results: {data: {}, status: 'failure', terminationCondition: null,
    run_id: null, input_revision: null, solution_status: null, failure_stage: null, constraints_violations: null},
    aiDiagnosis: {status: 'success', summary: 'Review inputs', likelyCauses: [], cautionNotes: [], diagnosedAt: 'now',
      nextSteps: [{title: 'Review', instruction: 'Review inputs', reason: null, appArea: null}]}};
  expect(decodeScenario(source, '$')).toBe(source);
});

test('drafts without results tables retain the missing field', () => {
  const source = {...clone(fixture), results: {status: 'Draft'}};
  expect(decodeScenario(source, '$')).toBe(source);
  expect(source.results).not.toHaveProperty('data');
});

test('missing map unit names remain incomplete without invented defaults', () => {
  const source = {...clone(fixture), data_input: {...clone(fixture.data_input),
    map_data: {...clone(fixture.data_input.map_data), units: {volume: 'bbl', time: ''}}}};
  expect(decodeScenario(source, '$')).toBe(source);
  expect(source.data_input.map_data.units).toEqual({volume: 'bbl', time: ''});
});

test.each([null, [], {}, {...fixture, id: '0'}, {...fixture, id: -1}, {...fixture, id: 0.5},
  {...fixture, id: false}, {...fixture, results: {data: {x: [123]}}},
  {...fixture, data_input: {...fixture.data_input, df_parameters: {PadRates: {T01: 100}}}},
  {...fixture, data_input: {...fixture.data_input, df_parameters: {Units: {volume: ['bbl'], time: 'day'}}}},
  {...fixture, data_input: {...fixture.data_input, map_data: {all_nodes: {}}}},
  {...fixture, optimization: {runtime: true}},
  {...fixture, validation: {issues: [{code: 'missing'}]}},
])('rejects malformed scenario shape %#', value => {
  expect(() => decodeScenario(value, '$')).toThrow(DecodeError);
});

test('lists require an object and matching key/record identities', () => {
  expect(decodeScenarioList({data: {'0': fixture}}, '$').data['0']).toBe(fixture);
  expect(() => decodeScenarioList({data: [fixture]}, '$')).toThrow(DecodeError);
  expect(() => decodeScenarioList({data: {'1': fixture}}, '$')).toThrow(/matching its list key/);
});

test.each([0, '0', 123, '123'])('accepts scenario ID %p', id => {
  expect(scenarioId(id)).toBe(Number(id));
});
test.each([false, null, '', ' ', '-1', '01', '1.0', '1/other', -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])(
  'rejects ambiguous or invalid ID %p before fetching', async id => {
    expect(() => scenarioId(id)).toThrow(ApiClientError);
    await expect(fetchScenario(50011, id as number)).rejects.toMatchObject({code: 'invalid_request'});
    expect(global.fetch).not.toHaveBeenCalled();
  });

test('detail, list, and both save endpoints expose decoded data, including ID zero', async () => {
  response(fixture);
  await expect(fetchScenario(50011, '0')).resolves.toEqual(fixture);
  expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:50011/get_scenario/0', undefined);
  response({data: {'0': fixture}});
  await expect(fetchScenarios(50011)).resolves.toEqual({data: {'0': fixture}});
  response({data: fixture});
  await expect(updateScenario(50011, {updatedScenario: fixture, propagateChanges: 'map'})).resolves.toEqual({data: fixture});
  expect(JSON.parse((global.fetch as jest.Mock).mock.calls[2][1].body).propagateChanges).toBe('map');
  response(fixture);
  await expect(updateExcel(50011, {id: '0', tableKey: 'RKA', updatedTable: {}, revision: 'previous'})).resolves.toEqual(fixture);
  expect(JSON.parse((global.fetch as jest.Mock).mock.calls[3][1].body)).toEqual({id: 0, tableKey: 'RKA', updatedTable: {}, revision: 'previous'});
});

test('wrong identities and unversioned save responses fail before reaching state', async () => {
  response({...fixture, id: 1});
  await expect(fetchScenario(50011, 0)).rejects.toMatchObject({code: 'invalid_response', status: 200});
  response({data: {...fixture, input_revision: undefined}});
  await expect(updateScenario(50011, {updatedScenario: fixture})).rejects.toMatchObject({code: 'invalid_response'});
  response({...fixture, id: 1});
  await expect(updateExcel(50011, {id: 0, tableKey: 'RKA', updatedTable: {}})).rejects.toMatchObject({code: 'invalid_response'});
});

test('normalizes conflicts and preserves detail without replaying a save', async () => {
  const detail = {message: 'Refresh saved inputs.', current_revision: 'newer'};
  response({detail}, 409);
  await expect(updateScenario(50011, {updatedScenario: fixture})).rejects.toMatchObject({
    name: 'ApiClientError', code: 'conflict', status: 409, message: detail.message, detail,
  });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('normalizes string, structured validation, and FastAPI field errors', async () => {
  response({detail: 'Scenario missing.'}, 404);
  await expect(fetchScenario(50011, 0)).rejects.toMatchObject({code: 'not_found', message: 'Scenario missing.'});
  const validation = {state: 'needs_input', valid: false, error: 'Fill capacity.', issues: [
    {code: 'missing_value', section: 'inputs', severity: 'error', message: 'Fill capacity.', actual: null},
  ]};
  response({detail: {message: 'Review inputs.', validation}}, 422);
  await expect(fetchScenarios(50011)).rejects.toMatchObject({code: 'validation_error', validation, message: 'Review inputs.'});
  const fields = [{loc: ['body', 'id'], msg: 'Field required', type: 'missing'}];
  response({detail: fields}, 422);
  await expect(fetchScenarios(50011)).rejects.toMatchObject({code: 'validation_error', fieldErrors: fields, message: 'body.id: Field required'});
});

test('malformed error diagnostics preserve HTTP status and raw recovery information', async () => {
  const detail = {message: 'Review inputs.', validation: {issues: 'broken'}};
  response({detail}, 422);
  await expect(fetchScenarios(50011)).rejects.toMatchObject({code: 'validation_error', status: 422, detail, validation: undefined});
});

test('distinguishes unreadable success, unreadable HTTP failure, network failure, and cancellation', async () => {
  for (const [ok, status, code] of [[true, 200, 'invalid_json'], [false, 500, 'http_error']] as const) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ok, status, json: async () => {throw new SyntaxError('HTML');}});
    await expect(fetchScenarios(50011)).rejects.toMatchObject({code, status});
  }
  (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));
  await expect(fetchScenarios(50011)).rejects.toMatchObject({code: 'network_error'});
  const controller = new AbortController();
  controller.abort();
  (global.fetch as jest.Mock).mockRejectedValueOnce(new DOMException('Cancelled', 'AbortError'));
  await expect(requestJson('/test', decodeScenario, {signal: controller.signal})).rejects.toMatchObject({code: 'aborted'});
  expect(global.fetch).toHaveBeenLastCalledWith('/test', {signal: controller.signal});
});
