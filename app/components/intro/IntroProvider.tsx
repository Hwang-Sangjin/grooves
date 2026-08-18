"use client";

import { createContext, useCallback, useContext, useState } from "react";

const IntroContext = createContext<{
  done: boolean;
  finish: () => void;
} | null>(null);

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error("useIntro must be used inside <IntroProvider>");
  return ctx;
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);

  return (
    <IntroContext.Provider value={{ done, finish }}>
      {children}
    </IntroContext.Provider>
  );
}
