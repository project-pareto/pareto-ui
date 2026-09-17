// src/ScenarioContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, AppAction, Scenario, ScenarioMap, ValidationIssue, ParameterTable, ScenarioPropagation, OptimizationStart } from "../types";
import {
  updateScenario,
  updateExcel,
  fetchScenarios,
  fetchScenario,
  checkTasks,
  deleteScenario,
  copyScenario,
  runModel,
} from "../services/app.service";
import { useApp } from "../AppContext";
import {applyScenarioEdits, copyScenario as copyInputs, scenarioEdits, ScenarioEdit} from '../scenarioEdits';
import {ApiClientError} from '../services/apiClient';
import {COMPLETED_STATES, isRunStatus, RUNNING_STATES} from '../services/contracts/workflow';

type NavigateFn = (to: string, opts?: { replace?: boolean }) => void;

export type {OptimizationStart} from '../types/scenario';

const newRunId = () => Array.from(crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16).padStart(8, '0')).join('');

export interface ScenarioContextValue {
  // state
  scenarioData: Scenario | null;
  scenarios: ScenarioMap;
  appState: AppState | null;
  section: number;
  category: string | null;
  scenarioIndex: string | number | null;
  backgroundTasks: Array<string | number>;
  loadLandingPage: number;
  showCompletedOptimization: boolean;
  lastCompletedScenario: string | number | null;
  compareScenarioIndexes: Array<string | number>;
  isSaving: boolean;
  saveError: string | null;
  optimizationStart: OptimizationStart | null;
  isStartingOptimization: boolean;
  startOptimization: () => Promise<void>;
  retryOptimizationStart: () => Promise<void>;
  dismissOptimizationStart: () => void;
  acceptSavedScenario: (scenario: Scenario) => void;
  inputFocus: ValidationIssue | null;
  focusInputIssue: (issue: ValidationIssue) => void;

  // setters
  setScenarios: React.Dispatch<React.SetStateAction<ScenarioMap>>;
  setCompareScenarioIndexes: React.Dispatch<React.SetStateAction<Array<string | number>>>;
  setScenarioIndex: React.Dispatch<React.SetStateAction<string | number | null>>;

  // handlers
  navigateToScenarioList: () => void;
  handleScenarioSelection: (scenario: string | number) => void;
  handleNewScenario: (data: Scenario) => void;
  handleScenarioUpdate: (updatedScenario: Scenario, keepOptimized?: boolean, propagateChanges?: ScenarioPropagation) => Promise<boolean>;
  handleSetSection: (section: number) => void;
  handleSetCategory: (category: string) => void;
  handleEditScenarioName: (newName: string, id: string | number, updateScenarioData?: boolean) => void;
  handleDeleteScenario: (index: string | number) => Promise<void>;
  handleUpdateExcel: (id: string | number, tableKey: string, updatedTable: ParameterTable) => Promise<boolean>;
  syncScenarioData: () => void;
  addTask: (id: string | number) => void;
  updateAppState: (action: AppAction, index?: string | number) => void;
  copyAndRunOptimization: (newScenarioName: string) => void;

  // model completion bar
  goToModelResults: () => void;
  handleCloseFinishedOptimizationDialog: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | undefined>(undefined);

export const useScenario = (): ScenarioContextValue => {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within a ScenarioProvider");
  return ctx;
};

interface ScenarioProviderProps {
  children: React.ReactNode;
  navigate: NavigateFn; // pass in from App.tsx (keeps router dependency out of the provider)
}

export const ScenarioProvider: React.FC<ScenarioProviderProps> = ({ children, navigate }) => {
  const { port } = useApp();
  const [pendingSaves, setPendingSaves] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const saveRequests = useRef(0);
  // The server baseline owns revisions. Drafts replay pending edits on that baseline
  // so a slow save response cannot replace what the user has typed since sending it.
  const savedScenarios = useRef<Record<string, Scenario>>({});
  const drafts = useRef<Record<string, Scenario>>({});
  const pendingEdits = useRef<Record<string, Array<{edits: ScenarioEdit[]}>>>({});
  const failedSaves = useRef(new Map<string, string>());
  const selectedId = useRef<string | null>(null);
  const navigationVersion = useRef(0);
  const starts = useRef<Record<string, OptimizationStart>>({});
  const [optimizationStarts, setOptimizationStarts] = useState<Record<string, OptimizationStart>>({});
  const updateStart = (id: string, state?: OptimizationStart) => {
    const next = {...starts.current};
    if (state) next[id] = state;
    else delete next[id];
    starts.current = next;
    setOptimizationStarts(next);
  };
  const [inputFocus, setInputFocus] = useState<ValidationIssue | null>(null);
  const focusInputIssue = (issue: ValidationIssue) => {
    const target = issue.area === 'map' ? 'Network Diagram' : issue.table === 'TimePeriods' ? 'Complete Scenario Inputs' : issue.table || 'Complete Scenario Inputs';
    setInputFocus({...issue});
    if (issue.section === 'settings' && !issue.table) {
      handleSetSection(1);
      return;
    }
    setSection(0);
    setCategory(target);
    setAppState(previous => ({...previous, section: 0, category: {...previous?.category, 0: target}} as AppState));
  };
  const publishDraft = (draft: Scenario) => {
    // Keep an independent baseline even when a form mutates its scenario prop.
    drafts.current[String(draft.id)] = copyInputs(draft);
    setScenarios(previous => ({...previous, [draft.id]: draft}));
    setScenarioData(previous => String(previous?.id) === String(draft.id) ? draft : previous);
  };
  const acceptSavedScenario = (saved: Scenario) => {
    const id = String(saved.id);
    savedScenarios.current[id] = copyInputs(saved);
    const draft = (pendingEdits.current[id] || []).reduce(
      (current, pending) => applyScenarioEdits(current, pending.edits), copyInputs(saved));
    publishDraft(draft);
    if (selectedId.current === id) setSaveError(failedSaves.current.get(id) || null);
  };
  const enqueueSave = (id: string, work: () => Promise<void>): Promise<boolean> => {
    setPendingSaves(count => count + 1);
    const request = saveQueue.current.then(async () => {
      try {
        await work();
        return true;
      } catch (error) {
        if (selectedId.current === id) setSaveError(error instanceof Error ? error.message : 'Unable to save scenario. Your changes have not been saved.');
        return false;
      } finally {
        setPendingSaves(count => count - 1);
      }
    });
    saveQueue.current = request;
    return request;
  };
  const queueScenarioEdit = (base: Scenario, edits: ScenarioEdit[], send: (current: Scenario) => Promise<Scenario>): Promise<boolean> => {
    saveRequests.current += 1;
    const id = String(base.id);
    if (!savedScenarios.current[id]) savedScenarios.current[id] = copyInputs(base);
    const pending = {edits};
    pendingEdits.current[id] = [...(pendingEdits.current[id] || []), pending];
    publishDraft(applyScenarioEdits(base, edits));
    return enqueueSave(id, async () => {
      if (failedSaves.current.has(id)) throw new Error('A previous save failed. Reload saved inputs before making more changes.');
      try {
        const saved = await send(applyScenarioEdits(savedScenarios.current[id], edits));
        pendingEdits.current[id] = pendingEdits.current[id].filter(item => item !== pending);
        acceptSavedScenario(saved);
      } catch (error) {
        // Keep unsaved edits visible, but do not let later requests hide a failed save.
        failedSaves.current.set(id, error instanceof Error ? error.message : 'Unable to save scenario. Reload saved inputs before making more changes.');
        throw error;
      }
    });
  };

  const [scenarioData, setScenarioData] = useState<Scenario | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioMap>({});
  const [appState, setAppState] = useState<AppState | null>(null);
  const [section, setSection] = useState<number>(0);
  const [category, setCategory] = useState<string | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState<string | number | null>(null);
  const [backgroundTasks, setBackgroundTasks] = useState<Array<string | number>>([]);
  const activeTasks = useRef<Array<string | number>>([]);
  const updateTasks = (tasks: Array<string | number>) => {
    activeTasks.current = tasks;
    setBackgroundTasks(tasks);
  };
  const [loadLandingPage, setLoadLandingPage] = useState<number>(1);
  const [showCompletedOptimization, setShowCompletedOptimization] = useState<boolean>(false);
  const [lastCompletedScenario, setLastCompletedScenario] = useState<string | number | null>(null);
  const [compareScenarioIndexes, setCompareScenarioIndexes] = useState<Array<string | number>>([]);

  // ---- constants ----
  const INITIAL_STATES = useMemo(() => ["Draft", "Incomplete"], []);
  const sectionRef = useRef(section);
  sectionRef.current = section;

  // ---- helper function for updating the state of the app (category, section...) ----
  const updateAppState = (action: AppAction, index?: string | number): void => {
    if (action.action === "select") {
      let tempSection: number;
      let tempCategory: Record<number, string | null>;
      const status = scenarios[index!].results.status;

      if (appState) {
        if (INITIAL_STATES.includes(status) && appState.section === 2) {
          tempSection = 0;
          tempCategory = appState.category;
        } else {
          tempSection = appState.section;
          tempCategory = status === "Draft" ? appState.category : { 0: "Input Summary", 1: null, 2: "Dashboard" };
        }
      } else {
        if (COMPLETED_STATES.includes(status) || RUNNING_STATES.includes(status)) {
          tempSection = 2;
        } else {
          tempSection = 0;
        }
        tempCategory = { 0: "Input Summary", 1: null, 2: "Dashboard" };
        const tempState = { section: tempSection, category: tempCategory };
        setAppState(tempState);
      }

      setSection(tempSection);
      setCategory(tempCategory[tempSection]);
    } else if (action.action === "new") {
      const tempSection = 0;
      const tempCategory = { 0: "Input Summary", 1: null, 2: "Dashboard" };
      const tempState = { section: tempSection, category: tempCategory };
      setAppState(tempState);
      setSection(tempSection);
      setCategory(tempCategory[tempSection]);
    } else if (action.action === "section") {
      const tempState = { ...(appState as AppState) };
      tempState.section = action.section;
      setAppState(tempState);
      setSection(action.section);
      setCategory(tempState.category[action.section]);
    } else if (action.action === "category") {
      const tempState = { ...(appState as AppState) };
      tempState.category[section] = action.category;
      setAppState(tempState);
      setCategory(action.category);
    }
  };

  const handleSetSection = (newSection: number): void => {
    navigationVersion.current += 1;
    setInputFocus(null);
    updateAppState({ action: "section", section: newSection }, scenarioIndex ?? undefined);
  };

  const handleSetCategory = (newCategory: string): void => {
    setInputFocus(null);
    updateAppState({ action: "category", category: newCategory }, scenarioIndex ?? undefined);
  };

  const goToModelResults = (): void => {
    handleScenarioSelection(lastCompletedScenario!);
    openOptimizationResults();
    setShowCompletedOptimization(false);
  };

  const handleCloseFinishedOptimizationDialog = (): void => {
    setShowCompletedOptimization(false);
  };

  const navigateToScenarioList = (): void => {
    selectedId.current = null;
    navigationVersion.current += 1;
    setScenarioData(null);
    setSection(0);
    setCategory(null);
    setScenarioIndex(null);

    fetchScenarios(port)
      .then((data) => {
        setScenarios(data.data);
      })
      .catch(error => console.error('Unable to refresh scenarios.', error));

    navigate("/scenarios", { replace: true });
  };

  const handleScenarioSelection = (scenario: string | number): void => {
    navigationVersion.current += 1;
    selectedId.current = String(scenario);
    setInputFocus(null);
    navigate("/scenario", { replace: true });
    const draft = pendingEdits.current[String(scenario)]?.length ? drafts.current[String(scenario)] : scenarios[scenario];
    if (!pendingEdits.current[String(scenario)]?.length) savedScenarios.current[String(scenario)] = copyInputs(scenarios[scenario]);
    drafts.current[String(scenario)] = copyInputs(draft);
    setSaveError(failedSaves.current.get(String(scenario)) || null);
    setScenarioData(draft);
    setScenarioIndex(scenario);
    updateAppState({ action: "select" }, scenario);
  };

  const handleNewScenario = (data: Scenario): void => {
    navigationVersion.current += 1;
    selectedId.current = String(data.id);
    savedScenarios.current[String(data.id)] = copyInputs(data);
    drafts.current[String(data.id)] = copyInputs(data);
    const temp = { ...scenarios };
    temp[data.id] = data;
    setScenarios(temp);
    setScenarioIndex(data.id);
    setScenarioData(data);
    updateAppState({ action: "new" }, data.id);
    navigate("/scenario", { replace: true });
  };

  const handleScenarioUpdate = (updatedScenario: Scenario, keepOptimized?: boolean, propagateChanges?: ScenarioPropagation): Promise<boolean> => {
    const snapshot = copyInputs(updatedScenario);
    if (snapshot.results.status === 'Optimized' && !keepOptimized) snapshot.results.status = 'Not Optimized';
    const base = drafts.current[String(snapshot.id)] || scenarios[snapshot.id] || snapshot;
    return queueScenarioEdit(base, scenarioEdits(base, snapshot), async current => {
      const body = await updateScenario(port, {updatedScenario: current, propagateChanges});
      return body.data;
    });
  };

  const handleEditScenarioName = (newName: string, id: string | number, updateScenarioData?: boolean): void => {
    const draft = drafts.current[String(id)] || scenarios[id];
    void handleScenarioUpdate({...draft, name: newName}, true);
  };

  const handleDeleteScenario = async (index: string | number): Promise<void> => {
    const data = await deleteScenario(port, {id: index});
    setScenarios(data.data);
    updateAppState({action: 'delete'}, index);
  };

  const handleUpdateExcel = (id: string | number, tableKey: string, updatedTable: ParameterTable): Promise<boolean> => {
    const table = copyInputs(updatedTable);
    const base = drafts.current[String(id)] || scenarios[id];
    const edits = [{path: ['data_input', 'df_parameters', tableKey], value: table}];
    return queueScenarioEdit(base, edits, current => updateExcel(port, {id, tableKey, updatedTable: table,
      revision: current.input_revision}));
  };

  const syncScenarioData = (): void => {
    if (pendingSaves > 0) return;
    const id = selectedId.current;
    const navigation = navigationVersion.current;
    const requestVersion = saveRequests.current;
    if (id === null) return;
    fetchScenarios(port)
      .then((data) => {
        // A reload is permission to discard this draft, not edits made while it was pending.
        if (selectedId.current !== id || navigationVersion.current !== navigation || saveRequests.current !== requestVersion) return;
        const saved = data.data[id];
        if (!saved) throw new Error('The saved scenario is no longer available. Your draft has been kept.');
        pendingEdits.current[id] = [];
        failedSaves.current.delete(id);
        acceptSavedScenario(saved);
      })
      .catch(error => {
        if (selectedId.current === id && navigationVersion.current === navigation && saveRequests.current === requestVersion) {
          setSaveError(error instanceof Error ? error.message : 'Unable to reload saved inputs.');
        }
      });
  };

  const addTask = (id: string | number): void => {
    if (!activeTasks.current.some(task => String(task) === String(id))) updateTasks([...activeTasks.current, id]);
  };

  const openOptimizationResults = () => {
    setSection(2);
    setCategory('Dashboard');
    setAppState(previous => ({...previous, section: 2, category: {...previous?.category, 2: 'Dashboard'}} as AppState));
  };

  const acceptRun = (scenario: Scenario) => {
    acceptSavedScenario(scenario);
    if (RUNNING_STATES.includes(scenario.results.status)) addTask(scenario.id);
    updateStart(String(scenario.id));
  };

  // Keep runId and snapshot together across uncertain acknowledgements. Retrying
  // this identity lets the backend return the reserved run without starting another.
  const submitOptimization = async (start: OptimizationStart): Promise<void> => {
    const id = String(start.snapshot.id);
    updateStart(id, {...start, phase: 'submitting', error: undefined});
    try {
      acceptRun(await runModel(port, {scenario: start.snapshot, run_id: start.runId}));
    } catch (error) {
      if (error instanceof ApiClientError && (error.code === 'invalid_request' ||
          (error.status !== undefined && error.status >= 400 && error.status < 500))) {
        updateStart(id, {...start, phase: 'rejected', error: error.validation?.error || error.message});
        // Refresh validation without replacing prior results with a fake failure.
        try {
          const saved = await fetchScenario(port, id);
          if (saved && starts.current[id]?.runId === start.runId && starts.current[id]?.phase === 'rejected') {
            if (error.status === 409 && RUNNING_STATES.includes(saved.results.status)) acceptRun(saved);
            else acceptSavedScenario(saved);
          }
        } catch { /* The rejection is known even if refreshing its inputs fails. */ }
        return;
      }
      if (starts.current[id]?.phase === 'rejected') return;
      try {
        const current = await fetchScenario(port, id);
        if (current.results.run_id === start.runId && isRunStatus(current.results.status)) { acceptRun(current); return; }
      } catch { /* Keep the request identity so a retry cannot start a second run. */ }
      updateStart(id, {...start, phase: 'uncertain', error:
        'We could not confirm whether optimization started. Retry the request to reconnect to this run.'});
    }
  };

  const canStartOptimization = () => !pendingSaves && !saveError && !activeTasks.current.length &&
    !pendingEdits.current[String(scenarioData?.id)]?.length &&
    !Object.values(starts.current).some(start => start.phase !== 'rejected');

  const startOptimization = async (): Promise<void> => {
    if (!scenarioData || !canStartOptimization()) return;
    const snapshot = copyInputs(scenarioData);
    openOptimizationResults();
    await submitOptimization({snapshot, phase: 'submitting', runId: newRunId()});
  };

  const retryOptimizationStart = async (): Promise<void> => {
    const start = starts.current[selectedId.current!];
    if (start?.phase === 'uncertain') await submitOptimization(start);
  };

  const dismissOptimizationStart = () => {
    if (starts.current[selectedId.current!]?.phase === 'rejected') updateStart(selectedId.current!);
  };

  const copyAndRunOptimization = async (newScenarioName: string): Promise<void> => {
    if (!scenarioData || !canStartOptimization()) return;
    const original = String(scenarioData.id);
    const navigation = navigationVersion.current;
    const start: OptimizationStart = {snapshot: copyInputs(scenarioData), phase: 'copying', runId: newRunId()};
    updateStart(original, start);
    openOptimizationResults();
    try {
      const body = await copyScenario(port, scenarioData.id, newScenarioName);
      const copied = body.scenarios[body.new_id];
      acceptSavedScenario(copied);
      updateStart(original);
      // Honor navigation made while the copy request was pending.
      if (selectedId.current === original && navigationVersion.current === navigation) {
        selectedId.current = String(copied.id);
        setScenarioIndex(copied.id);
        setScenarioData(copied);
      }
      await submitOptimization({...start, snapshot: copyInputs(copied)});
    } catch (error) {
      updateStart(original, {...start, phase: 'rejected', error: error instanceof Error ? error.message : 'Unable to copy scenario.'});
    }
  };

  // ---- effect 1: initial load ----
  useEffect(() => {
    let stopped = false;
    let timer: number;
    checkTasks(port)
      .then((data) => {
        const tasks = data.tasks;
        return fetchScenarios(port)
          .then((data) => {
            if (stopped) return;
            updateTasks(tasks);
            const tempScenarios: ScenarioMap = {};
            for (const key in data.data) {
              const scenario = { ...data.data[key] };
              tempScenarios[key] = scenario;

              if (RUNNING_STATES.includes(scenario.results.status) && !tasks.includes(scenario.id)) {
                scenario.results.status = "Draft";
                updateScenario(port, { updatedScenario: { ...scenario } }).catch((e) => {
                  console.error("error on scenario update");
                  console.error(e);
                });
              }
            }
            setScenarios(tempScenarios);
            navigate("/scenarios", { replace: true });
          });
      })
      .catch((e) => {
        if (stopped) return;
        console.error("try #" + loadLandingPage + " unable to load scenarios: ", e);
        timer = window.setTimeout(() => setLoadLandingPage((x) => x + 1), 1000);
      });
    return () => { stopped = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadLandingPage, port]);

  // ---- effect 2: polling for running optimizations ----
  useEffect(() => {
    if (!backgroundTasks.length) return;
    let stopped = false;
    let timer: number;
    const poll = async () => {
      const completed: Array<string | number> = [];
      await Promise.all(backgroundTasks.map(async id => {
        try {
          const current = await fetchScenario(port, id);
          if (stopped) return;
          // An unchanged poll must not reload maps or reset their local view state.
          if (JSON.stringify(savedScenarios.current[String(id)]) !== JSON.stringify(current)) acceptSavedScenario(current);
          if (COMPLETED_STATES.includes(current.results.status)) {
            completed.push(id);
            setLastCompletedScenario(id);
            if (selectedId.current !== String(id) || sectionRef.current !== 2) setShowCompletedOptimization(true);
          }
        } catch (error) { console.error('Unable to check optimization status; retrying.', error); }
      }));
      if (stopped) return;
      if (completed.length) {
        try {
          const {tasks} = await checkTasks(port);
          if (stopped) return;
          const released = completed.filter(id => !tasks.some(task => String(task) === String(id)));
          if (released.length) {
            updateTasks(activeTasks.current.filter(id => !released.includes(id)));
            return;
          }
        } catch (error) { console.error('Unable to confirm optimization completion; retrying.', error); }
      }
      timer = window.setTimeout(poll, 2000);
    };
    void poll();
    return () => { stopped = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundTasks, port]);

  const value: ScenarioContextValue = {
    scenarioData,
    scenarios,
    appState,
    section,
    category,
    scenarioIndex,
    backgroundTasks,
    loadLandingPage,
    showCompletedOptimization,
    lastCompletedScenario,
    compareScenarioIndexes,
    isSaving: pendingSaves > 0,
    saveError,
    optimizationStart: optimizationStarts[String(scenarioData?.id)] || null,
    isStartingOptimization: Object.values(optimizationStarts).some(start => start.phase !== 'rejected'),
    startOptimization,
    retryOptimizationStart,
    dismissOptimizationStart,
    acceptSavedScenario,
    inputFocus,
    focusInputIssue,

    setScenarios,
    setCompareScenarioIndexes,
    setScenarioIndex,

    navigateToScenarioList,
    handleScenarioSelection,
    handleNewScenario,
    handleScenarioUpdate,
    handleSetSection,
    handleSetCategory,
    handleEditScenarioName,
    handleDeleteScenario,
    handleUpdateExcel,
    syncScenarioData,
    addTask,
    updateAppState,
    copyAndRunOptimization,

    goToModelResults,
    handleCloseFinishedOptimizationDialog,
  };

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
};
