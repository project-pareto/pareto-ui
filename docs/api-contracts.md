# Runtime API contracts

Runtime decoding checks scenario retrieval, queued edits, copy/delete/import,
completion/validation, optimization launch/tasks, and AI responses before consumers use them. Backend routes and storage
remain unchanged. [Plan 1](plans/01-contracts-and-types.md) tracks the remaining
contract work.

## Migrated endpoints

| Service / endpoint | Decoded success | Additional checks |
| --- | --- | --- |
| `fetchScenarios` / `GET /get_scenario_list/` | `{data: Record<string, Scenario>}` | Each list key must match its scenario ID. |
| `fetchScenario` / `GET /get_scenario/{id}` | `Scenario` | Returned ID must match the requested ID. This also checks existing detail polling and launch-recovery reads. |
| `updateScenario` / `POST /update` | `{data: Scenario}` | Matching ID and a nonempty saved input revision. |
| `updateExcel` / `POST /update_excel` | `Scenario` | Matching ID and a nonempty saved input revision. |
| `getScenarioReadiness`, `validateScenario`, `checkScenarioFeasibility` / `/scenario_readiness/{id}`, `/validate_scenario/{id}`, `/scenario_feasibility/{id}` | `ScenarioValidationResult` | Required revision, state, validity, issue/section arrays, counts, periods, and separate model/feasibility evidence. |
| `fillScenarioInputs` / `POST /fill_scenario_inputs/{id}` | Preview: `ScenarioFillPreview`; apply: `Scenario` | Preview revision/value match the request; per-table counts match the total. Apply requires the saved scenario ID/revision. |
| `savePlanningHorizon` / `POST /planning_horizon/{id}` | `Scenario` | Matching ID and a nonempty saved input revision. |
| `advanceToOptimizationSetup` / `POST /advance_to_optimization_setup/{id}` | `{data: Scenario}` | Matching ID and a nonempty saved input revision. |
| `runModel` / `POST /run_model` | `Scenario` | Matching scenario and run IDs, saved revision, and an active or terminal run status. Completed retries are valid acknowledgements. |
| `checkTasks` / `GET /check_tasks/` | `{tasks: number[]}` | Nonnegative integer scenario IDs, including zero. Malformed responses cannot release a running task. |
| `copyScenario` / `GET /copy/{id}/{name}` | `{scenarios: Record<string, Scenario>, new_id: number}` | New ID differs from the source; its record exists with a saved revision; list keys match record IDs. |
| `deleteScenario` / `POST /delete_scenario/` | `{data: Record<string, Scenario>}` | Valid list with the deleted ID absent. |
| `uploadScenario` / `POST /upload/{name}` | `Scenario` | Valid scenario with a nonempty saved revision. |
| `replaceExcelSheet`, `uploadAdditionalMap` / `/replace/{id}`, `/upload_additional_map/{id}` | `Scenario` | Matching requested ID and a nonempty saved revision. |
| `getAIAvailability` / `GET /ai_available` | `{available: boolean}` | A real boolean is required; malformed/error responses keep AI hidden and use the existing startup retry. |
| `getAISettings`, `saveAISettings`, `resetAISettings` / `GET`, `PUT`, `DELETE /ai_settings` | `AIBackendSettings` | Checked public metadata only; unknown fields are dropped. Browser-only settings add `can_remember: false` and `remembered: false`. |
| `requestAIDataUpdate` / `POST /request_ai_data_update/{id}` | `AIPromptResponse` | Checked input proposal and string notes, or an explicit application error. Legacy wrappers and error bodies are normalized. |
| `requestAIOptimizationDiagnosis` / `POST /request_ai_optimization_diagnosis/{id}` | `AIOptimizationDiagnosisResponse` | Success requires summary, cause/caution arrays, checked steps, and the backend's diagnosis timestamp. |

These functions return decoded data, not native `Response` objects. Their caller
does not call `.json()` or inspect `.ok`. Request IDs accept nonnegative safe
integers or canonical decimal route text, including `0` and `"0"`; blank,
fractional, negative, and ambiguous values are rejected before fetching.

The [request helper](../electron/ui/src/services/apiClient.ts) reads JSON as
`unknown`, checks HTTP status, then invokes the endpoint decoder. It throws
`ApiClientError` with a stable `code`, readable `message`, optional HTTP `status`,
and raw `detail: unknown`. Codes distinguish network failure, cancellation,
HTTP errors, conflicts, validation errors, missing records, invalid JSON,
invalid success payloads, and invalid request identities. Valid validation
evidence and FastAPI field errors are also exposed as checked `validation` and
`fieldErrors` properties. Malformed diagnostics do not conceal the HTTP error.

Existing error bodies include:

```json
{"detail": "Inputs changed. Reload the saved scenario before saving this table."}
{"detail": {"message": "Review scenario inputs.", "validation": {"valid": false, "error": "Fill capacity."}}}
{"detail": [{"loc": ["body", "id"], "msg": "Field required", "type": "missing"}]}
```

The helper makes one request and never retries mutations. A rejected or
malformed save acknowledgement retains the draft and blocks later queued edits
for that scenario. Reloading clears the failure only after a valid saved
scenario arrives; a response delayed past a new edit or navigation is ignored.
Initial loading and optimization polling retain their existing retry cadence.

Copy/delete failures are shown in the scenario list. Upload dialogs stay open
with their selected file and name after failure; while uploading, their controls
are disabled. Workbook replacement always releases its busy state after failure.
Scenario state changes only after a checked response. These operations do not
automatically retry: a lost acknowledgement may follow a completed backend write,
so reload the scenario list before repeating an uncertain creation or copy.
Multipart requests preserve the original `FormData` and let the browser set its
boundary. Names are encoded as path segments and map types as query parameters;
the existing backend route still cannot accept a slash in a scenario name.

Launch handling distinguishes explicit HTTP 4xx rejection from an uncertain
acknowledgement. A successful HTTP response with malformed JSON, the wrong run
ID, or an invalid run status is uncertain: recover by reading the saved scenario,
or retain the original run ID and snapshot for an explicit retry. The client does
not submit a second optimization automatically. Even an unreadable 4xx response
remains a known rejection; structured validation messages remain available.

Live validation requires evidence instead of accepting the partial metadata
allowed in older saved scenarios. An empty object cannot claim completion or
enable advance. Model construction, solver feasibility, and “not determined”
remain separate. Validation controls accept scenario ID zero. Responses arriving
after a scenario/input change are ignored by the validation dialog; obsolete
readiness errors and autofill previews likewise cannot affect the newer inputs.

## AI boundaries

The [AI decoders](../electron/ui/src/services/contracts/ai.ts) also check desktop
settings bridge results as `unknown`. Only declared public settings fields reach
the renderer's settings state; unexpected credential fields are dropped. The
desktop main process still owns protected storage and restoring keys. Browser
saves send only the key, base URL, and model, not desktop persistence preferences.
Failed or malformed saves/resets retain the form and its last checked availability.

AI can return application errors with HTTP 200. Fill's legacy `{error, detail}`
body and explicit `{status: "error", errorMessage}` bodies become checked error
results. A success requires usable input fields; invalid tables, map structures,
notes, or diagnosis steps never reach a success preview. Fill accepts either
direct input fields or a `data_input` wrapper, and the legacy `updatedNotes`
alias. Only recognized input fields are proposed for saving. Unrecognized
provider fields cannot replace source metadata already present in the scenario;
existing saved metadata remains intact when the proposal is merged.

Fill and diagnosis use the shared ID parser, including zero, and never retry
automatically. Duplicate submissions are blocked while pending. The client
records the originating scenario locally: another scenario cannot display/save
that fill proposal or refresh its own diagnosis from the response. Clearing a
result or unmounting prevents late responses from repopulating that client state.
Fill still requires explicit **Save Updates**; diagnosis is saved by the backend.
These are structural checks, not proof that generated inputs are valid or feasible.
The AI wire responses do not yet carry request/scenario revisions or run IDs;
server-side correlation with concurrent edits/runs remains future contract work.

## Compatibility and ownership

The [decoders](../electron/ui/src/services/contracts/scenario.ts) mirror the
frontend domain types explicitly. This stage does not generate them from the
Python models: those models allow omitted/defaulted and nullable fields that
are not yet consistently represented or consumed by the frontend. Generating
schemas alone would not resolve that difference. Keep mirrored definitions and
shared compatibility tests until backend route adoption establishes one
authoritative wire schema.

Decoding checks structure, not whether a scenario is complete or feasible. It
preserves the original object, extra source attributes, absent fields, empty
tables, null cells, numeric strings, blanks, explicit zero, legacy optimization
settings, and status spellings. `Units` and `DesalinationSurrogate` retain their
legacy scalar-dictionary form; ordinary parameter tables require array columns.
Map unit names and draft result tables may be absent. Failure-result metadata and AI step hints
can retain the nulls emitted by the backend. No storage migration or defaults
are applied.

[Client tests](../electron/ui/src/tests/apiclient.test.ts) exercise the same
[shared fixture](../electron/ui/src/tests/fixtures/scenario-contract.json) as
the [Python contracts](../backend/tests/test_payload_contracts.py), plus every
bundled legacy scenario. Save-queue tests use the production client with a fake
transport so malformed responses must pass through the real decoder. Initial
load tests cover retry and unmount behavior. The decoder/helper files have a
dedicated strict TypeScript check in CI; the rest of the application keeps its
existing compiler settings. These checks do not establish compatibility with
every private saved scenario. [Workflow contract tests](../electron/ui/src/tests/workflowcontracts.test.ts)
cover live validation, preview/apply, run identity, and task responses.
[Workflow UI tests](../electron/ui/src/tests/scenarioworkflow.test.tsx), autofill tests,
and optimization-start tests use the production decoder with a fake transport
to check malformed responses and delayed-request behavior.
[Collection/import tests](../electron/ui/src/tests/collectioncontracts.test.ts)
cover identity, saved revisions, response envelopes, multipart bodies and errors;
[upload dialog tests](../electron/ui/src/tests/fileupload.test.tsx) cover pending
submissions and explicit retry. Copy-and-run and delete provider tests ensure
invalid acknowledgements cannot launch a run or replace existing scenario state.
[AI contract tests](../electron/ui/src/tests/aicontracts.test.ts) check browser and
desktop settings, public metadata, legacy AI errors and input/diagnosis shapes.
[AI request tests](../electron/ui/src/tests/aiprompt.test.tsx) exercise the production
client through a fake transport, including scenario zero, duplicate requests,
navigation, cleared requests and malformed previews. Settings/availability tests
also use the production client and cover recovery without overwriting form edits.

## Remaining endpoints

| Consumers / endpoints | Current boundary / next work |
| --- | --- |
| Results, downloads, reports, diagrams | Results inside migrated scenario reads are checked; binary/download endpoints need their own response handling. |

The unused legacy `ApiResponse<T>` success/error intersection has been removed.
Backend request/response schema adoption,
summary/detail separation, branded identities, run-status contracts, status
normalization, and broader strict checking remain planned. Polling still retrieves
full scenarios; decoding task lists does not introduce a smaller run-status API.
