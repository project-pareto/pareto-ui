import React, { createContext, useContext, useState } from "react";
import { reverseMapCoordinates, convertMapDataToBackendFormat, generateNewName } from "../assets/utils";
import { useApp } from '../AppContext';
import { uploadAdditionalMap } from "../services/app.service";
import type { Scenario } from "../types";
import type { CoordinateTuple, MapEditorNode, SelectedNodeState, MapContextValue, MapProviderProps } from "../types";

// Create the context
const MapContext = createContext<MapContextValue | undefined>(undefined);

// Provider component
export const MapProvider: React.FC<MapProviderProps> = ({ children, scenario, handleUpdateScenario }) => {
    const { port } = useApp();
    const [ lineData, setLineData ] = useState<MapEditorNode[]>([]);
    const [ nodeData, setNodeData ] = useState<MapEditorNode[]>([]);
    const [networkMapData, setNetworkMapData] = useState<any>([]);
    const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(null);
    const [showNetworkNode, setShowNetworkNode] = useState<boolean>(false);
    const [showNetworkPipeline, setShowNetworkPipeline] = useState<boolean>(false);
    const [creatingNewNode, setCreatingNewNode] = useState<boolean>(false);
    const currentlyCreatingPipeline: boolean = Boolean(showNetworkPipeline && selectedNode && creatingNewNode);
    const currentlyCreatingNode: boolean = Boolean(showNetworkNode && selectedNode && creatingNewNode);
    const deselectActiveNode = (): void => {
        setSelectedNode(null);
        setShowNetworkNode(false);
        setShowNetworkPipeline(false);
        setCreatingNewNode(false);
    }

    const addNode = (): void => {
        const newNode: SelectedNodeState = {
            node: {
                "name": generateNewName(nodeData, "Node"),
                "nodeType": networkMapData?.defaultNode || "NetworkNode",
                "coordinates": [0, 0] as CoordinateTuple,
                node_type: "node",
            },
            idx: nodeData?.length,
        }
        setSelectedNode(newNode);
        setShowNetworkNode(true);
        setCreatingNewNode(true);
    };

    const addPipeline = (): void => {
        const newPipeline: SelectedNodeState = {
            node: {
                name: generateNewName(lineData, "Pipeline"),
                nodes: [],
                node_type: "path"
            },
            idx: lineData?.length,
        }
        setSelectedNode(newPipeline);
        setShowNetworkPipeline(true);
        setCreatingNewNode(true);
    };

    const handleMapClick = (coords: CoordinateTuple): void => {
        if (creatingNewNode) {
            // If we are creating a new node, use the location on the map that is clicked to set the coordinates.
            const nodeCoordinates = reverseMapCoordinates(coords) as CoordinateTuple;
            if (showNetworkNode) { // if type node
                const newSelectedNode: SelectedNodeState = {
                    ...(selectedNode as SelectedNodeState),
                    node: {
                        ...(selectedNode as SelectedNodeState).node,
                        coordinates: nodeCoordinates,
                    },
                }
                setSelectedNode(newSelectedNode);
                saveNodeChanges(newSelectedNode.node, false)
            } else if (showNetworkPipeline) { // if type pipeline

            }
        } else {
            deselectActiveNode();
        }
    }

    const addPipelineConnection = (newConnectingNode: MapEditorNode): void => {
        setSelectedNode((data: SelectedNodeState | null) => {
            if (!data) return data;
            const prev = { ...data.node } as MapEditorNode;
            const prevNodes = prev.nodes || [];
            const updatedNodeList = [...prevNodes, { name: newConnectingNode.name, incoming: true, outgoing: true, coordinates: newConnectingNode.coordinates }]
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

    const clickNode = (node: MapEditorNode, idx: number): void => {
        // TODO: if currentlyCreatingPipeline, instead of selecting node, add it to pipeline
        // console.log(node)
        if (selectedNode?.node?.node_type === "path") {
            addPipelineConnection(node)
        } else {

            setCreatingNewNode(false);
            setSelectedNode({node, idx});
            setShowNetworkNode(true);
            setShowNetworkPipeline(false);
        }
    }

    const clickPipeline = (node: MapEditorNode, idx: number): void => {
        // console.log(node)
        setCreatingNewNode(false);
        setSelectedNode({node, idx});
        setShowNetworkPipeline(true);
        setShowNetworkNode(false);
    }

    const saveNodeChanges = (updatedNode: MapEditorNode, deselectAfterwards: boolean = true): void => {
        const idx = selectedNode?.idx;
        let nodeList: MapEditorNode[];
        let update: MapEditorNode[];
        let updateKey: "all_nodes" | "arcs" | undefined;
        if (showNetworkNode) {
            nodeList = [...nodeData];
            updateKey = "all_nodes";
        }
        else if (showNetworkPipeline) {
            nodeList = [...lineData];
            updateKey = "arcs";
        }
        if (creatingNewNode) {
            update = [
                ...nodeList,
                updatedNode
            ]
        }
        else if (selectedNode) {
            const updatedNodeList = [...nodeList].map((n, i) =>
                i === idx ? updatedNode : n
            );
            update = [
                ...updatedNodeList,
            ]
        } else {
            console.error("No node selected, cannot save changes")
            return;
        }
        let backendUpdate: any;
        if (showNetworkNode) {
            backendUpdate = convertMapDataToBackendFormat(update, undefined);
        } else {
            backendUpdate = convertMapDataToBackendFormat(null, update);
        }
        const updatedScenario: Scenario = {
            ...scenario,
            data_input: {
                ...scenario?.data_input,
                map_data: {
                    ...scenario?.data_input?.map_data,
                    [updateKey]: backendUpdate[updateKey],
                }
            }
        }

        handleUpdateScenario(updatedScenario, false, true)
        deselectActiveNode();
    }

    const deleteSelectedNode = (): void => {
        const idx = selectedNode?.idx;
        let updateKey: "all_nodes" | "arcs" | undefined;
        let backendUpdate: any;
        if (showNetworkNode) {
            const updatedList = [...nodeData];
            updatedList.splice(idx, 1);
            const formattedUpdate = convertMapDataToBackendFormat(updatedList, undefined);
            updateKey = "all_nodes";
            backendUpdate = formattedUpdate[updateKey];
        }
        else if (showNetworkPipeline) {
            const updatedList = [...lineData];
            updatedList.splice(idx, 1);
            const formattedUpdate = convertMapDataToBackendFormat(null, updatedList);
            updateKey = "arcs";
            backendUpdate = formattedUpdate[updateKey];
        }
        
        const updatedScenario: Scenario = {
            ...scenario,
            data_input: {
                ...scenario?.data_input,
                map_data: {
                    ...scenario?.data_input?.map_data,
                    [updateKey]: backendUpdate,
                }
            }
        }

        handleUpdateScenario(updatedScenario, false, true)
        deselectActiveNode();
    }

    const handleFileUpload = (file: File, defaultNodeType?: string): void => {
        const formData = new FormData();
        formData.append('file', file, file.name);

        uploadAdditionalMap(port, formData, scenario?.id, defaultNodeType)
        .then(response => {
        if (response.status === 200) {
            response.json()
            .then((data)=>{
                handleUpdateScenario(data)
            }).catch((err)=>{
                console.error(String(err))
                // setShowError(true)
            })
        }
        /*
            in the case of bad file type
        */
        else if (response.status === 400) {
            response.json()
            .then((data)=>{
                console.error("error on file upload: ",data.detail)
                // setErrorMessage(data.detail)
                // setShowError(true)
            }).catch((err)=>{
                console.error("error on file upload: ",err)
                // setErrorMessage(response.statusText)
                // setShowError(true)
            })
        }
        })
    }

    const value: MapContextValue = {
        networkMapData,
        setNetworkMapData,
        selectedNode,
        setSelectedNode,
        showNetworkNode,
        setShowNetworkNode,
        showNetworkPipeline,
        setShowNetworkPipeline,
        addNode,
        addPipeline,
        clickNode,
        clickPipeline,
        saveNodeChanges,
        nodeData,
        setNodeData,
        lineData,
        setLineData,
        handleMapClick,
        availableNodes: nodeData,
        creatingNewNode,
        deleteSelectedNode,
        currentlyCreatingPipeline,
        currentlyCreatingNode,
        handleFileUpload,
        nodeType: showNetworkNode ? "node" : showNetworkPipeline ? "pipeline" : null,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Custom hook
export const useMapValues = (): MapContextValue => {
    const ctx = useContext(MapContext);
    if (!ctx) {
        throw new Error("useMapValues must be used within a MapProvider");
    }
    return ctx;
};