import fixture from './fixtures/scenario-contract.json';
import type {Scenario} from '../types';
import {copyScenario, fetchScenario, fetchScenarios, replaceExcelSheet, requestAIDataUpdate,
  runModel, updateExcel, updateScenario, uploadScenario} from '../services/app.service';

const originalFetch = global.fetch;
beforeEach(() => {global.fetch = jest.fn();});
afterEach(() => {global.fetch = originalFetch;});
function response(body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ok: true, status: 200, json: async () => body});
}

test.each(['omitted', 'null'])('Excel-only scenarios with %s map data work across API boundaries', async representation => {
  const scenario: Scenario = JSON.parse(JSON.stringify(fixture));
  scenario.data_input.origin = 'excel';
  if (representation === 'omitted') delete scenario.data_input.map_data;
  else scenario.data_input.map_data = null;
  const before = JSON.stringify(scenario);
  const file = new FormData();
  file.append('file', new File(['workbook'], 'inputs.xlsx'));

  response(scenario);
  expect(await uploadScenario(50011, file, 'Excel inputs')).toBe(scenario);
  response({data: {'0': scenario}});
  expect((await fetchScenarios(50011)).data['0']).toBe(scenario);
  response(scenario);
  expect(await fetchScenario(50011, 0)).toBe(scenario);
  response(scenario);
  expect(await replaceExcelSheet(50011, file, 0)).toBe(scenario);
  response(scenario);
  expect(await updateExcel(50011, {id: 0, tableKey: 'PadRates',
    updatedTable: {ProductionPads: ['P1'], T01: [100], T02: [0]}})).toBe(scenario);
  response({data: scenario});
  expect((await updateScenario(50011, {updatedScenario: scenario})).data).toBe(scenario);

  const copied = {...scenario, id: 1};
  response({scenarios: {'0': scenario, '1': copied}, new_id: 1});
  expect((await copyScenario(50011, 0, 'Copy')).scenarios['1']).toBe(copied);
  const started = {...scenario, results: {status: 'Preparing inputs', run_id: 'excel-run', data: {}}};
  response(started);
  expect(await runModel(50011, {scenario, run_id: 'excel-run'})).toBe(started);
  const completed = {...started, results: {...started.results, status: 'Optimized', data: {flow: [['P1', 100]]}}};
  response(completed);
  expect(await fetchScenario(50011, 0)).toBe(completed);

  response({status: 'success', updatedScenario: scenario.data_input});
  const proposed = await requestAIDataUpdate(50011, 0, 'Update forecasts');
  expect(proposed).toMatchObject({
    status: 'success', updatedScenario: {df_sets: scenario.data_input.df_sets,
      df_parameters: scenario.data_input.df_parameters, origin: 'excel',
      ...(representation === 'null' ? {map_data: null} : {})},
  });
  expect('updatedScenario' in proposed && 'map_data' in proposed.updatedScenario).toBe(representation === 'null');
  expect(JSON.stringify(scenario)).toBe(before);
});
