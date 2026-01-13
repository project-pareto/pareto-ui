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

export interface AppState {
  section: number;
  category: Record<number, string | null>;
  [key: string]: any;
}

// Map / Editor related types
export type CoordinateTuple = [number | string, number | string];

export type MapEditorNode = {
  name?: string;
  node_type?: string; // node or path
  nodeType?: string; // type of node (NetworkNode, CompletionPad ...)
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

export interface NetworkDiagramProps {
  scenario: Scenario;
  type?: string;
  syncScenarioData?: (id?: string | number) => void;
  showMapTypeToggle?: boolean;
  interactive?: boolean;
  width?: number | string;
  height?: number | string;
  [key: string]: any;
}

export interface DataTableProps {
  section: 'input' | 'output' | 'compare';
  scenario: Scenario;
  data: Record<string, any>;
  category: string;
  updateScenario?: (updatedScenario: any) => void;
  setScenario?: (scenario: Scenario) => void;
  OVERRIDE_CATEGORIES?: string[];
  overrideValues?: any;
  setOverrideValues?: (v: any) => void;
  newInfrastructureOverrideRow?: boolean;
  setNewInfrastructureOverrideRow?: (b: boolean) => void;
  rowFilterSet?: Record<string, {checked: boolean; amt: number}>;
  columnFilterSet?: Record<string, {checked: boolean; amt: number}>;
  columnNodes: Record<string, boolean>;
  columnNodesMapping: string[];
  rowNodes: Record<string, boolean>;
  rowNodesMapping: string[];
  editDict?: Record<string, boolean>;
  setEditDict?: (d: Record<string, boolean>) => void;
  handleEditInput?: (edited: boolean) => void;
  setShowError?: (b: boolean) => void;
  
  [key: string]: any;
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

export interface FilterDropdownProps {
  option1: string;
  option2: string;
  width?: string | number;
  maxHeight?: string | number;
  handleFilter1?: (value: string) => void;
  handleFilter2?: (value: string) => void;
  filtered1?: string[];
  filtered2?: string[];
  total1?: string[];
  total2?: string[];
  isAllSelected1?: boolean;
  isAllSelected2?: boolean;
  handleArrowSelection?: (direction: 'up' | 'down') => void;
  columnFilterSet?: Record<string, {checked: boolean; amt: number}>;
  rowFilterSet?: Record<string, {checked: boolean; amt: number}>;
}

export interface WaterQualityFilterDropdownProps {
  width?: string | number;
  maxHeight?: string | number;
  isAllSelected?: boolean;
  filtered?: any[] | Record<string, boolean>;
  total?: any[];
  handleFilter?: (value: string) => void;
  filterSet?: string[];
}

export interface OverrideTableProps {
  category: string;
  data: Record<string, any[]>;
  columnNodes: Record<string, boolean>;
  columnNodesMapping: string[];
  scenario: Scenario;
  show: boolean;
  updateScenario?: (updatedScenario: any, setScenarioData?: boolean) => void;
  newInfrastructureOverrideRow?: boolean;
  setNewInfrastructureOverrideRow?: (b: boolean) => void;
  rowFilterSet?: Record<string, {checked: boolean; amt: number}>;
  columnFilterSet?: Record<string, {checked: boolean; amt: number}>;
  overrideValues?: any;
  setOverrideValues?: (v: any) => void;
}

export interface OverrideTableRowsProps {
  category: string;
  data: any[];
  columnNodes: Record<string, boolean>;
  columnNodesMapping: string[];
  scenario: Scenario;
  handleCheckOverride: (index: string, value: any) => void;
  handleInputOverrideValue: (event: any, number_value?: any) => void;
  newInfrastructureOverrideRow?: boolean;
  setNewInfrastructureOverrideRow?: (b: boolean) => void;
  addNewRow?: (newOverride: any, newRow: any) => void;
}

export interface NewOverrideRowProps {
  category: string;
  scenario: Scenario;
  handleCheckOverride: (index: string, value: any) => void;
  handleInputOverrideValue: (event: any, number_value?: any) => void;
  setNewInfrastructureOverrideRow: (b: boolean) => void;
  addNewRow: (newOverride: any, newRow: any) => void;
}

export interface ComparisonTableProps {
  scenarios: Record<string, Scenario> | Array<Scenario> | any;
  scenarioIndex: number | string;
  secondaryScenarioIndex: number | string;
}

export interface CustomChartProps {
  input?: boolean;
  data: any;
  category?: string;
  labelIndex?: number;
  xindex?: number;
  yindex?: number;
  width?: number;
  height?: number;
  showlegend?: boolean;
  title?: string;
  xaxis?: { titletext?: string };
  yaxis?: { titletext?: string };
  stackgroup?: boolean | string;
  waterQuality?: boolean;
  filterSet?: string[];
  chartType?: string;
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

export interface HeaderProps {
  showHeader: boolean;
  scenarios: Record<string, Scenario> | Array<Scenario> | any;
  index?: string | number | null;
  handleSelection: (id: string | number) => void;
  navigateHome?: () => void;
  [key: string]: any;
}

export interface SidebarProps {
  handleSetCategory?: (category: string) => void;
  scenario?: Scenario | any;
  section?: number;
  category?: string | null;
  inputDataEdited?: boolean;
  handleUpdateExcel?: (id: string | number, tableKey: string, updatedTable: any) => void;
  setInputDataEdited?: (b: boolean) => void;
  syncScenarioData?: (id?: string | number) => void;
  [key: string]: any;
}

export interface ModelCompletionBarProps {
  handleCloseFinishedOptimizationDialog: () => void;
  goToModelResults?: () => void;
  open?: boolean;
  [key: string]: any;
}

export interface PopupModalProps {
  open: boolean;
  handleClose: () => void;
  input?: boolean;
  text?: string | number;
  textLabel?: string;
  handleEditText?: (e: any) => void;
  handleSave?: () => void;
  buttonVariant?: any;
  buttonColor?: any;
  buttonText?: string;
  hasInput?: boolean;
  inputText?: string;
  showError?: boolean;
  errorText?: string;
  hasTwoButtons?: boolean;
  handleButtonTwoClick?: () => void;
  buttonTwoVariant?: any;
  buttonTwoColor?: any;
  buttonTwoText?: string;
  iconOne?: React.ReactNode;
  iconTwo?: React.ReactNode;
  width?: number;
  [key: string]: any;
}

export interface FileUploadModalProps {
  setShowFileModal: (show: boolean) => void;
  handleFileUpload: (file: File, defaultNodeType?: string, scenarioName?: string) => void;
  fileTypes?: string[];
  showNameInput?: boolean;
  showSampleFiles?: boolean;
  title?: string;
  buttonText?: string;
  [key: string]: any;
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

export interface NetworkMapProps {
  map_data: any;
  interactive?: boolean;
  showMapTypeToggle?: boolean;
  width?: number | string;
  height?: number | string;
  [key: string]: any;
}

export interface InputSummaryProps {
  scenario: Scenario;
  initialDisposalCapacity: Record<string, number[]>;
  initialTreatmentCapacity: Record<string, number[]>;
  completionsDemand: Record<string, number[]>;
  padRates: Record<string, number[]>;
  flowbackRates: Record<string, number[]>;
  updateScenario: (updatedScenario: any) => void;
  handleSetCategory: (category: string) => void;
  [key: string]: any;
}

export interface ScenarioCompareSidebarProps {
  category: string;
  setCategory: (category: string) => void;
  open: boolean;
  deltaDictionary: Record<string, Record<string, any>>;
  overrides: Array<Record<string, any>>;
  compareScenarioIndexes?: Array<string | number>;
  [key: string]: any;
}

