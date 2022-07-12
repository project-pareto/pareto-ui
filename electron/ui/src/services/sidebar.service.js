

export const fetchScenarios = () => {
    return fetch('http://localhost:8000/scenarios/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 