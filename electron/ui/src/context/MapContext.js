import React, { createContext, useContext, useState } from "react";
import { reverseMapCoordinates } from "../assets/utils";

// Create the context
const MapContext = createContext();

// Provider component
export const MapProvider = ({ children, scenario }) => {

    const [ lineData, setLineData ] = useState([])
    const [ nodeData, setNodeData ] = useState([])
    const [networkMapData, setNetworkMapData] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showNetworkNode, setShowNetworkNode] = useState(false);
    const [showNetworkPipeline, setShowNetworkPipeline] = useState(false);
    const [creatingNewNode, setCreatingNewNode] = useState(false);

    const deselectActiveNode = () => {
        setSelectedNode(null);
        setShowNetworkNode(false);
        setShowNetworkPipeline(false);
    }

    const addNode = (node) => {
        const newNode = {
            node: {
                "name": "",
                "nodeType": networkMapData?.defaultNode || "NetworkNode",
                "coordinates": []
            },
            idx: nodeData?.length,
        }
        setSelectedNode(newNode);
        setShowNetworkNode(true);
        setCreatingNewNode(true);
        // setNetworkMapData((prev) => [...prev, { ...node, type: "node" }]);
    };

    const addPipeline = (pipeline) => {
        // setNetworkMapData((prev) => [...prev, { ...pipeline, type: "pipeline" }]);
    };

    const handleMapClick = (coords) => {
        if (creatingNewNode) {
            const nodeCoordinates = reverseMapCoordinates(coords);
            console.log("clicked coords");
            console.log(nodeCoordinates);
            // update selected node's coordinates
            if (showNetworkNode) { // if type node
                setSelectedNode(prev => {
                    const newNode = {
                        ...prev,
                        node: {
                            ...prev.node,
                            coordinates: nodeCoordinates,
                        },
                    }
                    console.log("making new coordinates for node")
                    console.log(newNode)
                    return newNode;
                    
                })
            } else if (showNetworkPipeline) { // if type pipeline

            }
        } else {
            deselectActiveNode();
        }
    }

    const clickNode = (node, idx) => {
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

    const saveNodeChanges = (updatedNode) => {
        const idx = selectedNode?.idx;
        let updateFunc;
        let nodeList;
        if (showNetworkNode) {
            updateFunc = setNodeData;
            nodeList = {...nodeData};
        }
        else if (showNetworkPipeline) {
            updateFunc = setLineData;
            nodeList = {...lineData};
        }
        if (creatingNewNode) {
            updateFunc(data => ([
                ...data,
                updatedNode,
            ]))
        }
        // TODO:make backend api call to update this
        else if (selectedNode) {
            updateFunc(data => {
                const updatedNodeList = [...data].map((n, i) =>
                    i === idx ? updatedNode : n
                );
                return updatedNodeList;
            })
        } else {
            console.error("No node selected, cannot save changes")
        }
        setCreatingNewNode(false);
        setSelectedNode(null);
        setShowNetworkNode(false);
        setShowNetworkPipeline(false);
    }

    const propagateChanges = (newSelectedNode) => {
        setSelectedNode(prev => ({
            ...prev,
            node: newSelectedNode,
        }))
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
        propagateChanges,
        nodeType: showNetworkNode ? "node" : showNetworkPipeline ? "pipeline" : null,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Custom hook
export const useMapValues = () => useContext(MapContext);