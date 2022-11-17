 
import './App.css';
import React from 'react';
import {useEffect, useState} from 'react';   
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Header from './components/Header/Header'; 
import Dashboard from './views/Dashboard/Dashboard';
import ScenarioList from './views/ScenarioList/ScenarioList';
import LandingPage from './views/LandingPage/LandingPage';
import { updateScenario, updateExcel } from './services/app.service'
import { deleteScenario, copyScenario } from './services/scenariolist.service'
import { fetchScenarios } from './services/sidebar.service'
import { checkTasks } from './services/homepage.service'


function App() {
  
  const [ scenarioData, setScenarioData ] = useState(null);
  const [ scenarios, setScenarios ] = useState({}); 
  const [ section, setSection ] = useState(0)
  const [ category, setCategory ] = useState(null)
  const [ scenarioIndex, setScenarioIndex ] = useState(null)
  const [ backgroundTasks, setBackgroundTasks ] = useState([])
  const [ showHeader, setShowHeader ] = useState(false)
  const [ loadLandingPage, setLoadLandingPage ] = useState(1)
  const [ checkModelResults, setCheckModelResults ] = useState(0)
  const TIME_BETWEEN_CALLS = 20000
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
        console.log('loaded landing page on try #'+loadLandingPage)
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
      navigate('/scenarios', {replace: true})
    });
    })
    .catch(e => {
      console.error('try #'+loadLandingPage+' unable to check for tasks: ',e)
      setTimeout(function() {
        setLoadLandingPage(loadLandingPage+1)
      }, 1000)
  
      
    })
    
}, [loadLandingPage]);

useEffect(()=> {
  /*
    if model is running, periodically check for results 
  */
 if(checkModelResults > 0) {
  /*
    make api call to get status of each running task
  */
  fetchScenarios()
    .then(response => response.json())
    .then((data)=>{
      let tempScenarios = data.data
      let updated = false
      let completed = false
      for (var i =0; i < backgroundTasks.length; i++) {
        let task = backgroundTasks[i]
        let tempScenario = tempScenarios[task]
        if(tempScenario.results.status !== scenarios[task].results.status) {
          updated=true
          if(tempScenario.results.status === "complete") completed = true
        }
      }
      if(updated) {
        console.log('updated')
        if(completed) {
          console.log('completed')
          /*
            set scenario data, section and scenarios; finish checking
          */
          setScenarioData(tempScenarios[backgroundTasks[0]])
          setScenarios(tempScenarios)
          setSection(2)
          setCheckModelResults(0)
          setCategory("Dashboard")
          navigate('/scenario', {replace: true})
        } else {
          console.log('not completed')
          /*
            set scenarios and scenario data; keep checking
          */
            setScenarioData(tempScenarios[backgroundTasks[0]])
            setScenarios(tempScenarios)
            if(checkModelResults < 100) {
              setTimeout(function() {
                setCheckModelResults(checkModelResults+1)
              }, TIME_BETWEEN_CALLS)
            }
        }
      } else {
        if(checkModelResults < 100) {
          setTimeout(function() {
            setCheckModelResults(checkModelResults+1)
          }, TIME_BETWEEN_CALLS)
        }
      }
    }).catch(e => {
      console.log('unable to fetch scenarios and check results: '+e)
    })
 }
}, [checkModelResults])

  const navigateToScenarioList = () => {
    /*
      function for returning to scenario list and resetting scenario data
    */   
    setShowHeader(true)
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
    navigate('/scenarios', {replace: true})
  }

  const handleScenarioSelection = (scenario) => {
    navigate('/scenario', {replace: true})
    setScenarioData(scenarios[scenario]);
    setScenarioIndex(scenario)
    /*
      if scenario is curretly running or solved, send user to model results tab
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
    setShowHeader(true)
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

  const handleEditScenarioName = (newName, id, updateScenarioData) => {
    const tempScenarios = {...scenarios}
    const tempScenario = tempScenarios[id]
    console.log('updating scenario: ',tempScenario)
    tempScenario.name = newName
    tempScenarios[id] = tempScenario
    setScenarios(tempScenarios)
    if (updateScenarioData) {
      setScenarioData(tempScenario)
    }
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
      console.log('error on scenario delete')
      console.log(e)
    })
  }

  const handleCopyScenario = (index) => {
    console.log('copying scenario: ',index)
    copyScenario(index)
    .then(response => response.json())
    .then((data) => {
      console.log('copy scenario')
      setScenarios(data.data)
    }).catch(e => {
      console.log('error on scenario copy')
      console.log(e)
    })
  }

  const handleUpdateExcel = (id, tableKey, updatedTable) => {
    updateExcel({"id": id, "tableKey":tableKey, "updatedTable":updatedTable})
    .then(response => response.json())
    .then((data)=>{
      console.log('return from update excel: '+data)
      
    })
    .catch(e => {
      console.error('unable to check for tasks: ',e)
    })
  }

  const resetScenarioData = () => {
    console.log('resetting scenario data, index is '+scenarioIndex)
    fetchScenarios()
      .then(response => response.json())
      .then((data)=>{
        console.log('setscenarios: ',data.data)
        setScenarios(data.data)
        setScenarioData(data.data[scenarioIndex])
      });
  }

  const addTask = (id) => {
    let tempBackgroudTasks = [...backgroundTasks]
    tempBackgroudTasks.push(id)
    setBackgroundTasks(tempBackgroudTasks)
    setCheckModelResults(checkModelResults+1)
  }

  return (
    <div className="App">  
      <Header 
        showHeader={showHeader}
        scenarios={scenarios} 
        index={scenarioIndex} 
        scenarioData={scenarioData} 
        handleSelection={handleScenarioSelection}
        navigateHome={navigateToScenarioList}
        />
        
      <Routes> 
      <Route 
          path="/" 
          element={
            <LandingPage
            navigateToScenarioList={navigateToScenarioList}
            handleNewScenario={handleNewScenario} 
            scenarios={scenarios} 
            />} 
        />

        <Route 
          path="/scenarios" 
          element={
            <ScenarioList
            handleNewScenario={handleNewScenario} 
            handleEditScenarioName={handleEditScenarioName} 
            handleSelection={handleScenarioSelection}
            section={section} 
            scenarios={scenarios} 
            deleteScenario={handleDeleteScenario}
            copyScenario={handleCopyScenario}
            handleSetSection={handleSetSection} 
            setShowHeader={setShowHeader}
            />} 
        />

        <Route 
          path="/scenario" 
          element={
            <Dashboard 
            handleUpdateExcel={handleUpdateExcel}
            updateScenario={handleScenarioUpdate} 
            handleEditScenarioName={handleEditScenarioName} 
            scenario={scenarioData} 
            section={section} 
            category={category} 
            handleSetCategory={handleSetCategory} 
            handleSetSection={handleSetSection} 
            backgroundTasks={backgroundTasks}
            navigateHome={navigateToScenarioList}
            resetScenarioData={resetScenarioData}
            addTask={addTask}
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
