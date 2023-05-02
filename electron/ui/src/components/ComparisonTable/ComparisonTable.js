import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Typography, Box } from '@mui/material';
import ParetoDictionary from '../../assets/ParetoDictionary.json'
import CategoryNames from '../../assets/CategoryNames.json'

export default function ComparisonTable(props) {
    let params = useParams(); 
    const { scenarios, scenarioIndex } = props;
    const [ indices, setIndices ] = useState([scenarioIndex, scenarioIndex])
    const [ showTable, setShowTable ] = React.useState(true)
    const category = "v_F_Overview_dict"
    const styles ={
        firstCol: {
          backgroundColor: "#f4f4f4", 
          border:"1px solid #ddd",
          position: 'sticky',
          left: 0,
    
        },
        other: {
          minWidth: 100,
          border:"1px solid #ddd"
        }
      }


    useEffect(() => {
        setIndices([scenarioIndex, scenarioIndex])
    }, [scenarios, scenarioIndex])

    const handleConfigSelection = (event) => {
        let value = event.target.value
        let index = parseInt(event.target.name)
        let tempIndices = [...indices]
        tempIndices[index] = value
        setIndices(tempIndices)
    }

    const renderConfigurationSelect = (index) => {
        return <FormControl >
            <InputLabel id="select-label"></InputLabel>
            <Select
                name={`${index}`}
                id={`comparison_select_${index}`}
                value={indices[index]}
                label="Past Configurations"
                onChange={handleConfigSelection}
                variant='standard'
                sx={{color: "white"}}
            >
                {Object.entries(scenarios).map(( [ key, value ], ind) => {
                    return <MenuItem key={key+value} value={value.id}>
                                {value.name}
                            </MenuItem>
                })}
            </Select>
        </FormControl>
    }


    const renderOutputTable = () => {

        try {
            console.log('rendering output table')
            return (
              <TableContainer>
              <h3>Results Comparison</h3>
              <TableContainer sx={{overflowX:'auto'}}>
              <Table style={{border:"1px solid #ddd"}} size='small'>
                <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                <TableRow key={`headrow`}>
                    <TableCell key="overview0" style={{backgroundColor:"#6094bc", color:"white", width:"35%", fontSize: 15, paddingTop:"20px"}}>KPI</TableCell> 
                    <TableCell key="overview1" style={{backgroundColor:"#6094bc", color:"white",  width:"15%", fontSize: 15, paddingTop:"20px"}}>Units</TableCell> 
                    <TableCell key="overview2" style={{backgroundColor:"#6094bc", color:"white",  width:"25%", paddingTop:"0px"}}>{renderConfigurationSelect(0)}</TableCell> 
                    <TableCell key="overview2" style={{backgroundColor:"#6094bc", color:"white",  width:"25%", paddingTop:"0px"}}>{renderConfigurationSelect(1)}</TableCell> 
                </TableRow>
                </TableHead>
                <TableBody>
                {scenarios[indices[0]].results.data[category].slice(1).map((value, index) => {
                  return (<TableRow key={`row_${value}_${index}`}>
                  {value.map((cellValue, i)=> {
                    return (i !== 1 &&
                       <TableCell 
                        align={(i === (value.length - 1)) ? "right" : "left"} 
                        key={"" + index + i} 
                        style={i === 0 ? styles.firstCol : styles.other}>
                          {(i === (value.length - 1)) ? 
                          cellValue.toLocaleString('en-US', {maximumFractionDigits:0}) : 
                          cellValue ? CategoryNames[cellValue] ? CategoryNames[cellValue] :
                          cellValue.replace('v_F_','').replace('v_C_','Cost ').replace(/([A-Z])/g, ' $1').replace('Cap Ex', 'CapEx').trim()
                          : null
                        }
                    </TableCell>
                    )
                  })}
                    <TableCell 
                        align="right" 
                        style={styles.other}
                    >
                        {scenarios[indices[1]].results.data[category][index+1][3].toLocaleString('en-US', {maximumFractionDigits:0})}
                    </TableCell>
                  </TableRow>)
                })}
                </TableBody> 
              
              </Table>
              </TableContainer>
            </TableContainer>
            )
        } catch (e) {
          console.error("unable to render category: ",e)
        }
      }

  return (
        
        <>
            {  showTable &&
                renderOutputTable()
            }
        </>
      
  );
}
