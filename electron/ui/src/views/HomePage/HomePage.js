import './HomePage.css';
import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { useLocation, useParams } from 'react-router-dom';
import {  } from "react-router-dom";
import Button from '@mui/material/Button';
import ProcessToolbar from '../../components/ProcessToolbar/ProcessToolbar'
import DataInput from '../DataInput/DataInput'
import Optimization from '../Optimization/Optimization'
import ModelResults from '../ModelResults/ModelResults'



export default function HomePage(props) {
  // let params = useParams()
  const [ section, setSection ] = useState(0)
  const scenario = props.scenario
   useEffect(()=>{
       console.log('curr scenario',scenario)
   }, [scenario]);

   const handleSetSelection = (section) => {
      setSection(section)
   }

   const styles = {
    shiftTextLeft: {
      paddingLeft: '0px'
    },
    shiftTextRight: {
      paddingLeft: '240px'
    },
    titleDivider: {
      m:2, 
      marginTop:2
    }
   }
  return (

    <Grid container spacing={1} sx={props.shiftRight ? styles.shiftTextRight : styles.shiftTextLeft}>
      <Grid item xs={5}>
      <div>
        <b id='scenarioTitle' >
        {scenario ? scenario:  "Please select or create a scenario"}
      </b> 
      </div>
      </Grid>
      <Grid item xs={3}>

      </Grid>
      <Grid item xs={4}>
          <Button variant={'outlined'} sx={{marginLeft:'10px'}}>
                Rename
          </Button>
          <Button variant={'outlined'} sx={{marginLeft:'10px'}}>
                Copy
          </Button>
      </Grid>
      <Divider sx={styles.titleDivider} ></Divider>
      {scenario ? <ProcessToolbar handleSelection={handleSetSelection} selected={section}></ProcessToolbar> : null}
      <Grid item xs={12}>
      {(scenario && section===0) ? <DataInput scenario={scenario}></DataInput> : null}
      {(scenario && section===1) ? <Optimization scenario={scenario}></Optimization> : null}
      {(scenario && section===2) ? <ModelResults scenario={scenario}></ModelResults> : null}
      </Grid>
      
      
    </Grid>
  );

}


