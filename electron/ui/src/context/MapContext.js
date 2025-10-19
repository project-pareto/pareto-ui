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
    const [showNetworkNodePopup, setShowNetworkNodePopup] = useState(false);
    const [showNetworkPipelinePopup, setShowNetworkPipelinePopup] = useState(false);

    const deselectActiveNode = () => {
        setSelectedNode(null);
        setShowNetworkNodePopup(false);
        setShowNetworkPipelinePopup(false);
    }

    const addNode = (node) => {
        // setNetworkMapData((prev) => [...prev, { ...node, type: "node" }]);
    };

    const addPipeline = (pipeline) => {
        // setNetworkMapData((prev) => [...prev, { ...pipeline, type: "pipeline" }]);
    };

    const handleMapClick = (coords) => {
        console.log("clicked coords")
        console.log(coords)
        const stringCoordinates = reverseMapCoordinates(coords);
        deselectActiveNode();
    }

    const clickNode = (node, idx) => {
        setSelectedNode({node: node, idx: idx});
        setShowNetworkNodePopup(true);
        setShowNetworkPipelinePopup(false);
    }

    const clickPipeline = (node, idx) => {
        console.log(node)
        setSelectedNode({node: node, idx: idx});
        setShowNetworkPipelinePopup(true);
        setShowNetworkNodePopup(false);
    }

    const saveNodeChanges = (updatedNode) => {
        const idx = selectedNode?.idx;
        // TODO:make backend api call to update this
        if (selectedNode) {
            if (showNetworkNodePopup) {
                setNodeData(data => {
                    const updatedNodeList = [...data].map((n, i) =>
                        i === idx ? updatedNode : n
                    );
                    return updatedNodeList;
                })
            }
            else if (showNetworkPipelinePopup) {
                setLineData(data => {
                    const updatedNodeList = [...data].map((n, i) =>
                        i === idx ? updatedNode : n
                    );
                    return updatedNodeList;
                })
            }
            setSelectedNode(null);
            setShowNetworkNodePopup(false);
            setShowNetworkPipelinePopup(false);
        } else {
            console.error("No node selected, cannot save changes")
        }
    }

    const value = {
        networkMapData,
        setNetworkMapData,
        selectedNode,
        setSelectedNode,
        showNetworkNodePopup,
        setShowNetworkNodePopup,
        showNetworkPipelinePopup,
        setShowNetworkPipelinePopup,
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
        nodeType: showNetworkNodePopup ? "node" : showNetworkPipelinePopup ? "pipeline" : null,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Custom hook
export const useMapValues = () => useContext(MapContext);