import React from 'react'; 
import {useEffect, useState } from 'react';   
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';


export default function ErrorBar(props) {

    const handleErrorClose = () => {
        props.setOpen(false)
    }

    return ( 
      <Snackbar open={true} autoHideDuration={props.duration} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity={props.severity}>
          {props.errorMessage}
        </Alert>
      </Snackbar>
      
    );
  
}