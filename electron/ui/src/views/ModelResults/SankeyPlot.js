import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Plot from 'react-plotly.js';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';

export default function SankeyPlot(props) {
    const [ sankeyCategory, setSankeyCategory ] = useState("v_F_Piped")
    const [ filteredNodes, setFilteredNodes ] = useState([]) 
    const [ totalNodes, setTotalNodes ] = useState([])
    const isAllSelected = totalNodes.length > 0 && filteredNodes.length === totalNodes.length;
    const [ plotData, setPlotData ] = useState({link: {source: [], target:[], value: [], label: []}, node: {label: []}});
    
    useEffect(()=>{
        unpackData(true, []);
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
            setFilteredNodes(tempNodes)
        }
        unpackData(false, tempNodes)
    }

    const unpackData = (unpackAll, filtered) =>
    {
        if(!unpackAll) var tempFilteredNodes = filtered
        else var tempFilteredNodes = filteredNodes
        console.log('unpacking data with unpackall = '+unpackAll)
        var d = {link: {source: [], target:[], value: [], label: []}, node: {label: []}}
        var locationsInArray = {}
        var nodeSet = new Set()
        for (let i = 1; i < props.data[sankeyCategory].length; i++) {
            var source = props.data[sankeyCategory][i][0]
            var target = props.data[sankeyCategory][i][1]
            var label = props.data[sankeyCategory][i][2]
            var value = props.data[sankeyCategory][i][3]

            nodeSet.add(source)
            nodeSet.add(target)

            if (unpackAll || tempFilteredNodes.includes(source) || tempFilteredNodes.includes(target)) {
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
        setTotalNodes(Array.from(nodeSet))
        if(unpackAll) setFilteredNodes(Array.from(nodeSet))
        console.log(d)
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

            <Accordion sx={{width:"220px"}}>
                <AccordionSummary>
                <p style={{margin:0, fontWeight: "bold", color: "#0884b4"}}>Time & Location Filters</p>
                </AccordionSummary>
                <AccordionDetails sx={{ height:"500px", overflow: "scroll"}}>
                    <MenuItem value="all" onClick={()=> handleNodeFilter("all")}>
                    <ListItemIcon>
                        <Checkbox
                        checked={isAllSelected}
                        indeterminate={
                            filteredNodes.length > 0 && filteredNodes.length < totalNodes.length
                        }
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary="Select All"
                    />
                    </MenuItem>
                    {totalNodes.map((option, index) => (
                    <MenuItem key={option} value={option} onClick={()=> handleNodeFilter(option)}>
                        <ListItemIcon>
                        <Checkbox checked={filteredNodes.indexOf(option) > -1} />
                        </ListItemIcon>
                        <ListItemText primary={option} />
                    </MenuItem>
                    ))}
                </AccordionDetails>
            </Accordion>

        </Box>
        </Grid>
    </Grid>
    </Box>
  );

}
