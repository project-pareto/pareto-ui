import React from 'react';
import {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Tooltip, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ParetoDictionary from '../../assets/ParetoDictionary.json'
import CategoryNames from '../../assets/CategoryNames.json'

const OVERRIDE_PRESET_VALUES = {
  "Pipeline Construction": {
    input_table: "PipelineDiameterValues",
    variable_name: "vb_y_Pipeline_dict"
  },
  "Storage Facility": {
    input_table: "StorageCapacityIncrements",
    variable_name: "vb_y_Storage_dict"
  },
  "Disposal Facility": {
    input_table: "DisposalCapacityIncrements",
    variable_name: "vb_y_Disposal_dict"
  },
  "Treatment Facility": {
    input_table: "TreatmentCapacityIncrements",
    variable_name: "vb_y_Treatment_dict"
  },
}

export default function OverrideTable(props) {  

    const {
        category, 
        data, 
        rowNodes, 
        rowNodesMapping, 
        columnNodes, 
        columnNodesMapping, 
        scenario, 
        show,
        updateScenario
    } = props

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
        },
        inputDifference: {
        backgroundColor: "rgb(255,215,0, 0.5)",
        minWidth: 100,
        border:"1px solid #ddd"
        },
    }


    const handleCheckOverride = (index) => {
        let tempOverrideValues = {...scenario.override_values}
        if(Object.keys(tempOverrideValues[category]).includes(""+index)) {
        delete tempOverrideValues[category][index]
        } else {
            tempOverrideValues[category][index] = ""
        }
        const tempScenario = {...scenario}
        tempScenario.override_values = tempOverrideValues
        updateScenario(tempScenario)
    } 

    const handleInputOverrideValue = (event) => {
        let tempOverrideValues = {...scenario.override_values}
        let idx = event.target.name
        let val = event.target.value
        if(!isNaN(val)) {
            tempOverrideValues[category][idx] = parseInt(val)
            const tempScenario = {...scenario}
            tempScenario.override_values = tempOverrideValues
            updateScenario(tempScenario)
        }
    }

    const getCheckboxValue = (index) => {
        if(Object.keys(scenario.override_values[category]).includes(""+index)) {
            return true
        } else return false
    }
  
    const generateInfrastructureBuildoutOptions = (value, index) => {
      if (Object.keys(OVERRIDE_PRESET_VALUES).includes(value[0])) {
        try {
          let presetValues = []
          if(value[0] === "Treatment Facility") {
            let technology = value[5]
            let technologyNamesKey = "TreatmentCapacities"
            let indexOfTechnology = scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[value[0]].input_table][technologyNamesKey].indexOf(technology)
            // let presetValues = []
            for (let each of Object.keys(scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[value[0]].input_table])) {
              let val = scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[value[0]].input_table][each][indexOfTechnology]
              if(val !== technology) {
                presetValues.push(val)
              }
            }
          }
          return (
            <Tooltip 
              title={Object.keys(scenario.override_values[category]).includes(""+index) ? `To add more options, edit the ${CategoryNames[OVERRIDE_PRESET_VALUES[value[0]].input_table]} table in the data input section.` : ''} 
              placement="top" 
              enterDelay={500}
            >
            <FormControl sx={{ width: "100%" }} size="small">
              <InputLabel id="">Value</InputLabel>
              <Select
                disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
                labelId=""
                id=""
                name={`${index}`}
                value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index] : ""}
                label="Value"
                onChange={handleInputOverrideValue}
              >
                {
                  value[0] === "Treatment Facility" ? 
                  presetValues.map((presetValue, i) => (
                    <MenuItem key={`${presetValue}_${i}`} value={presetValue}>
                      {presetValue}
                    </MenuItem>
                  )) 
                  : 
                  scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[value[0]].input_table].VALUE.map((presetValue, i) => (
                    <MenuItem key={`${presetValue}_${i}`} value={presetValue}>
                      {presetValue}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            </Tooltip>
            )
          
          
        } catch (e) {
          console.error(e)
          console.log("unable to generate infrastructure buildout options from input table, using generic input")
          return ( 
            <TextField 
              name={`${index}`}
              size="small" 
              label="Value"
              value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index] : ""}
              disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
              onChange={handleInputOverrideValue} 
              onFocus={(event) => event.target.select()}
            />
          )
        }
      } else {
        return ( 
          <TextField 
            name={`${index}`}
            size="small" 
            label="Value"
            value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index] : ""}
            disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
            onChange={handleInputOverrideValue} 
            onFocus={(event) => event.target.select()}
          />
        )
      }
        
    }

const renderOutputTable = () => {

  try {
    if (show) {
        return (
            <TableContainer sx={{overflowX:'auto'}}>
            <Table style={{border:"1px solid #ddd"}} size='small'>
              <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
              <TableRow key={`headrow`}>
              {category === "vb_y_overview_dict" ? 
              <>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>CAPEX Type</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Location</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Destination</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Technology</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Capacity</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Unit</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Override</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12.5%"}}>Value</TableCell>
                {/* <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Bound</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Floor</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Ceilling</TableCell> */}
              </>
              
              :
              <>
              {data[category][0].map((value, index) => {
                if (Object.keys(columnNodes).length === 0 || columnNodes[columnNodesMapping[index]]){
                  return <TableCell key={`${value}_${index}`} style={{backgroundColor:"#6094bc", color:"white"}}>{value}</TableCell>
                }
              })}
                <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>Override</TableCell>
                <TableCell style={{backgroundColor:"#6094bc", color:"white", width: "12.5%"}}>Value</TableCell>
              </>
              }
              
              </TableRow>
              </TableHead>
              {category === "vb_y_overview_dict" ? 
              <TableBody>
                {data[category].slice(1).map((value, index) => {
                  return (<TableRow key={`row_${value}_${index}`}>
                    {[0,1,2,5,3,4].map((cellIdx, i) => (
                      <TableCell 
                        align={"left"} 
                        key={"" + index + i} 
                        style={i === 0 ? styles.firstCol : styles.other}>
                          {value[cellIdx].toLocaleString('en-US', {maximumFractionDigits:0})}
                      </TableCell>
                      )
                    )}
                    <TableCell 
                      align="left"
                      style={styles.other}>
                        <Checkbox
                            checked={getCheckboxValue(index)}
                            onChange={() => handleCheckOverride(index)}
                        />
                    </TableCell>
                    <TableCell 
                      disabled
                      align="right"
                      style={styles.other}>
                        {generateInfrastructureBuildoutOptions(value, index)}
                    </TableCell>
                  </TableRow>)
                })}
              </TableBody>
              :
              <TableBody>
              {data[category].slice(1).map((value, index) => {
                if (Object.keys(rowNodes).length === 0 || rowNodes[rowNodesMapping[index]]) {
                return (<TableRow key={`row_${value}_${index}`}>
                {value.map((cellValue, i)=> {
                  if (Object.keys(columnNodes).length === 0 || columnNodes[columnNodesMapping[i]]) {
                  return <TableCell 
                          align={(i === (value.length - 1)) ? "right" : "left"} 
                          key={"" + index + i} 
                          style={i === 0 ? styles.firstCol : styles.other}>
                            {cellValue.toLocaleString('en-US', {maximumFractionDigits:0})}
                          </TableCell>
                  }
                })}
                <TableCell 
                    align="left"
                    style={styles.other}>
                    <Checkbox
                        checked={getCheckboxValue(index)}
                        onChange={() => handleCheckOverride(index)}
                    />
                </TableCell>
                <TableCell disabled align="right" style={styles.other}>
                    <TextField 
                        name={`${index}`}
                        size="small" 
                        label="Value"
                        value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index] : ""}
                        disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
                        onChange={handleInputOverrideValue} 
                        onFocus={(event) => event.target.select()}
                    />
                    </TableCell>
                </TableRow>)
                }
              })}
              </TableBody>
              }
            
            </Table>
            </TableContainer>
          )
    }
      
  } catch (e) {
    console.error("unable to render category: ",e)
  }
}

  return ( 
    <>
    {renderOutputTable()}
    </>
  );

}


