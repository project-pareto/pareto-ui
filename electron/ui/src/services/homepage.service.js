
export const runModel = () => {
    return fetch('http://localhost:8001/run_model/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 