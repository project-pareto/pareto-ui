
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

export const uploadDiagarm = (data, type, id) => {
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