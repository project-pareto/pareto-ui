# Backend organization and payload contracts

This is the layout introduced by the cleanup in PR #116. Modules are grouped by
responsibility and use `snake_case` filenames. Existing functions, mutable
scenario dictionaries, storage locations, solver registration and HTTP routes
retain their behavior. The larger service redesign remains in
[plan 4](plans/04-backend-services-and-runs.md).

## Where code belongs

| Location under `backend/app/` | Responsibility |
| --- | --- |
| `routers/` | Existing HTTP endpoints, error responses and launch acknowledgement. |
| [schemas/](../backend/app/schemas/) | Pydantic descriptions of scenario, map and validation JSON. No storage, model creation or provider calls. |
| [internal/scenarios/](../backend/app/internal/scenarios/) | Canonical input tables, revisions, planning horizons, map/table synchronization and fill previews. |
| [internal/maps/](../backend/app/internal/maps/) | KML/KMZ and shapefile parsing. Preserve source attributes and geometry. |
| [internal/workbooks/](../backend/app/internal/workbooks/) | Workbook readers, map/JSON export and preservation by facility/period/option identity. |
| [internal/validation/](../backend/app/internal/validation/) | Input requirements, network capacity checks, issue help, model-build and feasibility evidence. |
| [internal/optimization/](../backend/app/internal/optimization/) | Strategic model execution, compatibility adjustments, solver interfaces and constraint diagnostics. |
| [internal/ai/](../backend/app/internal/ai/) | Optional client configuration and requests; credentials remain outside scenarios. |

`scenario_handler.py` still coordinates persistence and workflows. `util.py`
still contains shared geometry/configuration/prompt helpers. `settings.py`,
`get_extensions.py` and `download_binaries.py` remain with application setup.
Their extraction should follow the boundaries below, rather than changing their
lifetime during a filename cleanup. Assets remain in `internal/assets/`; the
workbook template lookup accounts for the deeper module directory.

Use explicit `app.internal.<package>.<module>` imports across these packages.
Package `__init__.py` files describe responsibility and do not import singletons
or initialize services. Existing parser/function names are retained; renaming
their public call sites can be a separate mechanical change.

## Module moves

Paths below are relative to `backend/app/internal/`.

| Previous module | Current module |
| --- | --- |
| `ExcelApi.py` | `workbooks/excel_api.py` |
| `get_data.py` | `workbooks/reader.py` |
| `workbook_preservation.py` | `workbooks/preservation.py` |
| `KMZParser.py` | `maps/kml_parser.py` |
| `ShapefileParser.py` | `maps/shapefile_parser.py` |
| `input_schema.py` | `scenarios/input_schema.py` |
| `scenario_inputs.py` | `scenarios/inputs.py` |
| `scenario_fill.py` | `scenarios/fill.py` |
| `scenario_validation.py` | `validation/scenario_validation.py` |
| `network_capacity.py` | `validation/network_capacity.py` |
| `validation_help.py` | `validation/help.py` |
| `pareto_stategic_model.py` | `optimization/strategic_model.py` |
| `model_compatibility.py` | `optimization/model_compatibility.py` |
| `model_diagnostics.py` | `optimization/model_diagnostics.py` |
| `solvers.py` | `optimization/solvers.py` |
| `ai_configuration.py` | `ai/configuration.py` |
| `openai_client_wrapper.py` | `ai/client.py` |

Application imports, dynamic imports and test patch targets use these paths.
External scripts importing the old internal paths need the same update. This
does not rename API fields, persisted data or the `pareto_cbc` solver identifier.

## Types and compatibility

| Domain | Python | TypeScript |
| --- | --- | --- |
| Scenarios, settings, overrides and results | [scenario.py](../backend/app/schemas/scenario.py) | [scenario.ts](../electron/ui/src/types/scenario.ts) |
| Nodes, pipeline references, geometry and connections | [map.py](../backend/app/schemas/map.py) | [map.ts](../electron/ui/src/types/map.ts) |
| Validation and constraint diagnostics | [validation.py](../backend/app/schemas/validation.py) | [validation.ts](../electron/ui/src/types/validation.ts) |
| Dynamic columns and result rows | Scalar/table aliases in `scenario.py` | [tables.ts](../electron/ui/src/types/tables.ts) |
| Current fetch request/response shapes | Existing routers | [api.ts](../electron/ui/src/types/api.ts) |

Frontend [types.ts](../electron/ui/src/types.ts) remains a type-only export entry
point. AI types live in `types/ai.ts`; presentation props live in
`types/components.ts`. Feature-local props can stay beside their component.

The Python models are contract groundwork, **not live request or response
validation**. Routes and persistence continue to use their existing dictionaries.
Do not add `response_model=Scenario`, change route annotations to these models,
or rewrite stored data through them as part of routine cleanup. Such changes can
reject old inputs or add/drop/coerce fields and need the migration in
[plan 1](plans/01-contracts-and-types.md).

For explicit contract checks, `Scenario.model_validate(payload).to_payload()`
retains extra fields and excludes defaults for absent fields. Strict scalar
validation avoids converting numeric strings and boolean settings. Explicit
nulls and empty strings remain distinguishable from missing values. This uses
Pydantic's [extra-field configuration](https://docs.pydantic.dev/latest/concepts/models/#extra-data)
and [serialization controls](https://docs.pydantic.dev/latest/concepts/serialization/).
It does not establish that scenario inputs are physically valid or feasible.

Keep these details visible when extending the contracts:

- Saved IDs are integers, including `0`; frontend route/selection IDs may be text.
- Map coordinates use longitude/latitude order and can include string altitude.
  The map display converts coordinates for Leaflet separately.
- Pipeline order represents geometry; `outgoing_nodes` represents directed flow.
- Workbook units use `decision period`; map form units use `decision_period`.
- Empty parameter tables, missing legacy fields and numeric strings are valid
  structural representations. Completion/validation interprets their meaning.
- Backend models allow unknown fields. TypeScript exposes imported extra fields
  as `unknown` so consumers must establish a type before using them.
- Persisted status spellings stay open for compatibility. Runtime status
  normalization and stricter frontend nullability remain planned.

The [shared fixture](../electron/ui/src/tests/fixtures/scenario-contract.json)
is checked by TypeScript and [Python compatibility tests](../backend/tests/test_payload_contracts.py).
Python also checks bundled older scenarios. These are representative checks,
not proof of compatibility with every private industry file. Update both sides
and the relevant fixtures when a payload contract changes.

The [runtime client migration](api-contracts.md) now checks scenario list/detail
responses and queued scenario/table saves using explicit frontend decoders.
It also covers completion/validation, autofill, planning periods, advance,
optimization launch, and task responses.
Backend route dictionaries still have the behavior described above. The decoder
tests include the shared fixture and bundled older scenarios; draft result tables
may be absent and failure-result metadata may be null.

## Next extractions

1. Move shared geometry helpers from `util.py` into `maps/geometry.py`, with
   KML/shapefile and bent/directed pipeline regression coverage.
2. Extract repository and artifact-path operations from `scenario_handler.py`;
   inject them at startup. Remove import-time directory/storage side effects as
   an explicit lifecycle change, covered by isolated-app tests.
3. Separate workbook import/export coordination from scenario mutation. Preserve
   identifier-based restoration, revision checks and Windows file lifetimes.
4. Extract optimization reservation and run services only after their contracts
   are defined. Keep snapshot capture under a short lock, workbook/model work in
   the worker, one build per run, and retry identity intact.

See [findings requiring review](cleanup-findings.md) before removing legacy
fields or code, and [regression tests](regression-tests.md) for verification.
