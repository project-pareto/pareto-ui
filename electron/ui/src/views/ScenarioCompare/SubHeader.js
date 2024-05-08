import React from 'react';
import { Grid, Box, IconButton, Divider } from '@mui/material';
import { MenuItem, FormControl, Select, Tooltip, InputLabel } from '@mui/material'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';


export default function SubHeader(props) {
    const { scenarios, compareScenarioIndexes, setCompareScenarioIndexes } = props

    const styles = {
        iconSelected: {
            backgroundColor:'#6094bc', 
            color: 'white'
        },
        textSelected: {
            fontWeight: 'bold',
            margin:'0'
        },
        textUnselected: {
            margin:'0'
        },
        shiftTextRight: {
            paddingLeft: '240px'
        },
        box: {
            position: 'sticky', 
            top:'71px', 
            backgroundColor:"white", 
            zIndex:'1'
        },
        inputLabel: {
            top:'-10px'
        },
        form: { 
            m: 1, 
            marginTop: 3, 
            minWidth: 200 
        }
    }
    const handleComparisonScenarioSelection = (event) => {
        if(event.target.name === "primary") setCompareScenarioIndexes([event.target.value, compareScenarioIndexes[1]])
        else if (event.target.name === "reference") setCompareScenarioIndexes([compareScenarioIndexes[0], event.target.value])
      }

      const handleSwitchScenarios = () => {
        setCompareScenarioIndexes([compareScenarioIndexes[1], compareScenarioIndexes[0]])
      }

  return ( 
    <Box sx={styles.box}>
      <Grid sx={{marginLeft:'30px'}} container>
        <FormControl sx={styles.form} size="small">
            <InputLabel sx={styles.inputLabel} id="scenario_label">Scenario</InputLabel>
            <Select
                labelId="scenario_label" 
                value={compareScenarioIndexes[0] === undefined ? "" : compareScenarioIndexes[0]}
                onChange={handleComparisonScenarioSelection}
                sx={{color:'#0b89b9', fontWeight: "bold"}}
                name={"primary"}
            >
                {Object.entries(scenarios).map( ([key, value] ) => {
                  if (value.results.status === "Optimized") return <MenuItem key={key} value={key}>{value.name}</MenuItem>
                })}
            </Select>
        </FormControl>
        <Tooltip title="Switch Scenarios">
            <IconButton style={{marginRight: '25px', marginLeft: '25px', marginTop:'20px'}} onClick={handleSwitchScenarios}>
            <ChangeCircleOutlinedIcon/>
            </IconButton>
        </Tooltip>
        
        <FormControl sx={styles.form} size="small">
            <InputLabel sx={styles.inputLabel} id="reference_label">Reference</InputLabel>
            <Select
                labelId="reference_label" 
                value={compareScenarioIndexes[1] === undefined ? "" : compareScenarioIndexes[1]}
                onChange={handleComparisonScenarioSelection}
                sx={{color:'#0b89b9', fontWeight: "bold"}}
                name={"reference"}
            >
                {Object.entries(scenarios).map( ([key, value] ) => {
                  if (value.results.status === "Optimized") return <MenuItem key={key} value={key}>{value.name}</MenuItem>
                })}
            </Select>
        </FormControl>
      </Grid>
      <Divider aria-label="bottom_divider"></Divider>
    </Box>
  );

}


