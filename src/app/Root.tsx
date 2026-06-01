import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { SettingsPanel } from './components/SettingsPanel';
import { SidebarProvider, useSidebar } from './context/SidebarContext';

// Separate component so it can consume the SidebarContext
function MainContent() {
  const { collapsed } = useSidebar();
  return (
    <div
      style={{
        marginLeft: collapsed ? '64px' : '260px',
        transition: 'margin-left 0.2s ease',
        minHeight: '100vh',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Outlet />
    </div>
  );
}

export default function Root() {
  return (
    <SidebarProvider>
      <SettingsPanel />
      <Sidebar />
      <MainContent />
    </SidebarProvider>
  );
}
