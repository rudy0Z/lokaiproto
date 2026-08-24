import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar } from '../components/Sidebar';
import { SettingsPanel } from '../components/SettingsPanel';
import { CommandPalette } from '../components/CommandPalette';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { LAYOUT } from '../components/shared';

const ROUTE_TITLES: Record<string, string> = {
  '/desktop/dashboard':          'Dashboard — LokAI',
  '/desktop/chat':               'Consumer Guide — LokAI',
  '/desktop/documents':          'Case Files — LokAI',
  '/desktop/notice-interpreter': 'Sample Notice — LokAI',
  '/desktop/document-draft':     'Demand Notice — LokAI',
};

function DesktopContent() {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? LAYOUT.sidebarShut : LAYOUT.sidebarOpen;
  const location = useLocation();

  // Update browser tab title on every navigation
  useEffect(() => {
    const base = location.pathname;
    const exact = ROUTE_TITLES[base];
    const prefix = Object.entries(ROUTE_TITLES).find(([k]) => base.startsWith(k + '/'));
    document.title = exact ?? (prefix ? prefix[1] : 'LokAI');
  }, [location.pathname]);
  return (
    <div
      style={{
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.2s ease',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function DesktopShell() {
  const navigate = useNavigate();

  useEffect(() => {
    /* Initial-mount check only: opening the desktop workspace on a phone-size
       viewport routes to mobile. Mid-session window resizes no longer yank
       the user out of an active workspace. */
    if (window.innerWidth < 1024) navigate('/mobile/home');
  }, [navigate]);

  return (
    <div style={{ minWidth: '1024px', height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <SidebarProvider>
        <SettingsPanel />
        <CommandPalette />
        <Sidebar />
        <DesktopContent />
      </SidebarProvider>
    </div>
  );
}
