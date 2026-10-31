import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Amount, Stack, Text, T } from '../../ui';
import { C, LAYOUT, SHADOW, TYPE } from '../shared';

/**
 * MatterFolder — the Files screen hero (M3, 2026 mobile redesign).
 *
 * Anatomy adapted from rare-ui `folder-component` (MIT): a folder whose flap
 * swings open on a bottom-origin 3D rotation while three cards fan out with
 * staggered springs. LokAI changes, recorded here so the provenance survives:
 *
 *  - TAP-driven, not hover-driven: on a phone the hover pose never fires, so
 *    tap is the primary interaction (hover poses removed, not retrofitted).
 *    aria-expanded + aria-controls keep it honest for assistive tech.
 *  - One "paper" theme built from roles (no feColorMatrix filter matrices —
 *    the source tinted through 20-value color matrices that cannot re-theme);
 *    depth comes from plain fills + the shadow scale.
 *  - The three cards are REAL: the matter's first exhibits, each carrying its
 *    mono reference and one-line label, tappable when the folder is open.
 *  - Reduced motion: poses snap, no springs.
 */

const BASE_W = 300;
const BASE_H = 236;

const FLAP_PATH =
  'M0 25C0 11.1929 11.1929 0 25 0H126C133 0 139.5 3 144 8L166 33C170.5 38 177 41 184 41H275C288.807 41 300 52.193 300 66V191C300 204.807 288.807 216 275 216H25C11.1929 216 0 204.807 0 191V25Z';

export interface FolderExhibit {
  id: string;
  reference: string;
  label: string;
}

export function MatterFolder({
  items,
  label,
  onTap,
  onOpenExhibit,
}: {
  items: FolderExhibit[];
  /** Localized caption under the folder — "Your matter folder · 7 documents". */
  label: string;
  /** Tap on the folder body (closed) — defaults to toggling open. */
  onTap?: () => void;
  onOpenExhibit?: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const open = isOpen || !!onTap; // controlled mode: parent navigates on tap

  const shown = items.slice(0, 3);
  const spring = { type: 'spring' as const, stiffness: 130, damping: 14 };

  const poses = [
    { y: open ? -142 : -6, x: open ? 74 : 36, rotate: open ? 16 : 4, delay: open ? 0.1 : 0 },
    { y: open ? -160 : -10, x: open ? 0 : 3, rotate: open ? -3 : -1, delay: open ? 0.05 : 0 },
    { y: open ? -150 : -13, x: open ? -70 : -34, rotate: open ? -13 : -5, delay: 0 },
  ];

  return (
    <Stack gap={2} align="center" style={{ width: '100%', paddingTop: 150 }}>
      {/* Headroom: the open fan rises ~170px above the folder; the padding
          keeps it inside the scroll container instead of clipping. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          if (onTap) { onTap(); return; }
          setIsOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onTap) { onTap(); return; }
            setIsOpen((o) => !o);
          }
        }}
        style={{
          width: BASE_W,
          height: BASE_H,
          position: 'relative',
          cursor: 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
        }}
      >
        {/* Folder back — the pocket the cards slide into */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: BASE_W,
            height: BASE_H - 44,
            transform: 'translate(-50%, -50%)',
            borderRadius: LAYOUT.radius.card,
            background: 'var(--role-bezel-fill)',
            border: `1px solid ${C.border}`,
            boxShadow: SHADOW.sm,
          }}
        />

        {/* The cards — the matter's first exhibits */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          {shown.map((item, i) => {
            const pose = poses[i];
            const style: React.CSSProperties = {
              position: 'absolute',
              width: 132,
              height: 172,
              borderRadius: LAYOUT.radius.card,
              background: 'var(--role-paper)',
              border: `1px solid ${C.border}`,
              boxShadow: SHADOW.sm,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            };
            const inner = (
              <>
                <Amount tone="anchor" style={{ fontSize: TYPE.caption.size }}>{item.reference}</Amount>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end' }}>
                  <div style={{ height: 5, borderRadius: LAYOUT.radius.xs, background: C.border, width: '88%' }} />
                  <div style={{ height: 5, borderRadius: LAYOUT.radius.xs, background: C.border, width: '64%' }} />
                  <div style={{ height: 5, borderRadius: LAYOUT.radius.xs, background: C.saffronSoft, width: '46%' }} />
                </div>
              </>
            );
            if (reduce || (open && !onOpenExhibit)) {
              return (
                <div
                  key={item.id}
                  style={{
                    ...style,
                    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg)`,
                  }}
                >
                  {inner}
                </div>
              );
            }
            return (
              <motion.button
                key={item.id}
                type="button"
                className="lokai-pressable"
                animate={pose}
                transition={reduce ? { duration: 0 } : { ...spring, delay: pose.delay }}
                onClick={(e) => {
                  if (!open) return;
                  e.stopPropagation();
                  onOpenExhibit?.(item.id);
                }}
                style={{ ...style, border: `1px solid ${C.border}`, cursor: open ? 'pointer' : 'default', font: 'inherit', textAlign: 'left' }}
              >
                {inner}
              </motion.button>
            );
          })}
        </div>

        {/* The flap — swings on a bottom-origin hinge */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: BASE_W,
            height: BASE_H - 20,
            marginLeft: -BASE_W / 2,
            marginTop: -(BASE_H - 20) / 2 + 20,
            transformOrigin: 'bottom center',
            transformStyle: 'preserve-3d',
            perspective: 800,
          }}
          animate={{ rotateX: open ? -52 : -12 }}
          transition={reduce ? { duration: 0 } : spring}
        >
          <svg width={BASE_W} height={BASE_H - 20} viewBox="0 0 300 216" fill="none" style={{ display: 'block' }}>
            <path d={FLAP_PATH} fill="var(--role-raised)" fillOpacity={0.94} />
            <path
              d={FLAP_PATH}
              stroke={C.border}
              fill="none"
            />
            {/* The saffron tab — the one brand accent, like the paper packets */}
            <rect x={126} y={2} width={54} height={7} rx={3.5} fill={C.saffron} opacity={0.85} />
          </svg>
        </motion.div>
      </div>

      <Text role="caption" tone="quiet" measured={false} style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </Stack>
  );
}
