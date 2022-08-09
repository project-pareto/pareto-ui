export const deleteScenario = (data) => {
    return fetch('http://localhost:8001/delete_scenario/', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 