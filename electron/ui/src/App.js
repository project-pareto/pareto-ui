 
import './App.css';
import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Header from './components/Header/Header'; 
import Dashboard from './views/Dashboard/Dashboard';
import ScenarioList from './views/ScenarioList/ScenarioList';
import {useEffect, useState} from 'react';   
import { updateScenario } from './services/app.service'
import { deleteScenario } from './services/scenariolist.service'
import { fetchScenarios } from './services/sidebar.service'
import { checkTasks } from './services/homepage.service'


function App() {
  
  const [ scenarioData, setScenarioData ] = useState(null);
  const [ scenarios, setScenarios ] = useState({}); 
  const [ section, setSection ] = useState(0)
  const [ category, setCategory ] = useState(null)
  const [ scenarioIndex, setScenarioIndex ] = useState(null)
  const [ backgroundTasks, setBackgroundTasks ] = useState([])
  let navigate = useNavigate();

  useEffect(()=>{
    /*
      1) check for optimizations that are currently running
      2) fetch all scenarios
      3) if a scenario is a draft, is optimized, or is currently running, leave it as is
      4) if a scenario was running when the app was previously quit, reset it to draft
    */
    checkTasks()
    .then(response => response.json())
    .then((data)=>{
      let tasks = data.tasks
      setBackgroundTasks(tasks)
      fetchScenarios()
      .then(response => response.json())
      .then((data)=>{
        console.log('setscenarios: ',data.data)
        /* 
        check for any scenarios that were running when the app was previously quit
        reset the status of these scenarios so that they can be treated as drafts again
        */ 
        const tempScenarios = {}
          for (var key in data.data){
            let scenario = {...data.data[key]}
            tempScenarios[key] = scenario
            if (!['complete','none','failure'].includes(scenario.results.status) && !tasks.includes(scenario.id)) {
              scenario.results.status = 'none'
              updateScenario({'updatedScenario': {...scenario}})
              .then(response => response.json())
              .then((data) => {
                console.log('reset scenario')
              }).catch(e => {
                console.log('error on scenario update')
                console.log(e)
              })
            }
        }
      setScenarios(tempScenarios)
    });
    })
    .catch(e => {
      console.error('unable to check for tasks: ',e)
    })
    
}, []);

  const navigateHome = () => {
    setScenarioData(null)
    setSection(0)
    setCategory(null)
    setScenarioIndex(null)
    fetchScenarios()
    .then(response => response.json())
    .then((data)=>{
      console.log('setscenarios: ',data.data)
      setScenarios(data.data)
    });
    navigate('/', {replace: true})
  }

  const handleScenarioSelection = (scenario) => {
    navigate('/scenario', {replace: true})
    setScenarioData(scenarios[scenario]);
    setScenarioIndex(scenario)
    /*
      if scenario is curretly running, send user to model results tab
    */
    if(["Initializing", "Solving model", "Generating output", "complete"].includes(scenarios[scenario].results.status)) {
      setCategory("Dashboard")
      setSection(2)
    } else {
      setSection(0);
      setCategory("PNA")
    }

  };

  const handleNewScenario = (data) => {
    const temp = {...scenarios}
    temp[data.id] = data
    setScenarios(temp)
    setScenarioIndex(data.id)
    setScenarioData(data)
    setSection(0);
    setCategory("PNA")
    navigate('/scenario', {replace: true})   
  }

  const handleScenarioUpdate = (updatedScenario) => {
    const temp = {...scenarios}
    temp[scenarioIndex] = {...updatedScenario}
    console.log('updating scenario: ',updateScenario)
    setScenarios(temp)
    setScenarioData({...updatedScenario})
    console.log('new scenario: ')
    console.log({...updatedScenario})
    updateScenario({'updatedScenario': {...updatedScenario}})
    .then(response => response.json())
    .then((data) => {
      console.log('updated scenarios on backend')
    }).catch(e => {
      console.log('error on scenario update')
      console.log(e)
    })
  }

  const handleSetSection = (section) => {
    if(section === 2) {
      setCategory("Dashboard")
      fetchScenarios()
      .then(response => response.json())
      .then((data)=>{
        console.log('setscenarios: ',data.data)
        setScenarios(data.data)
        setScenarioData(data.data[scenarioIndex])
      });
    } else if(section === 0) {
      setCategory("PNA")
    } else {
      setCategory(null)
      checkTasks()
      .then(response => response.json())
      .then((data)=>{
        console.log('background tasks: ',data.tasks)
        setBackgroundTasks(data.tasks)
      });
    }
    setSection(section)
 }

 const handleSetCategory = (category) => {
  setCategory(category)
 }

  const handleEditScenarioName = (newName) => {
    const tempScenario = {...scenarioData}
    tempScenario.name = newName
    console.log('updating scenario: ',tempScenario)
    const tempScenarios = {...scenarios}
    tempScenarios[scenarioIndex] = tempScenario
    setScenarios(tempScenarios)
    setScenarioData(tempScenario)
    updateScenario({'updatedScenario': tempScenario})
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
            handleSetSection={handleSetSection} 
            />} 
        />
        <Route 
          path="/scenario" 
          element={
            <Dashboard 
            updateScenario={handleScenarioUpdate} 
            handleEditScenarioName={handleEditScenarioName} 
            scenario={scenarioData} 
            section={section} 
            category={category} 
            handleSetCategory={handleSetCategory} 
            handleSetSection={handleSetSection} 
            backgroundTasks={backgroundTasks}
            navigateHome={navigateHome}
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
