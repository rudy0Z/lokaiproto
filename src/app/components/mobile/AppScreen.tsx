import React from 'react';
import { Screen, type ScreenTone } from '../../ui';
import { StatusBar, HomeIndicator } from '../../pages/mobile/MobileHome';
import { MobileTopBar } from './MobileTopBar';
import { MatterDrawer } from './MatterDrawer';
import { useDrawer } from '../../context/DrawerContext';

/**
 * The app frame for every mobile screen.
 *
 * Wraps the design-system `<Screen>` and injects the shared navigation so no
 * screen re-implements it: the minimal top bar (hamburger + wordmark +
 * new-chat) as chrome, and the one drawer — the app's whole navigation surface
 * now that the bottom tab bar is gone — mounted in the footer slot, which keeps
 * it contained inside the phone artboard (a `position:absolute` overlay escapes
 * the frame if mounted higher up).
 *
 * `onBack` swaps the hamburger for a back arrow on modal flows (voice, a stop
 * state). Everything else is a passthrough to `<Screen>`.
 */
export function AppScreen({
  children,
  context,
  action,
  tone = 'paper',
  onBack,
  onNewChat,
  scrollClearance,
  showWordmark = true,
  showNewChat = true,
}: {
  children: React.ReactNode;
  context?: React.ReactNode;
  action?: React.ReactNode;
  tone?: ScreenTone;
  onBack?: () => void;
  onNewChat?: () => void;
  scrollClearance?: string;
  /** Passthrough to the top bar — Home hides both (it is the chat canvas). */
  showWordmark?: boolean;
  showNewChat?: boolean;
}) {
  const { open, closeDrawer } = useDrawer();
  const stop = tone === 'stop';

  return (
    <Screen
      tone={tone}
      chrome={<><StatusBar light={stop} /><MobileTopBar onBack={onBack} onNewChat={onNewChat} tone={tone} showWordmark={showWordmark} showNewChat={showNewChat} /></>}
      context={context}
      action={action}
      footer={
        <>
          <HomeIndicator light={stop} />
          <MatterDrawer open={open} onClose={closeDrawer} />
        </>
      }
      scrollClearance={scrollClearance}
    >
      {children}
    </Screen>
  );
}
