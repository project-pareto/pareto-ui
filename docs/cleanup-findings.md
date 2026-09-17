# Cleanup findings for review

These findings were recorded during the PR #116 cleanup. The fixes below include
that PR and the subsequent workbook compatibility adapters. No legacy fields or
runtime code candidates have been removed. See [saved scenario compatibility](v3-compatibility.md)
for the original audit, regression coverage, and decision to keep data version 3.

## Resolved in the compatibility follow-up

- Scenario ID `0` now receives the update route's editability/revision guards
  and input/map propagation. API regressions cover rejected writes and workbook
  persistence for accepted changes.
- Workshop SRA diagram lookup uses `workshop_SRA_input.png` and
  `workshop_SRA_output.png`, matching the assets. The regression enforces exact
  filename case even when the host filesystem is case-insensitive.
- Legacy Units worksheets are read as name/value metadata even when their
  headings differ from `INDEX` / `VALUE`. Recovery no longer produces tuple
  keys, and read-only access leaves saved files unchanged.
- Scalar `DesalinationSurrogate` and legacy `Units` dictionaries survive table
  saves and map edits. Desalination values are also written into fresh model
  workbooks; their original scalar JSON representation is retained on reload.

## Suspected bugs and inconsistencies

| Finding | Evidence and effect | Suggested follow-up |
| --- | --- | --- |
| Additional KML import reads different category keys | [kml_parser.py](../backend/app/internal/maps/kml_parser.py) reads `production_pads`, `completion_pads`, etc. from the old map, then returns `ProductionPads`, `CompletionsPads`, etc. The normal route subsequently rebuilds categories from `all_nodes`. | Test the additional-map route and direct parser behavior before consolidating aliases. The mismatch alone does not establish data loss on the normal route. |
| Importing the scenario handler initializes storage and changes working directory | [ScenarioHandler](../backend/app/internal/scenario_handler.py) constructs the global instance at import time; tests isolate storage and restore the directory explicitly. | Handle through startup/dependency extraction in [plan 4](plans/04-backend-services-and-runs.md), with packaged-app checks. |

## Fields to consider consolidating

These are review candidates, not a deletion list. Their current consumers still
matter, especially for saved scenarios and workbook export.

| Field(s) | Current role | Removal/consolidation prerequisite |
| --- | --- | --- |
| `optimization.pipelineCostCalculation` | Present in bundled older scenarios; current configuration reads `pipeline_cost`. | Decide how old settings should migrate and test that choice before removing the legacy spelling. |
| `df_parameters.Units` / `DesalinationSurrogate` | Scalar metadata present in older v3 scenarios; accepted by the shared contracts and preserved by workbook/map adapters. The former differs from the current canonical `data_input.units`. | Keep these compatibility representations until an explicit migration accounts for their consumers and saved data. Adapter support is not a reason to delete them. |
| `map_data.ProductionPads`, `SWDSites`, other facility dictionaries | Derived from `all_nodes` by `PreprocessMapData`; workbook writing reads them. | Make category views explicit at the export boundary before removing persisted copies. |
| `map_data.connections`, including `connection_metadata` | Derived from arc directions, lengths and diameters; used to populate workbook capacities/distances. | Ensure every consumer derives the same directed-edge values before dropping stored copies. Metadata is still needed today. |
| `node_type` and `nodeType` | Backend facility classification and frontend editor classification overlap; editor kind also uses `node_type`. | Define separate facility and editor node/pipeline contracts, then migrate conversions and saved data. |
| `coordinates` and `longitude`/`latitude`/`altitude` | KML/source properties can duplicate position. Editor/conversion paths mainly use `coordinates`. | Audit import/export consumers and preserve original source attributes before choosing a canonical stored position. |
| Legacy validation keys such as `missing_tables`, `check_for_missing_tables`, `check_for_minimum_required_tables`, `check_for_infeasibility` | Retained in the old frontend contract; current validation emits issues and separate model/feasibility evidence. | Inventory old scenario data and consumers; migrate to current evidence fields before deleting compatibility fields. |
| `incoming`, `outgoing`, `incoming_nodes` on arc references | Legacy importer topology fields coexist with the currently used `outgoing_nodes`. | Audit geometry and parser consumers before pruning. Preserve `outgoing_nodes` and `segment_coordinates`. |

`_node_renames` and `_changed_pipe_fields` are **active transient instructions**.
The scenario handler consumes/removes them during map propagation; deleting them
would break identifier preservation or map-versus-table ownership. Likewise,
`input_revision`, validation revision and result input revision identify different
versions of evidence and should not be merged into one field.

Unknown vendor/KML attributes and shapefile polygons are preserved source data.
They can support the [future AI import feature](plans/06-ai-map-interpretation.md)
and are not cleanup candidates merely because the current solver ignores them.

## Code candidates

- `classifyNode` in [util.py](../backend/app/internal/util.py) has a repeated
  `NetworkNode` branch. It also lacks an explicit `ExternalWaterSource` branch;
  review intended default classification before simplifying it.
- The commented example blocks in [excel_api.py](../backend/app/internal/workbooks/excel_api.py)
  and commented debug/legacy UI blocks could be removed after useful examples
  are accounted for in tests or documentation.
- `import_default_data` in [scenario_handler.py](../backend/app/internal/scenario_handler.py)
  looks for `v3_default`, while the checked-in default bundle is `v1_default`.
  Determine whether this path is still intended before removing the method or
  any of the bundled scenario/diagram assets.

## Typing that remains

The focused pass covers shared scenario/map/validation/AI contracts, core
scenario fetch/save/launch/polling responses, map form fields and context state.
Dynamic chart/KPI/comparison rows, remaining presentation props, some import
responses and geometry conversions still need narrower contracts. The editor
also shares one selection record between nodes and pipelines; splitting that
representation deserves its own caller migration.

TypeScript is still not globally strict, and typed fetch responses do not add
runtime JSON decoding. The Pydantic models are not installed on live routes.
Continue those migrations through [plan 1](plans/01-contracts-and-types.md) and
[plan 5](plans/05-type-and-component-cleanup.md), without replacing unresolved
shapes with unchecked casts or changing runtime behavior in this cleanup.
