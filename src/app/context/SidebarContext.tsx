import React, { createContext, useContext, useState } from 'react';

interface SidebarCtx {
  collapsed:      boolean;
  toggle:         () => void;
  settingsOpen:   boolean;
  openSettings:   () => void;
  closeSettings:  () => void;
}

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false, toggle: () => {},
  settingsOpen: false, openSettings: () => {}, closeSettings: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggle        = () => setCollapsed(c => !c);
  const openSettings  = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle, settingsOpen, openSettings, closeSettings }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
