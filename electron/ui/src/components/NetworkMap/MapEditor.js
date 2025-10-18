import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, IconButton, MenuItem, Typography, Stack } from '@mui/material';
import { useMapValues } from '../../context/MapContext';
import { NetworkNodeTypes } from '../../assets/utils';
import CloseIcon from '@mui/icons-material/Close';

function isEmptyObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj)
    && Object.keys(obj).length === 0;
}


export default function MapEditor(props) {
    const {
        saveNodeChanges,
        setShowNetworkNodePopup,
        setShowNetworkPipelinePopup,
        selectedNode: _selectedNode,
        setSelectedNode: _setSelectedNode,
        addNode,
        addPipeline,
        nodeType
    } = useMapValues();

    const [nodeData, setNodeData] = useState(_selectedNode && !isEmptyObject(_selectedNode) ? {..._selectedNode?.node} : null)
    useEffect(() =>{
        if (_selectedNode && !isEmptyObject(_selectedNode)) {
            console.log("setting node data")
            console.log(_selectedNode?.node)
            setNodeData({..._selectedNode?.node})
        } else setNodeData(null);
    }, [_selectedNode])

    const styles = {
        buttonStyle: {
            margin: 2
        },
        stack: {
            padding: 2,
        }
    }

    const handleChange = (key, val) => {
        setNodeData(prev => 
            ({
                ...prev,
                [key]: val
            })
        )
    }
    const handleClose = () => {
        _setSelectedNode(null);
        setShowNetworkNodePopup(false);
        setShowNetworkPipelinePopup(false);
    }

    const getCoordinates = (n) => {
        if (!n?.coordinates) return[0, 0];
        const coords = [...n?.coordinates];
        const reverseCoords = coords?.reverse()
        return reverseCoords;
    }

    return (
        <Box sx={{ padding: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="h6">
            Map Editor
        </Typography>
        <Stack direction='column' spacing={1}>
            <Button variant="contained" onClick={addNode}>Add Node</Button>
            <Button variant="contained" onClick={addPipeline}>Add Pipeline</Button>
        </Stack>
        
        

        {nodeData && (
            <Box>

            {nodeType === 'node' && (
                <Stack>
                    <Stack justifyContent="space-between" alignItems="center" direction='row' sx={styles.stack}>
                        <Typography variant="h6">Node {_selectedNode?.node?.name}</Typography>
                        <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                        </IconButton>
                    </Stack>
                    <TextField
                        label="Name"
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                        value={nodeData?.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <TextField
                        label="Node Type"
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                        select
                        value={nodeData?.nodeType}
                        onChange={(e) => handleChange('nodeType', e.target.value)}
                        >
                        {Object.entries(NetworkNodeTypes).map(([key, v]) => {
                            return (
                                <MenuItem key={key} value={v.name}>
                                    {v.displayName}
                                </MenuItem>
                            )
                        }
                            
                        )}
                    </TextField>
                    <CoordinatesInput 
                        coordinates={getCoordinates(nodeData)}
                        onChange={handleChange}
                    />
                </Stack>
                
            )}
            <Stack direction='row' justifyContent='space-around' sx={styles.stack}>
                <Button variant="outlined" onClick={handleClose}>
                    Close
                </Button>

                <Button variant="contained" onClick={() => saveNodeChanges(nodeData)}>Save</Button>
            </Stack>
        </Box>
        )}
        </Box>
    );
}

function CoordinatesInput({ coordinates, onChange }) {
  // coordinates: [lat, long]

  const handleLatChange = (event) => {
    const newLat = event.target.value;
    onChange("coordinates", [coordinates[1], newLat]);
  };

  const handleLongChange = (event) => {
    const newLong = event.target.value;
    onChange("coordinates", [newLong, coordinates[0]]);
  };

  return (
    <Stack spacing={2} sx={{pt: 1}}>
      <TextField
        label="Latitude"
        value={coordinates[0] ?? ''}
        onChange={handleLatChange}
        type="number"
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Longitude"
        value={coordinates[1] ?? ''}
        onChange={handleLongChange}
        type="number"
        variant="outlined"
        fullWidth
      />
    </Stack>
  );
}
