import React from 'react';
import {useState} from 'react';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


export default function FilterDropdown(props) {
    const [ filterType, setFilterType ] = useState(props.option1)

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

    const handleFilterTypeChange = (filterType) => {
        setFilterType(filterType)
    }

    const handleKeyDown = (e) => {
        e.preventDefault();
        if (e.keyCode === 38) {
            props.handleArrowSelection('up')
          } else if (e.keyCode === 40) {
            props.handleArrowSelection('down')
          }
    }

    return (
        <Accordion style={{width:props.width }}sx={{width:props.width}}>
                <AccordionSummary sx={{marginBottom: 0, paddingBottom:0}} style={{justifyContent:"center"}}>
                <Typography noWrap align="center" sx={{width: '100%',fontWeight: "bold", color: "#0884b4"}}>{props.option1} & {props.option2} Filters</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ maxHeight:props.maxHeight, overflow: "scroll", marginTop:0, paddingTop:0}}>
                    <Grid container>
                        <Grid item xs={12}>
                        <Button size="small" style={filterType === props.option1 ? styles.iconSelected : styles.iconUnselected} onClick={() => handleFilterTypeChange(props.option1)}>{props.option1}</Button>
                    <Button size="small" style={filterType === props.option2 ? styles.iconSelected : styles.iconUnselected} onClick={() => handleFilterTypeChange(props.option2)}>{props.option2}</Button>
                        </Grid>
                        {filterType === "Time" && 
                        <Grid item xs={12}>
                            <div tabIndex="0" onKeyDown={handleKeyDown}>
                                <IconButton onKeyDown={handleKeyDown} onClick={() => props.handleArrowSelection('down')}><KeyboardArrowDownIcon></KeyboardArrowDownIcon></IconButton>
                                <IconButton onKeyDown={handleKeyDown} onClick={() => props.handleArrowSelection('up')}><KeyboardArrowUpIcon></KeyboardArrowUpIcon></IconButton>
                            </div>
                        </Grid>
                        }
                        
                    </Grid>
                    
                    
                    {filterType === props.option1 && 
                    <>
                        <MenuItem value="all" onClick={()=> props.handleFilter1("all")}>
                        <ListItemIcon>
                            <Checkbox
                            checked={props.isAllSelected1}
                            indeterminate={
                                props.filtered1.length > 0 && props.filtered1.length < props.total1.length
                            }
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select All"
                        />
                        </MenuItem>
                        {props.total1.map((option, index) => (
                        <MenuItem key={option} value={option} onClick={()=> props.handleFilter1(option)}>
                            <ListItemIcon>
                            <Checkbox checked={props.filtered1.indexOf(option) > -1} />
                            </ListItemIcon>
                            <ListItemText primary={option} />
                        </MenuItem>
                        ))}
                    </>
                }
                    {filterType === props.option2 && 
                    <>
                        <MenuItem value="all" onClick={()=> props.handleFilter2("all")}>
                        <ListItemIcon>
                            <Checkbox
                            checked={props.isAllSelected2}
                            indeterminate={
                                props.filtered2.length > 0 && props.filtered2.length < props.total2.length
                            }
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select All"
                        />
                        </MenuItem>
                        {props.total2.map((option, index) => (
                        <MenuItem key={option} value={option} onClick={()=> props.handleFilter2(option)}>
                            <ListItemIcon>
                            <Checkbox checked={props.filtered2.indexOf(option) > -1} />
                            </ListItemIcon>
                            <ListItemText primary={option} />
                        </MenuItem>
                        ))}
                    </>
                    }
                    
                </AccordionDetails>
            </Accordion>
    )
}