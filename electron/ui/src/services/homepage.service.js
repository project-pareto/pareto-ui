
export const runModel = (data) => {
    return fetch('http://localhost:8001/run_model/', {
        method: 'POST', 
        mode: 'cors',
        body: JSON.stringify(data)
    });
}; 

export const checkTasks = () => {
    return fetch('http://localhost:8001/check_tasks/', {
        method: 'GET', 
        mode: 'cors'
    });
}; 

export const getPlots = (id) => {
    return fetch('http://localhost:8001/get_plots/'+id, {
        method: 'GET', 
        mode: 'cors'
    });
}; 