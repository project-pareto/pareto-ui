import React, { Fragment, useState, useEffect } from 'react';
import { Box, Drawer, CssBaseline, Collapse, Button, Tooltip, IconButton } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ParetoDictionary from '../../assets/ParetoDictionary.json'
import CategoryNames from '../../assets/CategoryNames.json'
import Subcategories from '../../assets/Subcategories.json'


const drawerWidth = 240;

export default function Sidebar(props) {
    const { category, setCategory, open, deltaDictionary } = props
    const [ openDynamic, setOpenDynamic ] = useState(false)
    const [ openStatic, setOpenStatic ] = useState(false)
    const [ deltaCategories, setDeltaCategories ] = useState([])
    const [ checkAgain, setCheckAgain ] = useState(false)

    useEffect(() => {
      // check if delta dictionary is set yet
      // if not, need to rerun this stuff 
      if(Object.keys(deltaDictionary).length < 5) {
        
      }
      // console.log("deltaDictionary")
      // console.log(deltaDictionary)
      else {
        let tempDeltaCategories = []
        try {
          let dynamic_delta = false
          for (let each of Subcategories["Dynamic"]) {
            if(Object.keys(deltaDictionary[each]).length > 0) {
              dynamic_delta = true
              tempDeltaCategories.push(each)
            }
          }
          if (dynamic_delta) tempDeltaCategories.push("Dynamic")
  
          let static_delta = false
          for (let each of Subcategories["Static"]) {
            if(Object.keys(deltaDictionary[each]).length > 0) {
              static_delta = true
              tempDeltaCategories.push(each)
            }
          }
          if (static_delta) tempDeltaCategories.push("Static")
          setDeltaCategories(tempDeltaCategories)
        }
        catch(e) {
          console.error('error checking delta categories')
          // console.log(tempDeltaCategories)
          // setDeltaCategories(tempDeltaCategories)
        }
      }
      
    }, [deltaDictionary])

  const styles = {
    topLevelCategory: {
      paddingLeft: "0px",
      fontWeight: "500",
      margin: 0,
    },
    subcategory: {
      paddingLeft: "10px",
      margin: 0,
    },
    inputDifference: {
      backgroundColor: "rgb(255,215,0, 0.4)",
      cursor: "pointer",
      padding: 10,
      marginLeft: "10px",
      marginRight: "10px",
      borderRadius: "5px",
      textAlign: "left",
      marginTop: 1,
      marginBottom: 1
    },
    selected: {
      cursor: "pointer",
      color:"#0b89b9",
      backgroundColor: "#D4EFFF",
      padding: 10,
      marginLeft: "10px",
      marginRight: "10px",
      borderRadius: "5px",
      textAlign: "left",
      marginTop: 1,
      marginBottom: 1,
      fontWeight: "bold"
    },
    unselected: {
      cursor: "pointer",
      padding: 10,
      marginLeft: "10px",
      marginRight: "10px",
      borderRadius: "5px",
      textAlign: "left",
      marginTop: 1,
      marginBottom: 1
    }
  }

  const handleClick = (key) => {
    console.log(`clicked on ${key}`)
    setCategory(key)

  }

  const handleCheckForDifference = (key) => {
      if(category === key) return styles.selected
      else if (deltaCategories.includes(key)) return styles.inputDifference
      else return styles.unselected
  }

  const renderTopLevelCategories = () => {
      return (
        <div>
          <div style={category==="output" ? styles.selected : styles.unselected} onClick={() => handleClick("output")}> 
              <p style={styles.topLevelCategory}>Output</p>
          </div>
          <Tooltip title={deltaCategories.includes("Dynamic") ? "Select to view input deltas" : ""} placement="right-start">
          <div style={handleCheckForDifference("Dynamic")}  onClick={() => setOpenDynamic(!openDynamic)}> 
              <p style={styles.topLevelCategory}>
                <span style={{display:"flex", justifyContent: "space-between"}}>
                  Dynamic Inputs
                  <IconButton disableRipple edge={"end"} size="small" sx={{marginTop: -3, marginBottom: -3}}>{openDynamic ? <ExpandLess /> : <ExpandMore />}</IconButton>
                </span>
              </p>
          </div>
          </Tooltip>
          {renderDynamicCategories()}
          <Tooltip title={deltaCategories.includes("Static") ? "Select to view input deltas" : ""} placement="right-start">
          <div style={handleCheckForDifference("Static")}  onClick={() => setOpenStatic(!openStatic)}> 
              <p style={styles.topLevelCategory}>
                <span style={{display:"flex", justifyContent: "space-between"}}>
                  Static Inputs
                  <IconButton disableRipple edge={"end"} size="small" sx={{marginTop: -3, marginBottom: -3}}>{openStatic ? <ExpandLess /> : <ExpandMore />}</IconButton>
                </span>
              </p>
          </div>
          </Tooltip>
          {renderStaticCategories()}
        </div>
      ) 
  }

  const renderDynamicCategories = () => {
    return (
      <Collapse in={openDynamic} timeout="auto" unmountOnExit>
      {Subcategories.Dynamic.map( (value,index) => {
        return(
          <div key={value+""+index}>
            <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
            {/* <div style={category===value ? styles.selected : styles.unselected} onClick={() => handleClick(value)}>  */}
            <div style={handleCheckForDifference(value)} onClick={() => handleClick(value)}>
                <p style={styles.subcategory}>
                {CategoryNames[value] ? CategoryNames[value] :
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
                          .replace('vb_y_','New ')
                  } 
                </p>
            </div>
            </Tooltip>
          </div>
        )
      })}
      </Collapse>
    )
  }

  const renderStaticCategories = () => {
    return (
      <Collapse in={openStatic} timeout="auto" unmountOnExit>
      {Subcategories.Static.map( (value,index) => {
        return(
          <div key={value+""+index}>
            <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
            <div style={handleCheckForDifference(value)} onClick={() => handleClick(value)}>
                <p style={styles.subcategory}>
                {CategoryNames[value] ? CategoryNames[value] :
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
                          .replace('vb_y_','New ')
                  } 
                </p>
            </div>
            </Tooltip>
          </div>
        )
      })}
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
            [`& .MuiDrawer-paper`]: { backgroundColor:"#F5F5F6", width: drawerWidth, boxSizing: 'border-box' },
            [`& .MuiBox-root`]: {marginBottom: '60px' },
          }}
          PaperProps={{
              sx: {
              width: 240,
              // marginTop: '71px',
              // paddingBottom: '71px'
              marginTop: '152px',
              paddingBottom: '102px'
              }
          }}
          open={open}
        >
          <Box key="drawer_box" sx={{ overflow: 'auto', overflowX: 'hidden'}}>
              {renderTopLevelCategories()}
          </Box>
          {/* <Box key="drawer_box" sx={{ overflow: 'auto', overflowX: 'hidden'}}>
              <List key="drawer_list" aria-label="sidebar_table" sx={{paddingTop:'0px'}}>
              {renderTopLevelCategories()}
            </List>
          </Box> */}
        </Drawer>
      </Box>
    }
    </>
  );
}
