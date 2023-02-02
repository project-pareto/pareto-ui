import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import { uploadExcelSheet } from '../../services/sidebar.service'
import { copyScenario } from '../../services/scenariolist.service'
import ErrorBar from '../../components/ErrorBar/ErrorBar'
import PopupModal from '../../components/PopupModal/PopupModal'
import FileUploadModal from '../../components/FileUploadModal/FileUploadModal'

export default function ScenarioList(props) {
    const [ showError, setShowError ] = React.useState(false)
    const [ errorMessage, setErrorMessage ] = React.useState("")
    const [ openEditName, setOpenEditName ] = React.useState(false)
    const [ openDeleteModal, setOpenDeleteModal ] = React.useState(false)
    const [ showFileModal, setShowFileModal ] = React.useState(false)
    const [ name, setName ] = React.useState('')
    const [ id, setId ] = React.useState(null)
    const enabledStatusList = ['Optimized','Draft','failure', 'Not Optimized', 'Infeasible']

    React.useEffect(()=> {
        props.setShowHeader(true)
    }, [props]) 

    const handleOpenEditName = (name, id) => {
        setName(name)
        setId(id)
        setOpenEditName(true);
    }
    const handleCloseEditName = () => setOpenEditName(false);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);
    const handleOpenDeleteModal = (id) => {
        setOpenDeleteModal(true);
        setId(id)
    }

    const handleDelete = () => {
        props.deleteScenario(id)
        setOpenDeleteModal(false)
        setId(null)
    }

    const handleCopyScenario = (index) => {
        // console.log('copying scenario: ',index)
        copyScenario(index)
        .then(response => response.json())
        .then((data) => {
          props.setScenarios(data.scenarios)
          setId(data.new_id)
          setOpenEditName(true)
          setName(data.scenarios[data.new_id].name)
        }).catch(e => {
          console.error('error on scenario copy')
          console.error(e)
        })
      }

    const handleEditName = (event) => {
        setName(event.target.value)
       }
    
    const handleSaveName = () => {
        props.handleEditScenarioName(name, id, false)
        setOpenEditName(false)
        setId(null)
    }

    const handleFileUpload = (file, name) => {
        console.log('handle file upload')
        console.log('creating scenario with name '+name)
        const formData = new FormData();
        formData.append('file', file, file.name);

        uploadExcelSheet(formData, name)
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

  const styles={
    headerCell: {
        color: "white", 
        fontSize:"18px",
        fontWeight: "bold"
    },
    bodyCell: {
        color: "#0083b5", 
        fontSize:"16px",
        fontWeight: "bold"
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

  return (
    <Box sx={{m: 4}}>
    <Grid container>
        <Grid item xs={1}></Grid>
        <Grid item xs={5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start'}}>
                <h2 style={{color:"#003b60"}}>Scenarios</h2>
            </Box>
        </Grid>
        <Grid item xs={5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <h2><Button variant="contained" sx={styles.newButton} component="label" onClick={() => setShowFileModal(true)}>
                    + Create New Scenario
                    </Button>
                </h2>
            </Box>
        </Grid>
        <Grid item xs={1}></Grid>
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{backgroundColor: "#6094bc", color: "white"}}>
            <TableRow key="headRow">
                <TableCell sx={styles.headerCell}>Scenario Name</TableCell>
                <TableCell sx={styles.headerCell}>Date Created</TableCell>
                <TableCell sx={styles.headerCell}>Status</TableCell>
                <TableCell sx={styles.headerCell}>Actions</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            
            {Object.entries(props.scenarios).map( ([key, value] ) => {
                return( <TableRow
                hover
                key={key}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } , cursor:"pointer"}}
                >
                <TableCell sx={styles.bodyCell} component="th" scope="row" onClick={() => props.handleSelection(key)}>
                    {value.name}
                </TableCell>
                <TableCell onClick={() => props.handleSelection(key)} sx={styles.bodyCell}>{value.date}</TableCell>
                <TableCell onClick={() => props.handleSelection(key)} sx={styles.bodyCell}>{value.results.status === "complete" ? "Optimized"  : value.results.status === "none" ? "Draft" : value.results.status}</TableCell>
                <TableCell sx={styles.bodyCell}>
                    <Tooltip title="Edit Scenario Name" enterDelay={500}>
                        <IconButton onClick={() => handleOpenEditName(value.name, key)} disabled={enabledStatusList.includes(value.results.status) ? false : true}>
                            <EditIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Scenario" enterDelay={500}>
                        <IconButton onClick={() => handleCopyScenario(key)} disabled={enabledStatusList.includes(value.results.status) ? false : true}>
                            <ContentCopyIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Scenario" enterDelay={500}>
                        <IconButton onClick={() => handleOpenDeleteModal(key)} disabled={enabledStatusList.includes(value.results.status) ? false : true}>
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
                </TableRow>
                )
                
            })}
            </TableBody>
        </Table>
        </TableContainer>
        {showFileModal && 
        <FileUploadModal
            setShowFileModal={setShowFileModal}
            handleFileUpload={handleFileUpload}
        />
        }
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
        />
        <PopupModal
            open={openDeleteModal}
            handleClose={handleCloseDeleteModal}
            text="Are you sure you want to delete this scenario?"
            handleSave={handleDelete}
            buttonText='Delete'
            buttonColor='error'
            buttonVariant='contained'
        />
        {
            showError && <ErrorBar duration={2000} setOpen={setShowError} severity="error" errorMessage={errorMessage} />
        }
        <Box sx={{display: 'flex', justifyContent: 'flex-start'}}>
        <h3 style={{color: '#0083b5'}}>PARETO documentation can be found <a href="https://pareto.readthedocs.io/en/stable/" target="_blank">here</a>.</h3>
        </Box>



    </Grid>
    </Box>
  );
}
