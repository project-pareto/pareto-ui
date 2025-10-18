import React, { createContext, useContext, useState } from "react";

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

    const addNode = (node) => {
        // setNetworkMapData((prev) => [...prev, { ...node, type: "node" }]);
    };

    const addPipeline = (pipeline) => {
        // setNetworkMapData((prev) => [...prev, { ...pipeline, type: "pipeline" }]);
    };

    const updateItem = (id, updatedData) => {
        // setNetworkMapData((prev) =>
        // prev.map((item) =>
        //     item.id === id ? { ...item, ...updatedData } : item
        // )
        // );
    };

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
        updateItem,
        clickNode,
        clickPipeline,
        saveNodeChanges,
        nodeData,
        setNodeData,
        lineData,
        setLineData,
        availableNodes: nodeData,
        nodeType: showNetworkNodePopup ? "node" : showNetworkPipelinePopup ? "pipeline" : null,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Custom hook
export const useMapValues = () => useContext(MapContext);