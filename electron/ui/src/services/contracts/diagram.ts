import { DecodeError, Decoder, object, string } from './decode';

export const decodeDiagram = object({
  data: (value: unknown, path: string): string => {
    const location = string(value, path);
    if (!location.trim()) throw new DecodeError(path, 'a diagram file path');
    return location;
  },
});

// The current upload route acknowledges success with JSON null, not a scenario.
export const decodeDiagramUpload: Decoder<null> = (value, path) => {
  if (value !== null) throw new DecodeError(path, 'a null diagram upload acknowledgement');
  return null;
};
