# Packaged application memory investigation

The startup-only memory growth reported in September 2026 matches a recursive
Python resource-tracker launch in the frozen backend. Electron packages the
PyInstaller executable built from `backend/app/main.py`; development instead
runs Uvicorn through the normal Python interpreter.

## Evidence

Before the fix, `main.py` imported the routers, IDAES and Pyomo before calling
`multiprocessing.freeze_support()`. In the local Python 3.11 environment with
Pyomo 6.10.1, intercepting process creation while importing IDAES confirmed this
call sequence, without actually launching another process:

```text
pyomo.common.dependencies._finalize_multiprocessing
  multiprocessing.Lock
    multiprocessing.synchronize.SemLock
      multiprocessing.resource_tracker.register
        resource_tracker.ensure_running
          multiprocessing.util.spawnv_passfds
```

On macOS, the default spawn context requires a resource tracker for that lock.
In a PyInstaller application, the child runs the same bundled executable with
special arguments. The old entry point imported Pyomo again before dispatching
those arguments, allowing another tracker launch. Each additional process adds
memory even when the user takes no action. In development, the child runs the
normal Python interpreter and goes directly to the tracker code.

The screenshot shows memory pressure and substantial compressed memory, but its
visible process rows do not identify the backend. The user's failing artifact
and its dependency versions have not been inspected, so attribution of that
specific build remains an inference from the reproduced import path.

Two additional packaged-path defects compounded the risk:

- Electron appended all backend stdout/stderr to an unused `scriptOutput`
  string for the entire session.
- Its quit handler signalled only the immediate backend process. Descendants
  could survive, explaining how pressure could persist after quitting.

## Why this could start after PR #111

[PARETO PR #111](https://github.com/project-pareto/pareto-ui/pull/111) merged April
20, 2026. Its backend entry point already called `freeze_support()` too late.
The Python version, Electron requirement and that ordering have not changed
between that PR and the source investigated here.

[Pyomo PR #3957](https://github.com/Pyomo/pyomo/pull/3957), merged May 21, added
the multiprocessing lock during import. It shipped in
[Pyomo 6.10.1](https://github.com/Pyomo/pyomo/releases/tag/6.10.1) on June 4.
`backend/requirements.txt` leaves Pyomo unpinned, and the local environment has
6.10.1. This is a concrete candidate for a dependency update exposing an older
startup defect, without needing a recent PARETO UI PR to introduce it.

The `DEBUG - pip freeze` step in `app_build.yml` can establish whether a failing
CI build used 6.10.1 and a successful build used an earlier version. No last
known good artifact was available for that comparison. The parent PARETO
revision is pinned, but that does not lock its transitive dependencies.

## Relationship to the flowsheet processor fix

[Flowsheet processor PR #58](https://github.com/prommis/idaes-flowsheet-processor-ui/pull/58)
merged June 12. It deferred application/manager initialization, forced `fork`
where supported, explicitly exited the installer, and bounded frontend retries.
Its timing and multiprocessing changes fit the same class of problem.

Here, dispatching helpers before application imports is sufficient for the
identified recursion and follows
[PyInstaller's guidance](https://pyinstaller.org/en/stable/common-issues-and-pitfalls.html#when-to-call-multiprocessing-freeze-support).
There is no need to change the platform's multiprocessing start method or the
scenario manager's API. Forcing `fork` also has
[documented macOS thread-safety risks](https://docs.python.org/3/library/multiprocessing.html#contexts-and-start-methods).
The unused Electron extension-installer launcher was removed; the active build
workflow already bundles the solver extensions.

## Fix and verification

- `backend/app/main.py` calls `freeze_support()` before third-party imports.
- `electron/ui/public/backend-process.js` streams logs without an accumulated
  copy and owns the backend process lifecycle.
- On macOS/Linux, the backend gets a separate process group. Quit sends that
  group SIGTERM, allows three seconds for cleanup, then kills remaining group
  members even if the parent already exited.
- On Windows, quit waits for `taskkill /T /F`. These changes cover normal
  Electron quit; force-killing Electron bypasses its lifecycle callbacks.
- Electron completes normal quit only after backend cleanup.

The startup regression tests exercise PyInstaller's actual runtime hook in
fresh interpreters. Resource-tracker and spawn-worker invocations must exit
without importing FastAPI, IDAES, Pyomo or application code. Desktop tests
cover parent-first exit, missing processes, failed spawn, Windows tree
termination and waiting for cleanup before completing quit. Both suites are
included by the existing test workflow's discovery commands.

Run the focused checks with the repository's Conda environment active:

```bash
python -m unittest discover -s backend/tests -p 'test_frozen_startup.py'
node --test electron/tests/*.test.cjs
```

Local verification on September 21, 2026:

- All 99 backend tests and 10 desktop tests passed. Both new startup tests fail
  against the original entry point, before allowing application imports.
- Built a fresh macOS backend with the repository's `main.spec`, Python 3.11,
  PyInstaller 6.19.0 and Pyomo 6.10.1. Build artifacts and test data were isolated
  under `/tmp`; the existing local distribution was not overwritten.
- A direct frozen resource-tracker invocation, with PyInstaller's interpreter
  flags and an EOF pipe, exited successfully in 0.18 seconds without application
  initialization.
- Launched that executable through the new Electron backend controller and
  checked `/get_project_name`. During a 20-second idle sample, the process group
  stayed at two processes and approximately 220 MiB combined RSS. The harness
  enforced process-count and memory ceilings while monitoring startup.
- Stopping the controller left zero live processes in its process group.

This is a short check of the frozen backend and its controller, not a memory
profile of the full Electron UI or a Windows runtime test. Windows command and
quit behavior were tested with simulated process APIs. The backend build also
reported pre-existing missing optional/obsolete hidden-import warnings; it
completed and served requests successfully.

For release acceptance, rebuild both the Python executable and the Electron
bundle; an old installed app will still contain the old startup code. Open the
packaged app without taking actions and watch its backend descendants and
memory. A normal macOS startup can have one backend and one resource tracker;
their count should stabilize. Quit with Cmd+Q (closing the last window leaves
the app running on macOS), then verify those processes disappear. Repeat on
Windows and check that backend/solver descendants exit there too.
