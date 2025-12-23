// @ts-nocheck
import React from 'react';
import {useEffect, useState} from 'react';
import { TableCell, TableRow, Checkbox, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { INFRASTRUCTURE_CAPEX_MAPPING, VARIABLE_INDEXES }  from '../../assets/InfrastructureCapexMapping'


export default function NewBinaryVariableRow(props) {  
    const {
        category,
        scenario,
        handleCheckOverride,
        handleInputOverrideValue,
        setNewInfrastructureOverrideRow,
        addNewRow
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
    const [ value, setValue ] = useState([])
    const [ rowName, setRowName ] = useState("")
    const [ location, setLocation ] = useState("")
    const [ destination, setDestination ] = useState("")
    const [ technology, setTechnology ] = useState("")
    const [ capacity, setCapacity ] = useState("")
    const [ capacityNumberValue, setCapacityNumberValue ] = useState(null)
    const [ uniqueIndex, setUniqueIndex ] = useState('')
    const [ overrideChecked, setOverrideChecked ] = useState(true)
    const [ presetValues, setPresetValues ] = useState({})
    const [ nodeConnections, setNodeConnections ] = useState({})
    const pipelineTables = ['PNA', 'CNA','CCA','NNA', 'NCA','NKA', 'NRA', 'NSA','FCA','RCA','RNA','RSA','SCA','SNA']
    const pipelineTypes = {'P': 'ProductionPads', 'C': 'CompletionsPads', 'N': "NetworkNodes", 'F': 'FreshwaterSources', 'R': 'TreatmentSites', 'S': 'StorageSites'}
    
    useEffect(() => {
  
      //generate location options for pipeline consruction
      try {
        
          // TODO: generate the pipeline construction options
          let connections = []
          let connectionsDictionary = {}
          let allNodes = new Set()
          for (let tableName of pipelineTables) {
            let table = scenario.data_input.df_parameters[tableName]
            // let rowNames = table['ProductionPads']
            let rowNames = table[pipelineTypes[tableName.charAt(0)]]
            
            for(let colName of Object.keys(table)) {
              let row = table[colName]
              let idx = 0
              for (let element of row) {
                if (element === 1 || element === "1") {
                  connections.push([rowNames[idx], colName])

                  if (Object.keys(connectionsDictionary).includes(rowNames[idx])) {
                    connectionsDictionary[rowNames[idx]].push(colName)
                  } else connectionsDictionary[rowNames[idx]] = [colName]

                  //add connections in both directions (?)
                  if (Object.keys(connectionsDictionary).includes(colName)) {
                    connectionsDictionary[colName].push(rowNames[idx])
                  } else connectionsDictionary[colName] = [rowNames[idx]]

                  allNodes.add(rowNames[idx])
                  allNodes.add(colName)

                  
                }
                idx+=1
              }
              
            }
          }
          setNodeConnections(connectionsDictionary)
        
      } catch (e) {
        console.error(e)
        return 
      }
    },[scenario, category])
  
    const handleAddRow = () => {
        let tempDestination = destination
        if(tempDestination === "") tempDestination='--'
        let tempTechnology = technology
        if(tempTechnology === "") tempTechnology='--'

        // create object to insert into infrastructure buildout table
        let unit = INFRASTRUCTURE_CAPEX_MAPPING[rowName].unit
        let newRow = [rowName, location, tempDestination, capacityNumberValue, unit, tempTechnology]

        // create object to insert into override values
        let uniqueIndex = `${rowName}:${location}:${tempDestination}:${tempTechnology}`
        let indexes = [location]
        if (rowName === "Treatment Facility") {
            indexes.push(technology)
        }
        else if (rowName === "Pipeline Construction") {
            indexes.push(destination) 
        }
        indexes.push(capacity)
        let isZero = false
        if(capacityNumberValue === 0) isZero = true
        let variable = INFRASTRUCTURE_CAPEX_MAPPING[rowName].variable_name
        let new_override_value = {}
        new_override_value["key"] = uniqueIndex
        new_override_value["value"] = {
            indexes: indexes,
            isZero: isZero,
            value: 1,
            variable: variable,
            number_value: capacityNumberValue
        }
        addNewRow(new_override_value, newRow)
        setNewInfrastructureOverrideRow(false)

    }
  
    const generateValueOptions = () => {
        try {
          if (rowName === "Treatment Facility") {
            return (
              Object.entries(presetValues[technology]).map(([key,value]) => (
                <MenuItem key={`${key}_${value}`} value={key}>
                  {value}
                </MenuItem>
              ))
            ) 
          }
          else {
            return (
              Object.entries(presetValues).map(([key,value]) => (
                <MenuItem key={`${key}_${value}`} value={key}>
                  {value}
                </MenuItem>
              )) 
            )
          }
          
          
        } catch (e) {
          return 
        }
        
    }
  
    const generateLocationOptions = () => {
      try {
        if (rowName === "Treatment Facility") {
          return (
            scenario.data_input.df_sets.TreatmentSites.map((v,i) => (
              <MenuItem key={`${i}_${v}`} value={v}>
                {v}
              </MenuItem>
            ))
          ) 
        }
        else if (rowName === "Disposal Facility") {
          return (
            scenario.data_input.df_sets.SWDSites.map((v,i) => (
              <MenuItem key={`${i}_${v}`} value={v}>
                {v}
              </MenuItem>
            ))
          )
        }
        else if (rowName === "Storage Facility") {
          return (
            scenario.data_input.df_sets.StorageSites.map((v,i) => (
              <MenuItem key={`${i}_${v}`} value={v}>
                {v}
              </MenuItem>
            ))
          )
        }
        else if (rowName === "Pipeline Construction") {
            return (
                Object.keys(nodeConnections).sort().map((v,i) => (
                    <MenuItem key={`${i}_${v}`} value={v}>
                        {v}
                    </MenuItem>
                ))
            )
        }
        
        
      } catch (e) {
        console.error(e)
        return 
      }
  
    }
  
    const generateDestinationOptions = () => {
      if( location!=="") {
        return (
          nodeConnections[location].sort().map((v,i) => (
            <MenuItem key={`${i}_${v}`} value={v}>
              {v}
            </MenuItem>
          ))
        )
      } else return null
      
    } 
  
    const generatePresetValues = (rowName) => {
      try {
        let preset_value_table = scenario.data_input.df_parameters[INFRASTRUCTURE_CAPEX_MAPPING[rowName].input_table]
        let preset_values = {}
          if(rowName === "Treatment Facility") {
            let technologyNamesKey = "TreatmentCapacities"
            let technologies = scenario.data_input.df_parameters[INFRASTRUCTURE_CAPEX_MAPPING[rowName].input_table][technologyNamesKey]
            let len = technologies.length
            for (let i = 0; i < len; i++) {
              let each = technologies[i]
              preset_values[each] = {}
              for (let row of Object.keys(preset_value_table)) {
                if (row !== technologyNamesKey) {
                  preset_values[each][row] = preset_value_table[row][i]
                }
              }
            }
            // setTechnology(tempTechnology)
          } else {
    
            // this is janky but not sure how else to standardize reading the data from these different tables
            for (let key of Object.keys(preset_value_table)) {
              if(key !== "VALUE") {
                let leng = preset_value_table[key].length
                for(let i = 0; i < leng; i++) {
                  preset_values[preset_value_table[key][i]] = preset_value_table.VALUE[i]
                }
              }
            }
          }
        //   console.log('preset values')
        //   console.log(preset_values)
          setPresetValues(preset_values)
      } catch(e) {
        // console.log('failed to generated override table rows: ')
        // console.log(e)
      }
  
    }

  
    const handleSelectRowName = (event) => {
      let row_name = event.target.value
      setRowName(row_name)
      setCapacity("")
      setLocation("")
      setDestination("")
      setTechnology("")
      generatePresetValues(row_name)
    }
  
    const handleSelectLocation = (event) => {
      setLocation(event.target.value)
      setDestination("")
    }
  
    const handleSelectDestination = (event) => {
      setDestination(event.target.value)
    }
  
    const handleSelectTechnology = (event) => {
      setTechnology(event.target.value)
    }
  
    const handleSelectCapacity = (event) => {
        let number_value
        if (rowName === "Treatment Facility") {
            number_value = presetValues[technology][event.target.value]
        } else {
            number_value = presetValues[event.target.value]
        } 
        setCapacityNumberValue(number_value)
        setCapacity(event.target.value)
    }
  
    const checkForCompletion = () => {
      if (rowName === "") return true
      else if (rowName === "Treatment Facility") {
        if (location === "" || technology === "" || capacity === "") return true
        else return false
      }
      else if (rowName === "Disposal Facility") {
        if (location === "" || capacity === "") return true
        else return false
      }
      else if (rowName === "Storage Facility") {
        if (location === "" || capacity === "") return true
        else return false
      }
      else if (rowName === "Pipeline Construction") {
        if (location === "" || capacity === "" || destination === "") return true
        else return false
      }
    }
  
  
  return (
        <TableRow>
              <TableCell 
                align={"left"} 
                style={styles.firstCol}>
                    <FormControl sx={{ width: "100%" }} size="small">
                    <InputLabel id="">CAPEX Type</InputLabel>
                    <Select
                      labelId=""
                      id="rowname"
                      name={`rowname`}
                      value={rowName}
                      label="CAPEX Type"
                      onChange={handleSelectRowName}
                      autoFocus
                    >
                      {
                        ["Treatment Facility", "Disposal Facility", "Storage Facility", "Pipeline Construction"].map((key,idx) => (
                          <MenuItem key={`${key}_${idx}`} value={key}>
                            {key}
                          </MenuItem>
                        )) 
                      }
                    </Select>
                  </FormControl>
              </TableCell>
              <TableCell 
                align={"left"} 
                style={styles.other}>
                    <FormControl sx={{ width: "100%" }} size="small">
                    <InputLabel id="">Origin</InputLabel>
                    <Select
                      disabled={rowName===""}
                      labelId=""
                      id="location"
                      name={`location`}
                      value={location}
                      label="Origin"
                      onChange={handleSelectLocation}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                    >
                      {
                        generateLocationOptions()
                      }
                    </Select>
                  </FormControl>
              </TableCell>
              <TableCell 
                align={"left"} 
                style={styles.other}>
                  {rowName === "Pipeline Construction" ? 
                    <FormControl sx={{ width: "100%" }} size="small">
                    <InputLabel id="">Destination</InputLabel>
                    <Select
                      disabled={location===""}
                      labelId=""
                      id="destination"
                      name={`destination`}
                      value={destination}
                      label="Destination"
                      onChange={handleSelectDestination}
                    >
                      {
                        generateDestinationOptions()
                      }
                    </Select>
                  </FormControl>
                  :
                  "--"
                }
              </TableCell>
              <TableCell 
                align={"left"} 
                style={styles.other}>
                  {rowName === "Treatment Facility" ? 
                    <FormControl sx={{ width: "100%" }} size="small">
                    <InputLabel id="">Technology</InputLabel>
                    <Select
                      labelId=""
                      id="technology"
                      name={`technology`}
                      value={technology}
                      label="Technology"
                      onChange={handleSelectTechnology}
                    >
                      {
                        Object.keys(presetValues).map((key,idx) => (
                          <MenuItem key={`${key}_${idx}`} value={key}>
                            {key}
                          </MenuItem>
                        )) 
                      }
                    </Select>
                  </FormControl>
                  :
                  "--"
                }
              </TableCell>
              <TableCell 
                align={"left"} 
                style={styles.other}>
                    <FormControl sx={{ width: "100%" }} size="small">
                    <InputLabel id="">Capacity</InputLabel>
                    <Select
                      disabled={rowName==="" || (rowName==="Treatment Facility" && technology==="")}
                      labelId=""
                      id="capacity"
                      name={`capacity`}
                      value={capacity}
                      label="Capacity"
                      onChange={handleSelectCapacity}
                    >
                      {
                        generateValueOptions()
                      }
                    </Select>
                  </FormControl>
              </TableCell>
              <TableCell 
                align={"left"} 
                style={styles.other}>
                    {
                      rowName === "Pipeline Construction" ? "in" : 
                      rowName === "Storage Facility" ? "bbl" : 
                      ["Disposal Facility", "Treatment Facility"].includes(rowName) ? "bbl/d" : 
                      "--"
                     }
              </TableCell>
              <TableCell 
                align="center"
                style={styles.other}>
                  <Checkbox
                      checked={overrideChecked}
                  />
              </TableCell>
              <TableCell 
                align={"center"} 
                style={styles.other}
                >
                    <span style={{overflowX: 'auto', width:'100%'}}>
                    <IconButton color="success" disabled={checkForCompletion()} onClick={handleAddRow}>
                        <CheckCircleIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setNewInfrastructureOverrideRow(false)}>
                        <CancelIcon/>
                    </IconButton>
                    </span>
                    
              </TableCell>
          </TableRow>
      )
  }