import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails} from '@mui/material';
import { ListItemText, ListItemIcon, Checkbox, MenuItem, Typography } from '@mui/material';


export default function FilterDropdown(props) {
    const styles = {
        iconSelected: {
            backgroundColor:'#6094bc', 
            color: 'white',
            borderRadius: 10,
        },
        iconUnselected: {
            borderRadius: 10,
            color:'black',
        }
       }


    return (
        <Accordion style={{minWidth:props.width }} sx={{minWidth:props.width, zIndex: 2}}>
                <AccordionSummary sx={{marginBottom: 0, paddingBottom:0}} style={{justifyContent:"center"}}>
                <Typography noWrap align="center" sx={{width: '100%',fontWeight: "bold", color: "#0884b4"}}>Node Filters</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ maxHeight:props.maxHeight, overflow: "scroll", marginTop:0, paddingTop:0}}>
                    <MenuItem value="all" onClick={()=> props.handleFilter("all")}>
                        <ListItemIcon>
                            <Checkbox
                            checked={props.isAllSelected}
                            indeterminate={
                                props.filtered.length > 0 && props.filtered.length < props.total.length
                            }
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select All"
                        />
                        </MenuItem>
                        {
                        Object.entries(props.filtered).map(([key,value]) => (
                            <MenuItem key={key} value={key} onClick={()=> props.handleFilter(key)}>
                                <ListItemIcon>
                                <Checkbox checked={value} />
                                </ListItemIcon>
                                <ListItemText primary={key} />
                            </MenuItem>
                        ))}
                        

                    
                </AccordionDetails>
            </Accordion>
    )
}