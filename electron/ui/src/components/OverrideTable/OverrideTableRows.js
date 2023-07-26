import React from 'react';
import {useEffect, useState} from 'react';
import { TableBody, TableCell, TableRow, TextField, Tooltip, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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

export default function OverrideTableRows(props) {  
  const {
        category, 
        data, 
        rowNodes, 
        rowNodesMapping, 
        columnNodes, 
        columnNodesMapping, 
        scenario,
        handleCheckOverride,
        handleInputOverrideValue,
        newInfrastructureOverrideRow,
        setNewInfrastructureOverrideRow
  } = props

  const styles = {
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

    const getCheckboxValue = (index) => {
        if(Object.keys(scenario.override_values[category]).includes(""+index)) {
            return true
        } else return false
    }

return (
  <>
    {category === "vb_y_overview_dict" ? 
    
    <TableBody>
      {data.map((value, index) => (
        <BinaryVariableRow
          key={`${value}_${index}`}
          category={category}
          value={value}
          index={index}
          scenario={scenario}
          handleCheckOverride={handleCheckOverride}
          handleInputOverrideValue={handleInputOverrideValue}
        />
      ))}
      
      {/* 
        this is where new rows will go while they're being added
      */}
      {newInfrastructureOverrideRow && 
          <NewBinaryVariableRow
          category={category}
          scenario={scenario}
          handleCheckOverride={handleCheckOverride}
          handleInputOverrideValue={handleInputOverrideValue}
        />
      }

      
      
    </TableBody>
    :
    <TableBody>
    {data.map((value, index) => {
      if (Object.keys(rowNodes).length === 0 || rowNodes[rowNodesMapping[index]]) {
      return (
        <RegularVariableRow
          key={`${value}_${index}`}
          category={category}
          value={value}
          index={index}
          scenario={scenario}
          handleCheckOverride={handleCheckOverride}
          handleInputOverrideValue={handleInputOverrideValue}
          columnNodes={columnNodes}
          columnNodesMapping={columnNodesMapping}
        />
      )
      }
    })}
    </TableBody>
    }
</>   
);
}

function NewBinaryVariableRow(props) {  
  const {
      category,
      scenario,
      handleCheckOverride,
      handleInputOverrideValue
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
  const [ uniqueIndex, setUniqueIndex ] = useState('')
  const [ overrideChecked, setOverrideChecked ] = useState(true)
  const [ presetValues, setPresetValues ] = useState({})
  

  const getValueSelectValue = () => {
    if (scenario.override_values[category][uniqueIndex] !== undefined) {

      if(scenario.override_values[category][uniqueIndex].variable === "vb_y_Storage_dict" || scenario.override_values[category][uniqueIndex].variable === "vb_y_Disposal_dict") {
        if(scenario.override_values[category][uniqueIndex].indexes.length>=2) return scenario.override_values[category][uniqueIndex].indexes[1]
        else return ""
      } else {
        if(scenario.override_values[category][uniqueIndex].indexes.length>=3) return scenario.override_values[category][uniqueIndex].indexes[2]
        else return ""
      }
    } else return ""
  }

  const handleInput = (event) => {
    let number_value
    if (value[0] === "Treatment Facility") {
      number_value = presetValues[technology][event.target.value]
    } else {
      number_value = presetValues[event.target.value]
    } 
    if(number_value === 0) handleInputOverrideValue(event, true)
    else handleInputOverrideValue(event, false)
  }

  const generateValueOptions = (value, index) => {
    if (Object.keys(OVERRIDE_PRESET_VALUES).includes(value[0])) {
      try {
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
              name={`${index}::select`}
              value={getValueSelectValue()}
              label="Value"
              onChange={handleInput}
            >
              {
                value[0] === "Treatment Facility" ? 
                Object.entries(presetValues[technology]).map(([key,value]) => (
                  <MenuItem key={`${key}_${value}`} value={key}>
                    {value}
                  </MenuItem>
                ))
                : 
                Object.entries(presetValues).map(([key,value]) => (
                  <MenuItem key={`${key}_${value}`} value={key}>
                    {value}
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
            name={`${index}::textfield`}
            size="small" 
            label="Value"
            value={scenario.override_values[category][index].value !== undefined ? scenario.override_values[category][index].value : ""}
            disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
            onChange={handleInputOverrideValue} 
            onFocus={(event) => event.target.select()}
          />
        )
      }
    } else {
      return ( 
        <TextField 
          name={`${index}::textfield`}
          size="small" 
          label="Value"
          value={scenario.override_values[category][uniqueIndex] !== undefined ? scenario.override_values[category][uniqueIndex].value : ""}
          disabled={!Object.keys(scenario.override_values[category]).includes(""+uniqueIndex)}
          onChange={handleInputOverrideValue} 
          onFocus={(event) => event.target.select()}
        />
      )
    }
      
  }

  const generateLocationOptions = () => {

  }

  const generateDestinationOptions = () => {

  }

  const generateTechnologyOptions = () => {

  }

  const generateCapacityOptions = () => {

  }


  const handleSelectRowName = (event) => {
    setRowName(event.target.value)
  }

  const handleSelectLocation = (event) => {
    setLocation(event.target.value)
  }

  const handleSelectDestination = (event) => {
    setDestination(event.target.value)
  }

  const handleSelectTechnology = (event) => {
    // console.log('selected '+event.target.value)
    // let tempValue = [...value]
    // tempValue[5] = event.target.value
    // setValue(tempValue)
    setTechnology(event.target.value)
    // handleInputOverrideValue(event)
  }

  const handleSelectCapacity = (event) => {
    setCapacity(event.target.value)
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
                    // disabled={location===""}
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
                      generateTechnologyOptions()
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
                      generateCapacityOptions()
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
              align="left"
              style={styles.other}>
                <Checkbox
                    checked={overrideChecked}
                    // onChange={() => handleCheckOverride(uniqueIndex, displayValue)}
                />
            </TableCell>
            <TableCell 
              align={"left"} 
              style={styles.other}>
                  <FormControl sx={{ width: "100%" }} size="small">
                  <InputLabel id="">Value</InputLabel>
                  <Select
                    disabled={rowName==="" || (rowName==="Treatment Facility" && technology==="")}
                    labelId=""
                    id="capacity"
                    name={`capacity`}
                    value={capacity}
                    label="Value"
                    onChange={handleSelectCapacity}
                  >
                    {
                      generateCapacityOptions()
                    }
                  </Select>
                </FormControl>
            </TableCell>
        </TableRow>
    )
}

function BinaryVariableRow(props) {  
  const {
      category, 
      value,
      index, 
      scenario,
      handleCheckOverride,
      handleInputOverrideValue
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
  const [ displayValue, setDisplayValue ] = useState()
  const [ showData, setShowData ] = useState(false)
  const [ overrideChecked, setOverrideChecked ] = useState(false)
  const [ rowName, setRowName ] = useState("")
  const [ presetValues, setPresetValues ] = useState({})
  const [ technology, setTechnology ] = useState(null)
  const [ uniqueIndex, setUniqueIndex ] = useState('')

  useEffect(() => {
    /*
      Logic for creating dictionary with correct values for each infrastructure buildout row 
    */
    let tempDisplayValue = [...value]
    setDisplayValue(tempDisplayValue)

    try {
      let preset_value_table = scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[tempDisplayValue[0]].input_table]
      let preset_values = {}
        if(tempDisplayValue[0] === "Treatment Facility") {
          // check for technology in override values. if found, use that. else, use the value from scenario
          let tempTechnology
          if (scenario.override_values[category][uniqueIndex] !== undefined) {
            tempTechnology = scenario.override_values[category][uniqueIndex].indexes[1]
          } else {
            tempTechnology = tempDisplayValue[5]
          }
           
          let technologyNamesKey = "TreatmentCapacities"
          let technologies = scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[tempDisplayValue[0]].input_table][technologyNamesKey]
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
          setTechnology(tempTechnology)
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
        setRowName(value[0])
        setPresetValues(preset_values)
        setShowData(true)
    } catch(e) {
      // console.log('failed to generated override table rows: ')
      // console.log(e)
    }

  }, [value, overrideChecked])

  useEffect(() => {
    let newIndex = `${value[0]}:${value[1]}:${value[2]}:${value[5]}`
    // console.log('new index is: ')
    // console.log(newIndex)
    setUniqueIndex(newIndex)
    if(Object.keys(scenario.override_values[category]).includes(""+newIndex) && !overrideChecked) setOverrideChecked(true)
    else if (!Object.keys(scenario.override_values[category]).includes(""+newIndex) && overrideChecked) setOverrideChecked(false)
  }, [scenario])

  const getValueSelectValue = () => {
    if (scenario.override_values[category][uniqueIndex] !== undefined) {

      if(scenario.override_values[category][uniqueIndex].variable === "vb_y_Storage_dict" || scenario.override_values[category][uniqueIndex].variable === "vb_y_Disposal_dict") {
        if(scenario.override_values[category][uniqueIndex].indexes.length>=2) return scenario.override_values[category][uniqueIndex].indexes[1]
        else return ""
      } else {
        if(scenario.override_values[category][uniqueIndex].indexes.length>=3) return scenario.override_values[category][uniqueIndex].indexes[2]
        else return ""
      }
    } else return ""
  }

  const handleInput = (event) => {
    let number_value
    if (displayValue[0] === "Treatment Facility") {
      number_value = presetValues[technology][event.target.value]
    } else {
      number_value = presetValues[event.target.value]
    } 
    // console.log("number_value")
    // console.log(number_value)
    if(number_value === 0) handleInputOverrideValue(event, true)
    else handleInputOverrideValue(event, false)
  }

  const generateInfrastructureBuildoutValueOptions = (value, index) => {
    if (Object.keys(OVERRIDE_PRESET_VALUES).includes(value[0])) {
      try {
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
              name={`${index}::select`}
              value={getValueSelectValue()}
              label="Value"
              onChange={handleInput}
            >
              {
                value[0] === "Treatment Facility" ? 
                Object.entries(presetValues[technology]).map(([key,value]) => (
                  <MenuItem key={`${key}_${value}`} value={key}>
                    {value}
                  </MenuItem>
                ))
                : 
                Object.entries(presetValues).map(([key,value]) => (
                  <MenuItem key={`${key}_${value}`} value={key}>
                    {value}
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
            name={`${index}::textfield`}
            size="small" 
            label="Value"
            value={scenario.override_values[category][index].value !== undefined ? scenario.override_values[category][index].value : ""}
            disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
            onChange={handleInputOverrideValue} 
            onFocus={(event) => event.target.select()}
          />
        )
      }
    } else {
      return ( 
        <TextField 
          name={`${index}::textfield`}
          size="small" 
          label="Value"
          value={scenario.override_values[category][uniqueIndex] !== undefined ? scenario.override_values[category][uniqueIndex].value : ""}
          disabled={!Object.keys(scenario.override_values[category]).includes(""+uniqueIndex)}
          onChange={handleInputOverrideValue} 
          onFocus={(event) => event.target.select()}
        />
      )
    }
      
  }
  const handleTechnologySelect = (event) => {
    console.log('selected '+event.target.value)
    let tempDisplayValue = [...displayValue]
    tempDisplayValue[5] = event.target.value
    setDisplayValue(tempDisplayValue)
    setTechnology(event.target.value)
    handleInputOverrideValue(event)
  }

return (
  <>
    {showData && 
      <TableRow>
          {[0,1,2,5,3,4].map((cellIdx, i) => (
            <TableCell 
              align={"left"} 
              key={"" + index + i} 
              style={i === 0 ? styles.firstCol : styles.other}>
                {(cellIdx === 5 && overrideChecked && rowName === "Treatment Facility") ?
                  <FormControl sx={{ width: "100%" }} size="small">
                  <InputLabel id="">Value</InputLabel>
                  <Select
                    // disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
                    labelId=""
                    id=""
                    name={`${uniqueIndex}::technology`}
                    value={technology}
                    label="technology"
                    onChange={handleTechnologySelect}
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
                  displayValue[cellIdx].toLocaleString('en-US', {maximumFractionDigits:0})
                }
            </TableCell>
            )
          )}
          <TableCell 
            align="left"
            style={styles.other}>
              <Checkbox
                  checked={overrideChecked}
                  onChange={() => handleCheckOverride(uniqueIndex, displayValue)}
              />
          </TableCell>
          <TableCell 
            disabled
            align="right"
            style={styles.other}>
              {generateInfrastructureBuildoutValueOptions(displayValue, uniqueIndex)}
          </TableCell>
        </TableRow>
    }
  </>
  )
}


function RegularVariableRow(props) {  
  const {
      category, 
      value,
      index, 
      scenario,
      handleCheckOverride,
      handleInputOverrideValue,
      columnNodesMapping,
      columnNodes
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
  // const [ displayValue, setDisplayValue ] = useState()
  const [ showData, setShowData ] = useState(false)
  const [ overrideChecked, setOverrideChecked ] = useState(false)
  const [ rowName, setRowName ] = useState("")
  const [ uniqueIndex, setUniqueIndex ] = useState('')

  useEffect(() => {
    let tempDisplayValue = [...value]
    // setDisplayValue(tempDisplayValue)
    setRowName(value[0])
    setShowData(true)
  }, [value, overrideChecked])

  useEffect(() => {
    let newIndex = `${value[0]}:${value[1]}:${value[2]}`
    // console.log('new index is: ')
    // console.log(newIndex)
    setUniqueIndex(newIndex)
    if(Object.keys(scenario.override_values[category]).includes(""+newIndex) && !overrideChecked) setOverrideChecked(true)
    else if (!Object.keys(scenario.override_values[category]).includes(""+newIndex) && overrideChecked) setOverrideChecked(false)
  }, [scenario])

  const handleInput = (event) => {
    handleInputOverrideValue(event, false)
  }

return (
  <>
    {showData && 
      <TableRow key={`row_${value}_${index}`}>
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
                checked={overrideChecked}
                onChange={() => handleCheckOverride(uniqueIndex, value)}
            />
        </TableCell>
        <TableCell disabled align="right" style={styles.other}>
            <TextField 
                name={`${uniqueIndex}::textfield`}
                size="small" 
                label="Value"
                value={scenario.override_values[category][uniqueIndex] !== undefined ? scenario.override_values[category][uniqueIndex].value : ""}
                disabled={!Object.keys(scenario.override_values[category]).includes(""+uniqueIndex)}
                onChange={handleInput} 
                onFocus={(event) => event.target.select()}
          />
          </TableCell>
      </TableRow>
    }
  </>
  )
}




