/**
 * The LokAI design system — one import line.
 *
 *   import { Screen, Stack, Text, Label, Button, T, M } from '../../ui';
 *
 * If a screen needs something that is not exported here, that is a signal.
 * Either the system is missing a decision (add it here, with the reasoning in
 * a docstring, so it exists once) or the screen is reinventing one that
 * already exists (don't). What a screen must NOT do is reach past this file
 * into raw hex, raw px, or `C.*` — that is the drift this layer exists to end.
 *
 * See `docs/LLM_DESIGN_SYSTEM.md` for the copy-pasteable patterns.
 */

export { T, M, ROLE_TYPE } from './theme';
export type { ColorRole, TextRole } from './theme';

export {
  Text,
  Label,
  Amount,
  Button,
  IconButton,
  Badge,
  Field,
  ICON,
  ICON_STROKE,
  ICON_WEIGHT,
  FOCUS_RING,
  ToneProvider,
  useTone,
  useInk,
  useSystemStyles,
} from './primitives';
export type { ScreenTone, TextProps, TextTone, ButtonProps, FieldProps } from './primitives';

export {
  Screen,
  Stack,
  Row,
  Bleed,
  Rule,
  HairlineList,
  HairlineRow,
  Card,
} from './layout';
export type { ScreenProps } from './layout';

export {
  FadeRise,
  Stagger,
  staggerDelay,
  WorkingDots,
  ShimmerLine,
  StageTransition,
  NumberTicker,
  useHaptic,
  useMotionStyles,
} from './motion';

export {
  scriptOf,
  scriptProps,
  familyFor,
  needsDisplayFallback,
  useUiLanguage,
} from './script';
export type { Script } from './script';

/* Escape hatches — legitimate, but every use is a small debt.
   `S` and `LAYOUT` are the raw spacing/radius scales; prefer `Stack`/`Row`
   and the primitives' own radii. `C` is the literal palette and exists only
   for values that motion/react has to interpolate. */
export { S, LAYOUT, MOTION, SHADOW, TYPE, typeStyle, C, SANS, MONO, EDITORIAL } from '../components/shared';
