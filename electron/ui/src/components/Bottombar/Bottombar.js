import React from 'react';
import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PopupModal from '../../components/PopupModal/PopupModal';
import AddIcon from '@mui/icons-material/Add';
import { generateExcelFromMap } from '../../services/app.service';


export default function Bottombar(props) {
    const {
      scenario,
      backgroundTasks,
      setDisableOptimize,
      handleUpdateExcel,
      setInputDataEdited,
      handleSelection,
      syncScenarioData,
      category,
      inputDataEdited,
      disableOptimize,
      section,
      handleRunModel,
      copyAndRunOptimization,
      port
    } = props;
    const { results, id, name } = scenario || {};
    const { status } = results || {};
    const [ openSaveModal, setOpenSaveModal ] = useState(false)

    const [ openRerunModal, setOpenRerunModal] = useState(false)
    const [ newScenarioName, setNewScenarioName ] = useState('')
    const [ showModalError, setShowModalError ] = useState(false)
    const [ modalError, setModalError ] = useState('')
    const [ key, setKey ] =  useState(null)
    const [ hasOverride, setHasOverride ] = useState(false)
    const handleOpenSaveModal = () => setOpenSaveModal(true);
    const handleCloseSaveModal = () => setOpenSaveModal(false);
    const handleCloseRerunModal = () => setOpenRerunModal(false);


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
          for (let key of Object.keys(scenario.override_values)) {
            if(Object.keys(scenario.override_values[key]).length>0) tempHasOverride = true
        }

        setHasOverride(tempHasOverride)
      } catch (e) {
        
      }

    },[scenario.override_values])

    useEffect(() => {
        /*
            if the current scenario is already being optimized OR if there are multiple optimizations
            currently running, then we disable the ability to optimize the current scenario
        */
       try{
        let tasks = backgroundTasks
        if ((tasks.length > 0) || (!["Draft", "failure", "Optimized", "Not Optimized", "Infeasible"].includes(status))) {
            setDisableOptimize(true)
        } else {
            setDisableOptimize(false)
        }
       } catch(e){
        console.error("unable to check for background tasks from bottom bar : ",e)
       }
        
    },[props])

    useEffect(() => {
      setNewScenarioName('')
      setShowModalError(false)
    },[scenario])
    

    const handleSaveModal = () => {
        handleUpdateExcel(scenario.id, category, scenario.data_input.df_parameters[category])
        handleCloseSaveModal()
        setInputDataEdited(false)
        handleSelection(key)
      }
    
      const handleDiscardChanges = () => {
        handleCloseSaveModal()
        setInputDataEdited(false)
        handleSelection(key)
        syncScenarioData()
      }
    
      const handleClick = (key) => {
        setKey(key)
        console.log('handle click from bottom bar')
        console.log(inputDataEdited)
        if (inputDataEdited) {
          handleOpenSaveModal()
        }
        else {
          handleSelection(key)
        }
      }

      const handleRunOptimize = () => {
        handleCloseRerunModal()
        handleRunModel()
      }

      const reoptimizeNewScenario = () => {
        if (newScenarioName === '') {
          // show error
          setModalError(' *You must provide a name if creating a new scenario*')
          setShowModalError(true)

        } else {
          setShowModalError(false)
          handleCloseRerunModal()
          copyAndRunOptimization(newScenarioName)
        }
        
      }

      const handleEditNewScenarioName = (event) => {
        setNewScenarioName(event.target.value)
      }

      const handleClickGenerateSpreadsheet = () => {
        console.log("generating excel spreadsheet for "+id)
        // generateExcelFromMap(port, id)
        generateExcelFromMap(port, id).then(response => {
          if (response.status === 200) {
                  response.blob().then((data)=>{
                  let excelURL = window.URL.createObjectURL(data);
                  let tempLink = document.createElement('a');
                  tempLink.href = excelURL;
                  tempLink.setAttribute('download', name+'.xlsx');
                  tempLink.click();
              }).catch((err)=>{
                  console.error("error generating excel: ",err)
              })
          }
          else {
              console.error("error generating excel: ",response.statusText)
          }
          })
      }

  return ( 
    <Box sx={{ width: 500 }}>
      <CssBaseline />
      <Paper sx={{ position: 'fixed', bottom: 0, left: '0px', right: 0, height: '60px', zIndex: 2 }} elevation={3}>
          {scenario ? 
            <Grid container sx={{marginTop: '10px'}}>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
                        {section === 1 && <Button sx={styles.unfilled} onClick={() => handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}>back </Button>}
                        {section === 2 && <Button sx={styles.unfilled} onClick={() => handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}> review inputs &amp; settings </Button>}
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                        {section === 0 && (
                            status != "Incomplete" ?
                            <Button
                              sx={styles.filled}
                              onClick={() => handleClick(1)}
                              variant="contained"
                              size="large"
                              endIcon={<ArrowForwardIcon /> }
                            >
                              continue to optimization
                            </Button> : 
                            <Button
                              sx={styles.filled}
                              onClick={handleClickGenerateSpreadsheet}
                              variant="contained"
                              size="large"
                              startIcon={<FileDownloadIcon />}
                            >
                              Generate Spreadsheet From Network
                            </Button>
                        )}
                        {section === 1 && (
                          <Button
                            onClick={handleRunOptimize}
                            sx={styles.filled}
                            variant="contained"
                            size="large"
                            disabled={disableOptimize ? true : false}
                            endIcon={<ArrowForwardIcon /> }
                          >
                            Optimize
                          </Button>
                        )}
                        {(section === 2 && hasOverride) && (
                          <Button
                            onClick={() => setOpenRerunModal(true)}
                            sx={styles.filled}
                            variant="contained"
                            size="large"
                            disabled={disableOptimize ? true : false}
                            endIcon={<ArrowForwardIcon />}
                          >
                            Re-run Optimization
                          </Button>
                        )}
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
        width={400}
      />
      <PopupModal
        hasInput
        hasTwoButtons
        open={openRerunModal}
        handleClose={handleCloseRerunModal}
        handleSave={reoptimizeNewScenario}
        handleButtonTwoClick={handleRunOptimize}
        text="Would you like to create a new copy of this scenario for this optimization, or overwrite the current scenario?"
        buttonText='Create New Scenario'
        buttonColor='primary'
        buttonVariant='contained'
        buttonTwoText='Overwrite Current Scenario'
        buttonTwoColor='secondary'
        buttonTwoVariant='outlined'
        inputText={newScenarioName}
        textLabel={'New Scenario Name'}
        width={850}
        iconOne={<AddIcon/>}
        iconTwo={<ArrowForwardIcon/>}
        handleEditText={handleEditNewScenarioName}
        showError={showModalError}
        errorText={modalError}
      />
    </Box>
  );

}


