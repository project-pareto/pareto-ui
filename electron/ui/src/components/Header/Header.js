import './Header.css';
import React from 'react';
import {useEffect, useState} from 'react';   
import logo from "../../assets/pareto-logo.png";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {  uploadExcelSheet } from '../../services/sidebar.service'

 

export default function Header(props) {  

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
            <div id="pareto_logo">
              <img src={logo} alt="Pareto Logo"/>
            </div>
          </a>
          <p style={{color:'#565656', fontSize: '20px', marginLeft:'75px'}}>Scenario</p>
          <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
          <Select
            value={props.index === null ? "" : props.index}
            onChange={props.handleSelection}
            sx={{color:'#0b89b9', fontWeight: "bold"}}
          >
              {props.scenarios.map((scenario, index) => 
              (
                  <MenuItem key={index} value={index}>{scenario.name}</MenuItem>
              ))}
          </Select>
          </FormControl>
          <Button id='user-name' sx={{color: "#0b89b9"}} component="label" startIcon={<AddCircleIcon />}>
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
