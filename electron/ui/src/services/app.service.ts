import type {
    ApiResponse, ScenarioResponse, ScenarioListResponse, TaskResponse, CopyScenarioResponse,
    UpdateScenarioRequest, UpdateExcelRequest, RunModelRequest, FillScenarioInputsRequest,
    Scenario, ScenarioId, ScenarioValidation,
} from '../types';

let BACKEND_URL = "http://localhost"

export const updateScenario = (backend_port: number, data: UpdateScenarioRequest): Promise<ApiResponse<ScenarioResponse>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/update', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const updateExcel = (backend_port: number, data: UpdateExcelRequest): Promise<ApiResponse<Scenario>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/update_excel', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const fetchScenarios = (backend_port: number): Promise<ApiResponse<ScenarioListResponse>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/get_scenario_list/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const checkTasks = (backend_port: number): Promise<ApiResponse<TaskResponse>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/check_tasks/', {
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

export const runModel = (backend_port: number, data: RunModelRequest): Promise<ApiResponse<Scenario>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/run_model', {
        method: 'POST', 
        mode: 'cors',
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

export const fetchScenario = (backend_port: number, id: ScenarioId): Promise<ApiResponse<Scenario>> =>
    fetch(`${BACKEND_URL}:${backend_port}/get_scenario/${id}`);

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

export const getScenarioReadiness = (port: number, id: number | string, signal?: AbortSignal): Promise<ApiResponse<ScenarioValidation>> =>
    fetch(`${BACKEND_URL}:${port}/scenario_readiness/${id}`, {signal});

export const fillScenarioInputs = (port: number, id: number, payload: FillScenarioInputsRequest) => fetch(`${BACKEND_URL}:${port}/fill_scenario_inputs/${id}`, {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
});

export const checkScenarioFeasibility = (port: number, id: number | string): Promise<ApiResponse<ScenarioValidation>> =>
    fetch(`${BACKEND_URL}:${port}/scenario_feasibility/${id}`, {method: 'POST'});

export const savePlanningHorizon = (port: number, id: number | string, periods: string[], revision?: string): Promise<ApiResponse<Scenario>> =>
    fetch(`${BACKEND_URL}:${port}/planning_horizon/${id}`, {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({periods, revision})});

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

export const validateScenario = (backend_port: number, id: number | string): Promise<ApiResponse<ScenarioValidation>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/validate_scenario/'+id, {
        method: 'GET',
        mode: 'cors'
    });
};

export const advanceToOptimizationSetup = (backend_port: number, id: number | string): Promise<ApiResponse<ScenarioResponse>> => {
    return fetch(BACKEND_URL+':'+backend_port+'/advance_to_optimization_setup/'+id, {
        method: 'POST',
        mode: 'cors'
    });
};
