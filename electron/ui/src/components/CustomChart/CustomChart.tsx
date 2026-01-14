import React from 'react';
import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import type { CustomChartProps } from '../../types';

export default function AreaChart(props: CustomChartProps): JSX.Element {
    const [ areaChartData, setAreaChartData ] = useState<any[] | null>(null)

    useEffect(()=>{
        if(props.input) {
            const tempData: Record<string, {x: number[]; y: number[]}> = {}
            const tempKeys: string[] = []
            const category = props.category ?? ''
            const catArr: any[] = (props.data && props.data[category]) || []
            for (let key in catArr) {
                const k = catArr[key]
                tempData[k] = {x:[], y: []}
                tempKeys.push(k)
            }

            Object.entries(props.data || {}).forEach(([time, item], index ) => {
                if(index > 0) {
                    for (let ind in (item as any)){
                        let value = (item as any)[ind]
                        if(value === "") value = 0
                        const key = tempKeys[ind]
                        if (value || value === 0) {
                            tempData[key].x.push(Number(String(time).substring(1)))
                            tempData[key].y.push(Number(value))
                        }
                    }
                }
            })
            const tempAreaChartData: any[] = []

            const keys = Object.keys(tempData).sort().reverse()
            keys.forEach((key) => {
                const value = tempData[key]
                tempAreaChartData.push({x: value.x, y: value.y, stackgroup: 'one', name: key, line: { width: 0 }})
            })
            setAreaChartData(tempAreaChartData)
        } else {
            const tempData: Record<string, {x: number[]; y: number[]}> = {}
            // organize area chart data
            for (let idx = 1; idx < (props.data as any[]).length; idx++) {
                const item = (props.data as any[])[idx]
                let key = String(item[props.labelIndex ?? 0] ?? '')
                key = key.replace('PostTreatmentTreatedWaterNode','PTTWN').replace('PostTreatmentResidualNode','PTRN').replace('intermediate','I')
                let xraw = String(item[props.xindex ?? 0] ?? '')
                const x = Number(xraw.substring(1))
                const y = Number(item[props.yindex ?? 0] ?? 0)
                if (key in tempData){
                    tempData[key].x.push(x)
                    tempData[key].y.push(y)
                } else {
                    tempData[key] = {x: [x], y: [y]}
                }
            }
            const tempAreaChartData: any[] = []

            const keys = Object.keys(tempData).sort()
            keys.forEach((key) => {
                const value = tempData[key]
                tempAreaChartData.push({x: value.x, y: value.y, stackgroup: props.stackgroup, name: key, mode: "lines"})
            })
            setAreaChartData(tempAreaChartData)
        }

    }, [props]);

  return ( 
        <Plot
            /* 
                x values are T values
                y values are bbl/week
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


