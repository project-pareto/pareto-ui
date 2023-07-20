import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableCell, TableHead, TableRow, TableContainer, TablePagination } from '@mui/material';
import OverrideTableRows from './OverrideTableRows';

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

const VARIABLE_INDEXES = {
    "vb_y_overview_dict": [1,2,5],
    "v_F_Piped_dict": [0,1,2],
    "v_F_Sourced_dict": [0,1,2],
    "v_F_Trucked_dict": [0,1,2],
    "v_L_Storage_dict": [0,1],
    "v_L_PadStorage_dict": [0,1],
    "vb_y_Pipeline_dict": [0,1],
    "vb_y_Disposal_dict": [0,1],
    "vb_y_Storage_dict": [0,1],
    "vb_y_Treatment_dict": [0,1],
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

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [visibleRows, setVisibleRows] = useState([])
    const [rowsPerPage, setRowsPerPage] = useState(50);

    useEffect(() => {
      let tempRows = data[category].slice(1)
      let tempVisibleRows = tempRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      )
      setVisibleRows(tempVisibleRows)
      setRows(tempRows)

    },[data, scenario, category])

    useEffect(() => {
      // let tempRows = data[category].slice(1)
      let tempVisibleRows = rows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      )
      setVisibleRows(tempVisibleRows)

    },[page, rowsPerPage, rows])
    
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    // const visibleRows = useMemo(
    //   () =>
    //     rows.slice(
    //       page * rowsPerPage,
    //       page * rowsPerPage + rowsPerPage,
    //     ),
    //   [page, rowsPerPage, rows],
    // );


    const handleCheckOverride = (index, value) => {
      // console.log(value)
      
      let variable = category
      if(category ==="vb_y_overview_dict") variable = OVERRIDE_PRESET_VALUES[value[0]].variable_name
      let override_object = {variable: variable, isZero: false}
      let indexes = []
      for (let i of VARIABLE_INDEXES[category]) {
        if (!value[i].includes("-")) indexes.push(value[i])
      }
      override_object.indexes=indexes
      if(category ==="vb_y_overview_dict") override_object.value=1
      else override_object.value=""
      // console.log(override_object)
        let tempOverrideValues = {...scenario.override_values}
        if(Object.keys(tempOverrideValues[category]).includes(""+index)) {
        delete tempOverrideValues[category][index]
        } else {
            tempOverrideValues[category][index] = override_object
        }
        const tempScenario = {...scenario}
        tempScenario.override_values = tempOverrideValues
        updateScenario(tempScenario)
    } 

    const handleInputOverrideValue = (event, isZero) => {
        let tempOverrideValues = {...scenario.override_values}
        let idx = event.target.name.split("::")[0]
        let inputType = event.target.name.split("::")[1]
        let val = event.target.value
        /*
        ***
          WHEN SETTING VALUE FOR INFRASTRUCTURE BUILDOUT STUFF, WE NEED TO SEND THE NAME, NOT THE VALUE
          THIS OCCURS WHEN INPUT TYPE IS select
          For example, 0 -> C0 and 350000 -> C1
        ***
        */
        if(inputType === "select") {
          if(category ==="vb_y_overview_dict") {
            // check for storage faciltiy or disposal facility. they only have 2 total indexes. the others have 3
            if(tempOverrideValues[category][idx].variable === "vb_y_Storage_dict" || tempOverrideValues[category][idx].variable === "vb_y_Disposal_dict") {
              if (tempOverrideValues[category][idx].indexes.length >=2) tempOverrideValues[category][idx].indexes[1] = (val)
              else tempOverrideValues[category][idx].indexes.push(val)
            } else {
              if (tempOverrideValues[category][idx].indexes.length >=3) tempOverrideValues[category][idx].indexes[2] = (val)
              else tempOverrideValues[category][idx].indexes.push(val)
            }
          } else {
            tempOverrideValues[category][idx].value = val
          }
          if(isZero) tempOverrideValues[category][idx].isZero = true
          else tempOverrideValues[category][idx].isZero = false
          const tempScenario = {...scenario}
          tempScenario.override_values = tempOverrideValues
          updateScenario(tempScenario)
        }
        else if(inputType === "technology") {
          tempOverrideValues[category][idx].indexes[1] = val
          const tempScenario = {...scenario}
          tempScenario.override_values = tempOverrideValues
          updateScenario(tempScenario)
        }
        else if(!isNaN(val)) {
            if (val === "") tempOverrideValues[category][idx].value = val
            else tempOverrideValues[category][idx].value = parseInt(val)
            const tempScenario = {...scenario}
            tempScenario.override_values = tempOverrideValues
            updateScenario(tempScenario)
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
              <OverrideTableRows
                category={category}
                // data={data[category].slice(1)}
                data={visibleRows}
                rowNodes={rowNodes}
                rowNodesMapping={rowNodesMapping}
                columnNodes={columnNodes}
                columnNodesMapping={columnNodesMapping}
                scenario={scenario}
                handleCheckOverride={handleCheckOverride}
                handleInputOverrideValue={handleInputOverrideValue}
              />
            
            </Table>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            
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


