export interface ScenarioSets {
  [setName: string]: string[];
}

export interface ScenarioParametersTable {
  // Extremely wide schema; keep flexible
  [key: string]: any;
}

export interface ScenarioParameters {
  [tableName: string]: ScenarioParametersTable;
}

export interface ScenarioNode {
  name?: string;
  Name?: string;
  nodeType?: string;
  node_type?: string;
  coordinates?: [number, number] | [string, string];
  incoming?: boolean;
  outgoing?: boolean;
  incoming_nodes?: string[];
  outgoing_nodes?: string[];
}

export interface ScenarioArcsEntry {
  name?: string;
  node_list?: string[];
  nodes?: ScenarioNode[];
  node_type?: string;
  length?: number | string;
}

export interface ScenarioMapData {
  ProductionPads?: Record<string, ScenarioNode>;
  CompletionsPads?: Record<string, ScenarioNode>;
  SWDSites?: Record<string, ScenarioNode>;
  StorageSites?: Record<string, ScenarioNode>;
  TreatmentSites?: Record<string, ScenarioNode>;
  NetworkNodes?: Record<string, ScenarioNode>;
  FreshwaterSources?: Record<string, ScenarioNode>;
  ReuseOptions?: Record<string, ScenarioNode | any>;
  all_nodes?: Record<string, ScenarioNode>;
  connections?: any;
  arcs?: Record<string, ScenarioArcsEntry>;
  polygons?: Record<string, any>;
  other_nodes?: Record<string, any>;
  defaultNode?: string;
  [key: string]: any;
}

export interface ScenarioDataInput {
  df_sets: ScenarioSets;
  df_parameters: ScenarioParameters;
  display_units: Record<string, string>;
  map_data: ScenarioMapData;
}

export interface ScenarioOptimization {
  objective: string;
  runtime: number;
  pipeline_cost: string;
  waterQuality: string | boolean;
  hydraulics: string | boolean;
  solver: string;
  build_units: string;
  optimalityGap: number;
  scale_model: boolean;
  [key: string]: any;
}

export interface ScenarioResults {
  status: string;
  data: Record<string, any>;
  terminationCondition?: string;
  [key: string]: any;
}

export interface ScenarioOverrideCategory {
  [index: string]: any;
}

export interface ScenarioOverrideValues {
  vb_y_overview_dict?: ScenarioOverrideCategory;
  v_F_Piped_dict?: ScenarioOverrideCategory;
  v_F_Sourced_dict?: ScenarioOverrideCategory;
  v_F_Trucked_dict?: ScenarioOverrideCategory;
  v_L_Storage_dict?: ScenarioOverrideCategory;
  v_L_PadStorage_dict?: ScenarioOverrideCategory;
  vb_y_Pipeline_dict?: ScenarioOverrideCategory;
  vb_y_Disposal_dict?: ScenarioOverrideCategory;
  vb_y_Storage_dict?: ScenarioOverrideCategory;
  vb_y_Treatment_dict?: ScenarioOverrideCategory;
  [key: string]: ScenarioOverrideCategory | undefined;
}

export interface Scenario {
  id: string | number;
  name: string;
  date: string;
  data_input: ScenarioDataInput;
  optimization: ScenarioOptimization;
  results: ScenarioResults;
  override_values: ScenarioOverrideValues;
  [key: string]: any;
}

export type ScenarioMap = Record<string, Scenario>;

export interface AppContextValue {
  port: number;
}

// Map / Editor related types
export type CoordinateTuple = [number | string, number | string];

export type MapEditorNode = {
  name?: string;
  nodeType?: string;
  coordinates?: CoordinateTuple;
  nodes?: Array<{
    name: string;
    coordinates?: CoordinateTuple;
    outgoing_nodes?: string[];
    [key: string]: any;
  }>;
  length?: number;
  diameter?: number;
  [key: string]: any;
};

export type SelectedNodeState = {
  node: MapEditorNode;
  idx: number;
};

export interface MapContextValue {
  networkMapData: any;
  setNetworkMapData: React.Dispatch<React.SetStateAction<any>>;
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
  deleteSelectedNode: () => void;
  currentlyCreatingPipeline: boolean;
  currentlyCreatingNode: boolean;
  handleFileUpload: (file: File, defaultNodeType?: string) => void;
  nodeType: "node" | "pipeline" | null;
}

export interface MapProviderProps {
  children: React.ReactNode;
  scenario?: Scenario | null;
  handleUpdateScenario: (updatedScenario: Scenario | null, setScenarioData?: boolean, skipBackendUpdate?: boolean) => void;
}

export interface LandingPageProps {
  navigateToScenarioList?: () => void;
  handleNewScenario?: (data: any) => void;
  scenarios?: Record<string, any>;
}

export interface ScenarioListProps {
  handleNewScenario: (data: any) => void;
  handleEditScenarioName: (newName: string, id: string | number, updateScenarioData?: boolean) => void;
  handleSelection: (id: string) => void;
  scenarios: Record<string, any>;
  deleteScenario: (id: string | number) => void;
  setScenarios: (scenarios: Record<string, any>) => void;
  setShowHeader: (show: boolean) => void;
  setCompareScenarioIndexes: (indexes: Array<string | number>) => void;
  setScenarioIndex: (index: string | number) => void;
}

export interface DashboardProps {
  scenarios: Record<string, any>;
  scenario: Scenario | null;
  navigateHome: () => void;
  updateScenario: (updatedScenario: any, setScenarioData?: boolean, skipBackendUpdate?: boolean) => void;
  updateAppState: (update: any, id?: string | number) => void;
  addTask: (id: string | number) => void;
  handleEditScenarioName: (newName: string, id: string | number, updateScenarioData?: boolean) => void;
  section: number;
  category: string;
  handleSetSection: (section: number) => void;
  handleSetCategory: (category: string) => void;
  appState: any;
  backgroundTasks: any[];
  syncScenarioData: (id?: string | number) => void;
  copyAndRunOptimization: (id: string | number) => void;
  handleUpdateExcel: (id: string | number, tableKey: string, updatedTable: any) => void;
}

export interface ModelResultsProps {
  category: string;
  scenario: Scenario;
  handleSetSection: (section: number) => void;
  handleEditInput?: (edited: boolean) => void;
  updateScenario: (updatedScenario: any) => void;
  appState?: any;
  syncScenarioData?: (id?: string | number) => void;
  scenarios?: Record<string, any>;
  handleSetCategory?: (category: string) => void;
}

export interface SankeyPlotProps {
  data: Record<string, any[]>;
  scenarioId: string | number;
  appState?: any;
}

export interface KPIDashboardProps {
  overviewData: any[];
  truckedData: any[];
  pipedData: any[];
  waterQualityData: any[];
  hydraulicsData?: any[];
}

export interface OptimizationProps {
  scenario: Scenario;
  updateScenario: (updatedScenario: any, setScenarioData?: boolean, skipBackendUpdate?: boolean) => void;
  disabled: boolean;
  setDisabled: (disabled: boolean) => void;
  handleRunModel: () => void;
  backgroundTasks: any[];
  category?: string;
}

export interface DataInputProps {
  scenario: Scenario;
  updateScenario: (updatedScenario: any) => void;
  category: string;
  handleSetCategory: (category: string) => void;
  syncScenarioData: (id?: string | number) => void;
  handleUpdateExcel: (id: string | number, tableKey: string, updatedTable: any) => void;
  handleEditInput: (edited: boolean) => void;
  edited: boolean;
}

export interface ScenarioCompareProps {
  scenarios: Record<string, Scenario>;
  compareScenarioIndexes: Array<string | number>;
  setCompareScenarioIndexes: (indexes: Array<string | number>) => void;
  setScenarioIndex: (index: string | number) => void;
}

export interface SubHeaderProps {
  scenarios: Record<string, Scenario>;
  compareScenarioIndexes: Array<string | number>;
  setCompareScenarioIndexes: (indexes: Array<string | number>) => void;
}

export interface ScenarioCompareInputProps {
  primaryScenario: Scenario;
  referenceScenario: Scenario;
  category: string;
  showSidebar: boolean;
  deltaDictionary: Record<string, string[]>;
}

export interface ScenarioCompareOverridesProps {
  primaryScenario: Scenario;
  referenceScenario: Scenario;
  category: string;
  showSidebar: boolean;
  overrides: Array<Record<string, any>>;
  deltaDictionary?: Record<string, string[]>;
}

export interface ScenarioCompareOutputProps {
  scenarios: Record<string, Scenario>;
  primaryScenarioIndex: string | number | null;
  referenceScenarioIndex: string | number | null;
  kpiDataPrimary?: Record<string, any> | null;
  kpiDataReference?: Record<string, any> | null;
  capexBarChartData?: any[] | null;
  opexBarChartData?: any[] | null;
  showSidebar?: boolean;
  compareCategory?: string;
  totalCapex?: number[];
  totalOpex?: number[];
}

