 
import './App.css';
import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Header from 'components/Header/Header'; 
import HomePage from 'views/HomePage/HomePage';
import ScenarioList from 'views/ScenarioList/ScenarioList';
import { fetchScenarios } from './services/sidebar.service'
import {useEffect, useState} from 'react';   
import { updateScenario } from 'services/app.service'
import { deleteScenario } from 'services/scenariolist.service'


function App() {
  
  const [ scenarioData, setScenarioData ] = useState(null);
  const [ scenarios, setScenarios ] = useState([]); 
  const [ section, setSection ] = useState(0)
  const [ category, setCategory ] = useState(null)
  const [ scenarioIndex, setScenarioIndex ] = useState(null)
  let navigate = useNavigate();

  useEffect(()=>{
    fetchScenarios()
    .then(response => response.json())
    .then((data)=>{
      console.log('setscenarios: ',data.data)
      setScenarios(data.data)
    });
}, []);

  const navigateHome = () => {
    setScenarioData(null)
    setSection(0)
    setCategory(null)
    setScenarioIndex(null)
    navigate('/', {replace: true})
  }

  const handleScenarioSelection = (scenario) => {
    navigate('/scenario', {replace: true})
    setScenarioData(scenarios[scenario]);
    setScenarioIndex(scenario)
    setSection(0);
    setCategory("ProductionPads")
  };

  const handleNewScenario = (data) => {
    const temp = [...scenarios]
    temp.push(data)
    setScenarios(temp)   
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
    } else if(section === 0) {
      setCategory("ProductionPads")
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

  const handleDeleteScenario = (index) => {
    console.log('deleting scenario: ',index)
    deleteScenario({'id': index})
    .then(response => response.json())
    .then((data) => {
      console.log('deleted scenario')
      setScenarios(data.data)
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
        handleSelection={handleScenarioSelection}
        navigateHome={navigateHome}/>
        
      <Routes> 
        <Route 
          path="/" 
          element={
            <ScenarioList
            handleNewScenario={handleNewScenario} 
            handleEditScenarioName={handleEditScenarioName} 
            handleSelection={handleScenarioSelection}
            section={section} 
            scenarios={scenarios} 
            deleteScenario={handleDeleteScenario}
            />} 
        />
        <Route 
          path="/scenario" 
          element={
            <HomePage 
            updateScenario={handleScenarioUpdate} 
            handleEditScenarioName={handleEditScenarioName} 
            scenario={scenarioData} 
            section={section} 
            category={category} 
            handleSetCategory={handleSetCategory} 
            handleSetSelection={handleSetSelection} 
            />} 
        />
        <Route
          path="*" 
          element={<Navigate replace to="/" />}
        />
      </Routes> 
    </div> 
  );
  
}

export default App;
