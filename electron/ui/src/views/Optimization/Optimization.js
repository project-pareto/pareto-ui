import React from 'react';
import {useEffect, useState} from 'react';   
import { Box, Grid, InputAdornment, Checkbox, FormControlLabel, FormControl, Button } from '@mui/material';
import { MenuItem, Radio, RadioGroup, Select, IconButton, Tooltip, Collapse, OutlinedInput } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


export default function Optimization(props) {
  // const [ disabled, setDisabled ] = useState(false)
  const [ showAdvancedOptions, setShowAdvancedOptions ] = useState(false) 
  const columnWidths = [5,7]
  const defaultRuntimes = {"cbc": 900, "gurobi": 180}
  const defaultScaleModel = {"cbc": true, "gurobi": false}
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
                  Measure of optimality guaranteed 
                  (example: 0% gap is the mathematically proven best possible solution, 3% optimality 
                  gap ensures that the reported solution is within 3% of the best theoretically possible solution). 
                  Please note that runtime limits may supersede the optimality gap settings.
            </div>,
    waterQuality: <div>
                      PARETO can also consider water quality in the model, select how you would like to include it in the model:<br/>
                      -False: Model does not consider water quality.<br/>
                      -Post Process: Calculates the water quality after optimization. The model cannot impose quality restrictions.<br/>
                      -Discrete: Utilize a discrete model to incorporate water quality into decisions. This model can impose quality restrictions. For example, a maximum TDS allowed at a treatment facility.
                  </div>,
    hydraulics: <div>
                  PARETO's hydraulics module allows the user to determine pumping needs and compute pressures at every node in the network while considering maximum allowable operating pressure (MAOP) constraints. Select how you would like to include it in the model:<br/>
                  -False: This option allows the user to skip the hydraulics computations in the PARETO model.<br/>
                  -Post Process: PARETO first solves for optimal flows and network design. Afterwards, the hydraulics block containing constraints for pressure balances and losses is solved.<br/>
                  -Co-Optimize: In this method, the hydraulics model block is solved together with the produced water flow and network design. Note: The co-optimize model as currently implemented requires the following MINLP solvers: SCIP and BARON..
              </div>,
    solver: <div>
              Select the solver you would like to use. Note: Gurobi requires a license. 
              If you do not have a Gurobi licence, select "CBC", an open source solver.
            </div>,
    units: <div>
            Choose whether you would like to build the model with scaled units or user units.
          </div>,
    scaleModel: <div>
            Choose whether you would like to scale the model or not.
          </div>,
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
        boxShadow:3
      },
      gridContainer: {
        marginBottom: "100px"
      }, 
      gridItems: {
        marginTop: "5px"
      },
      advancedOptions: {
        color: "#0083b5",
        // "&:hover": {
        //   backgroundColor: "black"
        // },
      },
      filled: {
        backgroundColor: '#01678f',
        '&:hover': {
            backgroundColor: '#01678f',
            opacity: 0.9
        },
      },
  }

  //  useEffect(()=>{
  //   props.setDisabled(!['Optimized','Draft','failure', 'Not Optimized', 'Infeasible'].includes(props.scenario.results.status))
  //   // setScenario(props.scenario)
  //  }, [props.scenario]);

   const handleChange = (event) => {
     const name = event.target.name
     const value = event.target.value
     if ( (name === "runtime" || name === "optimalityGap") && isNaN(value) ) {
      console.log('tried entering nonnumerical characters for runtime or optimality gap')
     } 
     /*
      update runtime and scalemodel settings when changing solver
     */
     else if (name === "solver"){
      if(value === "cbc") {
        const tempScenario = {...props.scenario}
        tempScenario.optimization[name] = value
        tempScenario.optimization.runtime = defaultRuntimes["cbc"]
        tempScenario.optimization.scale_model = defaultScaleModel["cbc"]
        props.updateScenario(tempScenario)
      } else if (value === "gurobi_direct") {
        const tempScenario = {...props.scenario}
        tempScenario.optimization[name] = value
        tempScenario.optimization.runtime = defaultRuntimes["gurobi"]
        tempScenario.optimization.scale_model = defaultScaleModel["gurobi"]
        props.updateScenario(tempScenario)
      }
     }
     else {
      const tempScenario = {...props.scenario}
      tempScenario.optimization[name] = value
      props.updateScenario(tempScenario)
     }
   }

   const handleOptimize = () => {
    props.setDisabled(true)
    props.handleRunModel()
   }

  return ( 
    <Grid container spacing={2} style={styles.gridContainer}>
      <Grid item xs={2.5}>

      </Grid>

      <Grid item xs={7}>
      <Box style={{backgroundColor:'white'}} sx={styles.optimizationSettings}>
        <Grid container>
          <Grid item xs={12} style={{backgroundColor:'#6094bc', color:"white", fontWeight:"bold"}} >
          <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'50px'}}>
            <p>OPTIMIZATION SETTINGS</p>
          </Box>
          </Grid>
          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>
                Objective Selection
                <Tooltip title={descriptions.objective} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
                </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <FormControl disabled={props.disabled}>
            {/* <RadioGroup
              name="objective"
              aria-labelledby="objectives-select"
              value={props.scenario.optimization.objective}
              name="objectives-select"
              onChange={handleObjectiveChange}
            >
              <FormControlLabel value="cost" control={<Radio />} label="Minimize Cost" />
              <FormControlLabel value="reuse" control={<Radio />} label="Maximize Reuse" />
            </RadioGroup> */}
            <FormControlLabel control={<Checkbox defaultChecked />} label="Minimize Cost" />
            <FormControlLabel control={<Checkbox />} label="Maximize Reuse" />
            <FormControlLabel control={<Checkbox />} label="Maximize Profits" />
          </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Solver
              <Tooltip title={descriptions.solver} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={props.disabled}>
            <Select
              name="solver"
              value={props.scenario.optimization.solver}
              onChange={handleChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"cbc"}>CBC (Free)</MenuItem>
              <MenuItem key={1} value={"gurobi_direct"}>Gurobi (Commercial)</MenuItem>
              {/* <MenuItem key={2} value={"gurobi_direct"}>Gurobi Direct (Commercial)</MenuItem> */}
            </Select>
            </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Maximum Runtime
              <Tooltip title={descriptions.runtime} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size="small" disabled={props.disabled}>
            <OutlinedInput
              name="runtime"  
              id="outlined-adornment-sec"
              value={props.scenario.optimization.runtime}
              onChange={handleChange}
              endAdornment={<InputAdornment position="end">sec</InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'sec',
              }}
            />
          </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Optimality Gap
              <Tooltip title={descriptions.optimalityGap} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size="small" disabled={props.disabled}>
            <OutlinedInput
              name="optimalityGap"
              id="outlined-adornment-sec"
              value={props.scenario.optimization.optimalityGap}
              onChange={handleChange}
              endAdornment={<InputAdornment position="end">%</InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'sec',
              }}
            />
          </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Water Quality
              <Tooltip title={descriptions.waterQuality} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={props.disabled}>
            <Select
              name="waterQuality"
              value={props.scenario.optimization.waterQuality}
              onChange={handleChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"false"}>False</MenuItem>
              <MenuItem key={1} value={"post_process"}>Post Process</MenuItem>
              <MenuItem key={2} value={"discrete"}>Discrete</MenuItem>
            </Select>
            </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Hydraulics
              <Tooltip title={descriptions.hydraulics} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={props.disabled}>
            <Select
              name="hydraulics"
              value={props.scenario.optimization.hydraulics}
              onChange={handleChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={"false"}>False</MenuItem>
              <MenuItem key={1} value={"post_process"}>Post Process</MenuItem>
              <MenuItem key={2} value={"co_optimize"}>Co-Optimize</MenuItem>
            </Select>
            </FormControl>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p style={styles.advancedOptions}>
                Advanced User Options 
                <IconButton onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>{showAdvancedOptions ? <ExpandLess /> : <ExpandMore />}</IconButton>
              </p>
            </Box>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          </Grid>

          <Grid item xs={columnWidths[0]} style={styles.gridItems}>
          <Collapse in={showAdvancedOptions} timeout="auto" unmountOnExit>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'40px'}}>
              <p>Scale Model</p>
              <Tooltip title={descriptions.scaleModel} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip>
            </Box>
            </Collapse>
          </Grid>
          <Grid item xs={columnWidths[1]} style={styles.gridItems}>
          <Collapse in={showAdvancedOptions} timeout="auto" unmountOnExit>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small" disabled={props.disabled}>
            <Select
              name="scale_model"
              value={props.scenario.optimization.scale_model}
              onChange={handleChange}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={"false"} value={false}>No</MenuItem>
              <MenuItem key={"true"} value={true}>Yes</MenuItem>
            </Select>
            </FormControl>
            </Collapse>
          </Grid>
        </Grid>
        <Grid item xs={12} style={styles.gridItems}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'40px', paddingTop: '25px',paddingBottom: '25px'}}>
            <Button 
              onClick={props.handleRunModel} 
              sx={styles.filled} 
              variant="contained" 
              size="large" 
              disabled={props.backgroundTasks.length > 0 || props.disabled} 
              endIcon={<ArrowForwardIcon />}> 
              Optimize 
            </Button>
            </Box>
        </Grid>

      </Box>
      </Grid>
      
      <Grid item xs={2.5}>
      </Grid>
    </Grid>
  );

}


