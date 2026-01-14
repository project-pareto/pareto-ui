// src/App.tsx
import "./App.css";
import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ThemeProvider } from "@mui/material/styles";
import { appTheme } from "./theme";

import Header from "./components/Header/Header";
import Dashboard from "./views/Dashboard/Dashboard";
import ScenarioList from "./views/ScenarioList/ScenarioList";
import ScenarioCompare from "./views/ScenarioCompare/ScenarioCompare";
import LandingPage from "./views/LandingPage/LandingPage";
import ModelCompletionBar from "./components/ModelCompletionBar/ModelCompletionBar";

import { ScenarioProvider, useScenario } from "./context/ScenarioContext";

function AppInner(): React.ReactElement {
  const {
    // state
    scenarioData,
    scenarios,
    appState,
    section,
    category,
    scenarioIndex,
    backgroundTasks,
    showHeader,
    showCompletedOptimization,
    compareScenarioIndexes,

    // setters used by ScenarioList/Compare props
    setScenarios,
    setShowHeader,
    setCompareScenarioIndexes,
    setScenarioIndex,

    // handlers
    navigateToScenarioList,
    handleScenarioSelection,
    handleNewScenario,
    handleScenarioUpdate,
    handleSetCategory,
    handleSetSection,
    handleEditScenarioName,
    handleDeleteScenario,
    handleUpdateExcel,
    syncScenarioData,
    addTask,
    updateAppState,
    copyAndRunOptimization,

    // completion bar
    handleCloseFinishedOptimizationDialog,
    goToModelResults,
  } = useScenario();

  return (
    <ThemeProvider theme={appTheme}>
      <div className="App">
        <Header
          showHeader={showHeader}
          scenarios={scenarios}
          index={scenarioIndex}
          handleSelection={handleScenarioSelection}
          navigateHome={navigateToScenarioList}
        />

        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                navigateToScenarioList={navigateToScenarioList}
                handleNewScenario={handleNewScenario}
                scenarios={scenarios}
              />
            }
          />

          <Route
            path="/scenarios"
            element={
              <ScenarioList
                handleNewScenario={handleNewScenario}
                handleEditScenarioName={handleEditScenarioName}
                handleSelection={handleScenarioSelection}
                scenarios={scenarios}
                deleteScenario={handleDeleteScenario}
                setScenarios={setScenarios}
                setShowHeader={setShowHeader}
                setCompareScenarioIndexes={setCompareScenarioIndexes}
                setScenarioIndex={setScenarioIndex}
              />
            }
          />

          <Route
            path="/scenario"
            element={
              <Dashboard
                handleUpdateExcel={handleUpdateExcel}
                updateScenario={handleScenarioUpdate}
                handleEditScenarioName={handleEditScenarioName}
                scenario={scenarioData}
                section={section}
                category={category}
                handleSetCategory={handleSetCategory}
                handleSetSection={handleSetSection}
                backgroundTasks={backgroundTasks}
                navigateHome={navigateToScenarioList}
                syncScenarioData={syncScenarioData}
                addTask={addTask}
                appState={appState}
                updateAppState={updateAppState}
                scenarios={scenarios}
                copyAndRunOptimization={copyAndRunOptimization}
              />
            }
          />

          <Route
            path="/compare"
            element={
              <ScenarioCompare
                scenarios={scenarios}
                compareScenarioIndexes={compareScenarioIndexes}
                setCompareScenarioIndexes={setCompareScenarioIndexes}
                setScenarioIndex={setScenarioIndex}
              />
            }
          />

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>

        {showCompletedOptimization && (
          <ModelCompletionBar
            handleCloseFinishedOptimizationDialog={handleCloseFinishedOptimizationDialog}
            goToModelResults={goToModelResults}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

function App(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <ScenarioProvider navigate={navigate}>
      <AppInner />
    </ScenarioProvider>
  );
}

export default App;
