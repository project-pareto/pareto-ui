import './Header.css';
import React from 'react';
import logo from "../../images/pareto-logo.png";
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

 

export default function Header(props) {  
    const handleScenarioSelection = (event) => {
      props.handleSelection(event.target.value)
    }
    return (
      <>
      {props.showHeader ? 
        <div id="Header">
        
        <div className="titlebar">
          <div href="#" style={{cursor:"pointer"}} onClick={props.navigateHome}>
            <div id="pareto_logo">
              <img src={logo} alt="Pareto Logo"/>
            </div>
          </div>
        {props.scenarioData ? 
          <>
            <p style={{color:'#565656', fontSize: '20px', marginLeft:'75px'}}>Scenario</p>
            <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <Select
              value={props.index === null ? "" : props.index}
              onChange={handleScenarioSelection}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
                {Object.entries(props.scenarios).map( ([key, value] ) => {
                  return <MenuItem key={key} value={key}>{value.name}</MenuItem>
                })}
            </Select>
            </FormControl>
            
            <Button id='user-name' sx={{color: "#0b89b9"}} onClick={props.navigateHome}>View Scenario List</Button>
          </>
        : 
        null}
        </div>
      </div>
        : 
        
        null}
        </>
      
    );
  
}
