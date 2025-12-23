import './ScenarioCompare.css';
import React, {useEffect, useState, Fragment} from 'react';
import type { Scenario, ScenarioCompareProps } from '../../types';
import Sidebar from '../../components/Sidebar/ScenarioCompareSidebar'
import ScenarioCompareOutput from './ScenarioCompareOutput';
import ScenarioCompareInput from './ScenarioCompareInput';
import ScenarioCompareOverrides from './ScenarioCompareOverrides';
import SubHeader from './SubHeader';
import { Subcategories } from '../../assets/utils';


export default function ScenarioCompare(props: ScenarioCompareProps) {
    const {scenarios, compareScenarioIndexes, setCompareScenarioIndexes, setScenarioIndex} = props
    const [ primaryScenarioIndex, setPrimaryScenarioIndex ] = useState<string | number | null>(null)
    const [ referenceScenarioIndex, setReferenceScenarioIndex ] = useState<string | number | null>(null)
    const [ kpiDataPrimary, setKpiDataPrimary ] = useState<Record<string, any> | null>(null)
    const [ kpiDataReference, setKpiDataReference ] = useState<Record<string, any> | null>(null)
    const [ capexBarChartData, setCapexBarChartData ] = useState<any[] | null>(null)
    const [ opexBarChartData, setOpexBarChartData ] = useState<any[] | null>(null)
    const [ totalCapex, setTotalCapex ] = useState<number[]>([])
    const [ totalOpex, setTotalOpex ] = useState<number[]>([])
    const [ showSidebar, setShowSidebar ] = useState<boolean>(true)
    const [ compareCategory, setCompareCategory ] = useState<string>('output::dashboard')
    const [ deltaDictionary, setDeltaDictionary ] = useState<Record<string, string[]>>({})
    const [ overrides, setOverrides ] = useState<Array<Record<string, any>>>([{},{}])

  useEffect(() => {
    let temp_deltaDictionary = {}
    
    try {
        for(let key of Subcategories.Dynamic) {
            temp_deltaDictionary[key] = []
            let tableKeys = Object.keys(scenarios[primaryScenarioIndex].data_input.df_parameters[key])
            let primaryValues = scenarios[primaryScenarioIndex].data_input.df_parameters[key]
            let referenceValues = scenarios[referenceScenarioIndex].data_input.df_parameters[key]
            for (let i = 0; i < tableKeys.length; i++) {
                let primaryValueSet = primaryValues[tableKeys[i]]
                for (let j = 0; j < primaryValueSet.length; j++) {
                    try {
                        let primaryValue = primaryValues[tableKeys[i]][j]
                        let referenceValue = referenceValues[tableKeys[i]][j]
                        if (referenceValue !== primaryValue) {
                            temp_deltaDictionary[key].push(`${i}::${j}`)
                        }
                    } catch (e) {
                        temp_deltaDictionary[key].push(`${i}::${j}`)
                    }
                    
                }
            }
        }

        for(let key of Subcategories.Static) {
            temp_deltaDictionary[key] = []
            let tableKeys = Object.keys(scenarios[primaryScenarioIndex].data_input.df_parameters[key])
            let primaryValues = scenarios[primaryScenarioIndex].data_input.df_parameters[key]
            let referenceValues = scenarios[referenceScenarioIndex].data_input.df_parameters[key]
            for (let i = 0; i < tableKeys.length; i++) {
                let primaryValueSet = primaryValues[tableKeys[i]]
                for (let j = 0; j < primaryValueSet.length; j++) {
                    try {
                        let primaryValue = primaryValues[tableKeys[i]][j]
                        let referenceValue = referenceValues[tableKeys[i]][j]
                        if (referenceValue !== primaryValue) {
                            temp_deltaDictionary[key].push(`${i}::${j}`)
                        }
                    } catch (e) {
                        temp_deltaDictionary[key].push(`${i}::${j}`)
                    }
                    
                }
            }
        }
        setDeltaDictionary(temp_deltaDictionary)
    }
    catch (e) {
        setDeltaDictionary(temp_deltaDictionary)
    }        
  }, [primaryScenarioIndex, referenceScenarioIndex]);

  useEffect(() => {
    let temp_overrides = [{},{}]
    
    try {
        let primaryScenario = {...scenarios[primaryScenarioIndex]}
        let referenceScenario = {...scenarios[referenceScenarioIndex]}
        if (primaryScenario.optimized_override_values !== undefined)  {
            for(let key of Object.keys(primaryScenario.optimized_override_values)) {
                for(let each of Object.keys(primaryScenario.optimized_override_values[key])) {
                    temp_overrides[0][each] = primaryScenario.optimized_override_values[key][each]
                }
            }
        }
        if (referenceScenario.optimized_override_values !== undefined)  {
            for(let key of Object.keys(referenceScenario.optimized_override_values)) {
                for(let each of Object.keys(referenceScenario.optimized_override_values[key])) {

                    temp_overrides[1][each] = referenceScenario.optimized_override_values[key][each]
                } 
            }
        }
        setOverrides(temp_overrides)
    }
    catch (e) {

    }        
  }, [primaryScenarioIndex, referenceScenarioIndex]);

  useEffect(()=>{
    if(Object.keys(scenarios).length === 0) window.location.href = "/";
    //check for indexes
    let tempIndexes = []
    if(compareScenarioIndexes.length === 0) {
        // in this case maybe it makes sense to just redirect to list page
        let scenarioIds = Object.keys(scenarios)
        tempIndexes.push(scenarioIds[0])
        tempIndexes.push(scenarioIds[1])
        setPrimaryScenarioIndex(tempIndexes[0])
        setScenarioIndex(tempIndexes[0])
        setReferenceScenarioIndex(tempIndexes[1])
        setCompareScenarioIndexes([tempIndexes[0],tempIndexes[1]])
    } else if(compareScenarioIndexes.length === 1) {
        let scenarioIds = Object.keys(scenarios)
        tempIndexes.push(compareScenarioIndexes[0])
        for (let scenarioId of scenarioIds) {
            let status = scenarios[scenarioId].results.status
            if (status === "Optimized") { 
                tempIndexes.push(scenarioId)
                break
            }
        }
        
        setCompareScenarioIndexes([tempIndexes[0],tempIndexes[1]])
        return
    }
    else {
        tempIndexes.push(compareScenarioIndexes[0])
        tempIndexes.push(compareScenarioIndexes[1])
        setScenarioIndex(tempIndexes[0])
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
    setKpiDataReference(tempData2)
    unpackBarChartData(tempData,tempData2)
}, [compareScenarioIndexes]);

const unpackBarChartData = (scenarioData1, scenarioData2) => {
    // unpack bar chart data
    let tempTotalCapex = [0,0]
    let tempTotalOpex = [0,0]
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
        tempTotalCapex[0]+=scenarioData1[each].value
        tempTotalCapex[1]+=scenarioData2[each].value
    }

    for(let each of opexKeys) {
        let tempX = [scenarioData1[each].name, scenarioData2[each].name]
        let tempY = [scenarioData1[each].value, scenarioData2[each].value]
        let tempName = each.replace('v_C_','').replace('Total','')
        tempOpexData.push({x:tempX, y:tempY, name: tempName, type: 'bar'})
        tempTotalOpex[0]+=scenarioData1[each].value
        tempTotalOpex[1]+=scenarioData2[each].value
    }
    setCapexBarChartData(tempCapexData)
    setOpexBarChartData(tempOpexData)
    setTotalCapex(tempTotalCapex)
    setTotalOpex(tempTotalOpex)
    }
   
  return (
    <Fragment>
    <Sidebar
        open={showSidebar}
        category={compareCategory}
        setCategory={setCompareCategory}
        deltaDictionary={deltaDictionary}
        overrides={overrides}
        compareScenarioIndexes={compareScenarioIndexes}
    >
    </Sidebar>
    <SubHeader 
        scenarios={scenarios}
        compareScenarioIndexes={compareScenarioIndexes}
        setCompareScenarioIndexes={setCompareScenarioIndexes}
    />
    {compareCategory.includes("output") ? 
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
        totalCapex={totalCapex}
        totalOpex={totalOpex}
    />
    :
    compareCategory.includes("overrides") ? 
    <ScenarioCompareOverrides
        primaryScenario={scenarios[primaryScenarioIndex]}
        referenceScenario={scenarios[referenceScenarioIndex]}
        category={compareCategory}
        showSidebar={showSidebar}
        deltaDictionary={deltaDictionary}
        overrides={overrides}
    />
    :
    <ScenarioCompareInput
        primaryScenario={scenarios[primaryScenarioIndex]}
        referenceScenario={scenarios[referenceScenarioIndex]}
        category={compareCategory}
        showSidebar={showSidebar}
        deltaDictionary={deltaDictionary}
    />
    }
      
    </Fragment>
  );

}


