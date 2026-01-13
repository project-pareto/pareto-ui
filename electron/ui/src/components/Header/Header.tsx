import './Header.css';
import React from 'react';
import {useEffect, useState} from 'react';   
import { useLocation } from 'react-router-dom';
import logo from "../../images/pareto-logo.png";
import { Button, MenuItem, FormControl, Select } from '@mui/material'
import type { HeaderProps } from '../../types';
 
export default function Header(props: HeaderProps): JSX.Element {  
  const {showHeader, scenarios, index, handleSelection, navigateHome } = props
  const location = useLocation();

    const handleScenarioSelection = (event: any) => {
      handleSelection(event?.target?.value)
    }

    return (
      <>
      {showHeader && 
        <div id="Header">
        
        <div className="titlebar">
          <div style={{cursor:"pointer"}} onClick={() => navigateHome?.()}>
            <div id="pareto_logo">
              <img src={logo} alt="PARETO Logo"/>
            </div>
          </div>
        {location.pathname === "/scenario" &&
          <>
            <p style={{color:'#565656', fontSize: '20px', marginLeft:'75px'}}>Scenario</p>
            <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <Select
              value={index === null || index === undefined ? "" : index}
              onChange={handleScenarioSelection}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
                {Object.entries(scenarios || {}).map( ([key, value] ) => {
                  return <MenuItem key={key} value={key}>{(value as any).name}</MenuItem>
                })}
            </Select>
            </FormControl>
            
            <Button id='user-name' sx={{color: "#0b89b9"}} onClick={() => navigateHome?.()}>View Scenario List</Button>
          </>
        }
        {location.pathname.includes("compare") && index !== null && index !== undefined &&
        <>
          <div style={{fontSize:"20px", marginLeft:"20px", color:'#0b89b9', fontWeight: "bold"}}>
            Home / {(scenarios as any)[String(index)]?.name} / Compare Scenarios
          </div>
          <Button id='user-name' sx={{color: "#0b89b9"}} onClick={() => navigateHome?.()}>View Scenario List</Button>
        </>
        
        }
        </div>
      </div>
        }
        </>
      
    );
  
}
