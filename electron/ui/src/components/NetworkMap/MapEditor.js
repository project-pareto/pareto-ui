import { useEffect, useState } from 'react';
import { Box, Button, TextField, IconButton, MenuItem, Typography, Stack } from '@mui/material';
import { useMapValues } from '../../context/MapContext';
import { NetworkNodeTypes } from '../../assets/utils';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import { useKeyDown } from '../../assets/utils';

export default function MapEditor() {
    const {
        saveNodeChanges,
        setShowNetworkNode,
        setShowNetworkPipeline,
        selectedNode,
        setSelectedNode,
        addNode,
        addPipeline,
        availableNodes,
        creatingNewNode,
    } = useMapValues();

    const [editingName, setEditingName] = useState(creatingNewNode);
    const { node: nodeData } = selectedNode || {};

    useEffect(() => {
        setEditingName(creatingNewNode);
    }, [creatingNewNode])
    
    const nodeTypes = Object.keys(NetworkNodeTypes);
    const isNode = nodeTypes.includes(nodeData?.nodeType);

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
        },
        divider: {
            marginTop: 1,
            marginBottom: 2
        }
    }

    const handleChange = (key, val) => {
        setSelectedNode(data => {
            const prev = {...data.node};
            const node = {
                ...prev,
                [key]: val
            }
            return {
                ...data,
                node,
            }
        }
        )
    }
    const handleClose = () => {
        setSelectedNode(null);
        setShowNetworkNode(false);
        setShowNetworkPipeline(false);
    }

    const getCoordinates = (n) => {
        if (!n?.coordinates) return[0, 0];
        const coords = [...n?.coordinates];
        const reverseCoords = coords?.reverse()
        return reverseCoords;
    }

    // TODO: might have to move all of this updating to map context
    const handleUpdateConnection = (name, idx) => {
        const node = availableNodes.find((node) => node.name === name);
        setSelectedNode(data => {
            const prev = {...data.node};
            const updatedNodeList = idx === undefined
                ? [...prev.nodes, {name: name, incoming: true, outgoing: true}]
                : prev.nodes.map((n, i) =>
                    i === idx ? {...n, name: name, coordinates: node.coordinates} : n
                );
            const node = {
                ...prev,
                nodes: updatedNodeList,
            }
            return {
                ...data,
                node,
            };
        });
    }

    const handleUpdatePipelineDirection = (direction, value, idx) => {
        setSelectedNode(data => {
            const prevNode = {...data.node};
            const updatedNodeList = prevNode.nodes.map((n, i) =>
                    i === idx ? {...n, [direction]: value} : n
                );
            const node = {
                ...prevNode,
                nodes: updatedNodeList
            };
            return {
                ...data,
                node,
            }
        });

    }

    const handleRemoveConnection = (idx) => {
        setSelectedNode(data => {
            const prevNode = {...data.node};
            const updatedNodeList = prevNode.nodes.filter((_, i) => i !== idx);
            const node = {
                ...prevNode,
                nodes: updatedNodeList
            };
            return {
                ...data,
                node,
            }
        });
    }

    const nameFieldProps = {
        editingName,
        setEditingName,
        handleChange,
        nodeData,
        isNode,
        styles
    }

    const disableSave = (n) => {
        if (!n?.name) return true;
        if (isNode) {
            if (!n?.coordinates?.length === 2) return true;
            const [long, lat] = [...n.coordinates];
            if (isNaN(lat) || isNaN(long)) return true;
            if (lat > 90 || lat < -90 || long > 180 || long < -180) return true;
        }

        return false;
    }

    return (
        <Box sx={{ padding: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="h6">
            Map Editor
        </Typography>
        {nodeData ? (
            <Box>
                <NameField {...nameFieldProps}/>
                <Divider sx={styles.divider}/>
            {isNode ? (
                <Stack>
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
                
            ) : ( // This is a pipeline
                <Stack>
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
                                    <IconButton onClick={() => handleRemoveConnection(idx)} size="small">
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

                <Button
                    variant="contained"
                    onClick={() => saveNodeChanges(nodeData)}
                    disabled={disableSave(nodeData)}
                >
                    Save
                </Button>
            </Stack>
        </Box>
        ) : 
        
            <Stack direction='column' spacing={1}>
                <Button variant="contained" onClick={addNode}>Add Node</Button>
                <Button variant="contained" onClick={addPipeline}>Add Pipeline</Button>
            </Stack>
        }
        </Box>
    );
}

function NameField(props) {
    const { 
        editingName,
        setEditingName,
        handleChange,
        nodeData,
        isNode,
        styles
    } = props;

    useKeyDown("Enter", () => {
        if (editingName) {
            setEditingName(false);
        }
    }, undefined, undefined, undefined, true);
    return (
        <Stack justifyContent="space-between" alignItems="center" direction='row' sx={styles.stack}>
            {
                editingName ? (
                    <TextField
                        label="Name"
                        size='small'
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                        value={nodeData?.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                ) :
                (
                    <>
                        <Typography variant="h6">
                            {nodeData?.name}
                        </Typography>
                        <IconButton onClick={() => setEditingName(true)} size="small">
                            <EditIcon />
                        </IconButton>
                    </>
                )
            }
        </Stack>
    )
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

