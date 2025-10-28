import React from 'react';
import {useEffect, useState} from 'react';   
import { Box, FormControl, MenuItem, Select, Typography, Grid, Button } from '@mui/material'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material'
import { fetchExcelTemplate, replaceExcelSheet } from '../../services/app.service';
import NetworkMap from '../NetworkMap/NetworkMap';
import { FileUploader } from "react-drag-drop-files";
import ErrorBar from '../ErrorBar/ErrorBar'
import { useApp } from '../../AppContext';

export default function InputSummary(props) {
    const [ tableType, setTableType ] = useState("Input Summary")
    const [ updatedExcelFile, setUpdatedExcelFile ] = useState(null)
    const [ showError, setShowError ] = useState(false)
    const [ disableUpload, setDisableUpload ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState("")
    const fileTypes = ["xlsx"];
    const { port } = useApp()
    const [ sumValues, setSumValues ] = useState([
        {statistic: 'Total Completions Demand', value: 0, units: 'bbl'},
        {statistic: 'Total Produced Water', value: 0, units: 'bbl'},
        {statistic: 'Total Starting Disposal Capacity', value: 0, units: 'bbl'},
        {statistic: 'Total Starting Treatment Capacity', value: 0, units: 'bbl'},
    ]) 
    const [ timeSumValues, setTimeSumValues ] = useState({
        'Completions Demand': [],
        'Produced Water': [],
        'Initial Disposal Capacity': [],
        'Initial Treatment Capacity': [],
    }) 
    const styles = {
        headerCell: {color: 'white'},
        firstCol: {
            backgroundColor: "#f4f4f4", 
            border:"1px solid #ddd",
            position: 'sticky',
            left: 0,
      
          },
        inputFileTextBox: {
            display: 'flex', 
            justifyContent: 'flex-start', 
            textAlign: 'left'
        },
        downloadInput: {
            color: "#0083b5",
            cursor: "pointer",
            fontWeight: "bold",
            paddingBottom: 20
        },
        uploadInput: {
            color: "#0083b5",
            borderColor: "#0083b5",
            '&:hover': {
                borderColor: "#0083b5",
            },
        },
        viewFullMapText: {
            color: "#0083b5",
            cursor: "pointer",
            fontWeight: "bold",
            paddingTop: 0,
            marginTop: 0,
            // paddingBottom: 20
        },
    }

    useEffect(()=>{

        if (props.scenario.results.status !== 'Incomplete') { //fetch location of excel template{
        /* 
            calculate total completions demand, total produced water, 
            total disposal capacity, and total treatment capacity; 
            
            calculate totals for each time segment as well
        */

            let disposalCapacity = 0
            for (let each in props.initialDisposalCapacity) {
                for (let value of props.initialDisposalCapacity[each]) {
                    if (!isNaN(value)) {
                        disposalCapacity+=Number(value)
                    }
                }
            }

            let treatmentCapacity = 0
            for (let each in props.initialTreatmentCapacity) {
                for (let value of props.initialTreatmentCapacity[each]) {
                    if (!isNaN(value)) {
                        treatmentCapacity+=Number(value)
                    }
                }
            }
            
            let totCompletionsDemand = 0
            let completionsDemandByTime = []
            let disposalCapacityByTime = []
            let treatmentCapacityByTime = []      
            /*
                start weeks at -1 because the first record is the index, so after incrementing the index we are at 0
            */  
            let totWeeks = -1
            for (let each in props.completionsDemand) {
                let nextTime = 0
                for (let value of props.completionsDemand[each]) {
                    if (!isNaN(value)) {
                        totCompletionsDemand+=Number(value)
                        nextTime += Number(value)
                    }
                }
                completionsDemandByTime.push(nextTime)
                disposalCapacityByTime.push(disposalCapacity)
                treatmentCapacityByTime.push(treatmentCapacity)
                totWeeks += 1
            }

            let totProducedWater = 0
            let padRatesByTime = []
            for (let each in props.padRates) {
                let nextTime = 0
                for (let value of props.padRates[each]) {
                    if (!isNaN(value)) {
                        totProducedWater+=Number(value)
                        nextTime += Number(value)
                    }
                }
                padRatesByTime.push(nextTime)
            }

            let flowbackRatesByTime = []
            for (let each in props.flowbackRates) {
                let nextTime = 0
                for (let value of props.flowbackRates[each]) {
                    if (!isNaN(value)) {
                        totProducedWater+=Number(value)
                        nextTime += Number(value)
                    }
                }
                flowbackRatesByTime.push(nextTime)
            }

            let producedWaterByTime = []
            for (let i = 0; i < padRatesByTime.length; i++) {
                producedWaterByTime.push(padRatesByTime[i] + flowbackRatesByTime[i])
            }

            let tempSumValues = [
                {statistic: 'Total Completions Demand', value: totCompletionsDemand, units: 'bbl'},
                {statistic: 'Total Produced Water', value: totProducedWater, units: 'bbl'},
                {statistic: 'Total Starting Disposal Capacity', value: (disposalCapacity * totWeeks), units: 'bbl'},
                {statistic: 'Total Starting Treatment Capacity', value: (treatmentCapacity * totWeeks), units: 'bbl'},
            ]
            setSumValues(tempSumValues)

            let tempTimeSumValues = {
                'Completions Demand': completionsDemandByTime,
                'Produced Water': producedWaterByTime,
                'Initial Disposal Capacity': disposalCapacityByTime,
                'Initial Treatment Capacity': treatmentCapacityByTime,
            }
            setTimeSumValues(tempTimeSumValues)
        }
      }, [props, props.scenario]);

    const handleTableTypeChange = (event) => {
        setTableType(event.target.value)
    }

    const handleDownloadExcel = () => {
        fetchExcelTemplate(port, props.scenario.id).then(response => {
        if (response.status === 200) {
                response.blob().then((data)=>{
                let excelURL = window.URL.createObjectURL(data);
                let tempLink = document.createElement('a');
                tempLink.href = excelURL;
                tempLink.setAttribute('download', props.scenario.name+'.xlsx');
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

    const handleReplaceExcel = (file) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        replaceExcelSheet(port, formData, props.scenario.id)
        .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                console.log('fileupload successful: ',data)
                props.updateScenario(data)
            }).catch((err)=>{
                console.error("error on file upload: ",err)
                setErrorMessage(String(err))
                setShowError(true)
                setDisableUpload(false)
            })
        }
        /*
            in the case of bad file type
        */
        else if (response.status === 400) {
            response.json()
            .then((data)=>{
                console.error("error on file upload: ",data.detail)
                setErrorMessage(data.detail)
                setShowError(true)
                setDisableUpload(false)
            }).catch((err)=>{
                console.error("error on file upload: ",err)
                setErrorMessage(response.statusText)
                setShowError(true)
                setDisableUpload(false)
            })
        }
        })
    }

    const fileTypeError = () => {
        setErrorMessage("Please choose a valid excel file")
        setShowError(true)
        setTimeout(function() {
            setShowError(false)
          }, 5000)
   }

    const fileUploaderContainer = () => {
        return (
            <>
                <Box sx={styles.inputFileTextBox}>
                    <Button variant="outlined" sx={styles.uploadInput} disabled={disableUpload}>Upload PARETO input file</Button>
                </Box>
                <Box sx={{display: 'flex'}}>
                    <p style={{marginBottom:0, paddingTop:0}}>{updatedExcelFile === null ? "" : updatedExcelFile.name}</p>
                </Box>
            </>
        )
    }

    function DragDrop() {
        const handleChange = (file) => {
            setUpdatedExcelFile(file);
            handleReplaceExcel(file)
            setDisableUpload(true)
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

    const renderInputSummaryTable = () => {
        return (
            <Table style={{border:"1px solid #ddd"}} size='small'>
                <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                <TableRow key="headRow1">
                    <TableCell width="25%" style={styles.headerCell}>Statistic</TableCell>
                    <TableCell align="right" style={styles.headerCell}>Value</TableCell>
                    <TableCell align="right" style={styles.headerCell}>Units</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {sumValues.map((v,i) => {
                        return (
                            <TableRow key={""+v+i}>
                                <TableCell style={styles.firstCol}><Typography noWrap={true}>{v.statistic}</Typography></TableCell>
                                <TableCell align="right">{v.value.toLocaleString('en-US', {maximumFractionDigits:0})}</TableCell>
                                <TableCell align="right">{v.units}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )
    }

    const renderSummaryTimeTable = () => {
        return (
            <Table style={{border:"1px solid #ddd"}} size='small'>
                <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                <TableRow key="headRow2">
                    {Object.entries(props.completionsDemand).map(([key,value], index) => {
                        return <TableCell key={""+key+index} align="right" style={index > 0 ? styles.headerCell : styles.headerCell}>{index > 0 ? key : ""}</TableCell>
                    })}
                </TableRow>
                </TableHead>
                <TableBody>
                {Object.entries(timeSumValues).map(([key,statistic]) => {
                    return (
                    <TableRow key={""+key+statistic}>
                        {statistic.map((value, index) => {
                            return (
                            index > 0 ? 
                            <TableCell key={""+value+index} align="right">{value.toLocaleString('en-US', {maximumFractionDigits:0})}</TableCell>
                            :
                            <TableCell key={""+value+index} style={styles.firstCol}><Typography noWrap={true}>{key}</Typography></TableCell>
                            )
                        })}
                    </TableRow>
                    )
                })}
                
                </TableBody>
            </Table>
        )
    }
    
  return ( 
    <>
    {props.scenario.results.status === 'Incomplete' ? 
        <Grid container sx={{px: 5}}>
            <Grid item xs={5}>
                <Box sx={styles.inputFileTextBox}>
                    <h2>PARETO Input File</h2>
                </Box>
                <Box sx={styles.inputFileTextBox}>
                    <p>
                        A PARETO input file can be generated based on the schematic file uploaded. 
                        Fill out this input file and upload it here to begin your optimization
                    </p>
                </Box>
                {/* <Box sx={styles.inputFileTextBox}>
                    <p style={styles.downloadInput} onClick={handleDownloadExcel}>
                        Download PARETO input file
                    </p>
                    
                </Box> */}
                {DragDrop()}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={6}>
                <Box>
                <NetworkMap
                    map_data={props.scenario.data_input.map_data}
                    showMapTypeToggle={false}
                    interactive={false}
                    width={100}  //%
                    height={50} //vh
                />
                    <p style={styles.viewFullMapText} onClick={() => props.handleSetCategory('Network Diagram')}>
                        View Full Network Map
                    </p>
                </Box>
            </Grid>
            {
                showError && <ErrorBar duration={30000} setOpen={setShowError} severity="error" errorMessage={errorMessage} />
            }
        </Grid>
        : 
        <TableContainer>
            <Box display="flex" justifyContent="center" sx={{marginBottom:"20px"}}>
                <FormControl sx={{ width: "30ch" }} size="small">
                    <Select
                    value={tableType}
                    onChange={(handleTableTypeChange)}
                    sx={{color:'#0b89b9', fontWeight: "bold"}}
                    >
                    <MenuItem key={0} value={"Input Summary"}>Input Summary</MenuItem>
                    <MenuItem key={1} value={"Summary By Time"}>Summary By Time</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <TableContainer sx={{overflowX:'auto'}}>
                {tableType === "Input Summary" ? 
                renderInputSummaryTable()
                : 
                renderSummaryTimeTable()
                }
            </TableContainer>
        </TableContainer>
    }
    </>
    
  );

}


