import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import sankey_data from './Sankey_data.json';
import Plot from 'react-plotly.js';


export default function SankeyPlot(props) {

    const [ plotData, setPlotData ] = useState({link: {source: [], target:[], value: [], label: []}, node: {label: []}});

    useEffect(()=>{
        console.log('unpacking data')
        unpackData();
    }, []);

    const unpackData = () =>
    {
        var guys = ["PP01", "PP02", "PP03", "PP04", "PP05", 
                    "PP06", "PP07", "PP08", "PP09", "PP10", 
                    "N01", "N02", "N03", "N04", "N05",
                    "N06", "N07", "N08", "N09", "N10"]
        var d = {...plotData}
        var locationsInArray = {}
        for (let i = 1; i < sankey_data.length; i++) {
            
            var source = sankey_data[i][0]
            var target = sankey_data[i][1]
            var label = sankey_data[i][2]
            var value = sankey_data[i][3]
            if( guys.includes(source) & (i % 20===0)) {
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
        console.log(d)
        setPlotData(d)
          
        // return sankey_data.map(function(record) {
        //     return record[ind];
        // });
    }

  return ( 
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
            layout={ {width: 1118,   height: 772, font: { size: 10 }, title: 'Sankey Diagram'} }
        />
  );

}


