# Runtime API contracts

The first runtime migration checks scenario retrieval and the two queued edit
operations before responses enter scenario state. Backend routes and storage
remain unchanged. [Plan 1](plans/01-contracts-and-types.md) tracks the remaining
contract work.

## Migrated endpoints

| Service / endpoint | Decoded success | Additional checks |
| --- | --- | --- |
| `fetchScenarios` / `GET /get_scenario_list/` | `{data: Record<string, Scenario>}` | Each list key must match its scenario ID. |
| `fetchScenario` / `GET /get_scenario/{id}` | `Scenario` | Returned ID must match the requested ID. This also checks existing detail polling and launch-recovery reads. |
| `updateScenario` / `POST /update` | `{data: Scenario}` | Matching ID and a nonempty saved input revision. |
| `updateExcel` / `POST /update_excel` | `Scenario` | Matching ID and a nonempty saved input revision. |

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
every private saved scenario.

## Remaining endpoints

| Consumers / endpoints | Current boundary / next work |
| --- | --- |
| Readiness, validation, feasibility / `/scenario_readiness`, `/validate_scenario`, `/scenario_feasibility` | Native responses; move validation consumers and their recovery messages to the shared helper. |
| Fill, planning horizon, advance / `/fill_scenario_inputs`, `/planning_horizon`, `/advance_to_optimization_setup` | Native responses; decode preview versus saved-scenario results and preserve revision conflicts. |
| Launch / `/run_model` | Native scenario response or structured rejection; preserve run identity and uncertain-acknowledgement behavior when migrating. |
| Tasks / `/check_tasks/` | Native `{tasks: ScenarioId[]}` response; migrate before introducing a smaller run-status endpoint. |
| Copy, delete, upload, replacement, additional map | Native responses with different envelopes; migrate their list/scenario consumers. |
| Results, downloads, reports, diagrams | Results inside migrated scenario reads are checked; binary/download endpoints need their own response handling. |
| AI availability, settings, editing, diagnosis | Existing feature-specific handling; migrate without exposing credentials. |

The legacy `ApiResponse<T>` success/error intersection remains only for these
unmigrated native-fetch endpoints. Backend request/response schema adoption,
summary/detail separation, branded identities, run-status contracts, status
normalization, and broader strict checking remain planned.
