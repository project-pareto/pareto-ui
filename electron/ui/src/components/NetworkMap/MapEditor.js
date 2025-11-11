import { useEffect, useState } from 'react';
import { Box, Button, TextField, IconButton, MenuItem, Typography, Stack, Tooltip } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { useMapValues } from '../../context/MapContext';
import { NetworkNodeTypes, checkIfNameIsUnique } from '../../assets/utils';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import { useKeyDown } from '../../assets/utils';
import PopupModal from '../PopupModal/PopupModal';
import { NodeIcon } from './NodeIcon';
import FileUploadModal from '../FileUploadModal/FileUploadModal';

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
        deleteSelectedNode,
        nodeData: nodeList,
        lineData: lineList,
        networkMapData,
        handleFileUpload,
    } = useMapValues();
    const { units } = networkMapData || {};

    const [editingName, setEditingName] = useState(creatingNewNode);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const { node: nodeData, idx: nodeIdx } = selectedNode || {};

    useEffect(() => {
        setEditingName(creatingNewNode);
    }, [creatingNewNode])
    
    const nodeTypes = Object.keys(NetworkNodeTypes);
    const isNode = nodeTypes.includes(nodeData?.nodeType);
    const nameIsNotUnique = isNode ? 
        !checkIfNameIsUnique(nodeList, nodeData?.name, nodeIdx) : 
        !checkIfNameIsUnique(lineList, nodeData?.name, nodeIdx);
        
    // check if any pipeline nodes no longer exist (in the case they've been deleted)
    const pipelineConnectionIssues = isNode ? null : nodeData?.nodes?.map((c) => {
        const connectionNode = availableNodes.find((node) => node?.name === c?.name);
        if (!connectionNode) {
            return c.name;
        }
        return null;
    }).filter(Boolean);

    const styles = {
        buttonStyle: {
            margin: 2
        },
        stack: {
            paddingTop: 2,
        },
        pipelineTopStack: {
            paddingBottom: 16,
            fontWeight: "bold",
            fontSize: 20,
        },
        divider: {
            marginTop: 1,
            marginBottom: 2
        },
        name: {
            paddingTop: 2,
            px: 2,
        },
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

    const handleUpdateConnection = (name, idx) => {
        const connectionNode = availableNodes.find((node) => node.name === name);
        setSelectedNode(data => {
            const prev = {...data.node};
            const updatedNodeList = idx === undefined
                ? [...prev.nodes, {name: name, incoming: true, outgoing: true}]
                : prev.nodes.map((n, i) =>
                    i === idx ? {...n, name: name, coordinates: connectionNode.coordinates} : n
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

    const handleDelete = () => {
        setShowDeleteWarning(false);
        deleteSelectedNode();
    }

    const nameFieldProps = {
        editingName,
        setEditingName,
        handleChange,
        nodeData,
        isNode,
        styles,
        nameIsNotUnique
    }

    const disableSave = (n) => {
        // Return true for conditions where we want to disable the ability to save
        let disable = false;
        if (!n?.name || nameIsNotUnique) return true;
        if (isNode) {
            // Ensure we have valid coordinates
            if (!n?.coordinates?.length === 2) return true;
            const [long, lat] = [...n.coordinates];
            if (isNaN(lat) || isNaN(long)) return true;
            if (lat > 90 || lat < -90 || long > 180 || long < -180) return true;
        } else {
            const connectionsAmt = n.nodes?.length || 0;
            // Ensure we have at least 2 connecting nodes
            if (connectionsAmt < 2) return true;
            if (pipelineConnectionIssues?.length) return true;

            // Ensure each connection has a node
            n.nodes.forEach((connectingNode) => {
                if (!connectingNode?.name) {
                    disable = true;
                }
            })
        }

        return disable;
    }

    const handleUpdatePipelineLength = (event) => {
        const value = event.target.value;
        if (!isNaN(value)) {
            setSelectedNode(data => {
                const prevNode = {...data.node};
                const node = {
                    ...prevNode,
                    length: Number(value)
                };
                return {
                    ...data,
                    node,
                }
            });
        }
        
    }

    const handleUpdatePipelineDiameter = (event) => {
        const value = event.target.value;
        if (!isNaN(value)) {
            setSelectedNode(data => {
                const prevNode = {...data.node};
                const node = {
                    ...prevNode,
                    diameter: Number(value)
                };
                return {
                    ...data,
                    node,
                }
            });
        }
        
    }

    const handleUpdateOutgoingNodes = (value, idx) => {
        // TODO: Two directions we can go with this
        // Either, 
        // 1) a user can add any node to this nodes outgoing nodes, in which case we should add that additional node
        // as a connection if it is not already one, OR
        // 2) a user can only add other connection nodes as outgoing nodes.
        // FOR NOW: it seems that this should work. users just have to be smart about it and not create an impossible connection.
        setSelectedNode(data => {
            const prevNode = {...data.node};
            const updatedNodeList = prevNode.nodes.map((n, i) => {
                if (i === idx) {
                    return {
                        ...n,
                        outgoing_nodes: value
                    };
                }
                return n;
            });

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

    const handleClickUploadAnotherMap = () => {
        setShowFileUpload(true);
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
                    <Stack justifyContent={'space-between'} direction={'column'} style={styles.pipelineTopStack}>
                        <TextField
                            label="Pipeline Length"
                            size='small'
                            value={nodeData?.length || ''}
                            onChange={handleUpdatePipelineLength}
                            type="number"
                            variant="outlined"
                            fullWidth
                            sx={{marginBottom: 2}}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{units?.diameter || 'mi'}</InputAdornment>,
                            }}
                        />
                        <TextField
                            label="Pipeline Diameter"
                            size='small'
                            value={nodeData?.diameter || ''}
                            onChange={handleUpdatePipelineDiameter}
                            type="number"
                            variant="outlined"
                            fullWidth
                            sx={{marginBottom: 2}}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{units?.diameter || 'in'}</InputAdornment>,
                            }}
                        />
                        <span >Connections</span>
                    </Stack>
                    {
                        nodeData?.nodes?.map((connectionNode, idx) => {
                            const name = connectionNode.name;
                            return (
                                <Stack direction="column" key={idx} spacing={1} sx={{marginBottom: 2}}>
                                    <Stack direction={'row'} spacing={1}>
                                        <Tooltip title={pipelineConnectionIssues.includes(name) ? 'Please select a valid node.' : ''}>
                                            <TextField
                                                size='small'
                                                label="Node"
                                                fullWidth
                                                select
                                                value={pipelineConnectionIssues.includes(name) ? '' : name}
                                                error={pipelineConnectionIssues.includes(name)}
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
                                        </Tooltip>
                                    <Tooltip title="remove node from pipeline" placement="right">
                                        <IconButton onClick={() => handleRemoveConnection(idx)} size="small">
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                    </Stack>

                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            size="small"
                                            label="Transfers water to"
                                            fullWidth
                                            select
                                            value={connectionNode?.outgoing_nodes || []} // now an array of strings
                                            onChange={(e) => handleUpdateOutgoingNodes(e.target.value, idx)}
                                            SelectProps={{
                                                multiple: true,
                                                MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                    maxHeight: 200
                                                    }
                                                }
                                                }
                                            }}
                                            sx={{marginBottom: 1}}
                                            >
                                            {availableNodes?.map((node) => (
                                                <MenuItem key={node.name} value={node.name}>
                                                {node.name}
                                                </MenuItem>
                                            ))}
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
            <Stack direction='row' justifyContent='space-between' sx={styles.stack} spacing={1}>
                <Button variant="outlined" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="outlined" color='error' onClick={() => setShowDeleteWarning(true)}>
                    Delete
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
                <Button variant="contained" onClick={handleClickUploadAnotherMap}>Upload Another Map</Button>
                <Button variant="contained" onClick={addNode}>Add Node</Button>
                <Button variant="contained" onClick={addPipeline}>Add Pipeline</Button>
            </Stack>
        }
        <PopupModal
            hasTwoButtons
            open={showDeleteWarning}
            handleClose={() => setShowDeleteWarning(false)}
            handleSave={handleDelete}
            handleButtonTwoClick={() => setShowDeleteWarning(false)}
            text={`Are you sure you want to delete this ${isNode ? "node" : "pipeline"}?`}
            buttonText='Delete'
            buttonColor='error'
            buttonVariant='contained'
            buttonTwoText='Cancel'
            buttonTwoColor='primary'
            buttonTwoVariant='outlined'
            width={400}
        />
        {
            showFileUpload && (
                <FileUploadModal
                    title="Upload Map"
                    setShowFileModal={setShowFileUpload}
                    handleFileUpload={handleFileUpload}
                    fileTypes={["kmz", "kml", "zip"]}
                    showNameInput={false}
                    showSampleFiles={false}
                    buttonText="Upload"
                />
            )
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
        styles,
        nameIsNotUnique
    } = props;

    useKeyDown("Enter", () => {
        if (editingName) {
            setEditingName(false);
        }
    }, undefined, undefined, undefined, true);
    return (
        <Stack justifyContent="space-between" alignItems="center" direction='row' sx={styles.name}>
            {
                editingName ? (
                    <Tooltip title={nameIsNotUnique ? "Name must be unique" : ""}>
                        
                        <TextField
                            label="Name"
                            size='small'
                            fullWidth
                            sx={{ mt: 1, mb: 1 }}
                            value={nodeData?.name}
                            error={nameIsNotUnique}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </Tooltip>
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
