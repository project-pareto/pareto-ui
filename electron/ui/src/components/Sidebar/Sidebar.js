import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ParetoDictionary from '../../assets/ParetoDictionary.json'
import CategoryNames from '../../assets/CategoryNames.json'
import Subcategories from '../../assets/Subcategories.json'
import PopupModal from '../../components/PopupModal/PopupModal'


const drawerWidth = 240;

export default function Sidebar(props) {
  const [ openSaveModal, setOpenSaveModal ] = React.useState(false)
  const [ key, setKey ] =  React.useState(null)
  const [ openDynamic, setOpenDynamic ] = React.useState(true)
  const [ openStatic, setOpenStatic ] = React.useState(false)
  const [ openResultsTables, setOpenResultsTables ] = React.useState(false)
  const handleOpenSaveModal = () => setOpenSaveModal(true);
  const handleCloseSaveModal = () => setOpenSaveModal(false);
  const styles = {
    topLevelCategory: {
      paddingLeft: "0px",
      fontWeight: "500",

    },
    subcategory: {
      paddingLeft: "10px",
    }
  }

  const handleSaveModal = () => {
    console.log('saving this thing')
    props.handleUpdateExcel(props.scenario.id, props.category, props.scenario.data_input.df_parameters[props.category])
    handleCloseSaveModal()
    props.setInputDataEdited(false)
    props.handleSetCategory(key)
  }

  const handleDiscardChanges = () => {
    handleCloseSaveModal()
    props.setInputDataEdited(false)
    props.handleSetCategory(key)
    props.resetScenarioData()
  }

  const handleClick = (key) => {
    setKey(key)
    if (props.inputDataEdited) {
      handleOpenSaveModal()
    }
    else {
      props.handleSetCategory(key)
    }
  }

  const renderAdditionalCategories = () => {
    let additionalCategories = props.section === 0 ? {"Input Summary" :null, "Network Diagram": null, "Plots": null} : props.section === 1 ? {} : {"Dashboard": null, "Sankey": null, "Network Diagram": null}
    return (
      Object.entries(additionalCategories).map( ([key, value]) => ( 
        <>
        <ListItem key={"listitem_"+key} disablePadding>
            <ListItemButton key={"listitembutton_"+key} selected={props.category===key} onClick={() => handleClick(key)}>
            <ListItemText primaryTypographyProps={styles.topLevelCategory} key={"listitemtext_"+key} primary={key} />
            </ListItemButton>
        </ListItem>
        <Divider key={"divider_"+key}></Divider>
      </>
      ))
    )
  }

  const renderTopLevelCategories = () => {
    if (props.section === 0) {
      return (
        <>
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
    }else if (props.section ===2) {
      return (
        <>
        <ListItem key={"listitem_dynamic"} disablePadding>
              <ListItemButton key={"listitembutton_dynamic"} selected={false} onClick={() => setOpenResultsTables(!openResultsTables)}>
              <ListItemText primaryTypographyProps={styles.topLevelCategory} key={"listitemtext_resultsTables"} primary={"Results Tables"} />
              {openResultsTables ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
          </ListItem>
          <Divider key={"divider_resultsTables"}></Divider>
          {renderResultsTables()}
          </>
      ) 
    }
  }

  const renderDynamicCategories = () => {
    return (
      <Collapse in={openDynamic} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
      {Subcategories.Dynamic.map( (value,index) => {
        return(
            <>
            <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
            <ListItem key={"listitem_"+value} disablePadding>
                <ListItemButton key={"listitembutton_"+value} selected={props.category===value} onClick={() => handleClick(value)}>
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
          </>
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
            <>
            <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
            <ListItem style={{fontWeight:'bold'}} key={"listitem_"+value} disablePadding>
                <ListItemButton key={"listitembutton_"+value} selected={props.category===value} onClick={() => handleClick(value)}>
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
          </>
        )
      })}
     </List>
      </Collapse>
    )
  }
  const renderResultsTables = () => {
    return (
      <Collapse in={openResultsTables} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
      {Object.entries(props.scenario.results.data).map( ([key, value]) => ( 
        <>
        <Tooltip title={ParetoDictionary[key] ? ParetoDictionary[key] : CategoryNames[key] ? CategoryNames[key] : key} placement="right-start">
        <ListItem key={"listitem_"+key} disablePadding>
            <ListItemButton key={"listitembutton_"+key} selected={props.category===key} onClick={() => handleClick(key)}>
            <ListItemText 
              key={"listitemtext_"+key} 
              primary={CategoryNames[key] ? CategoryNames[key] :
                  key.replace('_dict','')
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
        <Divider key={"divider_"+key}></Divider>
      </>
      ))}
     </List>
      </Collapse>
    )
  }

  const renderTable = () => {
    return (
      Object.entries(props.section === 0 ? props.scenario.data_input.df_parameters : props.section === 1 ? props.scenario.optimization : props.scenario.results.data).map( ([key, value]) => ( 
        <>
        <Tooltip title={ParetoDictionary[key] ? ParetoDictionary[key] : CategoryNames[key] ? CategoryNames[key] : key} placement="right-start">
        <ListItem key={"listitem_"+key} disablePadding>
            <ListItemButton key={"listitembutton_"+key} selected={props.category===key} onClick={() => handleClick(key)}>
            <ListItemText 
              key={"listitemtext_"+key} 
              primary={CategoryNames[key] ? CategoryNames[key] :
                  key.replace('_dict','')
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
        <Divider key={"divider_"+key}></Divider>
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
        <Box key="drawer_box" sx={{ overflow: 'auto', overflowX: 'hidden'}}>
            <List key="drawer_list" aria-label="sidebar_table" sx={{paddingTop:'0px'}}>
            {props.scenario &&
              renderAdditionalCategories()
            }
            {props.scenario &&
              renderTopLevelCategories()
            }
            {/* {props.scenario && props.section === 2 &&
              renderTable()
            } */}
          </List>
        </Box>
      </Drawer>
      <PopupModal
        hasTwoButtons
        open={openSaveModal}
        handleClose={handleCloseSaveModal}
        handleSave={handleSaveModal}
        handleButtonTwoClick={handleDiscardChanges}
        text="Do you want to save changes made to this table?"
        buttonText='Save'
        buttonColor='primary'
        buttonVariant='contained'
        buttonTwoText='Discard'
        buttonTwoColor='error'
        buttonTwoVariant='outlined'
      />
    </Box>
  );
}
