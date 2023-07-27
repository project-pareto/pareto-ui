export const INFRASTRUCTURE_CAPEX_MAPPING = {
    "Pipeline Construction": {
      "input_table": "PipelineDiameterValues",
      "variable_name": "vb_y_Pipeline_dict"
    },
    "Storage Facility": {
      "input_table": "StorageCapacityIncrements",
      "variable_name": "vb_y_Storage_dict"
    },
    "Disposal Facility": {
      "input_table": "DisposalCapacityIncrements",
      "variable_name": "vb_y_Disposal_dict"
    },
    "Treatment Facility": {
      "input_table": "TreatmentCapacityIncrements",
      "variable_name": "vb_y_Treatment_dict"
    }
}

export const VARIABLE_INDEXES = {
    "vb_y_overview_dict": [1,2,5],
    "v_F_Piped_dict": [0,1,2],
    "v_F_Sourced_dict": [0,1,2],
    "v_F_Trucked_dict": [0,1,2],
    "v_L_Storage_dict": [0,1],
    "v_L_PadStorage_dict": [0,1],
    "vb_y_Pipeline_dict": [0,1],
    "vb_y_Disposal_dict": [0,1],
    "vb_y_Storage_dict": [0,1],
    "vb_y_Treatment_dict": [0,1],
}