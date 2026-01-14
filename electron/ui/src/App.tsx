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
    showCompletedOptimization,

    // completion bar
    handleCloseFinishedOptimizationDialog,
    goToModelResults,
  } = useScenario();

  return (
    <ThemeProvider theme={appTheme}>
      <div className="App">
        <Header/>

        <Routes>
          <Route
            path="/"
            element={
              <LandingPage/>
            }
          />

          <Route
            path="/scenarios"
            element={
              <ScenarioList/>
            }
          />

          {/*
            TODO: Send ID as parameter here.
          */}
          <Route
            path="/scenario"
            element={
              <Dashboard/>
            }
          />

          <Route
            path="/compare"
            element={
              <ScenarioCompare/>
            }
          />

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>

        {showCompletedOptimization && (
          <ModelCompletionBar/>
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
