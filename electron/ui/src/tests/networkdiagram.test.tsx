import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import NetworkDiagram from '../components/NetworkDiagram/NetworkDiagram';
import fixture from './fixtures/scenario-contract.json';

jest.mock('../AppContext', () => ({ useApp: () => ({ port: 50011 }) }));
jest.mock('../components/NetworkMap/NetworkMap', () => () => <div>Interactive network map</div>);
jest.mock('react-drag-drop-files', () => ({
  FileUploader: ({ handleChange, disabled, children }) => (
    <>
      <input
        type="file"
        aria-label="Diagram file"
        disabled={disabled}
        onChange={(event) => handleChange(event.target.files[0])}
      />
      {children}
    </>
  ),
}));

const scenario = { ...fixture, data_input: { ...fixture.data_input, map_data: null } };
const originalFetch = global.fetch;
const sync = jest.fn();
beforeEach(() => {
  global.fetch = jest.fn();
  sync.mockReset();
});
afterEach(() => {
  global.fetch = originalFetch;
});
const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
function respond(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce(response(body, status));
}
function chooseFile() {
  fireEvent.change(screen.getByLabelText('Diagram file'), {
    target: { files: [new File(['image'], 'diagram.png')] },
  });
}

test.each([
  [500, { detail: 'Cannot remove diagram.' }, /Cannot remove diagram/],
  [200, { data: { ...fixture, id: 2 } }, /invalid response/i],
])(
  'failed deletion retains the image until a checked explicit retry: %#',
  async (status, body, message) => {
    respond({ data: '/tmp/original.png' });
    render(<NetworkDiagram scenario={scenario} type="input" syncScenarioData={sync} />);
    await screen.findByRole('img', { name: 'network diagram' });
    respond(body, status);
    fireEvent.click(screen.getByRole('button', { name: 'Delete diagram' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'file:///tmp/original.png');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    respond({ data: fixture });
    fireEvent.click(screen.getByRole('button', { name: 'Delete diagram' }));
    await waitFor(() => expect(screen.queryByRole('img')).not.toBeInTheDocument());
    expect(screen.getByLabelText('Diagram file')).toBeEnabled();
  },
);

test('normal absence permits upload; a checked acknowledgement reloads the image and blocks duplicate submissions', async () => {
  respond({ detail: 'no diagram found: missing extension' }, 400);
  render(<NetworkDiagram scenario={scenario} type="output" syncScenarioData={sync} />);
  await waitFor(() => expect(screen.getByLabelText('Diagram file')).toBeEnabled());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  let resolve: (value: unknown) => void;
  (global.fetch as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  chooseFile();
  expect(screen.getByLabelText('Diagram file')).toBeDisabled();
  chooseFile();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  respond({ data: '/tmp/new.png' });
  await act(async () => resolve(response(null)));
  expect(screen.getByRole('img')).toHaveAttribute('src', 'file:///tmp/new.png');
  expect(sync).toHaveBeenCalledTimes(1);
});

test('invalid upload acknowledgement keeps the file and exposes reload without publishing success', async () => {
  respond({ detail: 'no diagram found' }, 400);
  render(<NetworkDiagram scenario={scenario} type="input" syncScenarioData={sync} />);
  await waitFor(() => expect(screen.getByLabelText('Diagram file')).toBeEnabled());
  respond({ error: 'not a valid acknowledgement' });
  chooseFile();
  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid response/i);
  expect(screen.getByText('diagram.png')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(sync).not.toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  respond({ data: '/tmp/persisted.png' });
  fireEvent.click(screen.getByRole('button', { name: 'Reload diagram' }));
  expect(await screen.findByRole('img')).toHaveAttribute('src', 'file:///tmp/persisted.png');
});

test('late diagram reads cannot replace a newly selected scenario', async () => {
  let resolve: (value: unknown) => void;
  (global.fetch as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const view = render(<NetworkDiagram scenario={scenario} type="input" />);
  const signal = (global.fetch as jest.Mock).mock.calls[0][1].signal;
  respond({ data: '/tmp/second.png' });
  view.rerender(<NetworkDiagram scenario={{ ...scenario, id: 2 }} type="input" />);
  await screen.findByRole('img');
  await act(async () => resolve(response({ data: '/tmp/first.png' })));
  expect(signal.aborted).toBe(true);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'file:///tmp/second.png');
});

test('an upload acknowledgement after navigation cannot reload another scenario', async () => {
  respond({ detail: 'no diagram found' }, 400);
  const view = render(<NetworkDiagram scenario={scenario} type="input" syncScenarioData={sync} />);
  await waitFor(() => expect(screen.getByLabelText('Diagram file')).toBeEnabled());
  let resolve: (value: unknown) => void;
  (global.fetch as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  chooseFile();
  respond({ data: '/tmp/second.png' });
  view.rerender(
    <NetworkDiagram scenario={{ ...scenario, id: 2 }} type="input" syncScenarioData={sync} />,
  );
  await screen.findByRole('img');
  await act(async () => resolve(response(null)));
  expect(screen.getByRole('img')).toHaveAttribute('src', 'file:///tmp/second.png');
  expect(sync).not.toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledTimes(3);
});

test('switching between a diagram and a map clears the previous view in both directions', async () => {
  respond({ data: '/tmp/diagram.png' });
  const view = render(<NetworkDiagram scenario={scenario} type="input" />);
  await screen.findByRole('img');
  view.rerender(<NetworkDiagram scenario={fixture} type="input" />);
  expect(screen.getByText('Interactive network map')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  respond({ detail: 'no diagram found' }, 400);
  view.rerender(<NetworkDiagram scenario={scenario} type="input" />);
  await waitFor(() => expect(screen.getByLabelText('Diagram file')).toBeEnabled());
  expect(screen.queryByText('Interactive network map')).not.toBeInTheDocument();
});
