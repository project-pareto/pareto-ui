
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

export const fetchDiagram = (id) => {
    return fetch('http://localhost:8001/get_diagram/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}

export const uploadDiagarm = (data, id) => {
    return fetch('http://localhost:8001/upload_diagram/'+id, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 