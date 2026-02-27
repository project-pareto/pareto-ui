import { useEffect, useState, type ChangeEvent } from 'react';
import { Box, Button, TextField, IconButton, MenuItem, Typography, Stack, Tooltip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { InputAdornment, InputLabel, Select, FormControl } from '@mui/material';
import { useMapValues } from '../../context/MapContext';
import type { CoordinateTuple, SelectedNodeState, MapEditorNode } from '../../types';
import { NetworkNodeTypes, checkIfNameIsUnique, useKeyDown, calculatePipelineSegmentLengths } from '../../util';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import Divider from '@mui/material/Divider';
import PopupModal from '../PopupModal/PopupModal';
import { NodeIcon } from './NodeIcon';
import FileUploadModal from '../FileUploadModal/FileUploadModal';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SwapVertIcon from '@mui/icons-material/SwapVert';

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

type FlowDirection = "down" | "up" | "bidirectional";

interface MapEditorProps {
    isExpanded?: boolean;
    PipelineDiameterValues?: {
        PipelineDiameters?: Array<string | number>;
        VALUE?: Array<string | number>;
    };
}

export default function MapEditor({ isExpanded = false, PipelineDiameterValues }: MapEditorProps) {
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
    const [editingSegmentLengthIdx, setEditingSegmentLengthIdx] = useState<number | null>(null);
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
    const pipelineDiameterIds = Array.isArray(PipelineDiameterValues?.PipelineDiameters) ? PipelineDiameterValues.PipelineDiameters : [];
    const pipelineDiameterDisplayValues = Array.isArray(PipelineDiameterValues?.VALUE) ? PipelineDiameterValues.VALUE : [];
    const pipelineDiameterOptions = pipelineDiameterIds.map((diameterId, idx) => ({
        value: String(diameterId),
        label: pipelineDiameterDisplayValues[idx] ?? diameterId,
    }));

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
        // Update pipeline connection
        // If no name is provided, this is a new connecting node being added
        // If idx is provided, we are updating a connection that is already present (prevNodes is the pipelines connecting nodes).
        const connectionNode = availableNodes.find((node) => node.name === name);
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prev = { ...data.node } as MapEditorNode;
            const prevNodes = prev.nodes || [];
            const updatedNodeList = (idx === undefined || idx === "")
                ? [...prevNodes, { name: name, incoming: true, outgoing: true }]
                : prevNodes.map((n, i) => i === idx ? { ...n, name: name, coordinates: connectionNode?.coordinates } : n);
            const lengths = calculatePipelineSegmentLengths(updatedNodeList);
            const node = {
                ...prev,
                nodes: updatedNodeList,
                lengths,
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
            const lengths = calculatePipelineSegmentLengths(updatedNodeList);
            const node = {
                ...prevNode,
                nodes: updatedNodeList,
                lengths,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
    };

    const getPipelineLengths = (n?: MapEditorNode): number[] => {
        const nodes = n?.nodes || [];
        const expectedLength = Math.max((nodes.length || 0) - 1, 0);
        const calculatedLengths = calculatePipelineSegmentLengths(nodes);
        const existingLengths = Array.isArray(n?.lengths) ? n.lengths : [];

        return Array.from({ length: expectedLength }, (_, idx) => {
            const existing = Number(existingLengths[idx]);
            if (!Number.isNaN(existing) && Number.isFinite(existing) && existing >= 0) return existing;
            const calculated = Number(calculatedLengths[idx]);
            if (!Number.isNaN(calculated) && Number.isFinite(calculated) && calculated >= 0) return calculated;
            return 0;
        });
    };

    const handleUpdateSegmentLength = (segmentIdx: number, value: string): void => {
        const parsed = Number(value);
        if (value !== "" && (Number.isNaN(parsed) || parsed < 0)) return;

        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prevNode = { ...data.node } as MapEditorNode;
            const lengths = [...getPipelineLengths(prevNode)];
            if (segmentIdx < 0 || segmentIdx >= lengths.length) return data;
            lengths[segmentIdx] = value === "" ? 0 : parsed;
            const node = {
                ...prevNode,
                lengths,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
    };

    const handleResetSegmentLength = (segmentIdx: number): void => {
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prevNode = { ...data.node } as MapEditorNode;
            const lengths = [...getPipelineLengths(prevNode)];
            if (segmentIdx < 0 || segmentIdx >= lengths.length) return data;

            const calculatedLengths = calculatePipelineSegmentLengths(prevNode.nodes || []);
            const calculated = Number(calculatedLengths[segmentIdx]);
            lengths[segmentIdx] = (!Number.isNaN(calculated) && Number.isFinite(calculated) && calculated >= 0) ? calculated : 0;

            const node = {
                ...prevNode,
                lengths,
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

    const getSelectedPipelineDiameter = (diameter?: string | number): string => {
        if (diameter === undefined || diameter === null || diameter === "") return "";
        const raw = String(diameter);
        if (pipelineDiameterOptions.some((option) => option.value === raw)) return raw;
        const byDisplayedValue = pipelineDiameterOptions.find((option) => String(option.label) === raw);
        return byDisplayedValue?.value || "";
    };

    const handleUpdatePipelineDiameter = (value: string): void => {
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prevNode = { ...data.node } as MapEditorNode;
            const node = {
                ...prevNode,
                diameter: value,
            } as MapEditorNode;
            return {
                ...data,
                node,
            } as SelectedNodeState;
        });
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

    const hasFlowBetweenNodes = (nodes: MapEditorNode["nodes"] = [], fromIdx: number, toIdx: number): boolean => {
        const fromNode = nodes?.[fromIdx];
        const toNode = nodes?.[toIdx];
        if (!fromNode?.name || !toNode?.name) return false;
        return (fromNode?.outgoing_nodes || []).includes(toNode.name);
    };

    const getDirectionState = (nodes: MapEditorNode["nodes"] = [], idx: number): FlowDirection => {
        const nextNode = nodes?.[idx + 1];
        if (!nextNode?.name) return "down";
        const hasDownFlow = hasFlowBetweenNodes(nodes, idx, idx + 1);
        const hasUpFlow = hasFlowBetweenNodes(nodes, idx + 1, idx);
        if (hasDownFlow && hasUpFlow) return "bidirectional";
        if (hasUpFlow) return "up";
        return "down";
    };

    const setDirectedEdge = (
        nodes: MapEditorNode["nodes"] = [],
        fromIdx: number,
        toIdx: number,
        enabled: boolean
    ): MapEditorNode["nodes"][number] => {
        const source = nodes?.[fromIdx];
        const targetName = nodes?.[toIdx]?.name;
        if (!source?.name || !targetName) return source;
        const outgoing = Array.isArray(source.outgoing_nodes) ? source.outgoing_nodes : [];
        const alreadyIncludes = outgoing.includes(targetName);
        if ((enabled && alreadyIncludes) || (!enabled && !alreadyIncludes)) return source;
        return {
            ...source,
            outgoing_nodes: enabled ? [...outgoing, targetName] : outgoing.filter((item) => item !== targetName),
        };
    };

    const handleCycleFlowDirection = (idx: number): void => {
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prevNode = { ...data.node } as MapEditorNode;
            const prevNodes = prevNode.nodes || [];
            if (!prevNodes[idx]?.name || !prevNodes[idx + 1]?.name) return data;

            const currentDirection = getDirectionState(prevNodes, idx);
            const nextDirection: FlowDirection = currentDirection === "down"
                ? "up"
                : currentDirection === "up"
                    ? "bidirectional"
                    : "down";

            const updatedNodeList = prevNodes.map((n, i) => {
                if (i === idx) {
                    return setDirectedEdge(prevNodes, idx, idx + 1, nextDirection === "down" || nextDirection === "bidirectional");
                }
                if (i === idx + 1) {
                    return setDirectedEdge(prevNodes, idx + 1, idx, nextDirection === "up" || nextDirection === "bidirectional");
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
    };

    const handleClickUploadAnotherMap = (): void => {
        setShowFileUpload(true);
    }

    const segmentLengths = getPipelineLengths(nodeData);

    const getDirectionTooltip = (direction: FlowDirection, fromNode?: string, toNode?: string): string => {
        if (!fromNode || !toNode) return "Select adjacent nodes to set flow";
        if (direction === "down") return `One-way: ${fromNode} -> ${toNode}`;
        if (direction === "up") return `One-way: ${toNode} -> ${fromNode}`;
        return `Bidirectional: ${fromNode} <-> ${toNode}`;
    };

    const getDirectionIcon = (direction: FlowDirection) => {
        if (direction === "up") return <ArrowUpwardIcon fontSize="small" />;
        if (direction === "bidirectional") return <SwapVertIcon fontSize="small" />;
        return <ArrowDownwardIcon fontSize="small" />;
    };

    const getSegmentLengthDisplayValue = (idx: number): string | number => {
        const value = segmentLengths?.[idx];
        if (value === undefined || value === null || Number.isNaN(Number(value))) return 0;
        if (editingSegmentLengthIdx === idx) return value;
        return Number(value).toFixed(3);
    };

    return (
        <Box sx={{ padding: 2, borderTop: '1px solid #ccc' }}>
        <Box sx={{ borderBottom: '1px solid #d9dde3', pb: 0.5, mb: 1 }}>
            <Typography variant="h6">
                Map Editor
            </Typography>
        </Box>
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
                        <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
                            <InputLabel>{`Pipeline Diameter (${units?.diameter || "in"})`}</InputLabel>
                            <Select
                                value={getSelectedPipelineDiameter(nodeData?.diameter)}
                                label={`Pipeline Diameter (${units?.diameter || "in"})`}
                                onChange={(e) => handleUpdatePipelineDiameter(String(e.target.value))}
                            >
                                {pipelineDiameterOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <span>Connections</span>
                    </Stack>
                    <Box sx={{ border: "1px solid #d9dde3", borderRadius: 1, overflowX: "auto", overflowY: "hidden", mb: 1 }}>
                        <Table size="small" >
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f7f8fa" }}>
                                    <TableCell sx={{ width: "30%", fontWeight: 600 }} align='center'>Node</TableCell>
                                    <TableCell sx={{ width: "20%", fontWeight: 600}} align='center'>Flow</TableCell>
                                    <TableCell sx={{ width: "30%", fontWeight: 600, minWidth: "100px" }} align='center'>Length ({units?.distance || "mi"})</TableCell>
                                    <TableCell sx={{ width: "20%", fontWeight: 600 }} align='right'>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {nodeData?.nodes?.map((connectionNode, idx) => {
                                    const name = connectionNode.name;
                                    const nextNode = nodeData?.nodes?.[idx + 1];
                                    const isLastNode = idx >= (nodeData?.nodes?.length || 0) - 1;
                                    const canToggleFlow = Boolean(name && nextNode?.name);
                                    const directionState = getDirectionState(nodeData?.nodes || [], idx);

                                    return (
                                        <TableRow key={idx} hover>
                                            <TableCell sx={{ py: 0.75 }}>
                                                <Tooltip title={pipelineConnectionIssues?.includes(name) ? "Please select a valid node." : ""}>
                                                    <TextField
                                                        size='small'
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
                                            </TableCell>
                                            <TableCell sx={{ py: 0.75 }} align='center'>
                                                {!isLastNode ? (
                                                    <Tooltip title={getDirectionTooltip(directionState, name, nextNode?.name)} placement="top">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                disabled={!canToggleFlow}
                                                                onClick={() => handleCycleFlowDirection(idx)}
                                                                aria-label={`Cycle flow direction between ${name || 'node'} and ${nextNode?.name || 'node'}`}
                                                            >
                                                                {getDirectionIcon(directionState)}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 0.75 }}>
                                                {!isLastNode ? (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={getSegmentLengthDisplayValue(idx)}
                                                        onChange={(e) => handleUpdateSegmentLength(idx, e.target.value)}
                                                        onFocus={() => setEditingSegmentLengthIdx(idx)}
                                                        onBlur={() => setEditingSegmentLengthIdx(null)}
                                                        inputProps={{ min: 0, step: "0.001" }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 0.75, textAlign: "right" }}>
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0}>
                                                    {!isLastNode && (
                                                        <Tooltip title="reset length to auto-calculated distance" placement="left">
                                                            <IconButton onClick={() => handleResetSegmentLength(idx)} size="small">
                                                                <RefreshIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="remove node from pipeline" placement="left">
                                                        <IconButton onClick={() => handleRemoveConnection(idx)} size="small">
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                    {(nodeData?.nodes?.length || 0) < 2 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 1, width: "100%", alignSelf: "center" }}
                        >
                            You can add connections by selecting nodes on the map.
                        </Typography>
                    )}
                    <Button
                        startIcon={<AddCircleIcon/>}
                        onClick={() => handleUpdateConnection("", "")}
                        variant='contained'
                        sx={{ marginBottom: 1, width: "100%", maxWidth: "300px", alignSelf: "center" }}
                    >
                        Add Connection
                    </Button>
                </Stack>
            )}
            <Stack
                direction='row'
                justifyContent={'space-around'}
                sx={{
                    ...styles.stack,
                    ...(isExpanded ? { width: "100%", maxWidth: "360px", mx: "auto" } : {}),
                }}
                spacing={1}
            >
                <Button variant="outlined" onClick={handleClose} sx={isExpanded ? { minWidth: 96 } : undefined}>
                    Close
                </Button>
                <Button variant="outlined" color='error' onClick={() => setShowDeleteWarning(true)} sx={isExpanded ? { minWidth: 96 } : undefined}>
                    Delete
                </Button>
                <Button
                    variant="contained"
                    onClick={() => saveNodeChanges(nodeData)}
                    disabled={disableSave(nodeData)}
                    sx={isExpanded ? { minWidth: 96 } : undefined}
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
