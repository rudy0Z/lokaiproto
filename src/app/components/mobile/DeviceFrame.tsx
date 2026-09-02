import React from 'react';
import { DEVICE } from '../shared';
import { IS_EMBED } from '../../embed';

/**
 * The phone the mobile screens are drawn on — dev/standalone view only.
 *
 * The artboard is 390x844, which is 19.5:9 — the exact logical viewport of an
 * iPhone 12 through 14. It was never the wrong ratio. It read as a "long slim"
 * web column because it was a hard-edged rectangle sitting on a cream gradient
 * with nothing to give it scale. A bezel, a radius and a shadow are all it
 * needed to read as a device.
 *
 * IS_EMBED short-circuits to a bare passthrough: inside the portfolio the
 * iframe IS the phone and PrototypeFrame supplies its own chrome, so drawing a
 * second bezel here would frame a frame. Every mobile screen already routes
 * through MobileRouteCanvas, so wiring this there frames all five at once.
 *
 * The Dynamic Island sits in the gap StatusBar leaves: StatusBar is
 * space-between with the time hard left and the signal glyphs hard right, so a
 * 110px pill centred at the top drops into ~120px of clear space on either
 * side and never collides with either.
 *
 * All values come from the DEVICE token in shared.tsx. This file writes no raw
 * colour, radius or shadow of its own.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  if (IS_EMBED) return <>{children}</>;

  return (
    <div
      aria-hidden={false}
      style={{
        position: 'relative',
        padding: DEVICE.bezel,
        borderRadius: DEVICE.radiusOuter,
        background: DEVICE.surface,
        boxShadow: `${DEVICE.shadow}, ${DEVICE.rim}`,
        flexShrink: 0,
      }}
    >
      {/* Side buttons — three left (mute + volume pair), one right (power).
          Thin slivers riding the bezel edge; they read as hardware, not UI. */}
      <SideButton edge="left" top={132} length={30} />
      <SideButton edge="left" top={188} length={54} />
      <SideButton edge="left" top={256} length={54} />
      <SideButton edge="right" top={208} length={76} />

      <div
        style={{
          position: 'relative',
          borderRadius: DEVICE.radiusScreen,
          overflow: 'hidden',
          /* The screen is its own stacking/clipping context so the artboard's
             own status bar and home indicator sit correctly under the island. */
          isolation: 'isolate',
        }}
      >
        {children}

        {/* Dynamic Island — above the screen content, below nothing. */}
        <div
          style={{
            position: 'absolute',
            top: DEVICE.islandTop,
            left: '50%',
            transform: 'translateX(-50%)',
            width: DEVICE.islandW,
            height: DEVICE.islandH,
            borderRadius: DEVICE.radiusScreen,
            background: DEVICE.islandFill,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

function SideButton({ edge, top, length }: { edge: 'left' | 'right'; top: number; length: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top,
        [edge]: -2,
        width: 3,
        height: length,
        borderRadius: DEVICE.bezel,
        background: DEVICE.buttonFill,
      }}
    />
  );
}
