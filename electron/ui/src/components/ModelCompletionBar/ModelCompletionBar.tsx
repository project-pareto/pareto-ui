import React from 'react'; 
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ModelCompletionBarProps } from '../../types';

export default function ModelCompletionBar(props: ModelCompletionBarProps): JSX.Element {
    const vertical: 'top' | 'bottom' = 'bottom'
    const horizontal: 'left' | 'center' | 'right' = 'right'

    const handleClose = () => {
        props.handleCloseFinishedOptimizationDialog()
    }

    return ( 
        <Snackbar style={{marginBottom:"50px"}} open={props.open ?? true} autoHideDuration={60000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
            <div>
                <Alert onClose={handleClose} severity="success">
                    <Button onClick={props.goToModelResults} color={undefined as any} variant={undefined as any}> 
                        Optimization has completed. Go to results <ArrowForwardIcon/>
                    </Button>
                </Alert>
            </div>
        </Snackbar>
    );
}