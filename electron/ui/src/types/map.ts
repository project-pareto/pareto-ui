import type React from 'react';
import type {Scenario} from './scenario';

/** Map units object */
export interface MapUnits {
  volume: string;
  distance: string;
  diameter: string;
  concentration: string;
  currency: string;
  time: string;
  pressure: string;
  elevation: string;
  decision_period: string;
  mass: string;

  [k: string]: string;
}

/** Coordinates stay in longitude/latitude order until converted for Leaflet.
 * KML retains strings and optional altitude; shapefiles and editor drafts may use numbers.
 */
export type CoordinateValue = number | string;
export type MapFieldValue = number | string | null;
export type MapCoordinates = CoordinateValue[];

/** Facility form values, including blanks/nulls before scenario completion. */
export interface MapFacilityFields {
  TreatmentTechnology?: string;
  Capacity?: MapFieldValue;
  PadWaterQuality?: MapFieldValue;
  PadStorageInitialWaterQuality?: MapFieldValue;
  StorageInitialWaterQuality?: MapFieldValue;
  ExternalWaterQuality?: MapFieldValue;
  InitialDisposalCapacity?: MapFieldValue;
  InitialStorageCapacity?: MapFieldValue;
  CompletionsPadStorage?: MapFieldValue;
  PadOffloadingCapacity?: MapFieldValue;
  NodeCapacities?: MapFieldValue;
  DisposalOperationalCost?: MapFieldValue;
  ReuseOperationalCost?: MapFieldValue;
  ExternalSourcingCost?: MapFieldValue;
  TruckingHourlyCost?: MapFieldValue;
  DesalinationSites?: MapFieldValue;
  BeneficialReuseCost?: MapFieldValue;
  BeneficialReuseCredit?: MapFieldValue;
  CompletionsPadOutsideSystem?: MapFieldValue;
  Elevation?: MapFieldValue;
  SWDDeep?: MapFieldValue;
  SWDAveragePressure?: MapFieldValue;
  SWDProxPAWell?: MapFieldValue;
  SWDProxInactiveWell?: MapFieldValue;
  SWDProxEQ?: MapFieldValue;
  SWDProxFault?: MapFieldValue;
  SWDProxHpOrLpWell?: MapFieldValue;
}

export interface MapNode extends MapFacilityFields {
  name?: string;
  longitude?: CoordinateValue;
  latitude?: CoordinateValue;
  altitude?: CoordinateValue;
  coordinates?: MapCoordinates;
  node_type: string;
  nodeType?: string;
  /** Preserve unrecognized source metadata; consumers must narrow it before use. */
  [key: string]: unknown;
}

/** A reference to a facility along a pipeline, not a separate facility record. */
export interface ArcNodeRef {
  name: string;
  incoming?: boolean;
  outgoing?: boolean;
  coordinates?: MapCoordinates;
  incoming_nodes?: string[];
  outgoing_nodes?: string[];
  /** Bends from this node to the next geometric node, retained across unchanged segments. */
  segment_coordinates?: MapCoordinates[];
  [key: string]: unknown;
}

export interface MapArc {
  name?: string;
  node_type?: string;
  coordinates?: MapCoordinates[];
  nodes?: ArcNodeRef[];
  lengths?: number[];
  length?: number;
  diameter?: CoordinateValue;
  [key: string]: unknown;
}

export type ConnectionsMap = Record<string, string[]>;

export interface ConnectionMetadata {
  pipeline_capacity?: MapFieldValue;
  pipeline_length?: MapFieldValue;
  pipeline_diameter?: MapFieldValue;
  [key: string]: unknown;
}

export interface MapConnections {
  all_connections: ConnectionsMap;
  /** Directed edge keys use "from::to". */
  connection_metadata?: Record<string, ConnectionMetadata>;
  [key: string]: unknown;
}

/** Imported maps may omit category views until workbook preprocessing rebuilds them. */
export interface MapData {
  all_nodes: Record<string, MapNode>;

  ProductionPads?: Record<string, MapNode>;
  CompletionsPads?: Record<string, MapNode>;
  NetworkNodes?: Record<string, MapNode>;
  SWDSites?: Record<string, MapNode>;
  TreatmentSites?: Record<string, MapNode>;
  StorageSites?: Record<string, MapNode>;
  ExternalWaterSources?: Record<string, MapNode>;
  ReuseOptions?: Record<string, MapNode>;
  other_nodes?: Record<string, MapNode>;

  connections: MapConnections;
  arcs: Record<string, MapArc>;

  units?: MapUnits;
  defaultNode?: string;
  time_periods?: string[];
  /** Transient rename instructions consumed by the backend before persistence. */
  _node_renames?: Record<string, string>;

  [k: string]: unknown;
}

// Map / Editor related types
export type CoordinateTuple = [number | string, number | string];

/** Editor records reuse facility values but distinguish UI kind from facility type. */
export interface MapEditorNode extends MapFacilityFields {
  name?: string;
  node_type?: string;
  nodeType?: string;
  coordinates?: MapCoordinates;
  lengths?: number[];
  nodes?: ArcNodeRef[];
  length?: number;
  diameter?: CoordinateValue;
  [key: string]: unknown;
}

/** The provider starts with an empty array before the first map is loaded. */
export type MapContextData = Partial<MapData> | ([] & {defaultNode?: never; units?: never});

export type SelectedNodeState = {
  node: MapEditorNode;
  idx: number;
};

export interface MapContextValue {
  networkMapData: MapContextData;
  setNetworkMapData: React.Dispatch<React.SetStateAction<MapContextData>>;
  selectedNode: SelectedNodeState | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<SelectedNodeState | null>>;
  showNetworkNode: boolean;
  setShowNetworkNode: React.Dispatch<React.SetStateAction<boolean>>;
  showNetworkPipeline: boolean;
  setShowNetworkPipeline: React.Dispatch<React.SetStateAction<boolean>>;
  addNode: () => void;
  addPipeline: () => void;
  clickNode: (node: MapEditorNode, idx: number) => void;
  clickPipeline: (node: MapEditorNode, idx: number) => void;
  saveNodeChanges: (updatedNode: MapEditorNode, deselectAfterwards?: boolean) => void;
  nodeData: MapEditorNode[];
  setNodeData: React.Dispatch<React.SetStateAction<MapEditorNode[]>>;
  lineData: MapEditorNode[];
  setLineData: React.Dispatch<React.SetStateAction<MapEditorNode[]>>;
  handleMapClick: (coords: CoordinateTuple) => void;
  availableNodes: MapEditorNode[];
  creatingNewNode: boolean;
  selectingPipelineConnectionFromMap: boolean;
  setSelectingPipelineConnectionFromMap: React.Dispatch<React.SetStateAction<boolean>>;
  pipelineConnectionSelectionIndex: number | null;
  setPipelineConnectionSelectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  deleteSelectedNode: () => void;
  currentlyCreatingPipeline: boolean;
  currentlyCreatingNode: boolean;
  handleFileUpload: (file: File, defaultNodeType?: string) => void;
  nodeType: "node" | "pipeline" | null;
}

export interface MapProviderProps {
  children: React.ReactNode;
  scenario?: Scenario | null;
  handleUpdateScenario: (updatedScenario: Scenario | null, setScenarioData?: boolean, propagateChanges?: string) => void;
}

export interface MapAdditionalField {
  key: keyof MapFacilityFields;
  displayName: string;
  type: 'number' | 'boolean' | 'dropdown' | 'dynamic_dropdown';
  defaultValue?: number | string | null;
  defaultOptions?: Array<number | string>;
  booleanValues?: {true: string; false: string};
  reliesOn?: keyof MapFacilityFields;
  usesKey?: 'TreatmentCapacityIncrements';
  units?: string;
  unit?: string;
  tip?: string;
}
