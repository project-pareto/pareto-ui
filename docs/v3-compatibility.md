# Saved scenario compatibility

## Decision

Keep `ScenarioHandler.VERSION = 3`. This cleanup needs no storage migration,
field removal, or rewrite of existing scenarios. The version controls both the
storage directory (`v3`) and database filtering; increasing it alone would hide
existing scenarios from the list, not make them compatible with a new format.

Keep legacy representations at the contract boundary:

- `df_parameters.Units` and `df_parameters.DesalinationSurrogate` can contain
  scalar dictionaries alongside ordinary column tables. The Pydantic contract
  permits those historical entries without accepting scalar columns in ordinary
  tables. Frontend table consumers use [getParameterTable](../electron/ui/src/parameterTables.ts)
  to distinguish arrays from metadata and keep the original draft reference.
- Aggregate map arc `length` can be text or a number. Individual segment
  `lengths` remain numeric arrays.
- Missing optional fields, unknown source attributes, numeric strings, blank
  cells, legacy settings, and saved results retain their existing representations.

The Pydantic models remain contract checks; they are not installed on live
routes or used to rewrite persistence. Removing duplicate or legacy keys remains
separate work in [cleanup findings](cleanup-findings.md).

## Verification on 15 September 2026

The compatibility check used a private snapshot of eight v3 scenarios dated
October 2025 through September 2026, with 70 associated storage files. Source
and snapshot SHA-256 hashes matched before testing. Each write operation ran
against its own disposable copy, using FastAPI's in-process test client; the
running application's data was never used as a test destination.

Both the current branch baseline (`ab3702a`) and the proposed changes were
checked against identical copies:

| Check | Result |
| --- | --- |
| Pydantic round trip of stored JSON | Improved from 5/8 to 8/8, preserving JSON values, scalar types, extra keys, and absent fields. |
| Scenario list/detail, readiness, rename, table save, map edit, and saved artifact retrieval | 45 operation cases: 36 succeeded in both versions; nine reproduced existing failures described below. No new failure or changed response/data result was found. Temporary diagram directory prefixes were excluded from response comparisons. |
| Saved artifacts | Input/output workbook downloads matched their stored bytes. Diagram paths resolved into the isolated copy. Artifact comparisons included workbook cell contents after successful saves. Read-only operations and rejected operations left the copy's stored bytes unchanged. |
| Automated regressions | 78 backend tests, including real CBC cases, and 68 frontend tests across 20 suites passed; TypeScript checking passed. |
| New runtime fixes | ID `0` receives revision/editability checks and workbook/map propagation. SRA diagram lookup uses the exact asset filename case. The new tests fail against the baseline and pass with the fixes. |

Private scenario files and audit reports are deliberately outside the repository.
The committed [synthetic fixture](../electron/ui/src/tests/fixtures/scenario-contract.json)
captures the legacy shapes for repeatable Python/TypeScript regression checks.
This verification does not rerun optimization on the eight saved scenarios,
exercise the full browser workflow, or establish compatibility with every older
workbook or packaged application.

## Existing failures to address separately

1. **Unit recovery can prevent an older scenario from loading.** One stored
   workbook produces tuple keys when `get_scenario` recovers missing units with
   `get_data`. JSON hashing in `input_revision` then fails. This blocks detail,
   readiness, rename, and edit operations for that scenario in both versions.
   Saved workbook/report downloads remain available. Add a fixture for the old
   Units worksheet layout and a read adapter before changing stored units.
2. **Scalar desalination metadata blocks input saves and map edits.** Two other
   scenarios load but fail when `write_inputs` treats `DesalinationSurrogate`
   values as columns, or `prune_removed_map_nodes` takes their length. The
   checked requests leave stored JSON and workbook bytes unchanged. Add a
   compatibility adapter that preserves this metadata through workbook and map
   operations; accepting it in the schema alone does not fix these runtime paths.

These failures predate this compatibility pass. Keep their repairs separate
from deleting legacy data or advancing the storage version.

## Future format changes

Before a change actually requires a new version, define its format difference,
test an explicit migration on copied scenarios and all referenced artifacts,
preserve originals, and provide a recovery path. A version bump alone is not a
migration. Until then, extend the v3 compatibility fixtures as additional real
legacy shapes are encountered.
