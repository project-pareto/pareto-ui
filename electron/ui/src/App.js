 
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
import ModelCompletionBar from './components/ModelCompletionBar/ModelCompletionBar';
import { updateScenario, updateExcel, fetchScenarios, checkTasks } from './services/app.service'
import { deleteScenario } from './services/scenariolist.service'


function App() {
  
  const [ scenarioData, setScenarioData ] = useState(null);
  const [ scenarios, setScenarios ] = useState({}); 
  const [ appState, setAppState ] = useState(null)
  const [ section, setSection ] = useState(0)
  const [ category, setCategory ] = useState(null)
  const [ scenarioIndex, setScenarioIndex ] = useState(null)
  const [ backgroundTasks, setBackgroundTasks ] = useState([])
  const [ showHeader, setShowHeader ] = useState(false)
  const [ loadLandingPage, setLoadLandingPage ] = useState(1)
  const [ checkModelResults, setCheckModelResults ] = useState(0)
  const [ showCompletedOptimization, setShowCompletedOptimization ] = useState(false)
  const [ lastCompletedScenario, setLastCompletedScenario ] = useState(null)
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
        // console.log('loaded landing page on try #'+loadLandingPage)
        // console.log('setscenarios: ',data.data)
        /* 
        check for any scenarios that were running when the app was previously quit
        reset the status of these scenarios so that they can be treated as drafts again
        */ 
        const tempScenarios = {}
          for (var key in data.data){
            let scenario = {...data.data[key]}
            tempScenarios[key] = scenario
            if (!['Optimized','Draft','failure', 'Not Optimized', 'complete', 'none', 'Infeasible'].includes(scenario.results.status) && !tasks.includes(scenario.id)) {
              scenario.results.status = 'Draft'
              updateScenario({'updatedScenario': {...scenario}})
              .then(response => response.json())
              .then((data) => {
                console.log('reset scenario')
              }).catch(e => {
                console.error('error on scenario update')
                console.error(e)
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
        setLoadLandingPage(loadLandingPage => loadLandingPage+1)
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
        if(tempScenario.results.status !== scenarios[task].results.status) updated=true
        if(tempScenario.results.status === "Optimized" || tempScenario.results.status === "failure" || tempScenario.results.status === "Infeasible") completed = true
      }
      if (completed) {
          /*
            set scenario data, section and scenarios; finish checking
          */
            setLastCompletedScenario(backgroundTasks[0])
            handleCompletedOptimization(tempScenarios, backgroundTasks[0])
      } else if (updated) {
          /*
            set scenarios and scenario data; keep checking
          */
            if(""+scenarioIndex === ""+backgroundTasks[0]) {
              setScenarioData(tempScenarios[backgroundTasks[0]])
            }
            setScenarios(tempScenarios)
            if(checkModelResults < 1000) {
              setTimeout(function() {
                setCheckModelResults(checkModelResults => checkModelResults+1)
              }, TIME_BETWEEN_CALLS)
            }
      } else {
        if(checkModelResults < 1000) {
          setTimeout(function() {
            setCheckModelResults(checkModelResults => checkModelResults+1)
          }, TIME_BETWEEN_CALLS)
        }
      }
    }).catch(e => {
      console.error('unable to fetch scenarios and check results: '+e)
    })
 }
}, [checkModelResults])

  const handleCompletedOptimization = (newScenarios, id) => {
    setCheckModelResults(0)
    setScenarios(newScenarios)
    checkTasks()
      .then(response => response.json())
      .then((data)=>{
        setBackgroundTasks(data.tasks)
      });
    /*
      if not on model results tab, show popup that lets user know that model has finished running
    */
   if(""+id === ""+scenarioIndex && section === 2){
    setScenarioData(newScenarios[id])
   }else {
    setShowCompletedOptimization(true)
   }
  }

  const goToModelResults = () => {
    setShowCompletedOptimization(false)
    handleScenarioSelection(lastCompletedScenario)

  }

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
    updateAppState({action: 'select'}, scenario)

  };

  const handleNewScenario = (data) => {
    const temp = {...scenarios}
    temp[data.id] = data
    setShowHeader(true)
    setScenarios(temp)
    setScenarioIndex(data.id)
    setScenarioData(data)
    updateAppState({action:'new'}, data.id)
    navigate('/scenario', {replace: true})   
  }

  const handleScenarioUpdate = (updatedScenario) => {
    console.log('inside handle scenario update')
    if (updatedScenario.results.status==='Optimized') {
      console.log('changing status to not optimized')
      updatedScenario.results.status = "Not Optimized"
    }
    const temp = {...scenarios}
    temp[scenarioIndex] = {...updatedScenario}
    console.log('updating scenario: ',updatedScenario)
    setScenarios(temp)
    setScenarioData({...updatedScenario})
    // console.log('new scenario: ')
    // console.log({...updatedScenario})
    updateScenario({'updatedScenario': {...updatedScenario}})
    .then(response => response.json())
    .then((data) => {
      // console.log('updated scenarios on backend')
    }).catch(e => {
      console.error('error on scenario update')
      console.error(e)
    })
  }

  /*
    set process section (input, optimization, results)
  */
  const handleSetSection = (section) => {
    updateAppState({action:'section',section:section},scenarioIndex)
 }

 /*
  set sidebar category
 */
 const handleSetCategory = (category) => {
  updateAppState({action:'category',category:category},scenarioIndex)
 }

  const handleEditScenarioName = (newName, id, updateScenarioData) => {
    const tempScenarios = {...scenarios}
    const tempScenario = tempScenarios[id]
    tempScenario.name = newName
    tempScenarios[id] = tempScenario
    setScenarios(tempScenarios)
    if (updateScenarioData) {
      setScenarioData(tempScenario)
    }
    updateScenario({'updatedScenario': tempScenario})
    .then(response => response.json())
    .then((data) => {
      // console.log('updated scenarios on backend')
    }).catch(e => {
      console.error('error on scenario update')
      console.error(e)
    })
  }

  const handleDeleteScenario = (index) => {
    // console.log('deleting scenario: ',index)
    deleteScenario({'id': index})
    .then(response => response.json())
    .then((data) => {
      setScenarios(data.data)
      updateAppState({action:'delete'},index)
    }).catch(e => {
      console.error('error on scenario delete')
      console.error(e)
    })
  }

  /*
    function for updating an input table for excel sheet
  */
  const handleUpdateExcel = (id, tableKey, updatedTable) => {
    updateExcel({"id": id, "tableKey":tableKey, "updatedTable":updatedTable})
    .then(response => response.json())
    .then((data)=>{
      console.log('return from update excel: ')
      console.log(data)
      if (data.results.status === 'Optimized') {
        data.results.status = "Not Optimized"
        handleScenarioUpdate(data)
      }
    })
    .catch(e => {
      console.error('unable to update excel: ',e)
    })
  }

  /*
    fetch scenarios and update frontend data
  */
  const syncScenarioData = () => {
    fetchScenarios()
      .then(response => response.json())
      .then((data)=>{
        setScenarios(data.data)
        setScenarioData(data.data[scenarioIndex])
      });
  }

  /*
    add scenario id to background tasks while it's optimizing
  */
  const addTask = (id) => {
    let tempBackgroudTasks = [...backgroundTasks]
    tempBackgroudTasks.push(id)
    setBackgroundTasks(tempBackgroudTasks)
    setCheckModelResults(checkModelResults+1)
  }

  /*
    update the section or category and cache the values
  */
  const updateAppState = (action, index) => {
    if (action.action === 'select') {
      let tempSection
      let tempCategory
      if (appState) {
        if (scenarios[index].results.status === "Draft" && appState.section === 2) {
          tempSection = 0
          tempCategory = appState.category
        } else {
          tempSection = appState.section
          tempCategory = appState.category
        }
      } else {
        console.log('in else')
        if(["Initializing", "Solving model", "Generating output", "Optimized", "failure"].includes(scenarios[index].results.status)) {
          tempSection = 2
        } else {
          tempSection = 0
        }
        tempCategory = {0: "Input Summary", 1: null, 2: "Dashboard"}
        let tempState = {section: tempSection, category: tempCategory}
        setAppState(tempState)
      }
      setSection(tempSection)
      setCategory(tempCategory[tempSection])
    } else if (action.action === 'new') {
      let tempSection = 0
      let tempCategory = {0: "Input Summary", 1: null, 2: "Dashboard"}
      let tempState = {section: tempSection, category: tempCategory}
      setAppState(tempState)
      setSection(tempSection)
      setCategory(tempCategory[tempSection])
    } else if (action.action === 'section') {
      let tempState = {...appState}
      tempState.section = action.section
      setAppState(tempState)
      setSection(action.section)
      setCategory(tempState.category[action.section])
    }else if (action.action === 'category') {
      let tempState = {...appState}
      tempState.category[section] = action.category
      setAppState(tempState)
      setCategory(action.category)
    }
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
            setScenarios={setScenarios}
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
            syncScenarioData={syncScenarioData}
            addTask={addTask}
            appState={appState}
            updateAppState={updateAppState}
            />} 
        />

        <Route
          path="*" 
          element={<Navigate replace to="/" />}
        />
      </Routes> 
      {showCompletedOptimization && 
        <ModelCompletionBar
          setShowCompletedOptimization={setShowCompletedOptimization}
          goToModelResults={goToModelResults}
        />
      }
      
    </div> 
  );
  
}

export default App;
