import React from 'react';
import {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Tooltip, Box } from '@mui/material';
import ParetoDictionary from '../../assets/ParetoDictionary.json'
import CategoryNames from '../../assets/CategoryNames.json'

export default function DataInputTable(props) {  
  useEffect(()=>{
    console.log('data table use effect triggered')
    // console.log(props.data)
    
  }, [props.data]);

  var keyIndexMapping = {}

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

   const handleChangeValue = (event) => {
    let inds = event.target.getAttribute('name').split(":")
    //ind[0] is the index inside the array
    //ind[1] corresponds with the key
    let ind = parseInt(inds[0])
    let colName = keyIndexMapping[parseInt(inds[1])].split('::')[1]
    let tempScenario = {...props.scenario}
    if (isNaN(event.target.value)) {
      tempScenario.data_input.df_parameters[props.category][colName][ind] = event.target.value
    }else {
      tempScenario.data_input.df_parameters[props.category][colName][ind] = Number(event.target.value)
    }
    props.setScenario(tempScenario)
   }


const handleDoubleClick = (ind, index) => {
  /*
    ind: row number, starting at 0, excluding header row
    index: column number, starting at 0
  */
  if (['Optimized','Draft','failure', 'Not Optimized'].includes(props.scenario.results.status)) {
    if(index === 0) //when double clicking column index, set all numerical values in that row to 0
    { 
      let tempScenario = {...props.scenario}
      Object.entries(props.scenario.data_input.df_parameters[props.category]).map(([key, value], i) => {
        if (i > 0 && value[ind] !== "" && !isNaN(value[ind])) {
          value[ind] = 0
        }
      })
      props.handleEditInput(true)
      props.setScenario(tempScenario)
    }else {
      if(!props.editDict[""+ind+":"+index]) {
        let tempEditDict = {...props.editDict}
        tempEditDict[""+ind+":"+index] = true
        props.setEditDict(tempEditDict)
        props.handleEditInput(true)
      }
    }
    
  }  
  else {
    props.setShowError(true)
  }
 }

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if(props.editDict[e.target.name]) {
      let tempEditDict = {...props.editDict}
      tempEditDict[e.target.name] = false
      props.setEditDict(tempEditDict)
    }
  } 
  
}
  
  const renderInputRow = (ind) => {
      var cells = []

      Object.entries(props.data[props.category]).forEach(function([key, value]) {
        cells.push(value[ind])
        return 1
      });

      return (cells.map( (value, index) => {
        /*
          props.columnNodes[props.columnNodesMapping[index]] must be true
          UNLESS it's the first column (index is 0)
        */
       if (index === 0 || props.columnNodes[props.columnNodesMapping[index - 1]] || Object.keys(props.columnNodes).length === 0) {
        return (
          <Tooltip key={"tooltip_"+ind+":"+index} title={props.editDict[""+ind+":"+index] ? "Hit enter to lock value in" : index> 0 ? "Doubleclick to edit value" : ""} arrow>
          <TableCell onKeyDown={handleKeyDown} onDoubleClick={() => handleDoubleClick(ind, index)} key={""+ind+":"+index} name={""+ind+":"+index} style={index === 0 ? styles.firstCol : styles.other}>
          {props.editDict[""+ind+":"+index] ? 
            index === 0 ? value : 
            <TextField 
              autoFocus
              name={""+ind+":"+index} 
              size="small" label={""} 
              defaultValue={value} 
              onChange={handleChangeValue} 
              onFocus={(event) => event.target.select()}
            />
            :
            props.category === 'PadRates' || props.category === 'FlowbackRates' ?
            value.toLocaleString('en-US', {maximumFractionDigits:0})
            :
            value.toLocaleString('en-US', {maximumFractionDigits:2})
          }
          </TableCell>
          </Tooltip>
        )
       } else return null
      }))
  }

  const renderInputRows = () => {
      const rows = []
      let len = props.data[props.category][Object.keys(props.data[props.category])[0]].length
      for (let i = 0; i < len; i++) {
        rows.push(renderInputRow(i))
      }
      return (rows.map( (value, index) => {
         /*
          props.rowNodes[props.rowNodesMapping[index]] must equal true
        */
       if (props.rowNodes[props.rowNodesMapping[index]] || Object.keys(props.rowNodes).length === 0) {
        return <TableRow key={"row_"+index}>{value}</TableRow>
       } else return null
        
      }))
  }

  const renderInputTable = () => {
    try {
        return (
            <TableContainer>
            <h3>
              {CategoryNames[props.category] ? CategoryNames[props.category] : ParetoDictionary[props.category] ? ParetoDictionary[props.category] : props.category}
              {props.scenario.data_input.display_units && props.scenario.data_input.display_units[props.category] && ` (${props.scenario.data_input.display_units[props.category]})`}
            </h3>
            <TableContainer sx={{overflowX:'auto'}}>
            <Table style={{border:"1px solid #ddd"}} size='small'>
              <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
              <TableRow key="headRow">
              {Object.entries(props.data[props.category]).map( ([key, value], index) => {
                keyIndexMapping[index] = index+"::"+key
                if (index === 0 || props.columnNodes[index+"::"+key] || Object.keys(props.columnNodes).length === 0) {
                  return (
                    index === 0 ? 
                  <TableCell key={key} style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc"}}>{key}</TableCell> 
                  : 
                  <TableCell key={key} style={{color:"white"}}>{key}</TableCell>
                  )
                } else return null
              })}
              </TableRow>
              </TableHead>
              <TableBody>
              {renderInputRows()}
              </TableBody>
            </Table>
            </TableContainer>
            </TableContainer>
        )
    } catch (e) {
      console.error("unable to render input category: ",e)
    }
}

const renderOutputTable = () => {

  try {
      console.log('rendering output table')
      return (
        <TableContainer>
        <h3>{ParetoDictionary[props.category] ? ParetoDictionary[props.category] : CategoryNames[props.category] ? CategoryNames[props.category] : props.category}</h3>
        <TableContainer sx={{overflowX:'auto'}}>
        <Table style={{border:"1px solid #ddd"}} size='small'>
          <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
          <TableRow key={`headrow`}>
          {props.category === "v_F_Overview_dict" ? 
          <>
            <TableCell key="overview0" style={{backgroundColor:"#6094bc", color:"white"}}>KPI</TableCell> 
            <TableCell key="overview1" style={{backgroundColor:"#6094bc", color:"white"}}>Units</TableCell> 
            <TableCell key="overview2" style={{backgroundColor:"#6094bc", color:"white"}}>Value</TableCell> 
          </>
          :
          props.data[props.category][0].map((value, index) => {
            if (Object.keys(props.columnNodes).length === 0 || props.columnNodes[props.columnNodesMapping[index]]){
              return <TableCell key={`${value}_${index}`} style={{backgroundColor:"#6094bc", color:"white"}}>{value}</TableCell>
            }
          })
          }
          
          </TableRow>
          </TableHead>
          {props.category === "v_F_Overview_dict" ? 
          <TableBody>
          {props.data[props.category].slice(1).map((value, index) => {
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
            </TableRow>)
          })}
          </TableBody> 
          : 
          <TableBody>
          {props.data[props.category].slice(1).map((value, index) => {
            if (Object.keys(props.rowNodes).length === 0 || props.rowNodes[props.rowNodesMapping[index]]) {
            return (<TableRow key={`row_${value}_${index}`}>
            {value.map((cellValue, i)=> {
              if (Object.keys(props.columnNodes).length === 0 || props.columnNodes[props.columnNodesMapping[i]]) {
              return <TableCell 
                      align={(i === (value.length - 1)) ? "right" : "left"} 
                      key={"" + index + i} 
                      style={i === 0 ? styles.firstCol : styles.other}>
                        {cellValue.toLocaleString('en-US', {maximumFractionDigits:0})}
                      </TableCell>
              }
            })}
            </TableRow>)
            }
          })}
          </TableBody>
          }
        
        </Table>
        </TableContainer>
      </TableContainer>
      )
  } catch (e) {
    console.error("unable to render input category: ",e)
  }
}

  return ( 
    <>
    {props.section === "input" && renderInputTable()}
    {props.section === "output" && renderOutputTable()}
    </>
  );

}


