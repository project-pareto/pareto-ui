import React from 'react';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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
        unpackData(true, [], []);
    }, [sankeyCategory]);

    const handleCategoryChange = (event) => {
        setSankeyCategory(event.target.value)
    }

    const handleNodeFilter = (node) => {
        var tempNodes
        if (node === 'all') {
            tempNodes = filteredNodes.length === totalNodes.length ? [] : totalNodes
            setFilteredNodes(tempNodes);
        }
        else {
            tempNodes = [...filteredNodes]
            const index = tempNodes.indexOf(node);
            if (index > -1) { // only splice array when item is found
                tempNodes.splice(index, 1); // 2nd parameter means remove one item only
            } else{
                tempNodes.push(node)
            }
            tempNodes = tempNodes.sort()
            setFilteredNodes(tempNodes)
        }
        unpackData(false, tempNodes, filteredTimes)
    }

    const handleTimeFilter = (time) => {
        var tempTimes
        if (time === 'all') {
            tempTimes = filteredTimes.length === totalTimes.length ? [] : totalTimes
            setFilteredTimes(tempTimes);
        }
        else {
            tempTimes = [...filteredTimes]
            const index = tempTimes.indexOf(time);
            if (index > -1) { // only splice array when item is found
                tempTimes.splice(index, 1); // 2nd parameter means remove one item only
            } else{
                tempTimes.push(time)
            }
            tempTimes = tempTimes.sort()
            setFilteredTimes(tempTimes)
        }
        unpackData(false, filteredNodes, tempTimes)
    }

    const handleArrowSelection = (direction) => {
        var tempTimes
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

    const unpackData = (unpackAll, nodes, times) =>
    {
        if(!unpackAll) {
            var tempFilteredNodes = nodes
            var tempFilteredTimes = times
        }
        else {
            var tempFilteredNodes = filteredNodes
            var tempFilteredTimes = filteredTimes
        }
        // console.log('unpacking data with unpackall = '+unpackAll)
        var d = {link: {source: [], target:[], value: [], label: []}, node: {label: []}}
        var locationsInArray = {}
        var nodeSet = new Set()
        var timeSet = new Set()
        for (let i = 1; i < props.data[sankeyCategory].length; i++) {
            var source = props.data[sankeyCategory][i][0]
            var target = props.data[sankeyCategory][i][1]
            var label = props.data[sankeyCategory][i][2]
            var value = props.data[sankeyCategory][i][3]

            nodeSet.add(source)
            nodeSet.add(target)
            timeSet.add(label)

            if (unpackAll || (tempFilteredTimes.includes(label) && (tempFilteredNodes.includes(source) || tempFilteredNodes.includes(target)))) {
                var sourceIndex, targetIndex
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
        let totalNodes = Array.from(nodeSet).sort()
        let totalTimes = Array.from(timeSet).sort()
        setTotalNodes(Array.from(totalNodes))
        setTotalTimes(Array.from(totalTimes))
        if(unpackAll) {
            setFilteredNodes(Array.from(nodeSet))
            setFilteredTimes(Array.from(timeSet))
        }
        // console.log(d)
        setPlotData(d)
          
    }

  return ( 
    <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3, overflow: 'scroll'}}>
    <Grid container direction="row">
        <Grid item sm={2} direction="row">
        <Box display="flex" justifyContent="flex-start">
            <FormControl sx={{ width: "25ch" }} size="small">
                <Select
                value={sankeyCategory}
                onChange={handleCategoryChange}
                sx={{color:'#0b89b9', fontWeight: "bold"}}
                >
                <MenuItem key={0} value={"v_F_Piped"}>v_F_Piped</MenuItem>
                <MenuItem key={1} value={"v_F_Trucked"}>v_F_Trucked</MenuItem>
                <MenuItem key={2} value={"v_F_Sourced"}>v_F_Sourced</MenuItem>
                </Select>
            </FormControl>
        </Box>
        </Grid>
        <Grid item sm="8">
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
                    // color: fig.data[0].node.color
                        },

                    link: {
                        source: plotData.link.source,
                        target: plotData.link.target,
                        value: plotData.link.value,
                        label: plotData.link.label,
                    }
                },
                // {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                ]}
                layout={ {width: 1118,   height: 772, font: { size: 10 }, title: sankeyCategory} }
            />
        </Box>
        </Grid>
        <Grid item sm={2} direction="row">
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
    </Box>
  );

}
