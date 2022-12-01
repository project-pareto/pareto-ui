import React from 'react'; 
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


export default function ModelCompletionBar(props) {
    const vertical = "bottom"
    const horizontal = "right"

    const handleClose = () => {
        props.setShowCompletedOptimization(false)
    }

    return ( 
        <Snackbar style={{marginBottom:"50px"}} open={true} autoHideDuration={60000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
            <div>
                <Alert onClose={handleClose} severity="success">
                    <Button onClick={props.goToModelResults} color="black" variant=""> 
                        Optimization has completed. Go to results <ArrowForwardIcon/>
                    </Button>
                </Alert>
            </div>
        </Snackbar>
      
    );
  
}