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