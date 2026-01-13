import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import { CategoryNames } from "../../assets/utils";
import type { ComparisonTableProps } from '../../types';

export default function ComparisonTable(props: ComparisonTableProps): JSX.Element {
    const { scenarios, scenarioIndex, secondaryScenarioIndex } = props;
    const primaryScenario = scenarios[scenarioIndex];
    const referenceScenario = scenarios[secondaryScenarioIndex];
    const category = "v_F_Overview_dict"
    const styles: any ={
        firstCol: {
          backgroundColor: "#f4f4f4", 
          border:"1px solid #ddd",
          position: 'sticky',
          left: 0,
        },
        other: {
          minWidth: 100,
          border:"1px solid #ddd"
        }
      }

    const getValue = (index: number) => {
      try {
        const v = referenceScenario?.results?.data?.[category]?.[index+1]?.[3]
        return v !== undefined && v !== null ? (v).toLocaleString('en-US', {maximumFractionDigits:0}) : ""
      }catch(e) {
        return ""
      }
    }
    

    const getPercentDifference = (index: number) => {
      try {
        let value1 = primaryScenario?.results?.data?.[category]?.[index+1]?.[3] || 0
        let value2 = referenceScenario?.results?.data?.[category]?.[index+1]?.[3] || 0

        let result = ((value1 - value2) / (value2 || 1)) * 100
        if (isNaN(result)) return 0
        else if(value1 > value2) return "+" + (Math.round(result * 10) / 10)
        else return Math.round(result * 10) / 10
      } catch(e) {
        return ""
      }
    }
    
    const getDifferenceStyling = (index: number) => {
      try {
        let value1 = primaryScenario?.results?.data?.[category]?.[index+1]?.[3] || 0
        let value2 = referenceScenario?.results?.data?.[category]?.[index+1]?.[3] || 0
        let style: any = {}
        if (value1 > value2) style.color = "green"
        else if (value2 > value1) style.color = "red"
        return style
      } catch (e) {
        return {}
      }
    }

    const renderOutputTable = () => {
        try {
            return (
              <TableContainer>
              <h3>Results Comparison</h3>
              <TableContainer sx={{overflowX:'auto'}}>
              <Table style={{border:"1px solid #ddd"}} size='small'>
                <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                <TableRow key={`headrow`}>
                    <TableCell style={{backgroundColor:"#6094bc", color:"white", width:"20%"}}>KPI</TableCell> 
                    <TableCell style={{backgroundColor:"#6094bc", color:"white",  width:"20%"}}>Units</TableCell> 
                    <TableCell style={{backgroundColor:"#6094bc", color:"white",  width:"20%"}} align='right'>{primaryScenario?.name}</TableCell> 
                    <TableCell style={{backgroundColor:"#6094bc", color:"white",  width:"20%"}} align='right'>{referenceScenario?.name}</TableCell>
                    <TableCell style={{backgroundColor:"#6094bc", color:"white",  width:"20%"}} align='right'>Percent Difference</TableCell> 
                </TableRow>
                </TableHead>
                <TableBody>
                {(primaryScenario?.results?.data?.[category] || []).slice(1).map((value: any, index: number) => {
                  return (<TableRow key={`row_${index}`}>
                  {value.map((cellValue: any, i: number)=> {
                    return (i !== 1 &&
                       <TableCell 
                        align={(i === (value.length - 1)) ? "right" : "left"} 
                        key={"" + index + i} 
                        style={i === 0 ? styles.firstCol : styles.other}>
                          {(i === (value.length - 1)) ? 
                          (cellValue).toLocaleString('en-US', {maximumFractionDigits:0}) : 
                          cellValue ? CategoryNames[cellValue] ? CategoryNames[cellValue] :
                          String(cellValue).replace('v_F_','').replace('v_C_','Cost ').replace(/([A-Z])/g, ' $1').replace('Cap Ex', 'CapEx').trim()
                          : null
                        }
                    </TableCell>
                    )
                  })}
                    <TableCell 
                        align="right" 
                        style={styles.other}
                    >
                        {getValue(index)}
                    </TableCell>
                    <TableCell 
                        align="right" 
                        style={styles.other}
                    > 
                    <span style={getDifferenceStyling(index)}>
                        {
                          getPercentDifference(index)
                        }
                        %
                      </span>
                    </TableCell>
                  </TableRow>)
                })}
                </TableBody> 
              </Table>
              </TableContainer>
            </TableContainer>
            )
        } catch (e) {
          console.error("unable to render category: ",e)
        }
      }

  return (
        <>
            {renderOutputTable()}
        </>
  );
}
