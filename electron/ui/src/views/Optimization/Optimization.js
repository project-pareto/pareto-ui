import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';




export default function Optimization(props) {
  const [scenario, setScenario] = useState(props.scenario)
   useEffect(()=>{
      //  console.log('curr scenario',scenario)
   }, [scenario]);
  
   const handleChange = (event) => {
     const tempScenario = {...scenario}
     tempScenario.optimization.objective = event.target.value
     setScenario(tempScenario)
   }

   const handleSave = () => {
     props.updateScenario(scenario)
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
      <Box style={{backgroundColor:'white'}} sx={styles.objectiveSelection}>
        <Grid container>
          <Grid item xs={12}>
          <FormControl>
            <FormLabel style={{color: "#157498", fontWeight: "bold"}} id="objectives-select">OBJECTIVE SELECTION</FormLabel>
            <RadioGroup
              aria-labelledby="objectives-select"
              value={scenario.optimization.objective}
              name="objectives-select"
              onChange={handleChange}
              // row
            >
              <FormControlLabel value="reuse" control={<Radio />} label="Maximize Reuse" />
              <FormControlLabel value="cost" control={<Radio />} label="Maximize Cost" />
            </RadioGroup>
          </FormControl>
          </Grid>
          <Grid item xs={12} style={{marginTop: "100px"}}>
          <Button onClick={handleSave} variant="contained">Save Objective</Button>
          </Grid>
        </Grid>
      </Box>
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
              <p>Maximum program runtime</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size="small">
            <OutlinedInput
              id="outlined-adornment-sec"
              // value={values.weight}
              value={180}
              // onChange={handleChange('weight')}
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
              <p>Solver Selection</p>
            </Box>
          </Grid>
          <Grid item xs={8} style={{marginTop: "25px"}}>
          <FormControl sx={{ m: 1, width: "25ch" }} size="small">
            <Select
              value={0}
              // onChange={handleScenarioSelection}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={0}>Strategic Model</MenuItem>
              <MenuItem key={1} value={1}>Operational Model</MenuItem>
            </Select>
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
              value={0}
              // onChange={handleScenarioSelection}
              sx={{color:'#0b89b9', fontWeight: "bold"}}
            >
              <MenuItem key={0} value={0}>Option 1</MenuItem>
              <MenuItem key={1} value={1}>Option 2</MenuItem>
            </Select>
            </FormControl>
          </Grid>

        </Grid>
      </Box>
      </Grid>
    </Grid>
  );

}


