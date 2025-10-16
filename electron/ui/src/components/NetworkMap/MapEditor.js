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
        lineData,
        setLineData,
        saveNodeChanges,
        setShowNetworkNodePopup,
        setShowNetworkPipelinePopup,
        selectedNode,
        setSelectedNode,
        addNode,
        addPipeline,
        updateItem,
        nodeType
    } = useMapValues();

    const [nodeData, setNodeData] = useState(selectedNode && !isEmptyObject(selectedNode) ? {...selectedNode?.node} : null)
    useEffect(() =>{
        if (selectedNode && !isEmptyObject(selectedNode)) {
            console.log("setting node data")
            console.log(selectedNode?.node)
            setNodeData({...selectedNode?.node})
        } else setNodeData(null);
    }, [selectedNode])

    const handleChange = (key, val) => {
        setNodeData(prev => 
            ({
                ...prev,
                [key]: val
            })
        )
    }
    const handleClose = () => {
        setSelectedNode(null);
        setShowNetworkNodePopup(false);
    }

    return (
        <Box sx={{ padding: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="h6">
            Map Editor
        </Typography>

        <Button variant="contained" onClick={addNode}>Add Node</Button>
        <Button variant="contained" onClick={addPipeline}>Add Pipeline</Button>

        {nodeData && (
            <Box>

            {nodeType === 'node' && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ mt: 0, mb: 0 }} variant="h6">Node {selectedNode?.node?.name}</Typography>
                        <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                        </IconButton>
                    </Box>
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
                        {Object.entries(NetworkNodeTypes).map(([name, key]) => (
                            <MenuItem key={key} value={name}>
                            {name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <CoordinatesInput 
                        coordinates={[...nodeData?.coordinates].reverse()}
                        onChange={handleChange}
                    />
                </Box>
                
            )}
            <Box sx={{ display: 'flex', justifyContent: "space-around", marginTop: 0, paddingTop: 0 }}>
                <Button variant="outlined" onClick={handleClose} sx={{margin: 0}}>
                    Close
                </Button>

                <Button variant="contained" onClick={() => saveNodeChanges(nodeData)}>Save</Button>
            </Box>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
    </Box>
  );
}
