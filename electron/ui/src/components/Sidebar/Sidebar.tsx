import React, {useState, useEffect} from 'react';
import { Box, Drawer, CssBaseline, Collapse, Tooltip, IconButton } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { CategoryNames, ParetoDictionary, Subcategories } from "../../assets/utils";
import PopupModal from '../../components/PopupModal/PopupModal'
import MapEditor from '../NetworkMap/MapEditor';
import type { SidebarProps } from '../../types';


const drawerWidth = 240;

export default function Sidebar(props: SidebarProps) {
  const {
    handleSetCategory,
    scenario,
    section,
    category,
    inputDataEdited,
    handleUpdateExcel,
    setInputDataEdited,
    syncScenarioData,
  } = props;

  const optimized_override_values = (scenario as any)?.optimized_override_values;
  const data_input = (scenario as any)?.data_input;
  const id = (scenario as any)?.id;
  const optimization = (scenario as any)?.optimization || {};
  const results = (scenario as any)?.results || {};

  const isIncomplete = results?.status === "Incomplete";
  const [ openSaveModal, setOpenSaveModal ] = useState<boolean>(false)
  const [ key, setKey ] =  useState<string | null>(null)
  const [ openDynamic, setOpenDynamic ] = useState<boolean>(true)
  const [ openStatic, setOpenStatic ] = useState<boolean>(false)
  const [ openResultsTables, setOpenResultsTables ] = useState<boolean>(false)
  const [ overrideList, setOverrideList ] = useState<string[]>([])

  useEffect(() => {
    const tempOverrideList: string[] = []
    if (optimized_override_values !== undefined)  {
        for(const k of Object.keys(optimized_override_values)) {
            if(Object.keys(optimized_override_values[k] || {}).length > 0) {
              tempOverrideList.push(k)
            }
        }
    }
    if (tempOverrideList.length > 0) tempOverrideList.push("Results Tables")
    setOverrideList(tempOverrideList)
  },[scenario])

  const handleOpenSaveModal = () => setOpenSaveModal(true);
  const handleCloseSaveModal = () => setOpenSaveModal(false);

  const styles: any = {
    topLevelCategory: {
      paddingLeft: "0px",
      fontWeight: "500",
      margin: 0,
      // justifyContent: "space-between"
    },
    subcategory: {
      paddingLeft: "10px",
      margin: 0,
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
    },
    override: {
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
  }

  const handleSaveModal = () => {
    handleUpdateExcel(id as string | number, String(category || ''), (data_input?.df_parameters || {})[category || ''])
    handleCloseSaveModal()
    setInputDataEdited?.(false)
    handleSetCategory(String(key || ''))
  }

  const handleDiscardChanges = () => {
    handleCloseSaveModal()
    setInputDataEdited?.(false)
    handleSetCategory(String(key || ''))
    syncScenarioData?.()
  }

  const handleClick = (k: string) => {
    setKey(k)
    if (inputDataEdited) {
      handleOpenSaveModal()
    }
    else {
      handleSetCategory(k)
    }
  }

  const getStyle = (k: string) => {
    try {
      if(String(category) === k) return styles.selected
      else if (overrideList.includes(k)) return styles.override
      else return styles.unselected
    }
    catch(e) {
      return styles.unselected
    }
  }

  const renderMapOptions = () => {
    const categories = {"Input Summary" :null, "Network Diagram": null}
    return (
      Object.entries(categories).map( ([k, value]) => ( 
        <div style={String(category)===k ? styles.selected : styles.unselected} onClick={() => handleClick(k)} key={String(value)+""+k}> 
            <p style={styles.topLevelCategory}>
              {k === "Input Summary" ? "PARETO Input File" : k}
            </p>
        </div>
      ))
    )
  }

  const renderAdditionalCategories = () => {
    const additionalCategories = section === 0 ? {"Input Summary" :null, "Network Diagram": null, "Plots": null} : section === 1 ? {} : {"Dashboard": null, "Sankey": null, "Network Diagram": null}
    return (
      Object.entries(additionalCategories).map( ([k, value]) => ( 
        <div style={String(category)===k ? styles.selected : styles.unselected} onClick={() => handleClick(k)} key={String(value)+""+k}> 
            <p style={styles.topLevelCategory}>
              {k === "Input Summary" && results?.status === "Incomplete" ? "PARETO Input File" : k}
            </p>
        </div>
      ))
    )
  }

  const renderTopLevelCategories = () => {
    if (section === 0) {
      return (
        <div>
          <div style={getStyle("Dynamic")}  onClick={() => setOpenDynamic(!openDynamic)}> 
            <p style={styles.topLevelCategory}>
              <span style={{display:"flex", justifyContent: "space-between"}}>
                Dynamic Inputs
                <IconButton disableRipple size="small" sx={{marginTop: -3, marginBottom: -3}}>{openDynamic ? <ExpandLess /> : <ExpandMore />}</IconButton>
              </span>
            </p>
            
              
          </div>
          {renderDynamicCategories()}
          <div style={getStyle("Static")}  onClick={() => setOpenStatic(!openStatic)}> 
              <p style={styles.topLevelCategory}>
              <span style={{display:"flex", justifyContent: "space-between"}}>
                Static Inputs
                <IconButton disableRipple size="small" sx={{marginTop: -3, marginBottom: -3}}>{openStatic ? <ExpandLess /> : <ExpandMore />}</IconButton>
              </span>
              </p>
          </div>
          {renderStaticCategories()}
        </div>
      ) 
    }else if (section ===2) {
      return (
        <>
        <div style={category==="Results Tables" ? styles.selected : styles.unselected} onClick={() => setOpenResultsTables(!openResultsTables)}> 
            
          <p style={styles.topLevelCategory}>
            <span style={{display:"flex", justifyContent: "space-between"}}>
              Results Tables
              <IconButton disableRipple edge={"end"} size="small" sx={{marginTop: -3, marginBottom: -3}}>{openResultsTables ? <ExpandLess /> : <ExpandMore />}</IconButton>
            </span>
          </p>
        </div>
          {renderResultsTables()}
          </>
      ) 
    }
  }

  const renderDynamicCategories = () => {
    return (
      <Collapse in={openDynamic} timeout="auto" unmountOnExit>
      {Subcategories.Dynamic.map( (value,index) => {
        return(
          <div style={getStyle(value)} onClick={() => handleClick(value)} key={value+""+index}> 
          <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
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
        return (
          <div style={getStyle(value)} onClick={() => handleClick(value)} key={value+""+index}> 
          <Tooltip title={ParetoDictionary[value] ? ParetoDictionary[value] : CategoryNames[value] ? CategoryNames[value] : value} placement="right-start">
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
              </Tooltip>
          </div>
        )
      })}
      </Collapse>
    )
  }
  const renderResultsTables = () => {
    let hasResiduals = checkForResiduals()
    return (
      <Collapse in={openResultsTables} timeout="auto" unmountOnExit>
        {hasResiduals && (
          <div style={getStyle("Water Residuals")} onClick={() => handleClick("Water Residuals")} key={"Water Residuals"}> 
              <p style={styles.subcategory}>
                Water Residuals
              </p>
          </div>
        )}
        {Object.entries(results?.data || {}).map( ([key, value]) => ( 
          <div style={getStyle(key)} onClick={() => handleClick(key)} key={key+""+value}> 
              <p style={styles.subcategory}>
                {CategoryNames[key] ? CategoryNames[key] :
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
              </p>
          </div>
        ))}
      </Collapse>
    )
  }

  const checkForResiduals = () => {
    if (optimization.deactivate_slacks === false) {
      return true
    } else return false
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {backgroundColor:"#F5F5F6",  width: drawerWidth, boxSizing: 'border-box' },
          [`& .MuiBox-root`]: {marginBottom: '60px' },
        }}
        PaperProps={{
            sx: {
            width: 240,
            marginTop: '158px',
            paddingBottom: '158px',
            zIndex:1
            }
        }}
        open={true}
      >
        <Box key="drawer_box" sx={{ overflow: 'auto', overflowX: 'hidden'}}>
            {scenario && !isIncomplete &&
              renderAdditionalCategories()
            }
            {scenario && !isIncomplete &&
              renderTopLevelCategories()
            }
            {
              scenario && isIncomplete && (
                renderMapOptions()
              )
            }
            {
              scenario && isIncomplete && (
                 category === "Network Diagram" ?
                <MapEditor/> :
                renderTopLevelCategories()
              )
            }
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
        width={400}
      />
    </Box>
  );
}
