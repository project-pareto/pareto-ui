import type { CopyScenarioResponse, ScenarioListResponse } from '../../types';
import { DecodeError, Decoder, object } from './decode';
import { decodeScenarioId, decodeScenarioList, decodeScenarioMap, scenarioFor } from './scenario';

const copyResponse = object({ scenarios: decodeScenarioMap, new_id: decodeScenarioId });

export const copiedScenarioFor =
  (sourceId: number): Decoder<CopyScenarioResponse> =>
  (value, path) => {
    const result = copyResponse(value, path);
    if (result.new_id === sourceId) throw new DecodeError(`${path}.new_id`, 'a new scenario ID');
    scenarioFor(result.new_id, true)(
      result.scenarios[String(result.new_id)],
      `${path}.scenarios.${result.new_id}`,
    );
    return result;
  };

export const deletedScenarioFor =
  (id: number): Decoder<ScenarioListResponse> =>
  (value, path) => {
    const result = decodeScenarioList(value, path);
    if (Object.prototype.hasOwnProperty.call(result.data, String(id))) {
      throw new DecodeError(`${path}.data`, 'a scenario list without the deleted scenario');
    }
    return result;
  };
