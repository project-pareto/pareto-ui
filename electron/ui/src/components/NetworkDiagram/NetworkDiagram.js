import React from 'react';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { FileUploader } from "react-drag-drop-files";
import { fetchDiagram, uploadDiagram, deleteDiagram } from '../../services/app.service';

export default function NetworkDiagram(props) {
    const [ file, setFile ] = useState(null)
    const fileTypes = ["png","jpg","jpeg"];
    const [ diagramImage, setDiagramImage ] = useState(null)
    const [ showWarning, setShowWarning ] = useState(false)
    const [ warningMessage, setWarningMessage ] = useState("")
    const styles = {
        fileUploaderBox: {
            border: '2px dashed black',
            borderRadius:2,
            p:10,
            cursor: "pointer"
        }
      }
    useEffect(()=>{
        fetchNetworkDiagram()
    }, [props.scenario]);

    const fileTypeError = () => {
        setWarningMessage("Please choose a valid image file (png, jpg, jpeg)")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
   }

    const handleDelete = () => {
        deleteDiagram(props.type, props.scenario.id)
        .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                setDiagramImage(null)
                console.log('successfully removed diagram')
            }).catch((err)=>{
                setDiagramImage(null)
                console.error("error removing diagram: ",err)
            })
        }
        else {
            setDiagramImage(null)
            console.error("error deleting diagram: ",response.statusText)
        }
        })
    }

    const fetchNetworkDiagram = () => {
    fetchDiagram(props.type, props.scenario.id)
    .then(response => {
    if (response.status === 200) {
        response.json()
        .then((data)=>{
            console.log('setting diagram image to :')
            console.log(data.data)
            setDiagramImage(data.data)
        }).catch((err)=>{
            setDiagramImage(null)
            console.error("error fetching diagram: ",err)
        })
    }
    else {
        setDiagramImage(null)
        console.error("error fetching diagram: ",response.statusText)
    }
    })
    }

      const handleDiagramUpload = (file, name) => {
        console.log('handle diagram upload')
        console.log('uploading diagram with name '+name)
        const formData = new FormData();
        formData.append('file', file, name);


        uploadDiagram(formData, props.type, props.scenario.id)
        .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                console.log('diagram upload successful: ',data)
                props.syncScenarioData()
            }).catch((err)=>{
                console.error("error on diagram upload: ",err)
            })
        }
        /*
            in the case of bad file type
        */
        else if (response.status === 400) {
            console.error("error on file upload: ",response.statusText)
        }
        })
  }

      const fileUploaderContainer = () => {
        return (
            <Box sx={styles.fileUploaderBox}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <h2 style={{marginTop:0, paddingTop:0, color:"#9B9B9B"}}>Drag and Drop Network Diagram File</h2>
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
                <Box>
                    {showWarning && <p style={{color:'red'}}>{warningMessage}</p>}
                </Box>
            </Box>
        )
       }
    
       const  UploadBox = () => {
        const handleChange = (file) => {
            console.log('setting file: '+file.name)
          setFile(file);
          handleDiagramUpload(file,file.name);
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
    <Box >
        {diagramImage ? 
        <Grid container>
            <Grid item xs ={0.5}>
            <IconButton onClick={() => handleDelete()}><CloseIcon/></IconButton>
            </Grid>
            <Grid item xs ={11.5}>
            <img alt="network diagram" style={{height:"500px"}} src={`file://${diagramImage}`}></img>
            </Grid>
        </Grid>
        
        : 
        <>
        {UploadBox()}
        {/* <Button>Upload Diagram</Button> */}
        </>
        
        }
    </Box>
  );

}


