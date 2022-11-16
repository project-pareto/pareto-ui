import React from 'react';
import {useState, useEffect} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { FileUploader } from "react-drag-drop-files";



export default function Dashboard(props) {
    const [ scenarioName, setScenarioName ] = useState("")
    const [ showWarning, setShowWarning ] = useState(false)
    const [ warningMessage, setWarningMessage ] = useState("")
    const [ file, setFile ] = useState(null)
    const fileTypes = ["xlsx"];
    const sampleFileUrl = "https://drive.google.com/uc?export=download&id=1dmcdh4sKmB73kqCkHS279pxomFGWbexP"


  useEffect(()=>{
    console.log('fileuploadmodal props: ')
    console.log(props)
  }, [props]);

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
        fontWeight: "bold"
    },
    fileUploaderBox: {
        border: '2px dashed black',
        borderRadius:2,
        p:10,
        cursor: "pointer"
    }
   }

   const handleEditScenarioName = (event) => {
    setScenarioName(event.target.value)
   }

   const handleClose = () => {
    props.setShowFileModal(false)
   }

   const handleCreateScenario = () => {
    if (file === null) {
        setWarningMessage("Please upload a valid file")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
    } else if (scenarioName === "") {
        setWarningMessage("Please provide a name for new scenario")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
    }else {
        console.log('valid file entry')
        props.handleFileUpload(file, scenarioName)
        setShowWarning(false)
        props.setShowFileModal(false)
    }
   }

   const fileTypeError = () => {
        setWarningMessage("Please choose a valid excel file")
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
                <Button style={{color: '#0884b4',}} variant="outlined">Browse...</Button>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={{marginBottom:0, paddingTop:0}}>{file === null ? "" : file.name}</p>
            </Box>
        </Box>
    )
   }

   function DragDrop() {
    const handleChange = (file) => {
        console.log('setting file: '+file.name)
      setFile(file);
    };
    return (
      <FileUploader 
        handleChange={handleChange} 
        name="file" 
        types={fileTypes}
        children={fileUploaderContainer()}
        onTypeError={fileTypeError}
      />
    );
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
            <h2 style={styles.header}>Create a New Scenario</h2>
        </Grid>
        <Grid item xs={3}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                <IconButton onClick={handleClose}><CloseIcon/></IconButton>
            </Box>
        </Grid>

        {/* <Divider key={"divider_guy"}></Divider> */}
        <Grid item xs={12}>
            <TextField
                required
                variant="outlined"
                id=""
                label={"Scenario Name"}
                value={scenarioName}
                onChange={handleEditScenarioName}
                fullWidth
            />
        </Grid>

        <Grid item xs={12}>
            <p style={{color:"#666666"}}>Input file</p>
        </Grid>
        <Grid item xs={12}>
            {DragDrop()}
        </Grid>
        <Grid item xs={6}>
            <p ><a style={styles.sampleFile} href={sampleFileUrl} download>Download an Example Input File</a></p>
        </Grid>
        <Grid item xs={6}>
            {showWarning && <p style={{color:'red'}}>{warningMessage}</p>}
        </Grid>
        <Grid item xs={12}>
            <Button style={styles.button} onClick={handleCreateScenario}>Create Scenario</Button>
        </Grid>
        </Grid>
    </Modal>
  );

}


