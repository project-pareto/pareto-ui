import './Header.css';
import React from 'react';
import {useEffect, useState} from 'react';   
import logo from "../../assets/pareto-logo-2.png";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { fetchScenarios, uploadExcelSheet } from '../../services/sidebar.service'

 

export default function Header(props) {

    const [ scenario, setScenario ] = useState([]) 

    const handleScenarioChange = (index) => {
      setScenario(props.scenarios[index]);
    }

  //   useEffect(()=>{
  //     console.log('scenarios changed b')
  //     console.log(props.scenarios[props.index])
  //     console.log('scenariodata')
  //     console.log(props.scenarioData)
  //     console.log('props index')
  //     console.log(props.index)
  // });
  

    const handleFileUpload = (e) => {
      console.log('handle file upload')
      const formData = new FormData();
      formData.append('file', e.target.files[0], e.target.files[0].name);
      uploadExcelSheet(formData)
      .then(response => response.json())
      .then((data)=> {
        console.log('fileupload successful: ',data)
        props.handleNewScenario(data)
      })
      .catch(e => {
        console.log('error on file upload')
        console.log(e)
      })
    }

    return (
      <div id="Header">
        
        <div className="titlebar">
          <a href="/">
            <div id="nawi_logo">
              <img src={logo} alt="NAWI logo"/>
            </div>
          </a>
          <p style={{color:'#565656', fontSize: '20px'}}>Scenario</p>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
          <Select
            value={props.index === null ? "" : props.index}
            onChange={props.handleSelection}
            // displayEmpty
          >
              {props.scenarios.map((scenario, index) => 
              (
                  <MenuItem key={index} onClick={() => handleScenarioChange(index)} value={index}>{scenario.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button id='user-name'  component="label" startIcon={<AddIcon />}>
            Create New Scenario
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
        </div>

      </div>
    );
  
}
