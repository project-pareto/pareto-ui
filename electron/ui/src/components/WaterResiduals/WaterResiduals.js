import React from 'react';
import {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Tooltip, Box } from '@mui/material';
import PopupModal from '../../components/PopupModal/PopupModal'

export default function WaterResiduals(props) {  
    const { scenario } = props;
    // water storage:
    const v_S_FracDemand = scenario?.results?.data?.v_S_FracDemand_dict
    
    // water surplus
    const v_S_Production = scenario?.results?.data?.v_S_Production_dict
    const v_S_Flowback = scenario?.results?.data?.v_S_Flowback_dict
    
    console.log(v_S_FracDemand)
    console.log(v_S_Production)
    console.log(v_S_Flowback)
    const styles = {
        table: {
            border:"1px solid #ddd"
        },
        tableHead: {
            backgroundColor:"#6094bc", color:"white"
        }
    }

    return (
        <Box>
            <h3>
                Water Residuals
            </h3>
            <Table style={styles.table} size='small'>
                <TableHead style={styles.tableHead}>
                    <TableRow>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        
                    </TableRow>
                </TableBody>
            </Table>
        </Box>
    );

}


