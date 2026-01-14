import React from 'react';
import {useEffect, useState} from 'react';   
import { Box, Grid, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploader } from "react-drag-drop-files";
import { fetchDiagram, uploadDiagram, deleteDiagram } from '../../services/app.service';
import NetworkMap from '../NetworkMap/NetworkMap';
import { useApp } from '../../AppContext';
import type { NetworkDiagramProps } from '../../types';

export default function NetworkDiagram(props: NetworkDiagramProps): JSX.Element {
    const {
        scenario, type, syncScenarioData
    } = props;
    const [ file, setFile ] = useState<File | null>(null)
    const [ hasMap, setHasMap ] = useState<boolean>(false)
    const fileTypes = ["png","jpg","jpeg"];
    const [ diagramImage, setDiagramImage ] = useState<string | null>(null)
    const [ showWarning, setShowWarning ] = useState<boolean>(false)
    const [ warningMessage, setWarningMessage ] = useState<string>("")
    const { port } = useApp()
    const styles = {
        fileUploaderBox: {
            border: '2px dashed black',
            borderRadius:2,
            p:10,
            cursor: "pointer"
        }
      }
    useEffect(()=>{
        if (scenario?.data_input?.map_data) {
            setHasMap(true)
        } else {
            fetchNetworkDiagram()
        }
        
    }, [scenario]);

    const fileTypeError = () => {
        setWarningMessage("Please choose a valid image file (png, jpg, jpeg)")
        setShowWarning(true)
        setTimeout(function() {
            setShowWarning(false)
          }, 5000)
   }

    const handleDelete = () => {
        deleteDiagram(port, type, scenario.id)
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
    fetchDiagram(port, type, scenario.id)
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

    const handleDiagramUpload = (file: File, name: string) => {
        console.log('handle diagram upload')
        console.log('uploading diagram with name '+name)
        const formData = new FormData();
        formData.append('file', file, name);


        uploadDiagram(port, formData, type, scenario.id)
        .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                console.log('diagram upload successful: ',data)
                syncScenarioData()
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
          const handleChange = (file: File) => {
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
            <img alt="network diagram" style={{width: "100%"}} src={`file://${diagramImage}`}></img>
            </Grid>
        </Grid>
        
        : 
        hasMap ? 
        <NetworkMap
            map_data={scenario.data_input.map_data}
            showMapTypeToggle
            interactive
            width={100}
            height={75}
            {...props}
        />
        :
        <>
        {UploadBox()}
        </>
        
        }
    </Box>
  );

}


