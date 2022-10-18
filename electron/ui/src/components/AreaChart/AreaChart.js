import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';


export default function KPIDashboard(props) {
    const [ areaChartData, setAreaChartData ] = useState(null)

    useEffect(()=>{
        let tempData = {}
        console.log('area chart data is',props.data)
        // organize area chart data
        for (var index = 1; index < props.data.length; index++) {
            let item = props.data[index]
            let key = item[1]
            let x = item[2]
            let y = item[3]
            if (key in tempData){
                tempData[key].x.push(x)
                tempData[key].y.push(y)
            }else {
                tempData[key] = {x: [x], y: [y]}
            }
        }
        let tempAreaChartData = []
        Object.entries(tempData).map(([key, value] ) => {
            tempAreaChartData.push({x: parseInt(value.x), y: value.y, stackgroup: 'one', name: key})
        })

        setAreaChartData(tempAreaChartData)
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


