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

