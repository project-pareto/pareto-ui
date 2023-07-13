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
        handleInputOverrideValue
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
        
      
    </TableBody>
    :
    <TableBody>
    {data.map((value, index) => {
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
              onChange={() => handleCheckOverride(index, value)}
          />
      </TableCell>
      <TableCell disabled align="right" style={styles.other}>
          <TextField 
              name={`${index}::textfield`}
              size="small" 
              label="Value"
              value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index].value : ""}
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
</>   
);
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
  const [ overrideChecked, setOverrideChecked ] = useState(null)
  const [ rowName, setRowName ] = useState("")
  const [ presetValues, setPresetValues ] = useState({})
  const [ technology, setTechnology ] = useState(null)

  useEffect(() => {
    /*
      Logic for creating dictionary with correct values for each infrastructure buildout row 
    */
    let tempDisplayValue = [...value]
    setDisplayValue(tempDisplayValue)


    let preset_value_table = scenario.data_input.df_parameters[OVERRIDE_PRESET_VALUES[tempDisplayValue[0]].input_table]
    let preset_values = {}
      if(tempDisplayValue[0] === "Treatment Facility") {
        let tempTechnology = tempDisplayValue[5]
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


      // let tempDisplayValue = [...value]
      // setDisplayValue(tempDisplayValue)
      // console.log('value is ')
      // console.log(value)

      setRowName(value[0])
      setPresetValues(preset_values)
      setShowData(true)
  }, [value, overrideChecked])

  useEffect(() => {
    if(Object.keys(scenario.override_values[category]).includes(""+index) && !overrideChecked) setOverrideChecked(true)
    else if (!Object.keys(scenario.override_values[category]).includes(""+index) && overrideChecked) setOverrideChecked(false)
  }, [scenario])


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
              value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index].value : ""}
              label="Value"
              onChange={handleInputOverrideValue}
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
          value={scenario.override_values[category][index] !== undefined ? scenario.override_values[category][index].value : ""}
          disabled={!Object.keys(scenario.override_values[category]).includes(""+index)}
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
                    name={`${index}::technology`}
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
                  onChange={() => handleCheckOverride(index, displayValue)}
              />
          </TableCell>
          <TableCell 
            disabled
            align="right"
            style={styles.other}>
              {generateInfrastructureBuildoutValueOptions(displayValue, index)}
          </TableCell>
        </TableRow>
    }
  </>
  )
}





