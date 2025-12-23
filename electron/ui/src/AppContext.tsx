import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppContextValue } from './types';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [ port, setPort ] = useState(50011);
  const [ foundPort, setFoundPort ] = useState(true)

  // useEffect(() => {
  //   /*
  //     search for backend port
  //   */
  //   fetch('http://localhost:'+port+'/get_project_name', {
  //       method: 'GET', 
  //       mode: 'cors',
  //   })
  //   .then(response => {
  //       if (response.status === 200) {
  //           response.json()
  //           .then((data)=>{
  //               if (data === "pareto") { 
  //                   // console.log("found pareto on port "+ port)
  //                   setFoundPort(true)
  //               }
  //               else  {
  //                   setPort(port + 1)
  //               }
  //           }).catch((err)=>{
  //               setPort(port + 1)
  //           })
  //       }
  //       else {
  //           setPort(port + 1)
  //       }
  //   }).catch((err) => {
  //       setPort(port + 1)
  //   })
  // }, [port]);


  const value: AppContextValue = {
    port
  };

  return (
    <AppContext.Provider value={value}>
      {foundPort && children}
    </AppContext.Provider>
  );
};
