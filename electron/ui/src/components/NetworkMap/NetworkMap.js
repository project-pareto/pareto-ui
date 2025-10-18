import './NetworkMap.css';
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { useMap } from 'react-leaflet/hooks'
import { LatLngBoundsExpression, LatLngBounds, LatLng } from 'leaflet'
// import MapLegend from './maplegend';
// import { kmz_data } from '../../assets/kmz_output';
// import CustomIcon from '../CustomIcon/CustomIcon';
import { Box, Grid, Tabs, Tab } from '@mui/material';
import { Tooltip } from 'react-leaflet/Tooltip'
import NetworkNodePopup from './NetworkNodePopup';
import NetworkPipelinePopup from './NetworkPipelinePopup';
import { NetworkNodeTypes, formatCoordinatesFromNodes } from '../../assets/utils';
import { useMapValues } from '../../context/MapContext';

// h = roads only
// m = standard roadmap
// p = terrain
// r = somehow altered roadmap
// s = satellite only
// t = terrain only
// y = hybrid
// ESRI map tile options: https://sites.google.com/a/blocoware.com/speedohelp/home/map-sources

// TILELAYER OPTIONS: https://leaflet-extras.github.io/leaflet-providers/preview/
// https://openmaptiles.org/styles/

const iconUrl = "http://maps.google.com/mapfiles/kml/"


export default function NetworkMap(props) {
    const { points, lines } = props;
    const { 
        lineData,
        setLineData,
        nodeData,
        setNodeData,
        clickNode: handleClickNode,
        clickPipeline: handleClickPipeline,
        // saveNodeChanges,
        // showNetworkNodePopup,
        // showNetworkPipelinePopup,
        // setShowNetworkNodePopup,
        // setShowNetworkPipelinePopup,
        // selectedNode,
        // setSelectedNode
    } = useMapValues();
    const [ googleMapType, setGoogleMapType ] = useState('y')
    const [ mapCenter, setMapCenter ] = useState([38, -98])
    const [ mapZoom, setMapZoom ] = useState(5)
    const [ showMap, setShowMap ] = useState(false)
    const [ mapBounds, setMapBounds ] = useState(
        [// southwest, northeast
            [25.6866,-127.4969],
            [50.7207, -66.0633]
        ])

    const markerRefs = useRef({});

    const styles = {
        legendBox: {
            paddingTop: 20, 
            paddingRight: 20, 
            position: 'absolute', 
            bottom: 25, 
            left: 25, 
            zIndex: 10000, 
            borderRadius: 8, 
            backgroundColor:'rgba(255,255,255,0.5)', 
            boxShadow:'0px 5px 10px 0px rgba(0, 0, 0, 0.5)'
        },
        mapTypeToggle: {
            paddingTop: 20, 
            paddingRight: 20, 
            borderRadius: 3, 
        }
    }

    const css = `
        .leaflet-container {
            width: ${props.width}%;
            height: ${props.height}vh;
            z-index: 0;
        }
    `

    // NOTEWORTHY: MY COORDINATES ARE REVERSED FROM HOW LEAFLET WANTS THEM
    useEffect(() => {
        //line color: #A03232

        //try setting map bounds
        let bound1 = new LatLng(25.6866,-127.4969)
        let bound2 = new LatLng(50.7207, -66.0633)
        let bounds = new LatLngBounds(bound1, bound2)
        // console.log(bounds)

        let tempLineDatas = []
        let tempNodeData = []
        
        let amt = 0
        let totalCoords = [0, 0]
        for (let key of Object.keys(points)) {
            let node_object = points[key]
            let styleUrl = node_object.styleUrl.replace('#','').replace('msn_','')
            let tempDataObject = {name: key, styleUrl: styleUrl}
            let coords = node_object.coordinates
            let coordinates = [parseFloat(coords[0]), parseFloat(coords[1])]
            let nodeType = node_object.node_type;
            if (nodeType && Object.keys(NetworkNodeTypes).includes(nodeType)) {
                // console.log("setting node_type to "+node_object.node_type)
                nodeType = node_object.node_type;
            } else {
                // console.log("node_type not found. using network node")
                nodeType = "NetworkNode"
            }
            tempDataObject.nodeType = nodeType
            tempDataObject.coordinates = coordinates
            tempNodeData.push(tempDataObject)

            amt+=1
            // console.log('adding to coordinates: ')
            // console.log(coordinates)
            totalCoords[0] += parseFloat(coords[0])
            totalCoords[1] += parseFloat(coords[1])
        }
        for (let key of Object.keys(lines)) {
            let line_object = lines[key]
            let tempLineObject = {
                name: key,
                color: "#A03232",
                node_list: line_object.node_list,
                nodes: line_object.nodes,
            }
            tempLineDatas.push(tempLineObject)
        }

        let tempMapCenter = [totalCoords[1]/amt, totalCoords[0]/amt]
        setLineData(tempLineDatas)
        setNodeData(tempNodeData.sort((a,b) => a.name.localeCompare(b.name)))
        setMapCenter(tempMapCenter)
        setMapZoom(11)
        setMapBounds(bounds)
        setShowMap(true)

    }, [])

    return (
        <Box sx={{ px: 4, pb: 5, pt: 3 }}>
            <style>{css}</style>
            <Grid container>
                <Grid item xs={6}>
                {props.showMapTypeToggle &&
                    <Box sx={{ p:1 }}>
                        <MapTypeToggle updateMapType={setGoogleMapType} style={styles.mapTypeToggle}/>
                    </Box>
                }
                
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={2}>
                    
                </Grid>
            </Grid>
            
            
            <Box>
                {showMap && 
                    <MapContainer 
                        center={mapCenter} 
                        zoom={mapZoom} 
                        maxBounds={mapBounds} 
                        minZoom={5}
                        scrollWheelZoom={props.interactive}
                        doubleClickZoom={props.interactive}
                        closePopupOnClick={props.interactive}
                        dragging={props.interactive}
                        zoomSnap={props.interactive}
                        zoomDelta={props.interactive}
                        zoomControl={props.interactive}
                        // trackResize={props.interactive}
                        touchZoom={props.interactive}
                    >
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url={`https://{s}.google.com/vt/lyrs=${googleMapType}&hl=en&x={x}&y={y}&z={z}`}
                        subdomains={['mt1','mt2','mt3']}
                    />
        
                        {nodeData.map((value, index) => {
                            return (
                                <Marker
                                    key={index}
                                    position={[
                                        value.coordinates[1],
                                        value.coordinates[0]
                                    ]}                        
                                    icon={NetworkNodeTypes[value.nodeType]?.icon}
                                    // icon={icons[0]}
                                    eventHandlers={{
                                        click: () => handleClickNode(value, index)
                                    }}
                                    ref={(el) => {
                                        const markerId = `node:${index}`
                                        if (el) {
                                            markerRefs.current[markerId] = el;
                                        }
                                    }}
                                >
                                    <Tooltip>{value.name}</Tooltip>
                                </Marker>
                            )
                        })}
        
        
                    {lineData.map((value, index) => {
                        return (
                            <Polyline
                                key={index}
                                pathOptions={{ color: value.color }}
                                positions={formatCoordinatesFromNodes(value.nodes)}
                                eventHandlers={{
                                    click: () => handleClickPipeline(value, index)
                                }}
                                ref={(el) => {
                                    const markerId = `line:${index}`
                                    if (el) {
                                        markerRefs.current[markerId] = el;
                                    }
                                }}
                            >
                                <Tooltip>
                                    {value.name}
                                </Tooltip>
                            </Polyline>
                        ) 
                        })}
                    </MapContainer>
                }
            </Box>
            {/* 
            {showNetworkPipelinePopup &&
                <NetworkPipelinePopup
                    pipeline={selectedNode?.node}
                    open={showNetworkPipelinePopup}
                    handleClose={() => {
                        setSelectedNode(null);
                        setShowNetworkPipelinePopup(false);
                    }}
                    availableNodes={nodeData}
                    handleSave={saveNodeChanges}
                />
            } */}
            
            
        </Box>
      );
}

function MapTypeToggle(props) {
    const { updateMapType, style } = props
    const [value, setValue] = useState(0);
    const mapTypes = ['y', 's', 'p', 'h']
    const handleChange = (event, newValue) => {
        setValue(newValue);
        updateMapType(mapTypes[newValue])
    };

    return (
        <Box style={style}>
        <Tabs
            onChange={handleChange}
            value={value}
            aria-label="Tabs where each tab needs to be selected manually"
        >
            <Tab label="Standard" />
            <Tab label="Satellite" />
            <Tab label="Hybrid" />
            <Tab label="Roads" />
        </Tabs>
        </Box>
    );
}