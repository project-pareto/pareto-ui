import {useEffect, useState} from 'react'; 
import Grid from '@mui/material/Grid';  
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {  uploadExcelSheet } from '../../services/sidebar.service'
import ErrorBar from '../../components/ErrorBar/ErrorBar'
import BackgroundPic from '../../assets/homepage-background.jpg'
import FullLogo from '../../assets/pareto-full-logo.png'

export default function LandingPage(props) {
    const [ showError, setShowError ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState("")
    const [ ids, setIds ] = useState([])

    useEffect(()=>{
        console.log('scenarios from landing page: ',props.scenarios)
        let scenarioIds = [...Object.keys(props.scenarios)]
        scenarioIds.sort(function (a, b) {  return b - a;  })
        setIds(scenarioIds)

    }, [props]);

    const styles = {
        background: {
            height: '100vh',
        },
        bacgkroundImage: {
            width: '100%',
            height: '100%',
            objectFit:'fill'
        },
        boxStyle: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            borderRadius: 8,
            boxShadow:'0px 5px 10px 0px rgba(0, 0, 0, 0.5)',
            p: 4,
            backgroundColor:'white',
        },
        tableBox: {
            border: '1px solid #0884b4',
            borderRadius: 2
        },
        newButton: {
            backgroundColor: '#0884b4',
            borderRadius: '8px', 
            '&:hover': {
                backgroundColor: '#0884b4',
                opacity: 0.9
            },
        },
    }

    const handleFileUpload = (e) => {
        console.log('handle file upload')
        const formData = new FormData();
        formData.append('file', e.target.files[0], e.target.files[0].name);

        uploadExcelSheet(formData)
        .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                console.log('fileupload successful: ',data)
                props.handleNewScenario(data)
            }).catch((err)=>{
                console.error("error on file upload: ",err)
                setErrorMessage(String(err))
                setShowError(true)
            })
        }
        /*
            in the case of bad file type
        */
        else if (response.status === 400) {
            console.error("error on file upload: ",response.statusText)
            setErrorMessage(response.statusText)
            setShowError(true)
        }
        })
  }
    
      

  return ( 
    <div style={styles.background}>
        <img src={BackgroundPic} style={styles.bacgkroundImage}>
        
        </img>
        <Box style={styles.boxStyle}>
            <Grid container>
                <Grid item xs={2}> </Grid>
                <Grid item xs={8}> 
                    <Box style={{}}>
                        <img src={FullLogo} style={{width:'100%'}}></img>
                    </Box>
                </Grid>
                <Grid item xs={2}> </Grid>

                <Grid item xs={1}> </Grid>
                <Grid item xs={10}> 
                    <Box style={{}}>
                        <p>
                            PARETO can help organizations better manage, better treat, and 
                            - where possible - beneficially reuse produced water from oil 
                            and gas operations.
                        </p>
                    </Box>
                </Grid>
                <Grid item xs={1}> </Grid>

                <Grid item xs={1}> </Grid>
                <Grid item xs={10}> 
                    <Box style={styles.tableBox} sx={{overflow:"scroll"}}>
                        <h2 style={{color:"#0884b4"}}>
                            {ids.length > 0 ? "Recent Scenarios" : "No Saved Scenarios"}
                        </h2>
                        <Table>
                            <TableBody>
                                {ids.length > 0 &&
                                <TableRow>
                                    <TableCell sx={{borderBottom:"none", maxWidth:150, overflow: 'hidden', textOverflow: 'ellipsis'}}><b>{props.scenarios[ids[0]].name}</b></TableCell>
                                    <TableCell sx={{borderBottom:"none"}}>{props.scenarios[ids[0]].date}</TableCell>
                                    <TableCell sx={{borderBottom:"none", overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                        {props.scenarios[ids[0]].results.status === "complete" ? "Optimized"  : props.scenarios[ids[0]].results.status === "none" ? "Draft" : props.scenarios[ids[0]].results.status}
                                    </TableCell>
                                </TableRow>
                                }
                                {ids.length > 1 &&
                                <TableRow>
                                    <TableCell sx={{borderBottom:"none", maxWidth:150, overflow: 'hidden', textOverflow: 'ellipsis'}}><b>{props.scenarios[ids[1]].name}</b></TableCell>
                                    <TableCell sx={{borderBottom:"none"}}>{props.scenarios[ids[1]].date}</TableCell>
                                    <TableCell sx={{borderBottom:"none", overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                        {props.scenarios[ids[1]].results.status === "complete" ? "Optimized"  : props.scenarios[ids[1]].results.status === "none" ? "Draft" : props.scenarios[ids[1]].results.status}
                                    </TableCell>
                                </TableRow>
                                }
                            </TableBody>
                        </Table>
                        <Grid item xs={12}>
                            <Button style={{color:"#0884b4"}} onClick={props.navigateToScenarioList}>View All Scenarios</Button>
                        </Grid>
                        <p></p>
                        <Grid item xs={12}>
                            <Button variant="contained" sx={styles.newButton} component="label" >
                                + Create New Scenario
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            <p></p>
                        </Grid>
                        
                    </Box>
                </Grid>
                <Grid item xs={1}> </Grid>

                <Grid item xs={1}> </Grid>
                <Grid item xs={10}> 
                    <Box>
                        <p style={{paddingTop:1}}></p>
                    </Box>
                </Grid>
                <Grid item xs={1}> </Grid>
                
            </Grid>
        </Box>
        {
            showError && <ErrorBar duration={2000} setOpen={setShowError} severity="error" errorMessage={errorMessage} />
        }
    </div> 
  );

}


