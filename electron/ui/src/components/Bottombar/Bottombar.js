import React from 'react';
import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PopupModal from '../../components/PopupModal/PopupModal';


export default function Bottombar(props) {
    const [ openSaveModal, setOpenSaveModal ] = useState(false)
    const [ disableOptimize, setDisableOptimize ] = useState(false) 
    const [ key, setKey ] =  useState(null)
    const [ hasOverride, setHasOverride ] = useState(false)
    const handleOpenSaveModal = () => setOpenSaveModal(true);
    const handleCloseSaveModal = () => setOpenSaveModal(false);
    const styles = {
        filled: {
            backgroundColor: '#01678f',
            '&:hover': {
                backgroundColor: '#01678f',
                opacity: 0.9
            },
        },
        unfilled: {
            color: '#595959'
        }
    }

    useEffect(() => {
      // check if override values are present
      try {
        let tempHasOverride = false
        if(props.scenario.results.status === "Not Optimized"){
          for (let key of Object.keys(props.scenario.override_values)) {
            if(Object.keys(props.scenario.override_values[key]).length>0) tempHasOverride = true
          }    
        }

        setHasOverride(tempHasOverride)
      } catch (e) {
        
      }

    },[props.scenario.override_values])

    useEffect(() => {
        /*
            if the current scenario is already being optimized OR if there are multiple optimizations
            currently running, then we disable the ability to optimize the current scenario
        */
       try{
        let tasks = props.backgroundTasks
        if ((tasks.length > 0) || (!["Draft", "failure", "Optimized", "Not Optimized", "Infeasible"].includes(props.scenario.results.status))) {
            setDisableOptimize(true)
        } else {
            setDisableOptimize(false)
        }
       } catch(e){
        console.error("unable to check for background tasks from bottom bar : ",e)
       }
        
    },[props])
    

    const handleSaveModal = () => {
        // console.log('saving this thing')
        props.handleUpdateExcel(props.scenario.id, props.category, props.scenario.data_input.df_parameters[props.category])
        handleCloseSaveModal()
        props.setInputDataEdited(false)
        props.handleSelection(key)
      }
    
      const handleDiscardChanges = () => {
        handleCloseSaveModal()
        props.setInputDataEdited(false)
        props.handleSelection(key)
        props.syncScenarioData()
      }
    
      const handleClick = (key) => {
        setKey(key)
        console.log('handle click from bottom bar')
        console.log(props.inputDataEdited)
        if (props.inputDataEdited) {
          handleOpenSaveModal()
        }
        else {
          props.handleSelection(key)
        }
      }

      const handleRerunOptimize = () => {
        console.log('rerun with the following overrides: ')
        console.log(props.scenario.override_values)
        props.handleRunModel()
      }

  return ( 
    <Box sx={{ width: 500 }}>
      <CssBaseline />
      <Paper sx={{ position: 'fixed', bottom: 0, left: '0px', right: 0, height: '60px', zIndex: 1500 }} elevation={3}>
          {props.scenario ? 
            <Grid container sx={{marginTop: '10px'}}>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
                        {props.section === 1 && <Button sx={styles.unfilled} onClick={() => props.handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}>back </Button>}
                        {props.section === 2 && <Button sx={styles.unfilled} onClick={() => props.handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}> review inputs &amp; settings </Button>}
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                        {props.section === 0 && <Button sx={styles.filled} onClick={() => handleClick(1)} variant="contained" size="large" endIcon={<ArrowForwardIcon /> }> continue to optimization </Button>}
                        {props.section === 1 && <Button onClick={props.handleRunModel} sx={styles.filled} variant="contained" size="large" disabled={disableOptimize ? true : false} endIcon={<ArrowForwardIcon /> }> Optimize </Button>}
                        {(props.section === 2 && hasOverride) && <Button onClick={handleRerunOptimize} sx={styles.filled} variant="contained" size="large" disabled={disableOptimize ? true : false} endIcon={<ArrowForwardIcon /> }> Re-run Optimization </Button>}
                    </Box>
                </Grid>
            </Grid>
          : 
          null}
        
      </Paper>
      <PopupModal
        hasTwoButtons
        open={openSaveModal}
        handleClose={handleCloseSaveModal}
        handleSave={handleSaveModal}
        handleButtonTwoClick={handleDiscardChanges}
        text="Do you want to save changes made to this table?"
        buttonText='Save'
        buttonColor='primary'
        buttonVariant='contained'
        buttonTwoText='Discard'
        buttonTwoColor='error'
        buttonTwoVariant='outlined'
      />
    </Box>
  );

}


