 
import './App.css';
import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Routes, Route } from "react-router-dom";
import Header from 'components/Header/Header'; 
import Bottombar from 'components/Bottombar/Bottombar'; 
import ProcessToolbar from 'components/ProcessToolbar/ProcessToolbar'
import HomePage from 'views/HomePage/HomePage';
import { fetchScenarios } from './services/sidebar.service'
import {useEffect, useState} from 'react';   
import { updateScenario } from 'services/app.service'


function App() {
  
  const [ scenarioData, setScenarioData ] = useState(null);
  const [ scenarios, setScenarios ] = useState([]); 
  const [ section, setSection ] = useState(0)
  const [ category, setCategory ] = useState(null)
  const [ scenarioIndex, setScenarioIndex ] = useState(null)

  useEffect(()=>{
    fetchScenarios()
    .then(response => response.json())
    .then((data)=>{
      console.log('setscenarios: ',data.data)
      setScenarios(data.data)
    });
}, []);


  const handleScenarioSelection = (data) => {
    setScenarioData(scenarios[data.target.value]);
    setScenarioIndex(data.target.value)
    setSection(0);
    setCategory(null)
  };

  const handleNewScenario = (data) => {
    const temp = [...scenarios]
    temp.push(data)
    setScenarios(temp)
    setScenarioData(data)
    setScenarioIndex(temp.length-1)
    setSection(0);
    setCategory(null)    
  }

  const handleScenarioUpdate = (updatedScenario) => {
    const temp = [...scenarios]
    scenarios[scenarioIndex] = updatedScenario
    setScenarios(temp)
    setScenarioData(updatedScenario)
    console.log('new scenario: ')
    console.log(updatedScenario)
    updateScenario({'updatedScenarios': temp})
    .then(response => response.json())
    .then((data) => {
      console.log('updated scenarios on backend')
    }).catch(e => {
      console.log('error on scenario update')
      console.log(e)
    })
  }

  const handleSetSelection = (section) => {
    if(section === 2) {
      setCategory("v_F_Overview_dict")
    } else {
      setCategory(null)
    }
    setSection(section)
 }

 const handleSetCategory = (category) => {
  setCategory(category)
 }

  const handleEditScenarioName = (newName) => {
    const tempScenario = {...scenarioData}
    tempScenario.name = newName
    const tempScenarios = [...scenarios]
    tempScenarios[scenarioIndex] = tempScenario
    setScenarios(tempScenarios)
    setScenarioData(tempScenario)
    updateScenario({'updatedScenarios': tempScenarios})
    .then(response => response.json())
    .then((data) => {
      console.log('updated scenarios on backend')
    }).catch(e => {
      console.log('error on scenario update')
      console.log(e)
    })
  }

  return (
    <div className="App">  
      <Header 
        scenarios={scenarios} 
        index={scenarioIndex} 
        scenarioData={scenarioData} 
        handleNewScenario={handleNewScenario} 
        handleSelection={handleScenarioSelection}/>
      <ProcessToolbar 
        handleSelection={handleSetSelection} 
        selected={section} 
        scenario={scenarioData}>
      </ProcessToolbar>
      <Routes> 
        <Route 
          path="/" 
          element={
            <HomePage 
            updateScenario={handleScenarioUpdate} 
            handleEditScenarioName={handleEditScenarioName} 
            scenario={scenarioData} 
            section={section} 
            category={category} 
            handleSetCategory={handleSetCategory} 
            />} 
        />
      </Routes> 
      <Bottombar handleSelection={handleSetSelection} section={section} scenario={scenarioData}></Bottombar>
    </div> 
  );
  
}

export default App;
