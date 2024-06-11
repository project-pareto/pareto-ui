
export const updateScenario = (data) => {
    return fetch('http://localhost:8001/update', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const updateExcel = (data) => {
    return fetch('http://localhost:8001/update_excel', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const fetchScenarios = () => {
    return fetch('http://localhost:8001/get_scenario_list/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const checkTasks = () => {
    return fetch('http://localhost:8001/check_tasks/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const fetchDiagram = (type, id) => {
    return fetch('http://localhost:8001/get_diagram/'+type+'/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const uploadDiagram = (data, type, id) => {
    return fetch('http://localhost:8001/upload_diagram/'+type+'/'+id, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 

export const deleteDiagram = (type, id) => {
    return fetch('http://localhost:8001/delete_diagram/'+type+'/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const fetchExcelTemplate = (id) => {
    return fetch('http://localhost:8001/get_template/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const replaceExcelSheet = (data, id) => {
    return fetch('http://localhost:8001/replace/'+id, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 

export const fetchExcelFile = (filename) => {
    return fetch('http://localhost:8001/get_excel_file/'+filename, {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const runModel = (data) => {
    return fetch('http://localhost:8001/run_model/', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const deleteScenario = (data) => {
    return fetch('http://localhost:8001/delete_scenario/', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const copyScenario = (id, newScenarioName) => {
    return fetch('http://localhost:8001/copy/'+id+'/'+newScenarioName, {
        method: 'GET', 
        mode: 'cors'
    });
};

export const uploadExcelSheet = (data, name) => {
    return fetch('http://localhost:8001/upload/'+name, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 
