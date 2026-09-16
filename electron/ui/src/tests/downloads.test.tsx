import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Bottombar from '../components/Bottombar/Bottombar';
import ModelResults from '../views/ModelResults/ModelResults';
import { downloadFile } from '../services/download';
import fixture from './fixtures/scenario-contract.json';

jest.mock('../AppContext', () => ({ useApp: () => ({ port: 50011 }) }));
jest.mock('../context/AIPromptContext', () => ({ useAIPrompt: () => ({ isAvailable: false }) }));
jest.mock('../components/AIPromptDialog/AIPromptDialog', () => () => null);
jest.mock('../views/ModelResults/SankeyPlot', () => () => null);
jest.mock('../views/ModelResults/KPIDashboard', () => () => null);
jest.mock('../components/NetworkDiagram/NetworkDiagram', () => () => null);
jest.mock('../components/WaterResiduals/WaterResiduals', () => () => null);

const originalFetch = global.fetch;
const originalRevoke = URL.revokeObjectURL;
const sync = jest.fn();
const scenario = { ...fixture, results: { status: 'Incomplete', data: {} } };
const props = {
  port: 50011,
  scenario,
  section: 0,
  backgroundTasks: [],
  syncScenarioData: sync,
  handleSelection: jest.fn(),
};
let click: jest.SpyInstance;
let create: jest.SpyInstance;
let clicks: Array<{ filename: string; connected: boolean }>;
const workbook = () => ({
  ok: true,
  status: 200,
  headers: new Headers({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }),
  arrayBuffer: async () => new Uint8Array([0x50, 0x4b, 3, 4, 1]).buffer,
});

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
  sync.mockReset();
  clicks = [];
  create = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:workbook');
  URL.revokeObjectURL = jest.fn();
  click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    clicks.push({ filename: this.download, connected: this.isConnected });
  });
});
afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  global.fetch = originalFetch;
  URL.revokeObjectURL = originalRevoke;
  click.mockRestore();
  create.mockRestore();
});

test('a failed workbook download shows its error, retains the draft, and permits explicit retry', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 404,
    json: async () => ({ detail: 'Workbook is unavailable.' }),
  });
  render(<Bottombar {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Workbook is unavailable.');
  expect(click).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
  expect(sync).not.toHaveBeenCalled();
  (global.fetch as jest.Mock).mockResolvedValueOnce(workbook());
  fireEvent.click(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' }));
  await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
  expect(clicks).toEqual([{ filename: 'Contract example.xlsx', connected: true }]);
  expect(screen.queryByRole('link', { hidden: true })).not.toBeInTheDocument();
  expect(sync).not.toHaveBeenCalled(); // Export is a read; it must not reload an editing draft.
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:workbook');
});

test('pending exports disable duplicate clicks and are ignored after switching scenarios', async () => {
  let resolve: (value: unknown) => void;
  (global.fetch as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const view = render(<Bottombar {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' }));
  expect(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' }));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const signal = (global.fetch as jest.Mock).mock.calls[0][1].signal;
  view.rerender(<Bottombar {...props} scenario={{ ...scenario, id: 2 }} />);
  await act(async () => resolve(workbook()));
  expect(signal.aborted).toBe(true);
  expect(click).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' })).toBeEnabled();
});

test('leaving the view suppresses errors from an obsolete download', async () => {
  let reject: (error: Error) => void;
  (global.fetch as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((_done, fail) => {
        reject = fail;
      }),
  );
  const view = render(<Bottombar {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Generate Spreadsheet From Network' }));
  const signal = (global.fetch as jest.Mock).mock.calls[0][1].signal;
  view.unmount();
  await act(async () => reject(new Error('Disconnected')));
  expect(signal.aborted).toBe(true);
  expect(click).not.toHaveBeenCalled();
});

test('the report button uses the checked client and exposes invalid HTTP-success files', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ...workbook(),
    headers: new Headers({ 'Content-Type': 'text/html' }),
  });
  render(
    <ModelResults
      scenario={{
        ...fixture,
        results: { status: 'Optimized', data: {}, terminationCondition: 'optimal' },
      }}
      category="Dashboard"
      updateScenario={jest.fn()}
      handleSetSection={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Generate Excel Report' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/did not return an Excel workbook/);
  expect(click).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Generate Excel Report' })).toBeEnabled();
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:50011/generate_report/0',
    expect.any(Object),
  );
});

test('temporary download elements and URLs are released even if the browser click fails', () => {
  click.mockImplementationOnce(() => {
    throw new Error('Download blocked');
  });
  expect(() => downloadFile(new Blob(['test']), 'report.xlsx')).toThrow('Download blocked');
  expect(screen.queryByRole('link', { hidden: true })).not.toBeInTheDocument();
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
});
