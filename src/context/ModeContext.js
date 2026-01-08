// src/context/ModeContext.jsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const ModeContext = createContext(null);

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState("anime");

  useEffect(() => {
    const savedMode = Cookies.get("app_mode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === "anime" ? "hanime" : "anime";
    setMode(newMode);
    Cookies.set("app_mode", newMode, { expires: 365 });
    window.location.reload();
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
