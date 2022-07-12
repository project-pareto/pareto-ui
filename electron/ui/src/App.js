 
import './App.css';
import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Routes, Route } from "react-router-dom";
import Header from 'components/Header/Header'; 
import Sidebar from 'components/Sidebar/Sidebar'
import DataInput from 'views/DataInput/DataInput';
import HomePage from 'views/HomePage/HomePage';

function App() {
  
  const [open, setOpenSidebar] = React.useState(true);
  const [scenarioData, setScenarioData] = React.useState(null);

  const handleSidebarOpen = () => {
    setOpenSidebar(true);
    console.log('open = '+open)
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
    console.log('open = '+open)
  };

  const handleScenarioSelection = (data) => {
    setScenarioData(data);
  };

  return (
    <div className="App">  
      <Header/>
      <Sidebar open={open} handleOpen={handleSidebarOpen} handleClose={handleSidebarClose} handleSelection={handleScenarioSelection}></Sidebar>
      <Routes> 
        <Route path="/" element={<HomePage scenario={scenarioData} shiftRight={open}/>} />
        {/* <Route path="/DataInput" element={<DataInput scenario={scenarioData} shiftRight={open}/>} /> */}
      </Routes> 
    </div> 
  );
  
}

export default App;
