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

    const handleUpdateConnection = (name, idx) => {
        const node = availableNodes.find((node) => node.name === name);
        setPipelineData(prev => {
            const updatedNodeList = idx === undefined
                ? [...prev.nodes, {name: name, incoming: true, outgoing: true}]
                : prev.nodes.map((n, i) =>
                    i === idx ? {...n, name: name, coordinates: node.coordinates} : n
                );
            return {
                ...prev,
                nodes: updatedNodeList
            };
        });
    }

    const handleUpdatePipelineDirection = (direction, value, idx) => {
        setPipelineData(prev => {
            const updatedNodeList = prev.nodes.map((n, i) =>
                    i === idx ? {...n, [direction]: value} : n
                );
            return {
                ...prev,
                nodes: updatedNodeList
            };
        });

    }

    // TODO: add function for REMOVING a connection
    const handleRemoveConnection = () => {
        
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
            <Stack justifyContent={'space-between'} direction={'row'} style={styles.connections}>
                <span >Connections</span>
                <Button
                    startIcon={<AddCircleIcon/>}
                    onClick={() => handleUpdateConnection("")}
                >
                    Add Connection
                </Button>
            </Stack>
            
            {
                pipelineData?.nodes?.map((connectionNode, idx) => {
                    const name = connectionNode.name;
                    const incomingValue = connectionNode.incoming;
                    const outgoingValue = connectionNode.outgoing;
                    return (
                        <Stack direction="row" key={idx} spacing={2} sx={{marginBottom: 3}}>
                            <TextField
                                label="Node"
                                fullWidth
                                select
                                value={name}
                                onChange={(e) => handleUpdateConnection(e.target.value, idx)}
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
                            <TextField
                                label="Incoming"
                                fullWidth
                                select
                                value={incomingValue}
                                onChange={(e) => handleUpdatePipelineDirection("incoming", e.target.value, idx)}
                            >
                                <MenuItem value={true}>
                                    true
                                </MenuItem>
                                <MenuItem value={false}>
                                    false
                                </MenuItem>
                            </TextField>
                            <TextField
                                label="Outgoing"
                                fullWidth
                                select
                                value={outgoingValue}
                                onChange={(e) => handleUpdatePipelineDirection("outgoing", e.target.value, idx)}
                            >
                                <MenuItem value={true}>
                                    true
                                </MenuItem>
                                <MenuItem value={false}>
                                    false
                                </MenuItem>
                            </TextField>
                        </Stack>
                        
                    )
                    
                })
            }

            <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
                Close
            </Button>
            <Button variant="contained" onClick={() => handleSave(pipelineData)}>
                Save Changes
            </Button>
            </Box>
        </Box>
    </Modal>
    );
}