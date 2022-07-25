

export const fetchScenarios = () => {
    return fetch('http://localhost:8001/scenarios/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const uploadExcelSheet = (data) => {
    console.log('sending data: ',data)
    return fetch('http://localhost:8001/upload', {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 



