export const uploadExcelSheet = (data, name) => {
    return fetch('http://localhost:8001/upload/'+name, {
        method: 'POST', 
        mode: 'cors',
        body: data
    });
}; 



