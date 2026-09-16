import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from '@mui/material/Modal';
import { Grid, MenuItem, Box, TextField, IconButton, Button, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploader } from "react-drag-drop-files";
import { fetchExcelFile } from '../../services/app.service';
import { useApp } from '../../AppContext';
import { NetworkNodeTypes } from '../../util';
import { NodeIcon } from '../NetworkMap/NodeIcon';
import type { FileUploadModalProps } from '../../types';

export default function FileUploadModal(props: FileUploadModalProps) {
    const { 
        setShowFileModal,
        handleFileUpload,
        fileTypes = ["xlsx", "kmz", "kml", "zip"],
        showNameInput = true,
        showSampleFiles = true,
        title = "Create a New Scenario",
        buttonText = "Create Scenario"
    } = props;
    const [ scenarioName, setScenarioName ] = useState<string>("")
    const [ showWarning, setShowWarning ] = useState<boolean>(false)
    const [ warningMessage, setWarningMessage ] = useState<string>("")
    const [ file, setFile ] = useState<File | null>(null)
    const [ uploading, setUploading ] = useState(false)
    const [defaultNodeType, setDefaultNodeType] = useState<string>("NetworkNode");
    const PARETO_VERSION = "main"
    const isMapFile = file?.name.includes('zip') || file?.name.includes('kmz') || file?.name.includes('kml');

    const sampleFileUrl = "https://github.com/project-pareto/project-pareto/raw/"+process.env.REACT_APP_PARETO_VERSION+"/pareto/case_studies/strategic_permian_demo.xlsx"
    const workshopFileUrl = "https://github.com/project-pareto/project-pareto/raw/"+process.env.REACT_APP_PARETO_VERSION+"/pareto/case_studies/workshop_baseline_all_data.xlsx"
    const workshopFileName = "workshop_baseline_all_data_"+process.env.REACT_APP_PARETO_VERSION+".xlsx"

  const { port } = useApp()

   const styles = {
    modalStyle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600,
      bgcolor: 'background.paper',
      border: '1px solid #AEAEAE',
      borderRadius:2,
      boxShadow: 24,
      p: 2,
    },
    header:{
        color:"#0884b4",
        marginTop:5
    },
    button: {
        backgroundColor: '#0884b4',
        borderRadius: '8px', 
        color:'white',
        width: 200,
        '&:hover': {
            backgroundColor: '#0884b4',
            opacity: 0.9
        },
    },
    sampleFile:{
        color:"#0884b4",
        textDecoration: "none",
        fontWeight: "bold",
        cursor: 'pointer'
    },
    fileUploaderBox: {
        border: '2px dashed black',
        borderRadius:2,
        p:10,
        cursor: "pointer"
    }
   }

    const handleEditScenarioName = (event: ChangeEvent<HTMLInputElement>) => {
     setScenarioName(event.target.value)
    }

   const handleClose = () => {
    if (!uploading) setShowFileModal(false)
   }

   const handleDownloadWorkshopFile = () => {
        fetchExcelFile(port, workshopFileName).then(response => {
        if (response.status === 200) {
                response.blob().then((data)=>{
                let excelURL = window.URL.createObjectURL(data);
                let tempLink = document.createElement('a');
                tempLink.href = excelURL;
                tempLink.setAttribute('download', 'workshop_baseline_all_data.xlsx');
                tempLink.click();
            }).catch((err)=>{
                console.error("error fetching excel template path: ",err)
            })
        }
        else {
            console.error("error fetching excel template path: ",response.statusText)
        }
        })
   }

   const handleClickUpload = async () => {
    if (uploading) return;
    if (file === null) {
        setWarningMessage("Please upload a valid file")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
    } else if (scenarioName === "" && showNameInput) {
        setWarningMessage("Please provide a name for new scenario")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
    }else {
        setUploading(true)
        setShowWarning(false)
        try {
            await handleFileUpload(file, defaultNodeType, scenarioName)
            setShowFileModal(false)
        } catch (error) {
            setWarningMessage(error instanceof Error ? error.message : 'Unable to upload file.')
            setShowWarning(true)
        } finally {
            setUploading(false)
        }
    }
   }

   const fileTypeError = () => {
        setWarningMessage("Please choose a valid file from accepted file types")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
   }

   const fileUploaderContainer = () => {
    return (
        <Box sx={styles.fileUploaderBox}>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <h2 style={{marginTop:0, paddingTop:0, color:"#9B9B9B"}}>Drag and Drop File</h2>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <h2 style={{marginTop:0, paddingTop:0, color:"#9B9B9B"}}>or</h2>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Button disabled={uploading} style={{color: '#0884b4',}} variant="outlined">Browse...</Button>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={{marginBottom:0, paddingTop:0}}>{file === null ? "" : file.name}</p>
            </Box>
        </Box>
    )
   }

    function DragDrop() {
        const handleChange = (f: File | null) => {
            setFile(f);
        };
    return (
      <FileUploader 
        disabled={uploading}
        handleChange={handleChange} 
        name="file" 
        types={fileTypes}
        children={fileUploaderContainer()}
        onTypeError={fileTypeError}
      />
    );
  }

  const handleChangeDefaultNode = (e) => {
    setDefaultNodeType(e.target.value);
  }


  return (
      <Modal
          open={true}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
      >

        <Grid container sx={styles.modalStyle} spacing={1}>
                    
        <Grid item xs={9}>
            <h2 id="modal-modal-title" style={styles.header}>{title}</h2>
        </Grid>
        <Grid item xs={3}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                <IconButton aria-label="Close upload" onClick={handleClose} disabled={uploading}><CloseIcon/></IconButton>
            </Box>
        </Grid>

        {
            showNameInput && (
                <Grid item xs={12}>
                    <TextField
                        disabled={uploading}
                        required
                        variant="outlined"
                        id="scenario-upload-name"
                        label={"Scenario Name"}
                        value={scenarioName}
                        onChange={handleEditScenarioName}
                        fullWidth
                    />
                </Grid>
            )
        }
        

        <Grid item xs={12}>
            <p style={{color:"#666666"}}>Input file</p>
        </Grid>
        <Grid item xs={12}>
            {DragDrop()}
        </Grid>
        <Grid item xs={6}>
            {
                showSampleFiles && (
                    <>
                        <p><a data-cy="excel-download" style={styles.sampleFile} href={sampleFileUrl} download>Download an Example Input File</a></p>
                        <p><a style={styles.sampleFile} href={workshopFileUrl} download>Download Workshop Input File</a></p>
                    </>
                )
            }
            
        </Grid>
        <Grid item xs={6}>
            {showWarning && <p role="alert" style={{color:'red', }}>{warningMessage}</p>}
        </Grid>
        <Grid item xs={12}>
            {isMapFile && (
                <TextField
                    disabled={uploading}
                    label="Default Node Type For This Map"
                    size='small'
                    fullWidth
                    sx={{ mt: 1, mb: 1 }}
                    select
                    value={defaultNodeType}
                    onChange={handleChangeDefaultNode}
                    >
                    {Object.entries(NetworkNodeTypes).map(([key, v]) => {
                        return (
                            <MenuItem key={key} value={v.name}>
                                <Stack direction='row' justifyContent='space-between'>
                                    <span>{v.displayName} </span>
                                    <NodeIcon src={v.iconUrl} alt={v.displayName} size={20}/>
                                </Stack>
                            </MenuItem>
                        )
                    }
                        
                    )}
                </TextField>
            )}
        </Grid>
        <Grid item xs={12}>
            <Button id="create-scenario-button" style={styles.button} onClick={handleClickUpload} disabled={uploading}>{uploading ? 'Uploading…' : buttonText}</Button>
        </Grid>
        </Grid>
    </Modal>
  );

}
