import type {ParameterTable} from './tables';
import type {Scenario, ScenarioId, ScenarioMap, ScenarioPropagation} from './scenario';
import type {ScenarioValidation} from './validation';

/** Existing FastAPI errors can carry a message, validation evidence, or field errors. */
export interface ApiError {
  detail?: string | {message?: string; validation?: ScenarioValidation; [key: string]: unknown}
    | (Array<{loc: Array<string | number>; msg: string; type: string; [key: string]: unknown}>
      & {message?: never; validation?: never});
}

/** Compile-time description of native fetch responses, with no new parsing behavior.
 * Check `ok` before using the success payload. JSON is still external data; a future
 * API decoder can enforce these contracts once legacy compatibility is covered.
 */
export interface ApiResponse<T> extends Response {
  json(): Promise<T & ApiError>;
}

export interface ScenarioResponse {data: Scenario}
export interface ScenarioListResponse {data: ScenarioMap}
export interface TaskResponse {tasks: ScenarioId[]}
export interface CopyScenarioResponse {scenarios: ScenarioMap; new_id: number}

export interface UpdateScenarioRequest {
  updatedScenario: Scenario;
  propagateChanges?: ScenarioPropagation;
}

export interface UpdateExcelRequest {
  id: ScenarioId;
  tableKey: string;
  updatedTable: ParameterTable;
  revision?: string;
}

export interface RunModelRequest {
  scenario: Scenario;
  run_id: string;
}

export interface FillScenarioInputsRequest {
  section: string;
  revision: string;
  value: number;
  apply: boolean;
}
