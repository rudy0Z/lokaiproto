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
  onMenu,
  showMenu = false,
  scrollClearance,
  scrollViewportRef,
  showWordmark = true,
  showNewChat = true,
  floatingAction = true,
}: {
  children: React.ReactNode;
  context?: React.ReactNode;
  action?: React.ReactNode;
  tone?: ScreenTone;
  onBack?: () => void;
  onNewChat?: () => void;
  /** Three-dots trailing control (Quick Recap deck) — takes precedence over
   *  new-chat in the top bar. */
  onMenu?: () => void;
  showMenu?: boolean;
  scrollClearance?: string;
  /** Passthrough to <Screen>'s scroll viewport — chat auto-scroll reads it. */
  scrollViewportRef?: React.RefObject<HTMLDivElement | null>;
  /** Passthrough to the top bar — Home hides both (it is the chat canvas). */
  showWordmark?: boolean;
  showNewChat?: boolean;
  /** When true, the action slot floats without a wall-to-wall dividing border. */
  floatingAction?: boolean;
}) {
  const { open, closeDrawer } = useDrawer();
  const stop = tone === 'stop';

  return (
    <Screen
      tone={tone}
      chrome={<><StatusBar light={stop} /><MobileTopBar onBack={onBack} onNewChat={onNewChat} onMenu={onMenu} showMenu={showMenu} tone={tone} showWordmark={showWordmark} showNewChat={showNewChat} /></>}
      context={context}
      action={action}
      floatingAction={floatingAction}
      footer={
        <>
          <HomeIndicator light={stop} />
          <MatterDrawer open={open} onClose={closeDrawer} />
        </>
      }
      scrollClearance={scrollClearance}
      scrollViewportRef={scrollViewportRef}
    >
      {children}
    </Screen>
  );
}
