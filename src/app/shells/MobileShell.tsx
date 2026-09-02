import React from 'react';
import { Outlet } from 'react-router';
import { DrawerProvider } from '../context/DrawerContext';

export default function MobileShell() {
  return (
    <DrawerProvider>
      <Outlet />
    </DrawerProvider>
  );
}
