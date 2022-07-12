import * as React from 'react';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { fetchScenarios } from '../../services/sidebar.service'
import SidebarTable from './SidebarTable'


const drawerWidth = 240;

export default function Sidebar(props) {

    const [scenarios, setScenarios] = useState([]); 

    useEffect(()=>{
        fetchScenarios()
        .then(response => response.json())
        .then((data)=>{
          console.log("scenarios:",data.data);
          setScenarios(data.data)
        });
    }, []);

  return (
    <Box sx={{ display: 'flex' }}>
        <CssBaseline />
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={props.handleOpen}
            // sx={{ ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
      <Drawer
        variant="persistent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        PaperProps={{
            sx: {
            width: 240,
            marginTop: '70px'
            }
        }}
        open={props.open}
      >
        <Box sx={{ overflow: 'auto' }}>
            <Button sx={{ marginTop: '20px' }} startIcon={<AddIcon />}>
                Create New Scenario
            </Button>
            <Divider></Divider>
            <List sx={{paddingTop:'0px'}}>
              {scenarios.map((text, index) => (
              // <Link
              //     to={{
              //         pathname: "/",
              //         key: Math.floor(Math.random()*10000000000)
              //     }}
              //     // reloadDocument={true}
              //     key= {Math.floor(Math.random()*10000000000)}
              //     state={{ id: index, scenario: text }}
              //     style={{ color: 'black', textDecoration: 'none' }}
              // >
              <>
                  <ListItem key={text+index} disablePadding>
                      <ListItemButton onClick ={ () => {props.handleSelection(text)}}>
                      <ListItemText primary={text} />
                      </ListItemButton>
                  </ListItem>
                  <Divider></Divider>
              </>
              // </Link>
              ))}
          </List>
        </Box>
        <IconButton onClick={props.handleClose}>
            <ChevronLeftIcon />
          </IconButton>
      </Drawer>
    </Box>
  );
}
