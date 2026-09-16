import {act, render} from '@testing-library/react';
import {ScenarioProvider, useScenario, ScenarioContextValue} from '../context/ScenarioContext';
import fixture from './fixtures/scenario-contract.json';
import {checkTasks} from '../services/app.service';

jest.mock('../AppContext', () => ({useApp: () => ({port: 50011})}));
jest.mock('../services/app.service', () => ({...jest.requireActual('../services/app.service'), checkTasks: jest.fn()}));

let context: ScenarioContextValue;
const originalFetch = global.fetch;
let consoleError: jest.SpyInstance;
function Probe() {context = useScenario(); return null;}
beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  (checkTasks as jest.Mock).mockResolvedValue({tasks: []});
});
afterEach(() => {
  global.fetch = originalFetch;
  consoleError.mockRestore();
  jest.useRealTimers();
});

test('initial malformed data is caught and the existing retry can recover', async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({data: []})})
    .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({data: {'0': fixture}})});
  const navigate = jest.fn();
  await act(async () => {render(<ScenarioProvider navigate={navigate}><Probe/></ScenarioProvider>);});
  expect(context.scenarios).toEqual({});
  expect(navigate).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({code: 'invalid_response'}));
  await act(async () => {jest.advanceTimersByTime(1000);});
  expect(context.scenarios['0']).toEqual(fixture);
  expect(navigate).toHaveBeenCalledTimes(1);
});

test('a late initial response after unmount cannot navigate or start polling', async () => {
  let resolveResponse: (value: unknown) => void;
  (global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => {resolveResponse = resolve;}));
  const navigate = jest.fn();
  const view = render(<ScenarioProvider navigate={navigate}><Probe/></ScenarioProvider>);
  await act(async () => {});
  view.unmount();
  await act(async () => resolveResponse({ok: true, status: 200, json: async () => ({data: {'0': fixture}})}));
  expect(navigate).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});
