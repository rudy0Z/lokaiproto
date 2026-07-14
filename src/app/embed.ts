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
 * Artboard root style for every mobile screen.
 * Standalone: fixed 390x844 artboard centered by MobileRouteCanvas.
 * Embedded:   fill the iframe viewport (390 wide, whatever height the
 *             portfolio frame renders — currently 780), no fixed height
 *             so nothing clips top/bottom.
 */
export const ARTBOARD: CSSProperties = IS_EMBED
  ? { width: '100%', maxWidth: 390, height: '100dvh' }
  : { width: 390, height: 844 };
