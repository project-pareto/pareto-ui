/** Structural checks only: never coerce cells, fill blanks, or remove source metadata. */
export type Decoder<T> = (value: unknown, path: string) => T;

export class DecodeError extends Error {
  constructor(public readonly path: string, expected: string) {
    super(`Invalid response at ${path}: expected ${expected}.`);
    this.name = 'DecodeError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const string: Decoder<string> = (value, path) => {
  if (typeof value !== 'string') throw new DecodeError(path, 'a string');
  return value;
};
export const number: Decoder<number> = (value, path) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new DecodeError(path, 'a finite number');
  return value;
};
export const boolean: Decoder<boolean> = (value, path) => {
  if (typeof value !== 'boolean') throw new DecodeError(path, 'a boolean');
  return value;
};
export const unknown: Decoder<unknown> = value => value;
export const optional = <T>(decode: Decoder<T>): Decoder<T | undefined> =>
  (value, path) => value === undefined ? undefined : decode(value, path);
export const nullable = <T>(decode: Decoder<T>): Decoder<T | null> =>
  (value, path) => value === null ? null : decode(value, path);
export const literal = <T extends string>(...values: T[]): Decoder<T> => (value, path) => {
  for (const allowed of values) if (value === allowed) return allowed;
  throw new DecodeError(path, values.join(' or '));
};
export const either = <A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<A | B> => (value, path) => {
  try { return a(value, path); } catch (error) {
    if (!(error instanceof DecodeError)) throw error;
    return b(value, path);
  }
};
export const array = <T>(decode: Decoder<T>): Decoder<T[]> => (value, path) => {
  if (!Array.isArray(value)) throw new DecodeError(path, 'an array');
  value.forEach((item: unknown, index) => decode(item, `${path}[${index}]`));
  // Every member was checked above; return the original to preserve its representation.
  return value as T[];
};
export const record = <T>(decode: Decoder<T>): Decoder<Record<string, T>> => (value, path) => {
  if (!isRecord(value)) throw new DecodeError(path, 'an object');
  Object.entries(value).forEach(([key, item]) => decode(item, `${path}.${key}`));
  return value as Record<string, T>;
};

type Shape = Record<string, Decoder<unknown>>;
type Decoded<S extends Shape> = {[K in keyof S]: ReturnType<S[K]>} & Record<string, unknown>;
export const object = <S extends Shape>(shape: S): Decoder<Decoded<S>> => (value, path) => {
  if (!isRecord(value)) throw new DecodeError(path, 'an object');
  Object.entries(shape).forEach(([key, decode]) => decode(
    Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined, `${path}.${key}`));
  // All declared fields were checked. Extra fields deliberately remain unknown.
  return value as Decoded<S>;
};
