import type { ScenarioValidation } from '../types';
import {
  array,
  DecodeError,
  Decoder,
  either,
  isRecord,
  number,
  object,
  string,
} from './contracts/decode';
import { decodeScenarioId, decodeValidation } from './contracts/scenario';

export type ApiErrorCode =
  | 'network_error'
  | 'aborted'
  | 'http_error'
  | 'conflict'
  | 'not_found'
  | 'validation_error'
  | 'invalid_json'
  | 'invalid_response'
  | 'invalid_request';

const fieldErrors = array(
  object({ loc: array(either(string, number)), msg: string, type: string }),
);
export type ApiFieldError = ReturnType<typeof fieldErrors>[number];

/** Only decoded validation/field errors are typed; raw detail remains available as unknown. */
export class ApiClientError extends Error {
  readonly validation?: ScenarioValidation;
  readonly fieldErrors?: ApiFieldError[];

  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status?: number,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
    Object.setPrototypeOf(this, new.target.prototype);
    try {
      if (isRecord(detail) && detail.validation !== undefined)
        this.validation = decodeValidation(detail.validation, '$.detail.validation');
      if (Array.isArray(detail)) this.fieldErrors = fieldErrors(detail, '$.detail');
    } catch (error) {
      if (!(error instanceof DecodeError)) throw error;
      // Malformed diagnostic data must not conceal the original HTTP failure.
    }
  }
}

const isAbort = (error: unknown) => error instanceof Error && error.name === 'AbortError';

function httpError(response: Response, body: unknown): ApiClientError {
  const detail = isRecord(body) ? body.detail : undefined;
  let message = `Request failed (HTTP ${response.status}).`;
  if (typeof detail === 'string' && detail.trim()) message = detail;
  else if (isRecord(detail)) {
    if (typeof detail.message === 'string' && detail.message.trim()) message = detail.message;
    else if (
      isRecord(detail.validation) &&
      typeof detail.validation.error === 'string' &&
      detail.validation.error.trim()
    ) {
      message = detail.validation.error;
    }
  }
  const code =
    response.status === 409
      ? 'conflict'
      : response.status === 422
        ? 'validation_error'
        : response.status === 404
          ? 'not_found'
          : 'http_error';
  const error = new ApiClientError(code, message, response.status, detail);
  if (error.fieldErrors?.length)
    error.message = error.fieldErrors
      .map((issue) => `${issue.loc.join('.')}: ${issue.msg}`)
      .join('; ');
  return error;
}

/** One attempt only. In particular, never replay a mutation after an uncertain acknowledgement. */
async function requestResponse(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw new ApiClientError(
      isAbort(error) ? 'aborted' : 'network_error',
      isAbort(error)
        ? 'Request cancelled.'
        : 'Unable to reach the backend. Check the connection and try again.',
    );
  }
}

async function readJson(response: Response): Promise<unknown> {
  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    if (isAbort(error)) throw new ApiClientError('aborted', 'Request cancelled.', response.status);
    if (!response.ok) throw httpError(response, undefined);
    throw new ApiClientError(
      'invalid_json',
      'The backend returned an unreadable response. Reload before continuing.',
      response.status,
    );
  }
  if (!response.ok) throw httpError(response, body);
  return body;
}

export async function requestJson<T>(
  url: string,
  decode: Decoder<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await requestResponse(url, init);
  const body = await readJson(response);
  try {
    return decode(body, '$');
  } catch (error) {
    if (!(error instanceof DecodeError)) throw error;
    throw new ApiClientError(
      'invalid_response',
      `${error.message} Reload before continuing.`,
      response.status,
    );
  }
}

/** XLSX responses are ZIP containers. Reject error documents before offering a download. */
export async function requestWorkbook(url: string, init?: RequestInit): Promise<Blob> {
  const response = await requestResponse(url, init);
  if (!response.ok) await readJson(response); // Preserve the same HTTP error details as JSON endpoints.
  const mediaType = response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
  const workbookType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (![workbookType, 'application/octet-stream', 'application/zip'].includes(mediaType ?? '')) {
    throw new ApiClientError(
      'invalid_response',
      'The backend did not return an Excel workbook. Please try again.',
      response.status,
    );
  }
  let data: ArrayBuffer;
  try {
    data = await response.arrayBuffer();
  } catch (error) {
    throw new ApiClientError(
      isAbort(error) ? 'aborted' : 'network_error',
      isAbort(error)
        ? 'Request cancelled.'
        : 'Unable to finish downloading the workbook. Please try again.',
      response.status,
    );
  }
  const header = new Uint8Array(data, 0, Math.min(data.byteLength, 4));
  if (
    data.byteLength <= 4 ||
    header[0] !== 0x50 ||
    header[1] !== 0x4b ||
    header[2] !== 3 ||
    header[3] !== 4
  ) {
    throw new ApiClientError(
      'invalid_response',
      'The backend returned an empty or invalid Excel workbook. Please try again.',
      response.status,
    );
  }
  return new Blob([data], { type: workbookType });
}

/** Accept route text once, without accepting blanks, decimals, or coercible values such as false. */
export function scenarioId(value: unknown): number {
  const parsed = typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value) ? Number(value) : value;
  try {
    return decodeScenarioId(parsed, 'scenario ID');
  } catch {
    throw new ApiClientError('invalid_request', 'A nonnegative integer scenario ID is required.');
  }
}
