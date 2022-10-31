import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';


export default function KPIDashboard(props) {
    const [ areaChartData, setAreaChartData ] = useState(null)

    useEffect(()=>{
        if(props.input) {
            let tempData = {}
            let tempKeys = []
            for (var key in props.data[props.category]) {
                tempData[props.data[props.category][key]] = {x:[], y: []}
                tempKeys.push(props.data[props.category][key])
            }

            Object.entries(props.data).map(([time, item], index ) => {
                if(index > 0) {
                    for (var index in item){
                        var value = item[index]
                        var key = tempKeys[index]
                        if (value) {
                            tempData[key].x.push(parseInt(time.substring(1)))
                            tempData[key].y.push(value)
                        }
                    }
                }
                
            })
            let tempAreaChartData = []
            // Object.entries(tempData).map(([key, value] ) => {
            //     tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
            // })
            let keys = Object.keys(tempData).sort().reverse()
            keys.map((key, index) => {
                let value = tempData[key]
                tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
            })
            setAreaChartData(tempAreaChartData)
        } else {
            let tempData = {}
            // organize area chart data
            for (var index = 1; index < props.data.length; index++) {
                let item = props.data[index]
                let key = item[1]
                let x = item[2]
                let y = item[3]
                if (key in tempData){
                    tempData[key].x.push(parseInt(x.substring(1)))
                    tempData[key].y.push(y)
                }else {
                    tempData[key] = {x: [x], y: [y]}
                }
            }
            let tempAreaChartData = []
            // Object.entries(tempData).map(([key, value] ) => {
            //     tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
            // })

            let keys = Object.keys(tempData).sort().reverse()
            keys.map((key, index) => {
                let value = tempData[key]
                tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key})
            })
            setAreaChartData(tempAreaChartData)
        }

    }, [props]);

  return ( 
        <Plot
            /* 
                x values are T values
                y values are bbl/week
                where does K value go? needs to be a label of some sort
            */
            data={areaChartData}
            layout={{
                width: props.width,
                height: props.height, 
                showlegend: props.showlegend, 
                title: props.title,
                xaxis: {
                    title: {
                        text: props.xaxis.titletext
                    }
                },
                yaxis: {
                    title: {
                        text: props.yaxis.titletext
                    }
                }
            }}
        />
  );

}


