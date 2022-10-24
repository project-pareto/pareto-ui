import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import ParetoDictionary from '../../assets/ParetoDictionary.json'


const drawerWidth = 240;

export default function Sidebar(props) {

  React.useEffect(() => {
    console.log('paretodictionary: ',ParetoDictionary)
    
},[])

  const renderAdditionalCategories = () => {
    let additionalCategories = props.section === 0 ? {"Plots": null, "Network Diagram": null} : props.section === 1 ? {} : {"Dashboard": null, "Sankey": null, "Network Diagram": null}
    console.log('additional categories: ',additionalCategories)
    return (
      Object.entries(additionalCategories).map( ([key, value]) => ( 
        <>
        <ListItem key={key} disablePadding>
            <ListItemButton selected={props.category===key} onClick={() => props.handleSetCategory(key)} key={key}>
            <ListItemText key={key} primary={key} />
            </ListItemButton>
        </ListItem>
        <Divider></Divider>
      </>
      ))
    )
  }

  const renderTable = () => {
    return (
      Object.entries(props.section === 0 ? props.scenario.data_input.df_parameters : props.section === 1 ? props.scenario.optimization : props.scenario.results.data).map( ([key, value]) => ( 
        <>
        <Tooltip title={ParetoDictionary[key]} placement="right-start">
        <ListItem key={key} disablePadding>
            <ListItemButton selected={props.category===key} onClick={() => props.handleSetCategory(key)} key={key}>
            <ListItemText key={key} primary={key} />
            </ListItemButton>
        </ListItem>
        </Tooltip>
        <Divider></Divider>
      </>
      ))
    )
    
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          [`& .MuiBox-root`]: {marginBottom: '60px' },
        }}
        PaperProps={{
            sx: {
            width: 240,
            marginTop: '152px',
            paddingBottom: '152px'
            }
        }}
        open={props.open}
      >
        <Box sx={{ overflow: 'auto', overflowX: 'hidden'}}>
            <List aria-label="sidebar_table" sx={{paddingTop:'0px'}}>
            {props.scenario &&
              renderAdditionalCategories()
            }
            {props.scenario &&
              renderTable()
            }
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
