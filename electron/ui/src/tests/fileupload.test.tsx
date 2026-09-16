import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import FileUploadModal from '../components/FileUploadModal/FileUploadModal';
import { uploadScenario } from '../services/app.service';
import fixture from './fixtures/scenario-contract.json';

jest.mock('../AppContext', () => ({ useApp: () => ({ port: 50011 }) }));
jest.mock('react-drag-drop-files', () => ({
  FileUploader: ({ handleChange, disabled, children }) => (
    <>
      <input
        type="file"
        aria-label="Input file"
        disabled={disabled}
        onChange={(event) => handleChange(event.target.files[0])}
      />
      {children}
    </>
  ),
}));

const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  global.fetch = originalFetch;
});

function setup() {
  const close = jest.fn();
  const accept = jest.fn();
  render(
    <FileUploadModal
      setShowFileModal={close}
      showSampleFiles={false}
      handleFileUpload={async (file, nodeType, name) => {
        const data = new FormData();
        data.append('file', file, file.name);
        accept(await uploadScenario(50011, data, name, nodeType));
      }}
    />,
  );
  fireEvent.change(screen.getByRole('textbox', { name: /Scenario Name/ }), {
    target: { value: 'Import test' },
  });
  fireEvent.change(screen.getByLabelText('Input file'), {
    target: { files: [new File(['input'], 'inputs.xlsx')] },
  });
  return { close, accept };
}

test('waits for a checked upload before closing and blocks duplicate submissions', async () => {
  let resolve: (response: unknown) => void;
  (global.fetch as jest.Mock).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const { close, accept } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Create Scenario' }));
  expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: /Scenario Name/ })).toBeDisabled();
  expect(screen.getByLabelText('Input file')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Uploading…' }));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  expect(accept).not.toHaveBeenCalled();
  await act(async () => resolve({ ok: true, status: 200, json: async () => fixture }));
  expect(accept).toHaveBeenCalledWith(fixture);
  expect(close).toHaveBeenCalledWith(false);
});

test.each([
  [400, { detail: 'Cannot read workbook.' }, /Cannot read workbook/],
  [200, { id: 0 }, /invalid response/i],
])(
  'HTTP %s upload failures retain the form and file for an explicit retry',
  async (status, body, message) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status === 200,
      status,
      json: async () => body,
    });
    const { close, accept } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Create Scenario' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('textbox', { name: /Scenario Name/ })).toHaveValue('Import test');
    expect(screen.getByText('inputs.xlsx')).toBeVisible();
    expect(close).not.toHaveBeenCalled();
    expect(accept).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => fixture,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Scenario' }));
    await waitFor(() => expect(close).toHaveBeenCalledWith(false));
    expect(accept).toHaveBeenCalledWith(fixture);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  },
);
