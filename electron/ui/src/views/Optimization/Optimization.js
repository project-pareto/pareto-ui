import React from 'react';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid'
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';


export default function Optimization(props) {
  const [scenario, setScenario] = useState(props.scenario)
  const [runtime, setRuntime] = useState(props.scenario.optimization.runtime)
  // const [pipelineCostCalculation, setPipelineCostCalculation] = useState("capacity_based")
  // const [waterQuality, setWaterQuality] = useState("discrete")

   useEffect(()=>{
      //  console.log('curr scenario',scenario)
   }, [scenario]);
  
   const handleObjectiveChange = (event) => {
     const tempScenario = {...scenario}
     tempScenario.optimization.objective = event.target.value
     setScenario(tempScenario)
     props.updateScenario(tempScenario)
   }

   const handleRuntimeChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.runtime = event.target.value
    setRuntime(event.target.value)
    setScenario(tempScenario)
    props.updateScenario(tempScenario)
  }

  const handlePipelineCostChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.pipelineCostCalculation = event.target.value
    // setPipelineCostCalculation(event.target.value)
    setScenario(tempScenario)
    props.updateScenario(tempScenario)
  }

  const handleWaterQualityChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.waterQuality = event.target.value
    // setWaterQuality(event.target.value)
    setScenario(tempScenario)
    props.updateScenario(tempScenario)
  }

  const styles = {
    objectiveSelection: 
      {
        m:3, 
        padding:2, 
        boxShadow:3, 
        border:"solid 2px #a0c6d6", 
        borderRadius: "6px"
      },
      optimizationSettings: 
      {
        m:3, 
        // padding:2, 
        boxShadow:3,
        paddingBottom: "50px" 
      }
  }

  return ( 
    <Grid container spacing={2}>
      <Grid item xs={3}>

      </Grid>

      <Grid item xs={6}>
      <Box style={{backgroundColor:'white'}} sx={styles.optimizationSettings}>
        <Grid container>
          <Grid item xs={12} style={{backgroundColor:'#6094bc', color:"white", fontWeight:"bold"}} >
          <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'50px'}}>
            <p>OPTIMIZATION SETTINGS</p>
          </Box>
          </Grid>
          <Grid item xs={4} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Objective Selection</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl>
            <RadioGroup
              aria-labelledby="objectives-select"
              value={scenario.optimization.objective}
              name="objectives-select"
              onChange={handleObjectiveChange}
              // row
            >
              <FormControlLabel value="cost" control={<Radio />} label="Minimize Cost" />
              <FormControlLabel value="reuse" control={<Radio />} label="Maximize Reuse" />
            </RadioGroup>
          </FormControl>
          </Grid>

          <Grid item xs={4} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Maximum program runtime</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size="small">
            <OutlinedInput
              id="outlined-adornment-sec"
              value={runtime}
              onChange={handleRuntimeChange}
              endAdornment={<InputAdornment position="end">sec</InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'sec',
              }}
            />
          </FormControl>
          </Grid>

          <Grid item xs={4} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Pipeline Cost Calculation</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small">
            <Select
              value={scenario.optimization.pipelineCostCalculation}
              onChange={handlePipelineCostChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"distance_based"}>Distance Based</MenuItem>
              <MenuItem key={1} value={"capacity_based"}>Capacity Based</MenuItem>
            </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Water Quality</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small">
            <Select
              value={scenario.optimization.waterQuality}
              onChange={handleWaterQualityChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"false"}>False</MenuItem>
              <MenuItem key={1} value={"post_process"}>Post Process</MenuItem>
              <MenuItem key={2} value={"discrete"}>Discrete</MenuItem>
            </Select>
            </FormControl>
          </Grid>

        </Grid>
      </Box>
      </Grid>
      <Grid item xs={3}>

      </Grid>
    </Grid>
  );

}


