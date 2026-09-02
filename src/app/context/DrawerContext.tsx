import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Drawer state, shared across every mobile screen.
 *
 * The mobile app dropped its bottom tab bar for a left drawer (the
 * ChatGPT/Gemini/Claude pattern — a minimal canvas with a sidebar of history,
 * no persistent tabs). The drawer is the universal navigation, so its open
 * state lives above the individual screens: any screen's top-bar hamburger
 * opens it, and it renders once inside whatever screen is mounted.
 */
interface DrawerContextValue {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue>({
  open: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  return (
    <DrawerContext.Provider value={{ open, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
