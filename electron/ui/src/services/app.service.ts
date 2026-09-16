import type {
    ApiResponse, ScenarioResponse, ScenarioListResponse, TaskResponse, CopyScenarioResponse,
    UpdateScenarioRequest, UpdateExcelRequest, RunModelRequest, FillScenarioInputsRequest,
    Scenario, ScenarioId, ScenarioValidationResult, ScenarioFillPreview,
} from '../types';
import {ApiClientError, requestJson, scenarioId} from './apiClient';
import {object} from './contracts/decode';
import {decodeScenarioList, scenarioFor} from './contracts/scenario';
import {decodeTasks, decodeValidationResult, fillPreviewFor, runFor} from './contracts/workflow';

let BACKEND_URL = "http://localhost"

export const updateScenario = async (backend_port: number, data: UpdateScenarioRequest): Promise<ScenarioResponse> => {
    const id = scenarioId(data.updatedScenario.id);
    return requestJson(BACKEND_URL+':'+backend_port+'/update', object({data: scenarioFor(id, true)}), {
        method: 'POST', 
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
}; 

export const updateExcel = async (backend_port: number, data: UpdateExcelRequest): Promise<Scenario> => {
    const id = scenarioId(data.id);
    return requestJson(BACKEND_URL+':'+backend_port+'/update_excel', scenarioFor(id, true), {
        method: 'POST', 
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...data, id})
    });
}; 

export const fetchScenarios = (backend_port: number): Promise<ScenarioListResponse> => {
    return requestJson(BACKEND_URL+':'+backend_port+'/get_scenario_list/', decodeScenarioList, {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const checkTasks = (backend_port: number): Promise<TaskResponse> => {
    return requestJson(BACKEND_URL+':'+backend_port+'/check_tasks/', decodeTasks, {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const fetchDiagram = (backend_port: number, type: string, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/get_diagram/'+type+'/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const uploadDiagram = (backend_port: number, data: FormData, type: string, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/upload_diagram/'+type+'/'+id, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 

export const deleteDiagram = (backend_port: number, type: string, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/delete_diagram/'+type+'/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const fetchExcelTemplate = (backend_port: number, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/get_template/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const replaceExcelSheet = (backend_port: number, data: FormData, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/replace/'+id, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 

export const fetchExcelFile = (backend_port: number, filename: string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/get_excel_file/'+filename, {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const runModel = async (backend_port: number, data: RunModelRequest): Promise<Scenario> => {
    const id = scenarioId(data.scenario.id);
    if (typeof data.run_id !== 'string' || !data.run_id.trim()) throw new ApiClientError('invalid_request', 'An optimization run ID is required.');
    return requestJson(BACKEND_URL+':'+backend_port+'/run_model', runFor(id, data.run_id), {
        method: 'POST', 
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
}; 

export const deleteScenario = (backend_port: number, data: {id: ScenarioId}): Promise<ApiResponse<ScenarioListResponse>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/delete_scenario/', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const copyScenario = (backend_port: number, id: number | string, newScenarioName: string): Promise<ApiResponse<CopyScenarioResponse>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/copy/'+id+'/'+newScenarioName, {
        method: 'GET', 
        mode: 'cors'
    });
};

export const fetchScenario = async (backend_port: number, id: ScenarioId): Promise<Scenario> => {
    const parsedId = scenarioId(id);
    return requestJson(`${BACKEND_URL}:${backend_port}/get_scenario/${parsedId}`, scenarioFor(parsedId));
};

export const uploadScenario = (backend_port: number, data: FormData, name: string, defaultNodeType: string) => {
    let endpoint = BACKEND_URL+':'+backend_port+'/upload/'+name
    if (defaultNodeType) endpoint += `?defaultNodeType=${defaultNodeType}`
    return fetch(endpoint, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
};

export const uploadAdditionalMap = (backend_port: number, data: FormData, id: number | string, defaultNodeType: string): Promise<ApiResponse<Scenario>> => {
    let endpoint = BACKEND_URL+':'+backend_port+'/upload_additional_map/'+id
    if (defaultNodeType) endpoint += `?defaultNodeType=${defaultNodeType}`
    return fetch(endpoint, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 

export const generateReport = (backend_port: number, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/generate_report/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const generateExcelFromMap = (backend_port: number, id: number | string) => {
    return fetch(BACKEND_URL+':'+backend_port+'/generate_excel_from_map/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const getScenarioReadiness = async (port: number, id: ScenarioId, signal?: AbortSignal): Promise<ScenarioValidationResult> =>
    requestJson(`${BACKEND_URL}:${port}/scenario_readiness/${scenarioId(id)}`, decodeValidationResult, {signal});

export function fillScenarioInputs(port: number, id: ScenarioId, payload: FillScenarioInputsRequest & {apply: true}): Promise<Scenario>;
export function fillScenarioInputs(port: number, id: ScenarioId, payload: FillScenarioInputsRequest & {apply: false}): Promise<ScenarioFillPreview>;
export async function fillScenarioInputs(port: number, id: ScenarioId, payload: FillScenarioInputsRequest): Promise<Scenario | ScenarioFillPreview> {
    const parsedId = scenarioId(id);
    const decode = payload.apply ? scenarioFor(parsedId, true) : fillPreviewFor(payload.revision, payload.value);
    return requestJson<Scenario | ScenarioFillPreview>(`${BACKEND_URL}:${port}/fill_scenario_inputs/${parsedId}`, decode, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
    });
}

export const checkScenarioFeasibility = async (port: number, id: ScenarioId): Promise<ScenarioValidationResult> =>
    requestJson(`${BACKEND_URL}:${port}/scenario_feasibility/${scenarioId(id)}`, decodeValidationResult, {method: 'POST'});

export const savePlanningHorizon = async (port: number, id: ScenarioId, periods: string[], revision?: string): Promise<Scenario> => {
    const parsedId = scenarioId(id);
    return requestJson(`${BACKEND_URL}:${port}/planning_horizon/${parsedId}`, scenarioFor(parsedId, true), {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({periods, revision})});
};

export const getAIAvailability = (backend_port: number, signal?: AbortSignal) =>
    fetch(`${BACKEND_URL}:${backend_port}/ai_available`, { signal });

export const getAISettings = (backend_port: number) =>
    fetch(`${BACKEND_URL}:${backend_port}/ai_settings`);

export const saveAISettings = (backend_port: number, settings: {api_key?: string; base_url: string; model: string}) =>
    fetch(`${BACKEND_URL}:${backend_port}/ai_settings`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(settings),
    });

export const resetAISettings = (backend_port: number) =>
    fetch(`${BACKEND_URL}:${backend_port}/ai_settings`, {method: 'DELETE'});

export const requestAIDataUpdate = (backend_port: number, id: number | string, prompt: string) => {
    let endpoint = `${BACKEND_URL}:${backend_port}/request_ai_data_update/${id}`
    return fetch(endpoint, {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify({"prompt": prompt})
    });
}

export const requestAIOptimizationDiagnosis = (
    backend_port: number,
    id: number | string,
    errorMessage: string
) => {
    const endpoint = `${BACKEND_URL}:${backend_port}/request_ai_optimization_diagnosis/${id}`
    return fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({ errorMessage })
    });
}

export const validateScenario = async (backend_port: number, id: ScenarioId): Promise<ScenarioValidationResult> => {
    return requestJson(BACKEND_URL+':'+backend_port+'/validate_scenario/'+scenarioId(id), decodeValidationResult, {
        method: 'GET',
        mode: 'cors'
    });
};

export const advanceToOptimizationSetup = async (backend_port: number, id: ScenarioId): Promise<ScenarioResponse> => {
    const parsedId = scenarioId(id);
    return requestJson(BACKEND_URL+':'+backend_port+'/advance_to_optimization_setup/'+parsedId, object({data: scenarioFor(parsedId, true)}), {
        method: 'POST',
        mode: 'cors'
    });
};
