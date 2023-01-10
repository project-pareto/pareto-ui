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
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';


export default function Optimization(props) {
  const [scenario, setScenario] = useState(props.scenario)
  // const [runtime, setRuntime] = useState(props.scenario.optimization.runtime)
  const [ disabled, setDisabled ] = useState(false)
  const columnWidths = [5,7]
  const descriptions = {
    objective: <div>Select what you would like to solve for.</div>,
    runtime:  <div> 
                  This setting limits the runtime for the solver to find a solution. 
                  Note that this time does not include time to build the model and process output.
              </div>,
    pipelineCost: <div>
                        There are two ways pipeline capacity expansion costs can be calculated:<br/>
                        -Distance based:  Uses pipeline distance, diameter and  $/inch-mile rate<br/>
                        -Capacity based: Uses pipeline capacity and $/bbl rate
                  </div>,
    optimalityGap: <div>
                  Needs description
            </div>,
    waterQuality: <div>
                      PARETO can also consider water quality in the model, select how you would like to include it in the model:<br/>
                      -False: Model does not consider water quality.<br/>
                      -Post Process: Calculates the water quality after optimization. The model cannot impose quality restrictions.<br/>
                      -Discrete: Utilize a discrete model to incorporate water quality into decisions. This model can impose quality restrictions. For example, a maximum TDS allowed at a treatment facility.
                  </div>,
    solver: <div>
              Select the solver you would like to use. Note: Gurobi requires a license. 
              If you do not have a Gurobi licence, select "CBC", an open source solver.
            </div>,
  }

   useEffect(()=>{
    setDisabled(!['complete','none','failure'].includes(scenario.results.status))
   }, [scenario]);
  
   const handleObjectiveChange = (event) => {
     const tempScenario = {...scenario}
     tempScenario.optimization.objective = event.target.value
     setScenario(tempScenario)
     props.updateScenario(tempScenario)
   }

   const handleRuntimeChange = (event) => {
    if (!isNaN(event.target.value)) {
      const tempScenario = {...scenario}
      tempScenario.optimization.runtime = Number(event.target.value)
      setScenario(tempScenario)
      props.updateScenario(tempScenario)
    }
  }

  const handlePipelineCostChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.pipelineCostCalculation = event.target.value
    setScenario(tempScenario)
    props.updateScenario(tempScenario)
  }

  const handleOptimalityGapChange = (event) => {
    if (!isNaN(event.target.value)) {
      const tempScenario = {...scenario}
      tempScenario.optimization.optimalityGap = Number(event.target.value)
      setScenario(tempScenario)
      props.updateScenario(tempScenario)
    }
  }

  const handleWaterQualityChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.waterQuality = event.target.value
    setScenario(tempScenario)
    props.updateScenario(tempScenario)
  }

  const handleSolverChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.solver = event.target.value
    setScenario(tempScenario)
    props.updateScenario(tempScenario)
  }

  const handleUnitsChange = (event) => {
    const tempScenario = {...scenario}
    tempScenario.optimization.build_units = event.target.value
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
          <Grid item xs={columnWidths[0]} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>
                Objective Selection
                <Tooltip title={descriptions.objective} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
                </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={{marginTop: "25px"}}>
          <FormControl disabled={disabled}>
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

          <Grid item xs={columnWidths[0]} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Maximum Runtime
              <Tooltip title={descriptions.runtime} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size="small" disabled={disabled}>
            <OutlinedInput
              id="outlined-adornment-sec"
              value={scenario.optimization.runtime}
              onChange={handleRuntimeChange}
              endAdornment={<InputAdornment position="end">sec</InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'sec',
              }}
            />
          </FormControl>
          </Grid>

          {/* <Grid item xs={columnWidths[0]} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Pipeline Cost Calculation
              <Tooltip title={descriptions.pipelineCost} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={disabled}>
            <Select
              value={scenario.optimization.pipelineCostCalculation}
              onChange={handlePipelineCostChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"distance_based"}>Distance Based</MenuItem>
              <MenuItem key={1} value={"capacity_based"}>Capacity Based</MenuItem>
            </Select>
            </FormControl>
          </Grid> */}

          <Grid item xs={columnWidths[0]} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Optimality Gap
              <Tooltip title={descriptions.optimalityGap} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size="small" disabled={disabled}>
            <OutlinedInput
              id="outlined-adornment-sec"
              value={scenario.optimization.optimalityGap}
              onChange={handleOptimalityGapChange}
              endAdornment={<InputAdornment position="end">%</InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'sec',
              }}
            />
          </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Water Quality
              <Tooltip title={descriptions.waterQuality} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={disabled}>
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

          <Grid item xs={columnWidths[0]} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Solver
              <Tooltip title={descriptions.solver} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={disabled}>
            <Select
              value={scenario.optimization.solver}
              onChange={handleSolverChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"cbc"}>CBC</MenuItem>
              <MenuItem key={1} value={"gurobi"}>Gurobi</MenuItem>
              <MenuItem key={2} value={"gurobi_direct"}>Gurobi Direct</MenuItem>
            </Select>
            </FormControl>
          </Grid>
          
          {/* <Grid item xs={4} style={{marginTop: "25px"}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Scale Model Units</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={disabled}>
            <Select
              value={scenario.optimization.units}
              onChange={handleUnitsChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={"user_units"} value={"user_units"}>No</MenuItem>
              <MenuItem key={"scaled_units"} value={"scaled_units"}>Yes</MenuItem>
            </Select>
            </FormControl>
          </Grid> */}

        </Grid>
      </Box>
      </Grid>
      <Grid item xs={3}>

      </Grid>
    </Grid>
  );

}


