import './ScenarioCompare.css';
import React, {useEffect, useState, Fragment} from 'react';
import {  } from "react-router-dom";
import { Box, Grid, IconButton } from '@mui/material'
import Sidebar from '../../components/Sidebar/ScenarioCompareSidebar'
import ScenarioCompareOutput from './ScenarioCompareOutput';





export default function ScenarioCompare(props) {
  const {scenarios, compareScenarioIndexes, setCompareScenarioIndexes} = props
  const [ primaryScenarioIndex, setPrimaryScenarioIndex ] = useState(null)
  const [ referenceScenarioIndex, setReferenceScenarioIndex ] = useState(null)
  const [ kpiDataPrimary, setKpiDataPrimary ] = useState(null)
  const [ kpiDataReference, setKpiDataReference ] = useState(null)
  const [ capexBarChartData, setCapexBarChartData ] = useState(null)
  const [ opexBarChartData, setOpexBarChartData ] = useState(null)
  const [ showSidebar, setShowSidebar ] = useState(true)
  const [ compareCategory, setCompareCategory ] = useState('output')

  useEffect(()=>{
    //check for indexes
    console.log('scenarios length')
    console.log(Object.keys(scenarios).length)
    let tempIndexes = []
    if(compareScenarioIndexes.length === 0) {
        let scenarioIds = Object.keys(scenarios)
        tempIndexes[0].push(scenarioIds[0])
        tempIndexes[1].push(scenarioIds[1])
        setPrimaryScenarioIndex(tempIndexes[0])
        setReferenceScenarioIndex(tempIndexes[1])
        setCompareScenarioIndexes([tempIndexes[0],tempIndexes[1]])
    } else if(compareScenarioIndexes.length === 1) {
        let scenarioIds = Object.keys(scenarios)
        tempIndexes.push(compareScenarioIndexes[0])
        tempIndexes.push(scenarioIds[0])
        setCompareScenarioIndexes([tempIndexes[0],tempIndexes[1]])
        return
    }
    else {
        tempIndexes.push(compareScenarioIndexes[0])
        tempIndexes.push(compareScenarioIndexes[1])
        setPrimaryScenarioIndex(tempIndexes[0])
        setReferenceScenarioIndex(tempIndexes[1])
    }

    // organize kpi data
    let tempData = {}
    for (var index in scenarios[tempIndexes[0]].results.data['v_F_Overview_dict']) {
        let item = scenarios[tempIndexes[0]].results.data['v_F_Overview_dict'][index]
        let key = item[0]
        let description = item[1]
        let unit = item[2]
        let value = item[3]
        tempData[key] = {"description": description, "unit": unit, "value": value, name: scenarios[tempIndexes[0]].name}
    }
    // console.log(tempData)
    setKpiDataPrimary(tempData)
    let tempData2 = {}
    for (var index in scenarios[tempIndexes[1]].results.data['v_F_Overview_dict']) {
        let item = scenarios[tempIndexes[1]].results.data['v_F_Overview_dict'][index]
        let key = item[0]
        let description = item[1]
        let unit = item[2]
        let value = item[3]
        tempData2[key] = {"description": description, "unit": unit, "value": value, name: scenarios[tempIndexes[1]].name}
    }
    // console.log(tempData2)
    setKpiDataReference(tempData2)
    unpackBarChartData(tempData,tempData2)
}, [compareScenarioIndexes]);

const unpackBarChartData = (scenarioData1, scenarioData2) => {
    console.log('unpacking data')
    // unpack bar chart data
    let tempCapexData = []
    let tempOpexData = []
    let capexKeys = [
        'v_C_StorageCapEx', 
        'v_C_TreatmentCapEx', 
        'v_C_DisposalCapEx', 
        'v_C_PipelineCapEx',
    ]
    let opexKeys = [
        'v_C_TotalSourced',
        'v_C_TotalTreatment',
        'v_C_TotalDisposal',
        'v_C_TotalPiping',
        'v_C_TotalTrucking',
    ]

    for(let each of capexKeys) {
        let tempX = [scenarioData1[each].name, scenarioData2[each].name]
        let tempY = [scenarioData1[each].value, scenarioData2[each].value]
        let tempName = each.replace('v_C_','').replace('CapEx','')
        tempCapexData.push({x:tempX, y:tempY, name: tempName, type: 'bar'})
    }

    for(let each of opexKeys) {
        let tempX = [scenarioData1[each].name, scenarioData2[each].name]
        let tempY = [scenarioData1[each].value, scenarioData2[each].value]
        let tempName = each.replace('v_C_','').replace('Total','')
        tempOpexData.push({x:tempX, y:tempY, name: tempName, type: 'bar'})
    }

    setCapexBarChartData(tempCapexData)
    setOpexBarChartData(tempOpexData)
    

    }

    const checkDiff = (key) => {
        try {
            let tableKeys = Object.keys(scenarios[primaryScenarioIndex].data_input.df_parameters[key])
            let primaryValues = scenarios[primaryScenarioIndex].data_input.df_parameters[key]
            let referenceValues = scenarios[referenceScenarioIndex].data_input.df_parameters[key]
            for (let i = 0; i < tableKeys.length; i++) {
                let primaryValueSet = primaryValues[tableKeys[i]]
                let referenceValueSet = referenceValues[tableKeys[i]]
                for (let j = 0; j < primaryValueSet.length; j++) {
                    let primaryValue = primaryValueSet[j]
                    let referenceValue = referenceValueSet[j]
                    if (referenceValue !== primaryValue) return true
                }
            }
            return false
        }
        catch (e) {
            return false
        }        
    }

   
  return (
    <Fragment>
    <Sidebar
        open={showSidebar}
        category={compareCategory}
        setCategory={setCompareCategory}
        checkDiff={checkDiff}
    >
    </Sidebar>
    {compareCategory==="output" && 
    <ScenarioCompareOutput
        scenarios={scenarios}
        primaryScenarioIndex={primaryScenarioIndex}
        referenceScenarioIndex={referenceScenarioIndex}
        kpiDataPrimary={kpiDataPrimary}
        kpiDataReference={kpiDataReference}
        capexBarChartData={capexBarChartData}
        opexBarChartData={opexBarChartData}
        showSidebar={showSidebar}
        compareCategory={compareCategory}
    />
    }
      
    </Fragment>
  );

}


