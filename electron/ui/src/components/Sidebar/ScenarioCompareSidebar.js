import React, { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';


const drawerWidth = 240;
const categories = [
    {
        key: "output", label: "Results"
    },
    {
        key: "input", label: "Inputs"
    },
]

export default function Sidebar(props) {
    const { category, setCategory, open } = props

  const styles = {
    topLevelCategory: {
      paddingLeft: "0px",
      fontWeight: "500",

    },
    subcategory: {
      paddingLeft: "10px",
    }
  }

  const handleClick = (key) => {
    console.log(`clicked on ${key}`)

  }


  const renderCategories = () => {
    return (
      categories.map( (each, index) => ( 
        <Fragment key={`${index}_${each.key}`}>
        <ListItem key={"listitem_"+each.key} disablePadding>
            <ListItemButton selected={each.key === category} onClick={() => handleClick(each.key)}>
            <ListItemText 
              primary={each.label} 
            />
            </ListItemButton>
        </ListItem>
        <Divider></Divider>
      </Fragment>
      ))
    )
    
  }

  return (
    <>
    {open && 
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
              marginTop: '71px',
              paddingBottom: '71px'
              }
          }}
          open={props.open}
        >
          <Box key="drawer_box" sx={{ overflow: 'auto', overflowX: 'hidden'}}>
              <List key="drawer_list" aria-label="sidebar_table" sx={{paddingTop:'0px'}}>
              {renderCategories()}
            </List>
          </Box>
        </Drawer>
      </Box>
    }
    </>
  );
}
