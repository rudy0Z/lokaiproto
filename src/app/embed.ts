import type { CSSProperties } from 'react';

/*
 * Embed mode — active when the app is iframed inside the portfolio's
 * PrototypeFrame (which provides its own phone chrome and renders the
 * iframe at exactly 390x780).
 *
 * Detection reads `?embed=1` from the initial hash-route query
 * (e.g. /embed/lokai/index.html#/mobile/home?embed=1) ONCE at module load.
 * In-app navigation rewrites the hash and drops the param, so the flag is
 * captured here rather than re-read per route.
 */
function detectEmbed(): boolean {
  if (typeof window === 'undefined') return false;
  const query = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(query).get('embed') === '1';
}

export const IS_EMBED: boolean = detectEmbed();

/*
 * Reference device widths for the standalone mock.
 *
 * The app is designed at a phone width and its type/spacing are rem-based, so
 * content reflows across these three without a bespoke layout each. They exist
 * so a screen can be QA'd at the edges — a 360 budget phone and a 430 Pro Max —
 * not just the 390 base. Pick one with `?device=compact|base|large`.
 */
export const DEVICE_WIDTHS = { compact: 360, base: 390, large: 430 } as const;
export type DeviceSize = keyof typeof DEVICE_WIDTHS;

function detectDeviceWidth(): number {
  if (typeof window === 'undefined') return DEVICE_WIDTHS.base;
  const query = window.location.hash.split('?')[1] ?? '';
  const value = new URLSearchParams(query).get('device');
  return value && value in DEVICE_WIDTHS ? DEVICE_WIDTHS[value as DeviceSize] : DEVICE_WIDTHS.base;
}

/** The artboard width for the standalone mock (embed fills its host instead). */
export const DEVICE_WIDTH: number = detectDeviceWidth();

/*
 * Artboard root style for every mobile screen.
 * Standalone: a real phone width (default 390, or ?device=) × 844 logical
 *             height. MobileRouteCanvas scales the whole frame to fit the
 *             viewport, so this stays a true device viewport at any laptop size.
 * Embedded:   fill the host iframe/device viewport — fluid width so a real
 *             360–430px phone gets its own width, not a letterboxed 390.
 */
export const ARTBOARD: CSSProperties = IS_EMBED
  ? { width: '100%', maxWidth: 430, height: '100dvh' }
  : { width: DEVICE_WIDTH, height: 844 };
