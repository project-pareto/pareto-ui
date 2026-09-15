# Future feature: AI-assisted industry map interpretation

**Status:** Planned. **Dependency:** stable scenario/map/input contracts from
[plan 1](01-contracts-and-types.md) and the existing import/preservation workflow.
This is an optional product feature, separate from the maintenance stages in the
[roadmap](../roadmap.md). No AI parsing behavior is implemented by this cleanup.

## Problem and outcome

The current KML/KMZ and shapefile import workflow primarily turns geometry into
nodes and pipelines. Some source properties survive, but they are not generally
translated into scenario inputs. Real industry files may describe a disposal
capacity as `MAX_INJ`, label a facility as `SWD`, or put units in a separate column.
These are examples of possible source conventions, not universal mappings.

Help users translate unfamiliar metadata into reviewed scenario fields and
tables. The output should be a proposed mapping and an inspectable set of edits,
with unresolved questions called out. Existing deterministic import, validation
and optimization remain usable without AI configuration.

## Suggested workflow

1. **Inspect the source.** Use the existing geospatial libraries to read geometry,
   coordinate reference system, layer names, field names/types, attribute samples
   and KML ExtendedData where available. Preserve source feature identifiers and
   original values. Treat missing CRS or ambiguous units as questions for the user.
2. **Propose mappings.** Give the model the relevant scenario schema, table
   dimensions, descriptions, units and representative source metadata. Suggest
   facility classification, stable node identity, capacity, cost, water-quality,
   treatment and pipeline properties when supported by actual source evidence.
   Include forecast periods only when the source supplies a defensible time basis.
3. **Review uncertainty.** Show source layer/field/value alongside each proposed
   destination, unit conversion, rationale and confidence indication. Let users
   accept, edit or ignore mappings; leave missing or conflicting values unresolved.
   Model confidence is a review aid, not proof of correctness.
4. **Preview scenario changes.** Run accepted mappings through deterministic
   conversion and structural checks, then show affected nodes, tables and cells.
   Distinguish new values, replacements and unmapped attributes. Preserve existing
   inputs by identifier, including explicit zero, unless the user selects a replacement.
5. **Apply reviewed edits.** Use the existing save/revision mechanism, reject stale
   previews and retain a recoverable prior state. Run ordinary scenario validation
   afterward. Imported values do not establish a complete or feasible scenario.

## Proposed contracts and boundaries

- An **import inventory** records source file/layer/feature IDs, geometry references,
  attributes and declared units. Keep original source data separate from proposed edits.
- A **mapping proposal** identifies source fields and evidence, destination facility
  fields or indexed tables, conversion rules, unresolved questions and rejected options.
- An **edit preview** records the input revision, concrete before/after values and
  provenance for each accepted change. Preview and apply must use the same proposal.
- An **import record** links applied values to their source, reviewed mapping and
  schema/model versions. Keep credentials and unnecessary provider request data out
  of scenario records and logs.

Start with one representative industry dataset and a bounded subset of facility
classification, identity and scalar capacity/cost fields. Pipeline direction,
treatment streams, water-quality dimensions and time-series interpretation can
follow with their own annotated examples and acceptance checks. Do not infer a
flow direction from line point order or invent a unit, cost or missing forecast.

The AI adapter returns structured proposals that are validated before becoming
edits. Use an allowlist of writable destinations; source text is data, never an
instruction to execute code, run a solver or change application settings. Keep
geometry reprojection, arithmetic conversions and revision checks deterministic.
Reusable mapping templates may reduce future AI calls once a user approves a
specific vendor's format; templates should be versioned and reviewable.

## Configuration and data handling

Reuse the app's optional AI settings and provider availability behavior. Explain
what source metadata will be sent and obtain user consent before transmission;
industry files may contain sensitive infrastructure or commercial information.
Send the minimum useful schema/attribute samples and allow redaction. Specify
provider retention expectations and local-provider support before implementation.

Plan for cancellation, bounded request sizes/costs, timeouts, retries and malformed
responses. Provider failure must preserve both the original import and any pending
user edits. No API key belongs in a mapping template, scenario export or audit record.

## Acceptance checks

- Annotated, shareable fixtures cover inconsistent names, abbreviations, extra
  attributes, numeric strings, mixed units, duplicate names, missing units and
  contradictory metadata. Include both KML/KMZ and shapefile ZIP inputs.
- Suggested mappings are assessed against human-reviewed destinations, units and
  values. Track incorrect accepted suggestions and unresolved cases, not just
  how many fields the model attempts to fill. Agree on quality thresholds using
  the representative dataset before shipping.
- No unsupported field, invented input or unapproved overwrite reaches saved
  scenario data. Blank, missing, null and explicit zero retain their meanings.
- Changing the scenario after preview requires a new preview. Repeating an apply
  cannot duplicate imported facilities or silently replace an unrelated node.
- Every applied value is traceable to its source and the user's reviewed mapping.
  Sensitive samples and credentials stay out of ordinary logs and exports.
- Import still works with AI unavailable, declined or failing. Applying accepted
  changes preserves geometry, existing inputs and the map-to-optimization tests.

## Decisions before implementation

Choose the initial dataset and supported metadata fields, proposal/provenance
storage format, overwrite/undo experience, request-size limits and evaluation
thresholds. Confirm whether mapping templates belong to the user or scenario.
Keep autonomous scenario creation, unreviewed engineering assumptions and
automatic optimization outside the first version.
