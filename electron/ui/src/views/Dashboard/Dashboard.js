import './Dashboard.css';
import React from 'react';
import {useEffect, useState} from 'react';   
import {  } from "react-router-dom";
import { Grid, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import ProcessToolbar from '../../components/ProcessToolbar/ProcessToolbar'
import Bottombar from '../../components/Bottombar/Bottombar'; 
import DataInput from '../DataInput/DataInput'
import Optimization from '../Optimization/Optimization'
import ModelResults from '../ModelResults/ModelResults'
import Sidebar from '../../components/Sidebar/Sidebar'
import PopupModal from '../../components/PopupModal/PopupModal'
import { runModel } from '../../services/app.service'
import { useApp } from '../../AppContext';
import { MapProvider } from '../../context/MapContext';

export default function Dashboard(props) {
  const { 
    scenarios, scenario, navigateHome, updateScenario, updateAppState,
    addTask, handleEditScenarioName, section, category, handleSetSection,
    handleSetCategory, appState, backgroundTasks, syncScenarioData,
    copyAndRunOptimization, handleUpdateExcel,
  } = props;
  const networkMapData = scenario?.data_input?.map_data;
  const [ name, setName ] = useState('')
  const [ openEditName, setOpenEditName ] = useState(false)
  // const [ openSaveChanges, setOpenSaveChanges ] = useState(false)
  const [ inputDataEdited, setInputDataEdited ] = useState(false) 
  const [ disableOptimize, setDisableOptimize ] = useState(false)
  const enabledStatusList = ['Optimized','Draft','failure', 'Not Optimized', 'Infeasible']

  const handleOpenEditName = () => setOpenEditName(true);
  const handleCloseEditName = () => setOpenEditName(false);
  const { port } = useApp()

  // These are for editing the network map
  // const [showNetworkNode, setShowNetworkNode] = useState(false);
  // const [showNetworkPipeline, setShowNetworkPipeline] = useState(false);
  // const [selectedNode, setSelectedNode] = useState(null);

  // const handleClickNode = (node, idx) => {
  //       setSelectedNode({node: node, idx: idx});
  //       setShowNetworkNode(true);
  //   }

  // const handleClickPipeline = (node, idx) => {
  //     // console.log(node)
  //     setSelectedNode({node: node, idx: idx});
  //     setShowNetworkPipeline(true);
  // }

  // const saveNodeChanges = (updatedNode) => {
  //     const idx = selectedNode?.idx;
  //     // console.log(selectedNode);
  //     if (selectedNode) {
  //         if (showNetworkNode) {
  //             // TODO: update on backend, which will return response to automatically update here.
  //             // setNodeData(data => {
  //             //     const updatedNodeList = [...data].map((n, i) =>
  //             //         i === idx ? updatedNode : n
  //             //     );
  //             //     return updatedNodeList;
  //             // })
  //         }
  //         else if (showNetworkPipeline) {
  //             // setLineData(data => {
  //             //     const updatedNodeList = [...data].map((n, i) =>
  //             //         i === idx ? updatedNode : n
  //             //     );
  //             //     return updatedNodeList;
  //             // })
  //         }
  //         setSelectedNode(null);
  //         setShowNetworkNode(false);
  //         setShowNetworkPipeline(false);
  //     } else {
  //         console.error("No node selected, cannot save changes")
  //     }
  // }

  // const networkMapProps = {
  //   showNetworkNode,
  //   setShowNetworkNode,
  //   showNetworkPipeline,
  //   setShowNetworkPipeline,
  //   selectedNode,
  //   setSelectedNode,
  //   networkMapData,
  //   handleClickNode,
  //   handleClickPipeline,
  //   saveNodeChanges
  // }

  useEffect(()=>{
    try {
      if(!scenario) {
        navigateHome()
      }
      setInputDataEdited(false)
      setName(scenario.name)
    }
    catch (e){
      console.error('unable to set scenario name: ',e)
    }
  }, [props, scenario]);

   const styles = {
    shiftTextLeft: {
      paddingLeft: '0px'
    },
    shiftTextRight: {
      paddingLeft: '240px',
      pb: 7
      // paddingTop: '184px'
    },
    titleDivider: {
      m:2, 
      marginTop:2
    },
   }

   const handleRunModel = () => {
      runModel(port, {"scenario": scenario})
      .then(r =>  r.json().then(data => ({status: r.status, body: data})))
      .then((response) => {
        let responseCode = response.status
        let data = response.body
        if(responseCode === 200) {
          updateScenario(data)
          updateAppState({action:'section',section:2},scenario.id)
          addTask(scenario.id)
        }
        else if(responseCode === 500) {
          console.error('error on model run: ',data.detail)
        }
      })
      .catch(e => {
        console.error('error on model run: ',e)
      })
   }

   const handleEditName = (event) => {
    setName(event.target.value)
   }

   const handleSaveName = () => {
    handleEditScenarioName(name, scenario.id, true)
    setOpenEditName(false)
  }
  
  return (
    <MapProvider scenario={scenario} handleUpdateScenario={updateScenario}>
      <ProcessToolbar 
        handleSelection={handleSetSection} 
        selected={section} 
        scenario={scenario}
        category={category} 
        inputDataEdited={inputDataEdited}
        handleUpdateExcel={handleUpdateExcel}
        setInputDataEdited={setInputDataEdited}
        syncScenarioData={syncScenarioData}
      >
      </ProcessToolbar>
      {(section === 0 || (section === 2 && scenario?.results?.status?.includes("Optimized"))) && 
        <Sidebar 
          handleSetCategory={handleSetCategory} 
          scenario={scenario} 
          section={section} 
          category={category} 
          inputDataEdited={inputDataEdited}
          handleUpdateExcel={handleUpdateExcel}
          setInputDataEdited={setInputDataEdited}
          syncScenarioData={syncScenarioData}
          >
        </Sidebar>
      }
      
    <Grid container spacing={1} sx={(section !== 1 && !(section === 2 && !scenario?.results?.status?.includes("Optimized"))) ? styles.shiftTextRight : {}}>
      <Grid item xs={4} ></Grid>
      <PopupModal
        input
        open={openEditName}
        handleClose={handleCloseEditName}
        text={name}
        textLabel='Config Name'
        handleEditText={handleEditName}
        handleSave={handleSaveName}
        buttonText='Save'
        buttonColor='primary'
        buttonVariant='contained'
        width={400}
      />
      <Grid item xs={4}>
      <div>
        <b id='scenarioTitle' >
        {(scenario && section===0) && 
        <p>{scenario.name}
        <IconButton onClick={handleOpenEditName} style={{fontSize:"15px", zIndex:'0'}} disabled={enabledStatusList.includes(scenario.results.status) ? false : true}>
          <EditIcon fontSize='inherit'/>
        </IconButton>
        </p>
        }
      </b> 
      </div>
      </Grid>
      <Grid item xs={4}>
      </Grid>
      <Grid item xs={12}>
      {(scenario && section===0) &&
        <DataInput 
          handleUpdateExcel={handleUpdateExcel} 
          category={category} 
          scenario={scenario} 
          edited={inputDataEdited} 
          handleEditInput={setInputDataEdited}
          syncScenarioData={syncScenarioData}
          handleSetCategory={handleSetCategory} 
          updateScenario={updateScenario}
          // {...networkMapProps}
        />
      }
      {(scenario && section===1) && 
        <Optimization 
          category={category} 
          scenario={scenario} 
          updateScenario={updateScenario}
          handleRunModel={handleRunModel}
          backgroundTasks={backgroundTasks} 
          disabled={disableOptimize}
          setDisabled={setDisableOptimize}
        />
      }
      {(scenario && section===2) && 
        <ModelResults 
          category={category} 
          scenario={scenario} 
          handleSetSection={handleSetSection} 
          appState={appState}
          syncScenarioData={syncScenarioData}
          scenarios={scenarios}
          updateScenario={updateScenario}
          handleSetCategory={handleSetCategory} 
        />
      }
      </Grid>
    </Grid>
    <Bottombar 
      handleSelection={handleSetSection} 
      section={section} 
      backgroundTasks={backgroundTasks} 
      scenario={scenario} 
      category={category}
      handleUpdateExcel={handleUpdateExcel}
      inputDataEdited={inputDataEdited}
      setInputDataEdited={setInputDataEdited}
      syncScenarioData={syncScenarioData}
      handleRunModel={handleRunModel}
      disableOptimize={disableOptimize}
      setDisableOptimize={setDisableOptimize}
      copyAndRunOptimization={copyAndRunOptimization}
      port={port}
      />
    </MapProvider>
  );

}


