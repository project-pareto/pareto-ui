import React, { createContext, useContext, useMemo, useState } from "react";
import { requestAIDataUpdate } from "../services/app.service";
import { useApp } from "../AppContext";

type AIPromptStatus = "idle" | "running" | "success" | "error";

export interface AIPromptContextValue {
  status: AIPromptStatus;
  isRunning: boolean;
  response: any | null;
  error: string | null;
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
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const runPrompt = async (scenarioId: string | number, prompt: string): Promise<void> => {
    setStatus("running");
    setError(null);
    setResponse(null);
    setLastPrompt(prompt);

    try {
      const result = await requestAIDataUpdate(port, scenarioId, prompt);
      let payload: any = null;
      try {
        payload = await result.json();
      } catch (parseError) {
        payload = null;
      }

      if (!result.ok) {
        throw new Error(payload?.message || result.statusText || "AI request failed");
      }

      setResponse(payload);
      setStatus("success");
    } catch (err: any) {
      setError(err?.message || "Unable to run AI prompt");
      setStatus("error");
    }
  };

  const clearResult = (): void => {
    setStatus("idle");
    setError(null);
    setResponse(null);
  };

  const value = useMemo(
    () => ({
      status,
      isRunning: status === "running",
      response,
      error,
      lastPrompt,
      runPrompt,
      clearResult,
    }),
    [status, response, error, lastPrompt]
  );

  return <AIPromptContext.Provider value={value}>{children}</AIPromptContext.Provider>;
};
