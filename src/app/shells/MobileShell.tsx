import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { DrawerProvider } from '../context/DrawerContext';
import { useConversations } from '../context/ConversationContext';

/**
 * The mobile app frame. Two jobs beyond the route outlet:
 *   - own the navigation drawer (the app's one nav surface, per chat-first)
 *   - apply data-theme on documentElement from the user's Appearance setting,
 *     so the whole role layer re-points and the app re-tints in one place
 *     (light, dark, or "follow the OS" — the default).
 */
export default function MobileShell() {
  const { appearance } = useConversations();

  useEffect(() => {
    const root = document.documentElement;
    const apply = (resolved: 'light' | 'dark') => {
      root.dataset.theme = resolved;
    };
    if (appearance === 'system') {
      /* Default to the OS preference. Listens to changes so the app
         re-tints when the user flips their machine at night. */
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const onChange = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    apply(appearance);
  }, [appearance]);

  return (
    <DrawerProvider>
      <Outlet />
    </DrawerProvider>
  );
}
