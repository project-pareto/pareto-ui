import { useEffect, useState, type ChangeEvent } from 'react';
import { Box, Button, TextField, IconButton, MenuItem, Typography, Stack, Tooltip } from '@mui/material';
import { InputAdornment, InputLabel, Select, FormControl } from '@mui/material';
import { useMapValues } from '../../context/MapContext';
import type { CoordinateTuple, SelectedNodeState, MapEditorNode } from '../../types';
import { NetworkNodeTypes, checkIfNameIsUnique, useKeyDown } from '../../assets/utils';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import PopupModal from '../PopupModal/PopupModal';
import { NodeIcon } from './NodeIcon';
import FileUploadModal from '../FileUploadModal/FileUploadModal';

// Reuse shared types from MapContext: CoordinateTuple, SelectedNodeState, MapEditorNode

interface NameFieldProps {
    editingName: boolean;
    setEditingName: (value: boolean) => void;
    handleChange: (key: string, val: any) => void;
    nodeData?: MapEditorNode;
    isNode: boolean;
    styles: any;
    nameIsNotUnique: boolean;
}

interface CoordinatesInputProps {
    coordinates: CoordinateTuple;
    onChange: (key: string, val: CoordinateTuple) => void;
}

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

    const [editingName, setEditingName] = useState<boolean>(creatingNewNode);
    const [showDeleteWarning, setShowDeleteWarning] = useState<boolean>(false);
    const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
    const { node: nodeData, idx: nodeIdx } = (selectedNode as SelectedNodeState | null) || {};

    useEffect(() => {
        setEditingName(creatingNewNode);
    }, [creatingNewNode])
    
    const { 
        nodeType
    } = nodeData || {};
    const nodeTypes = Object.keys(NetworkNodeTypes);
    const nodeTypeMetaData = NetworkNodeTypes[nodeType];
    const additionalFields = nodeTypeMetaData?.additionalFields;
    const isNode = nodeTypes.includes(nodeType);
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

    const handleChange = (key: string, val: any) => {
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prev = { ...data.node } as Record<string, any>;
            const node = {
                ...prev,
                [key]: val,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
    };
    const handleClose = (): void => {
        setSelectedNode(null);
        setShowNetworkNode(false);
        setShowNetworkPipeline(false);
    }

    const getCoordinates = (n?: MapEditorNode): CoordinateTuple => {
        if (!n?.coordinates) return [0, 0];
        const coords = n.coordinates;
        // Ensure we return a proper tuple [lat, long] for the editor inputs
        const a = coords[0] as number | string;
        const b = coords[1] as number | string;
        return [a, b];
    };

    const handleUpdateConnection = (name: string, idx?: number | ""): void => {
        const connectionNode = availableNodes.find((node) => node.name === name);
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prev = { ...data.node } as MapEditorNode;
            const prevNodes = prev.nodes || [];
            const updatedNodeList = (idx === undefined || idx === "")
                ? [...prevNodes, { name: name, incoming: true, outgoing: true }]
                : prevNodes.map((n, i) => i === idx ? { ...n, name: name, coordinates: connectionNode?.coordinates } : n);
            const node = {
                ...prev,
                nodes: updatedNodeList,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
    };

    const handleRemoveConnection = (idx: number): void => {
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prevNode = { ...data.node } as MapEditorNode;
            const updatedNodeList = (prevNode.nodes || []).filter((_, i) => i !== idx);
            const node = {
                ...prevNode,
                nodes: updatedNodeList,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
    };

    const handleDelete = (): void => {
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

    const disableSave = (n?: MapEditorNode): boolean => {
        // Return true for conditions where we want to disable the ability to save
        let disable = false;
        if (!n?.name || nameIsNotUnique) return true;
        if (isNode) {
            // Ensure we have valid coordinates
            if (!n?.coordinates || n.coordinates.length !== 2) return true;
            // coerce to numbers for validation
            const long = Number(n.coordinates[0]);
            const lat = Number(n.coordinates[1]);
            if (Number.isNaN(lat) || Number.isNaN(long)) return true;
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

    const handleUpdatePipelineLength = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        if (!Number.isNaN(Number(value))) {
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

    const handleUpdatePipelineDiameter = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        if (!Number.isNaN(Number(value))) {
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

    const handleUpdateAdditionalField = (
        event: any,
        fieldKey: string
    ): void => {
        const value = event?.target?.value;
        if (!Number.isNaN(Number(value))) {
            setSelectedNode((data: SelectedNodeState | null) => {
                if (!data) return data;
                const prevNode = { ...data.node } as Record<string, any>;
                const node = {
                    ...prevNode,
                    [fieldKey]: Number(value),
                } as MapEditorNode;
                return {
                    ...data,
                    node,
                } as SelectedNodeState;
            });
        }
    };

    const handleUpdateOutgoingNodes = (value: string[], idx: number): void => {
        // TODO: Two directions we can go with this
        // Either, 
        // 1) a user can add any node to this nodes outgoing nodes, in which case we should add that additional node
        // as a connection if it is not already one, OR
        // 2) a user can only add other connection nodes as outgoing nodes.
        // FOR NOW: it seems that this should work. users just have to be smart about it and not create an impossible connection.
        setSelectedNode(data => {
            if (!data) return data;
            const prevNode = { ...data.node } as MapEditorNode;
            const updatedNodeList = (prevNode.nodes || []).map((n, i) => {
                if (i === idx) {
                    return {
                        ...n,
                        outgoing_nodes: value,
                    } as any;
                }
                return n;
            });

            const node = {
                ...prevNode,
                nodes: updatedNodeList,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
    }

    const handleClickUploadAnotherMap = (): void => {
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
                        value={nodeType}
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
                    {
                        additionalFields?.map((additionalField) => (
                            additionalField.type === "number" ? (
                                <TextField
                                    key={additionalField.key}
                                    label={additionalField?.displayName}
                                    size='small'
                                    value={nodeData[additionalField.key] || ''}
                                    onChange={(e) => handleUpdateAdditionalField(e, additionalField.key)}
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    sx={{marginBottom: 2}}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">{additionalField.units || ""}</InputAdornment>,
                                    }}
                                />
                            ) : additionalField.type === "boolean" && (
                                <Tooltip title={additionalField.tip || ""} key={additionalField.key} placement="right">
                                    <FormControl
                                        size="small"
                                        sx={{marginBottom: 2}}
                                    >
                                        <InputLabel>{additionalField?.displayName}</InputLabel>
                                        <Select
                                            label={additionalField?.displayName}
                                            name={additionalField.key}
                                            value={nodeData[additionalField.key] || 0}
                                            onChange={(e) => handleUpdateAdditionalField(e, additionalField.key)}
                                        >
                                            <MenuItem value={0}>{additionalField.booleanValues?.["false"] || "false"}</MenuItem>
                                            <MenuItem value={1}>{additionalField.booleanValues?.["true"] || "true"}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Tooltip>
                            )
                            // TODO: add functionality for other field types

                        ))
                    }
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
                                        <Tooltip title={pipelineConnectionIssues?.includes(name) ? 'Please select a valid node.' : ''}>
                                            <TextField
                                                size='small'
                                                label="Node"
                                                fullWidth
                                                select
                                                value={pipelineConnectionIssues?.includes(name) ? '' : name}
                                                error={pipelineConnectionIssues?.includes(name)}
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
                                            onChange={(e) => handleUpdateOutgoingNodes(e.target.value as unknown as string[], idx)}
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
                        onClick={() => handleUpdateConnection("", "")}
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

function NameField(props: NameFieldProps) {
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

function CoordinatesInput({ coordinates, onChange }: CoordinatesInputProps) {
  // coordinates: [lat, long]

    const handleLatChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newLat = event.target.value;
        onChange("coordinates", [coordinates[1], newLat]);
    };

    const handleLongChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newLong = event.target.value;
        onChange("coordinates", [newLong, coordinates[0]]);
    };

  return (
    <Stack spacing={2} sx={{pt: 1, pb: 2}}>
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
