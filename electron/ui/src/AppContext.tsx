// src/AppContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { AppContextValue } from "./types";

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [port] = useState(50011);
  const [foundPort] = useState(true);

  const value: AppContextValue = { port };

  return <AppContext.Provider value={value}>{foundPort && children}</AppContext.Provider>;
};
