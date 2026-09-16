import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import IssueFill from '../components/ScenarioCompletion/IssueFill';
import ValidationIssues from '../components/ScenarioValidationDialog/ValidationIssues';
import {fillScenarioInputs} from '../services/app.service';
import fixture from './fixtures/scenario-contract.json';

jest.mock('../services/app.service', () => ({fillScenarioInputs: jest.fn()}));
const request = fillScenarioInputs as jest.Mock;
const props = {port: 50011, scenarioId: 1, revision: 'revision-one', section: 'costs', title: 'Costs and assumptions', count: 18, disabled: false};
const preview = {revision: 'revision-one', value: 0, cell_count: 18,
  tables: [{name: 'PipelineOperationalCost', cell_count: 18, unit: 'USD/bbl'}]};
const service = jest.requireActual('../services/app.service');
const originalFetch = global.fetch;
beforeEach(() => {request.mockReset(); request.mockImplementation(service.fillScenarioInputs); global.fetch = jest.fn();});
afterEach(() => {global.fetch = originalFetch;});

test('autofill previews all flagged cells and applies an explicit zero using the saved revision', async () => {
  const saved = {...fixture, id: 1, input_revision: 'revision-two'};
  (global.fetch as jest.Mock).mockResolvedValueOnce({ok: true, json: async () => preview})
    .mockResolvedValueOnce({ok: true, json: async () => saved});
  const onSaved = jest.fn();
  render(<IssueFill {...props} onSaved={onSaved}/>);
  fireEvent.click(screen.getByRole('button', {name: 'Autofill flagged cells (18)'}));
  expect(screen.getByRole('button', {name: 'Preview autofill'})).toBeDisabled();
  expect(screen.getByRole('button', {name: 'Apply autofill'})).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Value for flagged cells'), {target: {value: '0'}});
  fireEvent.click(screen.getByRole('button', {name: 'Preview autofill'}));
  expect(await screen.findByText('18 cells will change to 0.')).toBeInTheDocument();
  expect(screen.getByText('PipelineOperationalCost: 18 cells (USD/bbl)')).toBeInTheDocument();
  expect(onSaved).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', {name: 'Apply autofill'}));
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
  expect(request).toHaveBeenLastCalledWith(50011, 1, {section: 'costs', revision: 'revision-one', value: 0, apply: true});
});

test('changing the number or input revision requires a fresh preview', async () => {
  (global.fetch as jest.Mock).mockImplementation(async (_url, options) => ({ok: true,
    json: async () => ({...preview, value: JSON.parse(options.body).value})}));
  const {rerender} = render(<IssueFill {...props} onSaved={jest.fn()}/>);
  fireEvent.click(screen.getByRole('button', {name: /Autofill flagged cells/}));
  fireEvent.change(screen.getByLabelText('Value for flagged cells'), {target: {value: '0'}});
  fireEvent.click(screen.getByRole('button', {name: 'Preview autofill'}));
  await screen.findByText('18 cells will change to 0.');
  fireEvent.change(screen.getByLabelText('Value for flagged cells'), {target: {value: '5'}});
  expect(screen.getByRole('button', {name: 'Apply autofill'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button', {name: 'Preview autofill'}));
  await screen.findByText('18 cells will change to 5.');
  rerender(<IssueFill {...props} revision="revision-two" onSaved={jest.fn()}/>);
  expect(screen.getByRole('button', {name: 'Apply autofill'})).toBeDisabled();
});

test('a rejected autofill keeps the dialog open and displays the server explanation', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ok: false, status: 400, json: async () => ({detail: 'DisposalOperatingCapacity requires a value between 0 and 1.'})});
  const onSaved = jest.fn();
  render(<IssueFill {...props} onSaved={onSaved}/>);
  fireEvent.click(screen.getByRole('button', {name: /Autofill flagged cells/}));
  fireEvent.change(screen.getByLabelText('Value for flagged cells'), {target: {value: '20'}});
  fireEvent.click(screen.getByRole('button', {name: 'Preview autofill'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('requires a value between 0 and 1');
  expect(screen.getByRole('button', {name: 'Apply autofill'})).toBeDisabled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('network info explains the rule and offers navigation to the affected feature', () => {
  const issue = {code: 'unreachable_destination', section: 'network', severity: 'error' as const, area: 'map',
    row: ['R01'], message: 'R01 produces water but has no directed route to a destination.',
    help: {rule: 'Supported pipelines and trucking routes both count.', steps: ['Check Node Type.', 'Follow the flow arrows to a destination.']}};
  const select = jest.fn();
  render(<ValidationIssues issues={[issue]} onSelect={select}/>);
  fireEvent.click(screen.getByRole('button', {name: /How to address: R01/}));
  expect(screen.getByRole('dialog')).toHaveTextContent(issue.help.rule);
  expect(screen.getByRole('dialog')).toHaveTextContent('Follow the flow arrows');
  fireEvent.click(screen.getByRole('button', {name: 'Review affected input'}));
  expect(select).toHaveBeenCalledWith(issue);
});

test('a malformed preview never enables apply', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ok: true, status: 200, json: async () => ({...preview, value: 100})});
  const onSaved = jest.fn();
  render(<IssueFill {...props} onSaved={onSaved}/>);
  fireEvent.click(screen.getByRole('button', {name: /Autofill flagged cells/}));
  fireEvent.change(screen.getByLabelText('Value for flagged cells'), {target: {value: '0'}});
  fireEvent.click(screen.getByRole('button', {name: 'Preview autofill'}));
  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid response/i);
  expect(screen.getByRole('button', {name: 'Apply autofill'})).toBeDisabled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('a preview arriving after the input revision changed cannot enable apply', async () => {
  let resolve: (value: unknown) => void;
  (global.fetch as jest.Mock).mockReturnValue(new Promise(done => {resolve = done;}));
  const {rerender} = render(<IssueFill {...props} onSaved={jest.fn()}/>);
  fireEvent.click(screen.getByRole('button', {name: /Autofill flagged cells/}));
  fireEvent.change(screen.getByLabelText('Value for flagged cells'), {target: {value: '0'}});
  fireEvent.click(screen.getByRole('button', {name: 'Preview autofill'}));
  rerender(<IssueFill {...props} revision="revision-two" onSaved={jest.fn()}/>);
  await act(async () => resolve({ok: true, json: async () => preview}));
  expect(screen.queryByText('18 cells will change to 0.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Apply autofill'})).toBeDisabled();
});
