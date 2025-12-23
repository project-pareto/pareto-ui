// @ts-nocheck
import React from 'react';
import {useEffect, useState} from 'react';
import { Grid, Box } from '@mui/material';
import DataTable from '../../components/DataTable/DataTable';

export default function ScenarioCompareInput(props) {
    const {primaryScenario, referenceScenario, category, showSidebar, deltaDictionary} = props

  const [ columnNodesMapping, setColumnNodesMapping ] = useState([]) 
  const [ columnNodes, setColumnNodes ] = useState([])
  const [ filteredColumnNodes, setFilteredColumnNodes ] = useState([])
  const [ rowNodesMapping, setRowNodesMapping ] = useState([]) 
  const [ rowNodes, setRowNodes ] = useState([])
  const [ filteredRowNodes, setFilteredRowNodes ] = useState([])

  const styles = {
    boxView: showSidebar ? {
      m:3, padding:2, boxShadow:3,
    } : {
      m:3, padding:2, boxShadow:3,
    },
  }

    useEffect(()=>{
      /*
        when category is changed, reset the nodes for filtering (columns and rows of current table)
      */
      try {
        if (category !== "Plots" && category !== "Network Diagram" && category !== "Input Summary") {
          let tempEditDict = {}
          let tempColumnNodes = {}
          let tempColumnNodesMapping = []
          let tempRowNodes = {}
          let tempRowNodesMapping = []
          Object.entries(primaryScenario.data_input.df_parameters[category]).map( ([key, value], ind) => {
            if (ind === 0) {
              value.map ((v,i) => {
                tempRowNodesMapping.push(i+"::"+v)
                tempRowNodes[i+"::"+v] = true
                return 1
              })
            } else {
              tempColumnNodesMapping.push(ind+"::"+key)
              tempColumnNodes[ind+"::"+key] = true
            }
            primaryScenario.data_input.df_parameters[category][key].map( (value, index) => {
              tempEditDict[""+ind+":"+index] = false
              return 1
            })
            return 1
          })
          setColumnNodes(tempColumnNodes)
          setRowNodes(tempRowNodes)
          setFilteredColumnNodes(tempColumnNodesMapping)
          setFilteredRowNodes(tempRowNodesMapping)
          setColumnNodesMapping(tempColumnNodesMapping)
          setRowNodesMapping(tempRowNodesMapping) 
        }
      } catch (e) {
        console.error('unable to set edit dictionary: ',e)
      }
      
    }, [category, primaryScenario, referenceScenario]);


  const renderInputCategory = () => {
    try {
      /*
        else, return table for input category dictionary
      */

        return (
          <Box style={{backgroundColor:'white'}} sx={styles.boxView}>
          <Grid container>
            <Grid item xs={0.5}>
            </Grid>
            <Grid item xs={11}>
              <DataTable
                  section="compare"
                  category={category}
                  scenario={primaryScenario}
                  primaryData={primaryScenario.data_input.df_parameters}
                  referenceData={referenceScenario.data_input.df_parameters}
                  data={primaryScenario.data_input.df_parameters}
                  columnNodesMapping={columnNodesMapping}
                  columnNodes={columnNodes}
                  filteredColumnNodes={filteredColumnNodes}
                  rowNodesMapping={rowNodesMapping}
                  rowNodes={rowNodes}
                  filteredRowNodes={filteredRowNodes}
                  deltaDictionary={deltaDictionary}
              />
            </Grid>
            <Grid item xs={0.5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginLeft:'10px'}}>
            
            </Box>
          </Grid>
        </Grid>
        </Box>
        )
      
    } catch (e) {
      console.error("unable to render input category: ",e)
    }
}
  return ( 
    <Box sx={ showSidebar ? {paddingLeft: '240px'} : {paddingLeft:"0px"}}>
     {renderInputCategory()}
    </Box>
    
  );

}


