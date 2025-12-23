import React from 'react';
import {useEffect, useState} from 'react';   
import { Box, Grid, FormControl, MenuItem, Select } from '@mui/material'
import Plot from 'react-plotly.js';
import FilterDropdown from '../../components/FilterDropdown/FilterDropdown';

export default function SankeyPlot(props) {
    const [ sankeyCategory, setSankeyCategory ] = useState("v_F_Piped")
    const [ filteredNodes, setFilteredNodes ] = useState([]) 
    const [ totalNodes, setTotalNodes ] = useState([])
    const [ filteredTimes, setFilteredTimes ] = useState([]) 
    const [ totalTimes, setTotalTimes ] = useState([])
    const isAllNodesSelected = totalNodes.length > 0 && filteredNodes.length === totalNodes.length;
    const isAllTimesSelected = totalTimes.length > 0 && filteredTimes.length === totalTimes.length;
    const [ plotData, setPlotData ] = useState({link: {source: [], target:[], value: [], label: []}, node: {label: []}});


    useEffect(()=>{

        unpackNodes(false)
        
    }, [sankeyCategory, props.scenarioId]);

    const handleCategoryChange = (event) => {
        setSankeyCategory(event.target.value)
    }

    const handleNodeFilter = (node) => {
        let tempNodes
        if (node === 'all') {
            tempNodes = filteredNodes.length === totalNodes.length ? [] : totalNodes
            setFilteredNodes(tempNodes);
        }
        else {
            tempNodes = [...filteredNodes]
            const index = tempNodes.indexOf(node);
            if (index > -1) {
                tempNodes.splice(index, 1);
            } else{
                tempNodes.push(node)
            }
            tempNodes = tempNodes.sort()
            setFilteredNodes(tempNodes)
        }
        unpackData(false, tempNodes, filteredTimes)
    }

    const handleTimeFilter = (time) => {
        let tempTimes
        if (time === 'all') {
            tempTimes = filteredTimes.length === totalTimes.length ? [] : totalTimes
            setFilteredTimes(tempTimes);
        }
        else {
            tempTimes = [...filteredTimes]
            const index = tempTimes.indexOf(time);
            if (index > -1) {
                tempTimes.splice(index, 1);
            } else{
                tempTimes.push(time)
            }
            tempTimes = tempTimes.sort()
            setFilteredTimes(tempTimes)
        }
        unpackData(false, filteredNodes, tempTimes)
    }

    const handleArrowSelection = (direction) => {
        let tempTimes
        if(direction === 'up') {
            if(isAllTimesSelected || filteredTimes.length===0) {
                tempTimes=[totalTimes[totalTimes.length-1]]
            } else if (filteredTimes[0]===totalTimes[0]) {
                tempTimes=[...totalTimes]
            }else {
                let index = totalTimes.indexOf(filteredTimes[0]);
                tempTimes=[totalTimes[index-1]]
            }
        } else if(direction === 'down') {
            if(isAllTimesSelected || filteredTimes.length===0) {
                tempTimes=[totalTimes[0]]
            } else if (filteredTimes[filteredTimes.length-1]===totalTimes[totalTimes.length-1]){
                tempTimes=[...totalTimes]
            }
            else {
                const index = totalTimes.indexOf(filteredTimes[filteredTimes.length-1]);
                tempTimes=[totalTimes[index+1]]
            }
        }
        setFilteredTimes(tempTimes)
        unpackData(false, filteredNodes, tempTimes)
    }

    const unpackNodes = (unpackAllTimes) =>
    {
        let nodeSet = new Set()
        let timeSet = new Set()
        for (let i = 1; i < props.data[sankeyCategory].length; i++) {
            let source = props.data[sankeyCategory][i][0]
            let target = props.data[sankeyCategory][i][1]
            let label = props.data[sankeyCategory][i][2]
            
            nodeSet.add(source)
            nodeSet.add(target)
            timeSet.add(label)
            
        }
        let totalNodes = Array.from(nodeSet).sort()
        let totalTimes = Array.from(timeSet).sort()
        let tempFilteredTimes = unpackAllTimes ? timeSet : timeSet.has('T01') ? ["T01"] : Array.from(timeSet)
        console.log(`filtered times is ${tempFilteredTimes}`)
        setTotalNodes(Array.from(totalNodes))
        setTotalTimes(Array.from(totalTimes))
        setFilteredNodes(Array.from(nodeSet))
        setFilteredTimes(Array.from(tempFilteredTimes))
        
        unpackData(false, totalNodes, tempFilteredTimes)
          
    }


    const unpackData = (unpackAll, nodes, times) =>
    {
        let tempFilteredNodes, tempFilteredTimes
        if(!unpackAll) {
            tempFilteredNodes = nodes
            tempFilteredTimes = times
        }
        else {
            tempFilteredNodes = filteredNodes
            tempFilteredTimes = filteredTimes
        }
        let d = {link: {source: [], target:[], value: [], label: []}, node: {label: []}}
        let locationsInArray = {}
        for (let i = 1; i < props.data[sankeyCategory].length; i++) {
            let source = props.data[sankeyCategory][i][0]
            let target = props.data[sankeyCategory][i][1]
            let label = props.data[sankeyCategory][i][2]
            let value = props.data[sankeyCategory][i][3]
            if ((unpackAll) || (tempFilteredTimes.includes(label) && (tempFilteredNodes.includes(source) || tempFilteredNodes.includes(target)))) {
                let sourceIndex, targetIndex
                if (d.node.label.includes(source)) {
                    sourceIndex = locationsInArray[source]
                } 
                else {
                    sourceIndex = d.node.label.length
                    d.node.label.push(source)
                    locationsInArray[source] = sourceIndex
                }
                if (d.node.label.includes(target)) {
                    targetIndex = locationsInArray[target]
                } 
                else {
                    targetIndex = d.node.label.length
                    d.node.label.push(target)
                    locationsInArray[target] = targetIndex
                }
                d.link.source.push(sourceIndex)
                d.link.target.push(targetIndex)
                d.link.value.push(value)
                d.link.label.push(label)
            }
            
        }
        setPlotData(d)
          
    }

  return ( 
    <Grid container direction="row">
        <Grid item sm={2}>
        <Box display="flex" justifyContent="flex-start">
            <FormControl sx={{ width: "25ch" }} size="small">
                <Select
                value={sankeyCategory}
                onChange={handleCategoryChange}
                sx={{color:'#0b89b9', fontWeight: "bold"}}
                >
                <MenuItem key={0} value={"v_F_Piped"}>Piped</MenuItem>
                <MenuItem key={1} value={"v_F_Trucked"}>Trucked</MenuItem>
                </Select>
            </FormControl>
        </Box>
        </Grid>
        <Grid item sm={8}>
        <Box display="flex" justifyContent="center" sx={{paddingTop:'50px'}}>
            <Plot
                data={[
                {
                    type: "sankey",
                    domain: {
                        x: [0,1],
                        y: [0,1]
                    },
                    orientation: "h",
                    valueformat: ".0f",
                    valuesuffix: " bbl",
                    node: {
                        pad: 15,
                        thickness: 15,
                        line: {
                        color: "black",
                        width: 0.5
                        },
                    label: plotData.node.label,

                        },

                    link: {
                        source: plotData.link.source,
                        target: plotData.link.target,
                        value: plotData.link.value,
                        label: plotData.link.label,
                    }
                },

                ]}
                layout={ {width: 1118,   height: 772, font: { size: 10 }} }
            />
        </Box>
        </Grid>
        <Grid item sm={2}>
        <Box display="flex" justifyContent="flex-end">
            <FilterDropdown
                width="220px"
                maxHeight="500px"
                option1="Time"
                filtered1={filteredTimes}
                total1={totalTimes}
                isAllSelected1={isAllTimesSelected}
                handleFilter1={handleTimeFilter}
                option2="Location"
                filtered2={filteredNodes}
                total2={totalNodes}
                isAllSelected2={isAllNodesSelected}
                handleFilter2={handleNodeFilter}
                handleArrowSelection={handleArrowSelection}
            />
        </Box>
        </Grid>
    </Grid>
  );

}
