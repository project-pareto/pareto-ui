import './ScenarioList.css';
import {useEffect, useState} from 'react';   
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom'

export default function ScenarioList(props) {

    const fakeData = ['New Scenario 1', 'Base Scenario 2', 'Base Scenario 1']
    const [scenarios, setScenarios] = useState([]); 
     useEffect(()=>{
         setScenarios(fakeData);
     }, []);


  return ( 
    <div>
        <Button startIcon={<AddIcon />}>
                    Create New Scenario
        </Button>
        <List>
            {scenarios.map((text, index) => (
            <Link
                to={{
                  pathname: "/scenario"+{index},
                  hash: "",
                  state: { id: index, inState: 'yes' }
                }}
                style={{ color: 'black', textDecoration: 'none' }}
            >
              
            <ListItem key={text} disablePadding>
                <ListItemButton>
                <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
            </Link>
            ))}
        </List>
        <Divider />
    </div>
  );

}


