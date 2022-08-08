import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'


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

  return ( 
    <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
      <Grid container>
        <Grid item xs={12}>
        <FormControl>
          <FormLabel id="objectives-select">Objective</FormLabel>
          <RadioGroup
            aria-labelledby="objectives-select"
            value={scenario.optimization.objective}
            name="objectives-select"
            onChange={handleChange}
            row
          >
            <FormControlLabel value="reuse" control={<Radio />} label="Reuse" />
            <FormControlLabel value="cost" control={<Radio />} label="Cost" />
          </RadioGroup>
        </FormControl>
        </Grid>
        <Grid item xs={12}>
        <Button onClick={handleSave} variant="contained">Save Objective</Button>
        </Grid>
      </Grid>
    </Box>
  );

}


