import './Dashboard.css';
import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import {  } from "react-router-dom";
import Button from '@mui/material/Button';
import ProcessToolbar from '../../components/ProcessToolbar/ProcessToolbar'
import Bottombar from '../../components/Bottombar/Bottombar'; 
import DataInput from '../DataInput/DataInput'
import Optimization from '../Optimization/Optimization'
import ModelResults from '../ModelResults/ModelResults'
import Sidebar from '../../components/Sidebar/Sidebar'
import { runModel } from '../../services/homepage.service'
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';



export default function Dashboard(props) {
  const scenario = props.scenario
  const [ openEditName, setOpenEditName ] = useState(false)
  const [ name, setName ] = useState('')

  const handleOpenEditName = () => setOpenEditName(true);
  const handleCloseEditName = () => setOpenEditName(false);

  useEffect(()=>{
    try {
      if(!scenario) {
        props.navigateHome()
      }
      setName(scenario.name)
    }
    catch (e){
      console.error('unable to set scenario name: ',e)
    }
  }, [scenario]);

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
    modalStyle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    },
   }

   const handleRunModel = () => {
    console.log('running model')
      runModel({"scenario": scenario})
      .then(r =>  r.json().then(data => ({status: r.status, body: data})))
      .then((response) => {
        let responseCode = response.status
        let data = response.body
        if(responseCode === 200) {
          console.log('run model successful: ')
          console.log(data)
          props.updateScenario(data)
          props.handleSetSection(2)
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
    props.handleEditScenarioName(name)
    setOpenEditName(false)
  }



  return (
    <>
    <ProcessToolbar 
        handleSelection={props.handleSetSection} 
        selected={props.section} 
        scenario={scenario}>
      </ProcessToolbar>
      {(props.section === 0 || (props.section === 2 && scenario.results.status === "complete")) && 
        <Sidebar handleSetCategory={props.handleSetCategory} scenario={scenario} section={props.section} category={props.category}></Sidebar>
      }
      
    <Grid container spacing={1} sx={(props.section !== 1 && !(props.section == 2 && scenario.results.status != "complete")) && styles.shiftTextRight}>
      <Grid item xs={4} ></Grid>
      <Modal
          open={openEditName}
          onClose={handleCloseEditName}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
      >
          <Grid container sx={styles.modalStyle} spacing={1}>
              <Grid item xs={12}>
                  <TextField
                      required
                      variant="standard"
                      id="margin-none"
                      label="Config Name"
                      value={name}
                      onChange={handleEditName}
                      fullWidth
                  />
              </Grid>
              <Grid item xs={8}></Grid>
              <Grid item xs={4}>
                  <Button onClick={handleSaveName} variant="contained">Save</Button>
              </Grid>
          </Grid>
      </Modal>
      <Grid item xs={4}>
      <div>
        <b id='scenarioTitle' >
        {(scenario && props.section===0)? <p>{scenario.name}<IconButton onClick={handleOpenEditName} style={{fontSize:"15px", zIndex:'0'}}><EditIcon fontSize='inherit'></EditIcon></IconButton></p> : null}
      </b> 
      </div>
      </Grid>
      <Grid item xs={4}>
      </Grid>
      <Grid item xs={12}>
      {(scenario && props.section===0) ? <DataInput category={props.category} scenario={scenario}></DataInput> : null}
      {(scenario && props.section===1) ? <Optimization category={props.category} scenario={scenario} updateScenario={props.updateScenario}></Optimization> : null}
      {(scenario && props.section===2) ? <ModelResults category={props.category} scenario={scenario} handleSetSection={props.handleSetSection}></ModelResults> : null}
      </Grid>
    </Grid>
    <Bottombar handleSelection={props.handleSetSection} section={props.section} backgroundTasks={props.backgroundTasks} scenario={scenario} handleRunModel={handleRunModel}></Bottombar>
    </>
  );

}


