import {useState} from 'react';
import { Button, Modal, TextField, Box, Typography, IconButton, MenuItem, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';


export default function NetworkPipelinePopup(props) {
    const { pipeline, open, handleClose, handleSave, availableNodes } = props;

    const [pipelineData, setPipelineData] = useState({...pipeline})
    const styles = {
        modalStyle: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
        },
        connections: {
            paddingTop: 16,
            paddingBottom: 16,
            fontWeight: "bold",
            fontSize: 24,
        }
    }

    const handleChange = (key, val) => {
        setPipelineData(prev => 
            ({
                ...prev,
                [key]: val
            })
        )
    }

    const handleUpdateNodeList = (name, idx) => {
        const node = availableNodes.find((node) => node.name === name);
        console.log("updating to node")
        console.log(node)
        setPipelineData(prev => {
            const updatedNodeList = idx === undefined
                ? [...prev.node_list, name]
                : prev.node_list.map((node, i) =>
                    i === idx ? name : node
                );
            
            // TODO: update coordinates list as well

            return {
                ...prev,
                node_list: updatedNodeList
            };
        });

    }

    return (
    <Modal open={open} onClose={handleClose}>
        <Box sx={styles.modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Pipeline {pipeline?.name}</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
            <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={pipelineData.name}
                onChange={(e) => handleChange('name', e.target.value)}
            />
            <Stack justifyContent={'space-between'} direction={'row'}>
                <span style={styles.connections}>Connections</span>
                <Button
                    startIcon={<AddCircleIcon/>}
                    onClick={() => handleUpdateNodeList("")}
                >
                    Add Connection
                </Button>
            </Stack>
            
            {
                pipelineData?.node_list?.map((node, idx) => {
                    return ( //TODO: add incoming, outgoing booleans
                        <TextField
                            key={idx}
                            label="Node"
                            fullWidth
                            margin="normal"
                            select
                            value={node}
                            onChange={(e) => handleUpdateNodeList(e.target.value, idx)}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        style: {
                                            maxHeight: 200
                                        }
                                    }
                                }
                            }}

                        >
                            {availableNodes?.map((node) => (
                                <MenuItem key={node.name} value={node.name}>
                                    {node.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )
                    
                })
            }

            <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
                Close
            </Button>
            <Button variant="contained" onClick={handleSave}>
                Save Changes
            </Button>
            </Box>
        </Box>
    </Modal>
    );
}