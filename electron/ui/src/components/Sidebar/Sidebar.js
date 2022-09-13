import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';


const drawerWidth = 240;

export default function Sidebar(props) {

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
            {props.scenario  ? 
            Object.entries(props.section === 0 ? props.scenario.data_input.df_parameters : props.section === 1 ? props.scenario.optimization : props.scenario.results).map( ([key, value]) => ( 
              <>
              <ListItem key={key} disablePadding>
                  <ListItemButton selected={props.category===key} onClick={() => props.handleSetCategory(key)} key={key}>
                  <ListItemText key={key} primary={key} />
                  </ListItemButton>
              </ListItem>
              <Divider></Divider>
            </>
            ))
            : null}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
