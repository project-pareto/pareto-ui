import React, { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [ port, setPort ] = useState(50011);
  const [ foundPort, setFoundPort ] = useState(false)

  useEffect(() => {
    /*
      search for backend port
    */
    fetch('http://localhost:'+port+'/get_project_name', {
        method: 'GET', 
        mode: 'cors',
    })
    .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                if (data === "pareto") { 
                    console.log("found pareto on port "+ port)
                    setFoundPort(true)
                }
                else  {
                    setPort(port + 1)
                }
            }).catch((err)=>{
                setPort(port + 1)
            })
        }
        else {
            setPort(port + 1)
        }
    }).catch((err) => {
        setPort(port + 1)
    })
  }, [port]);


  const value = {
    port
  };

  return (
    <AppContext.Provider value={value}>
      {foundPort && children}
    </AppContext.Provider>
  );
};
