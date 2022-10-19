import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Plot from 'react-plotly.js';
import IconButton from '@mui/material/IconButton';
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
    const [ filteredTimes, setFilteredTimes ] = useState([]) 
    const [ totalTimes, setTotalTimes ] = useState([])
    const [ filterType, setFilterType ] = useState("location")
    const isAllNodesSelected = totalNodes.length > 0 && filteredNodes.length === totalNodes.length;
    const isAllTimesSelected = totalTimes.length > 0 && filteredTimes.length === totalTimes.length;
    const [ plotData, setPlotData ] = useState({link: {source: [], target:[], value: [], label: []}, node: {label: []}});
    
    const styles = {
        iconSelected: {
            backgroundColor:'#6094bc', 
            color: 'white',
            borderRadius: 10,
            // margin:0,
            // padding:0
        },
        iconUnselected: {
            borderRadius: 10,
            color:'black',
            // margin:0,
            // padding:0
        }
       }

    useEffect(()=>{
        unpackData(true, [], []);
    }, [sankeyCategory]);

    const handleCategoryChange = (event) => {
        setSankeyCategory(event.target.value)
    }

    const handleFilterTypeChange = (filterType) => {
        setFilterType(filterType)
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
            setFilteredTimes(tempTimes)
        }
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
        console.log('unpacking data with unpackall = '+unpackAll)
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

            if (unpackAll || (tempFilteredNodes.includes(source) && tempFilteredNodes.includes(target) && tempFilteredTimes.includes(label))) {
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
        setTotalTimes(Array.from(timeSet))
        if(unpackAll) {
            setFilteredNodes(Array.from(nodeSet))
            setFilteredTimes(Array.from(timeSet))
        }
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
                <AccordionSummary sx={{marginBottom: 0, paddingBottom:0}}>
                <p style={{margin:0, fontWeight: "bold", color: "#0884b4"}}>Time & Location Filters</p>
                </AccordionSummary>
                <AccordionDetails sx={{ height:"500px", overflow: "scroll", marginTop:0, paddingTop:0}}>
                    <Button size="small" style={filterType === 'time' ? styles.iconSelected : styles.iconUnselected} onClick={() => handleFilterTypeChange('time')}>Time</Button>
                    <Button size="small" style={filterType === 'location' ? styles.iconSelected : styles.iconUnselected} onClick={() => handleFilterTypeChange('location')}>Location</Button>
                    
                    {filterType === 'time' && 
                    <>
                        <MenuItem value="all" onClick={()=> handleTimeFilter("all")}>
                        <ListItemIcon>
                            <Checkbox
                            checked={isAllTimesSelected}
                            indeterminate={
                                filteredTimes.length > 0 && filteredTimes.length < totalTimes.length
                            }
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select All"
                        />
                        </MenuItem>
                        {totalTimes.map((option, index) => (
                        <MenuItem key={option} value={option} onClick={()=> handleTimeFilter(option)}>
                            <ListItemIcon>
                            <Checkbox checked={filteredTimes.indexOf(option) > -1} />
                            </ListItemIcon>
                            <ListItemText primary={option} />
                        </MenuItem>
                        ))}
                    </>
                }
                    {filterType === 'location' && 
                    <>
                        <MenuItem value="all" onClick={()=> handleNodeFilter("all")}>
                        <ListItemIcon>
                            <Checkbox
                            checked={isAllNodesSelected}
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
                    </>
                    }
                    


                </AccordionDetails>
            </Accordion>

        </Box>
        </Grid>
    </Grid>
    </Box>
  );

}
