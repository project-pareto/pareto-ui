import { requestWorkbook } from '../services/apiClient';
import {
  fetchDiagram,
  uploadDiagram,
  deleteDiagram,
  fetchExcelTemplate,
  fetchExcelFile,
  generateReport,
  generateExcelFromMap,
} from '../services/app.service';
import fixture from './fixtures/scenario-contract.json';

const originalFetch = global.fetch;
const workbookType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
// The client checks the container signature, not the internal workbook schema.
const workbookBytes = new Uint8Array([0x50, 0x4b, 3, 4, 1, 2, 3]);
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  global.fetch = originalFetch;
});
function json(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}
function file(type = workbookType, data = workbookBytes.buffer) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: new Headers({ 'Content-Type': type }),
    arrayBuffer: async () => data,
  });
}

test('all workbook routes return checked blobs, accept ID zero and encode asset names', async () => {
  const signal = new AbortController().signal;
  const operations = [
    () => fetchExcelTemplate(50011, '0', signal),
    () => generateExcelFromMap(50011, 0, signal),
    () => generateReport(50011, '0', signal),
    () => fetchExcelFile(50011, 'Workshop #1? & more.xlsx', signal),
  ];
  for (const run of operations) {
    file();
    const blob = await run();
    expect(blob.size).toBe(workbookBytes.length);
    expect(blob.type).toBe(workbookType);
  }
  expect((global.fetch as jest.Mock).mock.calls).toEqual([
    ['http://localhost:50011/get_template/0', { signal }],
    ['http://localhost:50011/generate_excel_from_map/0', { signal }],
    ['http://localhost:50011/generate_report/0', { signal }],
    ['http://localhost:50011/get_excel_file/Workshop%20%231%3F%20%26%20more.xlsx', { signal }],
  ]);
});

test.each(['application/octet-stream', 'application/zip', `${workbookType}; charset=utf-8`])(
  'supported workbook media type %s still requires the ZIP header',
  async (type) => {
    file(type);
    await expect(generateReport(50011, 0)).resolves.toHaveProperty('type', workbookType);
    file(type, new Uint8Array([60, 104, 116, 109, 108]).buffer);
    await expect(generateReport(50011, 0)).rejects.toMatchObject({ code: 'invalid_response' });
  },
);

test.each(['application/json', 'text/html', 'text/plain', ''])(
  'HTTP 200 with %s cannot become an Excel download',
  async (type) => {
    file(type);
    await expect(generateReport(50011, 0)).rejects.toMatchObject({
      code: 'invalid_response',
      status: 200,
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  },
);

test.each([
  new ArrayBuffer(0),
  new Uint8Array([0x50, 0x4b]).buffer,
  new Uint8Array([123, 34, 100, 34, 125]).buffer,
])(
  'empty, truncated and JSON file bodies fail even with an Excel content type: %#',
  async (data) => {
    file(workbookType, data);
    await expect(fetchExcelTemplate(50011, 0)).rejects.toMatchObject({ code: 'invalid_response' });
  },
);

test('file failures retain JSON error details and never download unreadable HTTP errors or retry', async () => {
  json({ detail: 'Report is not ready.' }, 404);
  await expect(generateReport(50011, 0)).rejects.toMatchObject({
    code: 'not_found',
    status: 404,
    message: 'Report is not ready.',
  });
  json({ detail: { message: 'Wait for optimization.' } }, 409);
  await expect(generateReport(50011, 0)).rejects.toMatchObject({
    code: 'conflict',
    status: 409,
    message: 'Wait for optimization.',
  });
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => {
      throw new SyntaxError('HTML');
    },
  });
  await expect(generateReport(50011, 0)).rejects.toMatchObject({ code: 'http_error', status: 500 });
  (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Offline'));
  await expect(generateReport(50011, 0)).rejects.toMatchObject({ code: 'network_error' });
  expect(global.fetch).toHaveBeenCalledTimes(4);
});

test.each([
  ['AbortError', 'aborted'],
  ['TypeError', 'network_error'],
])('file body failure %s is normalized', async (name, code) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: new Headers({ 'Content-Type': workbookType }),
    arrayBuffer: async () => {
      throw new DOMException('Interrupted', name);
    },
  });
  await expect(requestWorkbook('/file')).rejects.toMatchObject({ code, status: 200 });
});

test('diagram reads check paths and distinguish absence from unrelated errors', async () => {
  const signal = new AbortController().signal;
  json({ data: '/tmp/0.png' });
  await expect(fetchDiagram(50011, 'input', '0', signal)).resolves.toBe('/tmp/0.png');
  expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:50011/get_diagram/input/0', {
    signal,
  });
  json({ detail: 'no diagram found: missing extension' }, 400);
  await expect(fetchDiagram(50011, 'output', 0)).resolves.toBeNull();
  json({ detail: 'Permission denied.' }, 400);
  await expect(fetchDiagram(50011, 'output', 0)).rejects.toMatchObject({
    code: 'http_error',
    message: 'Permission denied.',
  });
  for (const body of [{}, { data: null }, { data: 42 }, { data: '  ' }]) {
    json(body);
    await expect(fetchDiagram(50011, 'input', 0)).rejects.toMatchObject({
      code: 'invalid_response',
    });
  }
});

test('diagram upload checks the legacy null acknowledgement and preserves multipart headers', async () => {
  const data = new FormData();
  data.append('file', new File(['image'], 'diagram.png'));
  json(null);
  await expect(uploadDiagram(50011, data, 'input', 0)).resolves.toBeNull();
  expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:50011/upload_diagram/input/0', {
    method: 'POST',
    mode: 'cors',
    body: data,
  });
  json({ error: 'upload failed' });
  await expect(uploadDiagram(50011, data, 'input', 0)).rejects.toMatchObject({
    code: 'invalid_response',
  });
});

test('diagram deletion requires the requested scenario, while permitting legacy missing revisions', async () => {
  const legacy = { ...fixture, input_revision: undefined };
  json({ data: legacy });
  await expect(deleteDiagram(50011, 'input', '0')).resolves.toEqual({ data: legacy });
  json({ data: { ...fixture, id: 1 } });
  await expect(deleteDiagram(50011, 'output', 0)).rejects.toMatchObject({
    code: 'invalid_response',
  });
});

test('invalid identities, diagram kinds and asset path segments fail before a request', async () => {
  await expect(fetchDiagram(50011, 'other' as 'input', 0)).rejects.toMatchObject({
    code: 'invalid_request',
  });
  await expect(uploadDiagram(50011, new FormData(), 'input', '01')).rejects.toMatchObject({
    code: 'invalid_request',
  });
  await expect(deleteDiagram(50011, 'input', -1)).rejects.toMatchObject({
    code: 'invalid_request',
  });
  for (const run of [fetchExcelTemplate, generateReport, generateExcelFromMap]) {
    await expect(run(50011, '')).rejects.toMatchObject({ code: 'invalid_request' });
  }
  for (const name of ['../other.xlsx', 'dir\\other.xlsx', '', '.', '..']) {
    await expect(fetchExcelFile(50011, name)).rejects.toMatchObject({ code: 'invalid_request' });
  }
  expect(global.fetch).not.toHaveBeenCalled();
});
