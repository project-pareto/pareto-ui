import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom'
import Divider from '@mui/material/Divider';
import {useEffect, useState} from 'react';   


export default function Sidebar(props) {
    const scenarios = props.scenarios;

    <List sx={{paddingTop:'0px'}}>
        {scenarios.map((text, index) => (
        <Link
            to={{
                pathname: "/scenario",
                key: Math.floor(Math.random()*10000000000)
            }}
            // reloadDocument={true}
            key= {Math.floor(Math.random()*10000000000)}
            state={{ id: index, scenario: text }}
            style={{ color: 'black', textDecoration: 'none' }}
        >
            <ListItem key={text+index} disablePadding>
                <ListItemButton onClick ={ () => {props.handleSelection(text)}}>
                <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
            <Divider></Divider>
        </Link>
        
        ))}
    </List>

}
