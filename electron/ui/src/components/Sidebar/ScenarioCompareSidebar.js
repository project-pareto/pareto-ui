import React, { Fragment, useState } from 'react';
import { Box, Drawer, CssBaseline, Collapse, Divider, Tooltip } from '@mui/material'
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ParetoDictionary from '../../assets/ParetoDictionary.json'
import CategoryNames from '../../assets/CategoryNames.json'
import Subcategories from '../../assets/Subcategories.json'


const drawerWidth = 240;

export default function Sidebar(props) {
    const { category, setCategory, open, checkDiff } = props
    const [ openDynamic, setOpenDynamic ] = useState(false)
    const [ openStatic, setOpenStatic ] = useState(false)

  const styles = {
    topLevelCategory: {
      paddingLeft: "0px",
      fontWeight: "500",

    },
    subcategory: {
      paddingLeft: "10px",
    },
    inputDifference: {
      backgroundColor: "rgb(255,215,0, 0.5)",
    },
  }

  const handleClick = (key) => {
    console.log(`clicked on ${key}`)
    setCategory(key)

  }

  const handleCheckForDifference = (key) => {
    if (checkDiff(key)) return styles.inputDifference
    else return {backgroundColor: "white"}
    
  }

  const renderTopLevelCategories = () => {
      return (
        <>
        <Fragment>
          <ListItem disablePadding>
              <ListItemButton selected={category==="output"} onClick={() => handleClick("output")}>
              <ListItemText primaryTypographyProps={styles.topLevelCategory} primary={"Output"} />
              </ListItemButton>
          </ListItem>
          <Divider></Divider>
        </Fragment>
        <ListItem key={"listitem_dynamic"} disablePadding>
              <ListItemButton key={"listitembutton_dynamic"} selected={false} onClick={() => setOpenDynamic(!openDynamic)}>
              <ListItemText primaryTypographyProps={styles.topLevelCategory} key={"listitemtext_dynamic"} primary={"Dynamic Inputs"} />
              {openDynamic ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
          </ListItem>
          <Divider key={"divider_dynamic"}></Divider>
          {renderDynamicCategories()}
          <ListItem key={"listitem_static"} disablePadding>
              <ListItemButton key={"listitembutton_static"} selected={false} onClick={() => setOpenStatic(!openStatic)}>
              <ListItemText primaryTypographyProps={styles.topLevelCategory} key={"listitemtext_static"} primary={"Static Inputs"} />
              {openStatic ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
          </ListItem>
          <Divider key={"divider_static"}></Divider>
          {renderStaticCategories()}
          </>
      ) 
  }

  const renderDynamicCategories = () => {
    return (
      <Collapse in={openDynamic} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
      {Subcategories.Dynamic.map( (value,index) => {
        return(
          <Fragment key={"_"+index}>
            <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
            <ListItem key={"listitem_"+value} disablePadding>
                <ListItemButton key={"listitembutton_"+value} selected={category===value} style={handleCheckForDifference(value)} onClick={() => handleClick(value)}>
                <ListItemText 
                  style={styles.subcategory}
                  key={"listitemtext_"+value} 
                  primary={CategoryNames[value] ? CategoryNames[value] :
                    value.replace('_dict','')
                          .replace('v_F_','')
                          .replace('v_C_','Cost ')
                          .replace('v_R_','Credit ')
                          .replace('v_L_','Water Level ')
                          .replace('v_S_','Slack ')
                          .replace('v_D_','Disposal ')
                          .replace('v_X_','Storage ')
                          .replace('v_T_','Treatment ')
                          .replace('vb_y_Flow','Directional Flow')
                          .replace('vb_y_','New ')} 
                />
                </ListItemButton>
            </ListItem>
            </Tooltip>
            <Divider key={"divider_"+value}></Divider>
          </Fragment>
        )
      })}
     </List>
      </Collapse>
    )
  }

  const renderStaticCategories = () => {
    return (
      <Collapse in={openStatic} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
      {Subcategories.Static.map( (value,index) => {
        return (
          <Fragment key={"_"+index}>
            <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
            <ListItem style={{fontWeight:'bold'}} key={"listitem_"+value} disablePadding>
                <ListItemButton key={"listitembutton_"+value} selected={category===value} onClick={() => handleClick(value)}>
                <ListItemText 
                  style={styles.subcategory}
                  key={"listitemtext_"+value} 
                  primary={CategoryNames[value] ? CategoryNames[value] :
                    value.replace('_dict','')
                          .replace('v_F_','')
                          .replace('v_C_','Cost ')
                          .replace('v_R_','Credit ')
                          .replace('v_L_','Water Level ')
                          .replace('v_S_','Slack ')
                          .replace('v_D_','Disposal ')
                          .replace('v_X_','Storage ')
                          .replace('v_T_','Treatment ')
                          .replace('vb_y_Flow','Directional Flow')
                          .replace('vb_y_','New ')} 
                />
                </ListItemButton>
            </ListItem>
            </Tooltip>
            <Divider key={"divider_"+value}></Divider>
          </Fragment>
        )
      })}
     </List>
      </Collapse>
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
          open={open}
        >
          <Box key="drawer_box" sx={{ overflow: 'auto', overflowX: 'hidden'}}>
              <List key="drawer_list" aria-label="sidebar_table" sx={{paddingTop:'0px'}}>
              {renderTopLevelCategories()}
            </List>
          </Box>
        </Drawer>
      </Box>
    }
    </>
  );
}
