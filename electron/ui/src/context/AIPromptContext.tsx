import React, { createContext, useContext, useMemo, useState } from "react";
import { requestAIDataUpdate } from "../services/app.service";
import { useApp } from "../AppContext";
import type { DfParameters, DfSets, DisplayUnits } from "../types";

type AIPromptStatus = "idle" | "running" | "success" | "error";

export interface AIPromptUpdatedScenario {
  df_sets?: DfSets;
  df_parameters?: DfParameters;
  display_units?: DisplayUnits;
  map_data?: any;
}

export interface AIPromptResponse {
  status: "success" | "error";
  updatedScenario?: AIPromptUpdatedScenario;
  updateNotes?: string[];
  errorMessage?: string;
  error?: string;
}

export interface AIPromptContextValue {
  status: AIPromptStatus;
  isRunning: boolean;
  response: AIPromptResponse | null;
  updatedScenario: AIPromptUpdatedScenario | null;
  updateNotes: string[];
  errorMessage: string | null;
  lastPrompt: string | null;
  runPrompt: (scenarioId: string | number, prompt: string) => Promise<void>;
  clearResult: () => void;
}

const AIPromptContext = createContext<AIPromptContextValue | undefined>(undefined);

export const useAIPrompt = (): AIPromptContextValue => {
  const ctx = useContext(AIPromptContext);
  if (!ctx) throw new Error("useAIPrompt must be used within an AIPromptProvider");
  return ctx;
};

interface AIPromptProviderProps {
  children: React.ReactNode;
}

export const AIPromptProvider: React.FC<AIPromptProviderProps> = ({ children }) => {
  const { port } = useApp();
  const [status, setStatus] = useState<AIPromptStatus>("idle");
  const [response, setResponse] = useState<AIPromptResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedScenario, setUpdatedScenario] = useState<AIPromptUpdatedScenario | null>(null);
  const [updateNotes, setUpdateNotes] = useState<string[]>([]);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const runPrompt = async (scenarioId: string | number, prompt: string): Promise<void> => {
    setStatus("running");
    setErrorMessage(null);
    setResponse(null);
    setUpdatedScenario(null);
    setUpdateNotes([]);
    setLastPrompt(prompt);

    try {
      const result = await requestAIDataUpdate(port, scenarioId, prompt);
      let payload: AIPromptResponse | null = null;
      try {
        payload = await result.json();
      } catch (parseError) {
        payload = null;
      }

      if (!result.ok || !payload) {
        throw new Error(payload?.errorMessage || result.statusText || "AI request failed");
      }

      if (payload.status !== "success") {
        setErrorMessage(payload.errorMessage || payload.error || "AI request failed.");
        setResponse(payload);
        setStatus("error");
        return;
      }

      setResponse(payload);
      setUpdatedScenario(payload.updatedScenario || null);
      setUpdateNotes(payload.updateNotes || (payload as any).updatedNotes || []);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Unable to run AI prompt");
      setStatus("error");
    }
  };

  const clearResult = (): void => {
    setStatus("idle");
    setErrorMessage(null);
    setResponse(null);
    setUpdatedScenario(null);
    setUpdateNotes([]);
    setLastPrompt(null);
  };

  const value = useMemo(
    () => ({
      status,
      isRunning: status === "running",
      response,
      updatedScenario,
      updateNotes,
      errorMessage,
      lastPrompt,
      runPrompt,
      clearResult,
    }),
    [status, response, updatedScenario, updateNotes, errorMessage, lastPrompt]
  );

  return <AIPromptContext.Provider value={value}>{children}</AIPromptContext.Provider>;
};
