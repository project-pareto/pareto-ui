
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