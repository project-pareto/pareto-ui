import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Plot from 'react-plotly.js';


export default function SankeyPlot(props) {
    const [ sankeyCategory, setSankeyCategory ] = useState("v_F_Piped")

    const [ plotData, setPlotData ] = useState({link: {source: [], target:[], value: [], label: []}, node: {label: []}});

    useEffect(()=>{
        unpackData();
    }, [sankeyCategory]);

    const handleCategoryChange = (event) => {
        setSankeyCategory(event.target.value)
    }

    const unpackData = () =>
    {
        var d = {link: {source: [], target:[], value: [], label: []}, node: {label: []}}
        var locationsInArray = {}
        for (let i = 1; i < props.data[sankeyCategory].length; i++) {
            
            var source = props.data[sankeyCategory][i][0]
            var target = props.data[sankeyCategory][i][1]
            var label = props.data[sankeyCategory][i][2]
            var value = props.data[sankeyCategory][i][3]
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
        console.log(d)
        setPlotData(d)
          
    }

  return ( 
    <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3, overflow: 'scroll'}}>
    <Grid container direction="row">
        <Grid item sm={1} direction="row">
        </Grid>
        <Grid item sm={2} direction="row">
        {/* <Box display="flex" justifyContent="flex-start">
            <Button variant="outlined" 
                sx={{
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    borderColor: '#0884b4',
                    color:'#0884b4'}}
            >
                Save Sankey
            </Button>
        </Box> */}
        </Grid>
        <Grid item sm={8} direction="row">
        <Box display="flex" justifyContent="flex-end">
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
        <Grid item sm={1} direction="row">

        </Grid>
        <Grid item sm={12}>
        <Box display="flex" justifyContent="center">
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
                    valuesuffix: "TWh",
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
    </Grid>
    </Box>
  );

}


