# Maintenance roadmap

This roadmap follows [PR #112](https://github.com/project-pareto/pareto-ui/pull/112),
merged on 11 September 2026. The map-to-optimization workflow is the working
baseline. The architectural stages below are **planned**. The bounded cleanup
foundation described next is implemented in the PR #116 working branch; it does
not complete those architectural stages.

For application usage, start with [From map file to optimization](scenario-completion.md).
For the safety net around future changes, see [Regression tests](regression-tests.md)
and [current validation behavior](scenario-validation.md).

## Cleanup foundation in PR #116

- Group backend modules by responsibility and standardize filenames; see the
  [organization guide and move table](backend-organization.md).
- Split shared frontend types by domain and type the core scenario API/context
  paths, map fields and completion data. Keep existing type import paths valid.
- Add Pydantic scenario/map/validation contracts and representative compatibility
  fixtures. Live request validation, response serialization and storage remain unchanged.
- Explain input preservation, revision ownership, fill previews, validation
  evidence, retry identity and credential boundaries in the code.
- Record [bugs, legacy fields and removal candidates](cleanup-findings.md) for
  review. The approved follow-up fixes ID-0 update guards and SRA asset casing;
  other findings and removals remain separate work.
- Keep storage version 3 and extend contracts for actual legacy payload shapes.
  The [compatibility audit](v3-compatibility.md) records two existing runtime
  blockers to repair before adopting schemas on live routes or removing fields.

## Priorities and implementation plans

Work in small PRs with usable intermediate states. Establish contracts first,
then reduce scenario state, make navigation explicit, separate backend
responsibilities, and broaden typing and component cleanup.

| Order | Work | Intended result | Status / dependency |
| --- | --- | --- | --- |
| 1 | [Core types and API contracts](plans/01-contracts-and-types.md) | Shared definitions for scenario IDs, input revisions, validation, errors, and optimization runs; typed API access. | Planned; start here. |
| 2 | [Scenario data and polling](plans/02-scenario-data-and-polling.md) | Load lightweight scenario summaries, fetch details on demand, preserve editing drafts, and poll small run-status responses. | Planned; uses stage 1 contracts. |
| 3 | [Navigation and workflow state](plans/03-navigation.md) | Scenario and view live in routes; editing and optimization have separate state models. Reload, back, and forward have predictable behavior. | Planned; uses stages 1–2. |
| 4 | [Backend services and optimization runs](plans/04-backend-services-and-runs.md) | Explicit persistence and model boundaries, smaller routers, durable run records, and honest restart handling. | Planned; extraction can begin after stage 1 alongside stages 2–3. |
| 5 | [Broader typing and component cleanup](plans/05-type-and-component-cleanup.md) | Stricter types and smaller components organized around the responsibilities established above. | Planned; incremental work can accompany every stage. |

## Future product feature

| Feature | Intended result | Status / dependency |
| --- | --- | --- |
| [AI-assisted industry map interpretation](plans/06-ai-map-interpretation.md) | Translate unfamiliar source metadata into reviewed scenario mappings and edits, with units, uncertainty and source traceability. | Planned; uses stage 1 contracts and stable import/preservation boundaries. Optional AI. |

This feature has a separate scope and acceptance plan. It does not require the
navigation or persistent-run redesign to be completed first.

## Scope of the maintenance stages

Additional API and service contracts in the stages are design targets. The
[current organization guide](backend-organization.md) identifies implemented modules. Each plan includes PR-sized steps, acceptance checks, and migration
constraints. A new state library, database, or job queue is not a prerequisite.

## Why these areas

- **Scenario data:** `ScenarioContext` loads full scenarios and also keeps the
  selected scenario, saved baselines, and editing drafts. The list and polling
  paths need far less data. Some duplication protects unsaved edits; retain that
  protection while clarifying ownership.
- **Types and contracts:** TypeScript is not in strict mode, and broad `any`
  values cross API, scenario, and navigation boundaries. Start where a mistaken
  shape or status can lose an edit or misreport an optimization.
- **Navigation:** Numeric sections, `appState`, categories, selection, and a
  generic `/scenario` route overlap. A URL should identify a scenario and view;
  it should not decide whether inputs are saved or a solver is running.
- **Backend:** Scenario persistence, workbook operations, model orchestration,
  and HTTP handling are intertwined. Existing focused validation, fill,
  diagnostics, and solver modules provide a foundation to build on.
- **Run lifecycle:** Active tasks live in memory and results live inside the
  scenario. Persistent run identity and history would make failures, retries,
  input provenance, and backend restarts easier to explain and recover from.

## Behavior every stage must preserve

- Map and workbook imports, exports, identifier-based input preservation, and
  the approved expansion defaults, units, and meaning of explicit zero.
- Ordered saves, retained drafts after failure, revision checks, and protection
  against late responses overwriting newer edits or changing scenario selection.
- Separate evidence for complete inputs, model construction, and solver-verified
  feasibility. A successfully built model is not proof of a feasible solution.
- Immediate preparation feedback, early launch acknowledgement, immutable run
  inputs, retry identity, prior results on rejected launch, and cleanup on failure.
- Optional AI that stays out of the way without configuration; remembered
  credentials must not appear in scenario responses, logs, or settings readback
  to the renderer.
- Browser and packaged Electron behavior, including Windows workbook replacement.

## Tracking and completion

Use **Planned → In progress → Complete**, with **Blocked** only when a specific
dependency prevents progress. When a stage begins, add its issue/PR links and
record any design decision that changes the plan. Mark it complete only when its
acceptance checks pass, its production callers have migrated, and superseded
paths can be removed. Update these documents in the implementation PRs.

Track response size, retained scenario data, and navigation/render behavior before
and after stage 2. Agree on representative workloads before choosing performance
targets. Add tests for meaningful guarantees and observed bugs; avoid coupling
tests to internal component structure.

Follow-up candidates include a fully automated map workflow in the browser,
independent browser fixtures pinned to known data, additional model modes and
solvers, and packaged desktop checks. Database replacement, server-push updates,
solver cancellation/resumption, and broad dependency upgrades need separate
evidence and plans; they should not enlarge the first cleanup PRs.
