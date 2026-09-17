import fixture from './fixtures/scenario-contract.json';
import {
  copyScenario,
  deleteScenario,
  replaceExcelSheet,
  uploadAdditionalMap,
  uploadScenario,
} from '../services/app.service';

const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  global.fetch = originalFetch;
});

function response(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

test('copy validates the new record, allows ID zero, and encodes names as a path segment', async () => {
  const body = { new_id: 0, scenarios: { 0: fixture } };
  response(body);
  await expect(copyScenario(50011, '1', 'Copy #1? & more')).resolves.toEqual(body);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:50011/copy/1/Copy%20%231%3F%20%26%20more',
    { method: 'GET', mode: 'cors' },
  );
});

test.each([
  {},
  { new_id: '0', scenarios: { 0: fixture } },
  { new_id: 0, scenarios: {} },
  { new_id: 0, scenarios: { 0: { ...fixture, id: 2 } } },
  { new_id: 0, scenarios: { 0: { ...fixture, input_revision: undefined } } },
  { new_id: 1, scenarios: { 1: { ...fixture, id: 1 } } },
])('a malformed copy cannot claim success or trigger an automatic retry: %#', async (body) => {
  response(body);
  await expect(copyScenario(50011, 1, 'Copy')).rejects.toMatchObject({ code: 'invalid_response' });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('delete sends a numeric ID, accepts an empty list, and rejects a list retaining that ID', async () => {
  response({ data: {} });
  await expect(deleteScenario(50011, { id: '0' })).resolves.toEqual({ data: {} });
  expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:50011/delete_scenario/', {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: '{"id":0}',
  });
  response({ data: { 0: fixture } });
  await expect(deleteScenario(50011, { id: 0 })).rejects.toMatchObject({
    code: 'invalid_response',
  });
});

test('imports preserve multipart bodies and encode both names and query parameters', async () => {
  const data = new FormData();
  data.append('file', new File(['data'], 'inputs.xlsx'));
  response(fixture);
  await expect(uploadScenario(50011, data, 'Inputs #1? & more')).resolves.toEqual(fixture);
  response(fixture);
  await expect(replaceExcelSheet(50011, data, '0')).resolves.toEqual(fixture);
  response(fixture);
  await expect(uploadAdditionalMap(50011, data, '0', 'NetworkNode & extra')).resolves.toEqual(
    fixture,
  );
  const calls = (global.fetch as jest.Mock).mock.calls;
  expect(calls.map(([url]) => url)).toEqual([
    'http://localhost:50011/upload/Inputs%20%231%3F%20%26%20more?defaultNodeType=NetworkNode',
    'http://localhost:50011/replace/0',
    'http://localhost:50011/upload_additional_map/0?defaultNodeType=NetworkNode+%26+extra',
  ]);
  for (const [, options] of calls) {
    expect(options).toEqual({ method: 'POST', mode: 'cors', body: data });
    expect(options.body).toBe(data);
    expect(options).not.toHaveProperty('headers'); // The browser supplies the multipart boundary.
  }
});

test.each([undefined, '', '   '])(
  'uploads require a saved revision, including rejecting %p',
  async (revision) => {
    response({ ...fixture, input_revision: revision });
    await expect(uploadScenario(50011, new FormData(), 'New')).rejects.toMatchObject({
      code: 'invalid_response',
    });
  },
);

test.each([replaceExcelSheet, uploadAdditionalMap])(
  '%p cannot replace a different scenario',
  async (save) => {
    response({ ...fixture, id: 2 });
    await expect(save(50011, new FormData(), 0)).rejects.toMatchObject({
      code: 'invalid_response',
    });
  },
);

test.each([
  () => copyScenario(50011, '01', 'Copy'),
  () => deleteScenario(50011, { id: -1 }),
  () => replaceExcelSheet(50011, new FormData(), ''),
  () => uploadAdditionalMap(50011, new FormData(), '0/other'),
])('rejects invalid scenario identities before a mutation: %#', async (mutate) => {
  await expect(mutate()).rejects.toMatchObject({ code: 'invalid_request' });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('collection and import errors preserve backend messages without retrying mutations', async () => {
  response({ detail: 'Wait for optimization to finish.' }, 409);
  await expect(deleteScenario(50011, { id: 0 })).rejects.toMatchObject({
    code: 'conflict',
    status: 409,
    message: 'Wait for optimization to finish.',
  });
  response(
    { detail: [{ loc: ['query', 'defaultNodeType'], msg: 'Field required', type: 'missing' }] },
    422,
  );
  await expect(uploadScenario(50011, new FormData(), 'New')).rejects.toMatchObject({
    code: 'validation_error',
    message: 'query.defaultNodeType: Field required',
  });
  (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Disconnected'));
  await expect(copyScenario(50011, 0, 'Copy')).rejects.toMatchObject({ code: 'network_error' });
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('HTML');
    },
  });
  await expect(replaceExcelSheet(50011, new FormData(), 0)).rejects.toMatchObject({
    code: 'invalid_json',
  });
  expect(global.fetch).toHaveBeenCalledTimes(4);
});
