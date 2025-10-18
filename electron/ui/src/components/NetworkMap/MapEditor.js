import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, IconButton, MenuItem, Typography, Stack } from '@mui/material';
import { useMapValues } from '../../context/MapContext';
import { NetworkNodeTypes } from '../../assets/utils';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';

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
        nodeType,
        availableNodes
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
            paddingTop: 2,
            px: 2,
        },
        connections: {
            paddingTop: 8,
            paddingBottom: 16,
            fontWeight: "bold",
            fontSize: 20,
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

    const handleUpdateConnection = (name, idx) => {
        const node = availableNodes.find((node) => node.name === name);
        setNodeData(prev => {
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
        setNodeData(prev => {
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

            {nodeType === 'node' ? (
                <Stack>
                    <Stack justifyContent="space-between" alignItems="center" direction='row' sx={styles.stack}>
                        <Typography variant="h6">Node {_selectedNode?.node?.name}</Typography>
                        <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                        </IconButton>
                    </Stack>
                    <TextField
                        label="Name"
                        size='small'
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                        value={nodeData?.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <TextField
                        label="Node Type"
                        size='small'
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                        select
                        value={nodeData?.nodeType}
                        onChange={(e) => handleChange('nodeType', e.target.value)}
                        >
                        {Object.entries(NetworkNodeTypes).map(([key, v]) => {
                            return (
                                <MenuItem key={key} value={v.name}>
                                    <Stack direction='row' justifyContent='space-between'>
                                        <span>{v.displayName} </span>
                                        <NodeIcon src={v.iconUrl} alt={v.displayName} size={20}/>
                                    </Stack>
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
                
            ) : (
                <Stack>
                    <Stack justifyContent="space-between" alignItems="center" direction='row' sx={styles.stack}>
                        <Typography variant="h6">Pipeline {_selectedNode?.node?.name}</Typography>
                        <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                        </IconButton>
                    </Stack>
                    <TextField
                        label="Name"
                        size='small'
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                        value={nodeData?.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <Stack justifyContent={'space-between'} direction={'column'} style={styles.connections}>
                        <span >Connections</span>
                    </Stack>
                    {
                        nodeData?.nodes?.map((connectionNode, idx) => {
                            const name = connectionNode.name;
                            const incomingValue = connectionNode.incoming;
                            const outgoingValue = connectionNode.outgoing;
                            return (
                                <Stack direction="column" key={idx} spacing={1} sx={{marginBottom: 2}}>
                                    <Stack direction={'row'} spacing={1}>
                                        <TextField
                                            size='small'
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
                                    <IconButton onClick={() => handleRemoveConnection(connectionNode, idx)} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                    </Stack>
                                    
                                    <Stack direction="row" spacing={1} >
                                        <TextField
                                            label="Incoming"
                                            size='small'
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
                                            size='small'
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
                                    
                                </Stack>
                                
                            )
                            
                        })
                    }
                    <Button
                        startIcon={<AddCircleIcon/>}
                        onClick={() => handleUpdateConnection("")}
                        variant='contained'
                        sx={{marginBottom: 1}}
                    >
                        Add Connection
                    </Button>
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
        size='small'
        value={coordinates[0] ?? ''}
        onChange={handleLatChange}
        type="number"
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Longitude"
        size='small'
        value={coordinates[1] ?? ''}
        onChange={handleLongChange}
        type="number"
        variant="outlined"
        fullWidth
      />
    </Stack>
  );
}

const NodeIcon = ({ src, alt, size = 24 }) => {
  return (
    <Typography
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        ml: 1
      }}
    />
  );
};

