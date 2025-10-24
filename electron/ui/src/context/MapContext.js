import React, { createContext, useContext, useState } from "react";
import { reverseMapCoordinates, convertMapDataToBackendFormat, generateNewName } from "../assets/utils";
import { useApp } from '../AppContext';

// Create the context
const MapContext = createContext();

// Provider component
export const MapProvider = ({ children, scenario, handleUpdateScenario }) => {
    const { port } = useApp()
    const [ lineData, setLineData ] = useState([])
    const [ nodeData, setNodeData ] = useState([])
    const [networkMapData, setNetworkMapData] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showNetworkNode, setShowNetworkNode] = useState(false);
    const [showNetworkPipeline, setShowNetworkPipeline] = useState(false);
    const [creatingNewNode, setCreatingNewNode] = useState(false);
    const currentlyCreatingPipeline = showNetworkPipeline && selectedNode && creatingNewNode;
    const currentlyCreatingNode = showNetworkNode && selectedNode && creatingNewNode;
    const deselectActiveNode = () => {
        setSelectedNode(null);
        setShowNetworkNode(false);
        setShowNetworkPipeline(false);
        setCreatingNewNode();
    }

    const addNode = () => {
        const newNode = {
            node: {
                "name": generateNewName(nodeData, "Node"),
                "nodeType": networkMapData?.defaultNode || "NetworkNode",
                "coordinates": [],
            },
            idx: nodeData?.length,
        }
        setSelectedNode(newNode);
        setShowNetworkNode(true);
        setCreatingNewNode(true);
    };

    const addPipeline = () => {
        const newPipeline = {
            node: {
                name: generateNewName(lineData, "Pipeline"),
                nodes: []
            },
            idx: lineData?.length,
        }
        setSelectedNode(newPipeline);
        setShowNetworkPipeline(true);
        setCreatingNewNode(true);
    };

    const handleMapClick = (coords) => {
        if (creatingNewNode) {
            const nodeCoordinates = reverseMapCoordinates(coords);
            // update selected node's coordinates
            if (showNetworkNode) { // if type node
                const newSelectedNode = {
                    ...selectedNode,
                    node: {
                        ...selectedNode.node,
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

    const clickNode = (node, idx) => {
        // TODO: if currentlyCreatingPipeline, instead of selecting node, add it to pipeline
        // console.log(node)
        setCreatingNewNode(false);
        setSelectedNode({node: node, idx: idx});
        setShowNetworkNode(true);
        setShowNetworkPipeline(false);
    }

    const clickPipeline = (node, idx) => {
        // console.log(node)
        setCreatingNewNode(false);
        setSelectedNode({node: node, idx: idx});
        setShowNetworkPipeline(true);
        setShowNetworkNode(false);
    }

    const saveNodeChanges = (updatedNode, deselectAfterwards=true) => {
        const idx = selectedNode?.idx;
        let nodeList;
        let update;
        let updateKey;
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
        let backendUpdate;
        if (showNetworkNode) {
            backendUpdate = convertMapDataToBackendFormat(update);
        } else {
            backendUpdate = convertMapDataToBackendFormat(null, update);
        }
        const updatedScenario = {
            ...scenario,
            data_input: {
                ...scenario?.data_input,
                map_data: {
                    ...scenario?.data_input?.map_data,
                    [updateKey]: backendUpdate[updateKey],
                }
            }
        }

        handleUpdateScenario(updatedScenario)
        deselectActiveNode();
    }

    const deleteSelectedNode = () => {
        const idx = selectedNode?.idx;
        let updateKey;
        let backendUpdate;
        if (showNetworkNode) {
            const updatedList = [...nodeData]
            updatedList.splice(idx, 1);
            const formattedUpdate = convertMapDataToBackendFormat(updatedList);
            updateKey = "all_nodes";
            backendUpdate = formattedUpdate[updateKey];
        }
        else if (showNetworkPipeline) {
            const updatedList = [...lineData]
            updatedList.splice(idx, 1);
            const formattedUpdate = convertMapDataToBackendFormat(null, updatedList);
            updateKey = "arcs";
            backendUpdate = formattedUpdate[updateKey];
        }
        
        const updatedScenario = {
            ...scenario,
            data_input: {
                ...scenario?.data_input,
                map_data: {
                    ...scenario?.data_input?.map_data,
                    [updateKey]: backendUpdate,
                }
            }
        }

        handleUpdateScenario(updatedScenario)
        deselectActiveNode();
    }

    const value = {
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
        nodeType: showNetworkNode ? "node" : showNetworkPipeline ? "pipeline" : null,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Custom hook
export const useMapValues = () => useContext(MapContext);