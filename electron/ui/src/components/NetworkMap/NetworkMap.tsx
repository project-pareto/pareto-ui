import './NetworkMap.css';
import React, { useState, useEffect, useRef } from "react";
import type { NetworkMapProps } from '../../types';
import type { LatLngBoundsExpression as LLBoundsExpr } from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { LatLngBoundsExpression, LatLngBounds, LatLng } from 'leaflet'
import { Box, Grid, Tabs, Tab, Button } from '@mui/material';
import type { CoordinateTuple } from '../../types';
import { Tooltip } from 'react-leaflet'
import {
    NetworkNodeTypes,
    formatCoordinatesFromNodes,
    convertMapDataToFrontendFormat,
    convertMapDataToBackendFormat
} from '../../assets/utils';
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
const PIPELINE_COLOR = "#A03232"


export default function NetworkMap(props: NetworkMapProps) {
    const { map_data, interactive = false, showMapTypeToggle = false, width = 100, height = 50 } = props;
    const {
        all_nodes: points,
        arcs: lines,
    } = map_data || {};
    const { 
        lineData,
        setLineData,
        nodeData,
        setNodeData,
        clickNode: handleClickNode,
        clickPipeline: handleClickPipeline,
        handleMapClick,
        creatingNewNode,
        selectedNode,
        setNetworkMapData,
    } = useMapValues();
    const [ googleMapType, setGoogleMapType ] = useState<string>('y')
    const [ mapCenter, setMapCenter ] = useState<[number, number]>([38, -98])
    const [ mapZoom, setMapZoom ] = useState<number>(5)
    const [ showMap, setShowMap ] = useState<boolean>(false)
    const [ mapBounds, setMapBounds ] = useState<LLBoundsExpr>(
        [// southwest, northeast
            [25.6866,-127.4969],
            [50.7207, -66.0633]
        ])


    function CustomCursorControl() {
        const map = useMap();

        useEffect(() => {
            let cursor = ""
            if (creatingNewNode) {
                const node_type = selectedNode?.node?.nodeType;
                const img_url = NetworkNodeTypes?.[node_type]?.iconUrl;
                if (img_url) {
                    const img = new Image();
                        img.onload = () => {
                        const iconWidth = img.width;
                        const iconHeight = img.height;
                        cursor = `url('${img_url}') ${iconWidth/2} ${iconHeight/2}, auto`;
                        container.style.cursor = cursor;
                    };
                    img.src = img_url;
                }
            }
            const container = map.getContainer();
            container.style.cursor = cursor;

            // Optional: restore on cleanup
            return () => {
            container.style.cursor = "";
            };
        }, [map, creatingNewNode, selectedNode]);

        return null; // This is just a behavior component
    }


    const markerRefs = useRef({});

    const styles: Record<string, React.CSSProperties> = {
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
            width: ${width}%;
            height: ${height}vh;
            z-index: 0;
        }
        .leaflet-interactive:focus {
            outline: none;
        }
    `

    function MapClickHandler({ onClick }: { onClick: (coords: CoordinateTuple) => void }) {
    useMapEvents({
        click(e) {
        const { lat, lng } = e.latlng; // coordinates
        onClick([lng, lat]);
        },
    });
    return null; // This component doesn't render anything visible
    }


    // NOTEWORTHY: MY COORDINATES ARE REVERSED FROM HOW LEAFLET WANTS THEM
    useEffect(() => {

        //try setting map bounds
        let bound1 = new LatLng(25.6866,-127.4969)
        let bound2 = new LatLng(50.7207, -66.0633)
        let bounds = new LatLngBounds(bound1, bound2)
        // console.log(bounds)

        const [tempNodeData, tempLineDatas, tempMapCenter] = 
            convertMapDataToFrontendFormat({
                all_nodes: points,
                arcs: lines
            })
        setLineData(tempLineDatas)
        setNodeData(tempNodeData.sort((a,b) => a.name.localeCompare(b.name)))
        setMapCenter(tempMapCenter)
        setMapZoom(11)
        setMapBounds(bounds)
        setShowMap(true)
        setNetworkMapData(map_data);

    }, [map_data])

    return (
        <Box sx={{ px: 4, pb: 5, pt: 3 }}>
            <style>{css}</style>
            <Grid container>
                <Grid item xs={6}>
                {showMapTypeToggle &&
                    <Box sx={{ p:1 }}>
                        <MapTypeToggle updateMapType={setGoogleMapType} style={styles.mapTypeToggle}/>
                    </Box>
                }
                
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={4}>
                    
                </Grid>
            </Grid>
            
            
            <Box>
                {showMap && 
                    <MapContainer {...({
                        center: mapCenter,
                        zoom: mapZoom,
                        maxBounds: mapBounds,
                        minZoom: 5,
                        scrollWheelZoom: interactive,
                        doubleClickZoom: interactive,
                        closePopupOnClick: interactive,
                        dragging: interactive,
                        zoomSnap: interactive,
                        zoomDelta: interactive,
                        zoomControl: interactive,
                        touchZoom: interactive,
                    } as any)}>
                        <CustomCursorControl/>
                    <TileLayer {...({
                        attribution: '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                        url: `https://{s}.google.com/vt/lyrs=${googleMapType}&hl=en&x={x}&y={y}&z={z}`,
                        subdomains: ['mt1','mt2','mt3']
                    } as any)} />
                    <MapClickHandler onClick={handleMapClick} />
        
                    {nodeData.map((value, index) => {
                        return (
                            <Marker
                                key={index}
                                position={[
                                    value.coordinates[1],
                                    value.coordinates[0]
                                ]}                        
                                {...({ icon: NetworkNodeTypes[value.nodeType]?.icon } as any)}
                                // icon={icons[0]}
                                eventHandlers={{
                                    click: (e) => {
                                        e.originalEvent.stopPropagation();
                                        handleClickNode(value, index);
                                    }
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
                                pathOptions={{ 
                                    color: PIPELINE_COLOR,
                                    bubblingMouseEvents: false 
                                }}
                                positions={formatCoordinatesFromNodes(value.nodes)}
                                eventHandlers={{
                                    click: (e) => {
                                        handleClickPipeline(value, index);
                                    }
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