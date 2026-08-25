import React from 'react';
import { useParams, useSearchParams } from 'react-router';
import { C, LAYOUT, MONO, SANS, TYPE } from '../components/shared';
import { getSpecimen } from '../dev/specimens';
import { useSpecimenLoop } from '../hooks/useSpecimenLoop';

/**
 * /specimen/:id — one component, alone, on a transparent canvas at natural
 * size. The case study embeds these instead of shrinking whole screens to
 * thumbnails.
 *
 * ?loop=1 cycles a specimen that declares frames; otherwise it renders frame
 * 0 static. Transparent background by default so the embedding card owns the
 * surround; ?bg=1 paints the app canvas for standalone viewing.
 *
 * A specimen with no framing reads as an unexplained form floating in space
 * — confirmed the hard way when opening one cold produced exactly that
 * reaction. The label is on by default (this is also how specimens get
 * checked during dev, not just how they'll eventually be embedded, and the
 * case-study copy providing context is a separate later concern) —
 * ?label=0 strips it for a clean capture once a specimen is ready to embed.
 */
export default function Specimen() {
  const { specimenId } = useParams();
  const [params] = useSearchParams();
  const specimen = specimenId ? getSpecimen(specimenId) : undefined;

  const looping = params.get('loop') === '1';
  const paintBg = params.get('bg') === '1';
  const showLabel = params.get('label') !== '0';
  const frameCount = specimen?.frames?.length ?? 1;
  const frame = useSpecimenLoop(frameCount, { active: looping });

  if (!specimen) {
    return (
      <div style={{ fontFamily: MONO, fontSize: TYPE.caption.size, color: C.red, padding: 24 }}>
        Unknown specimen: {specimenId}. See /dev for the list.
      </div>
    );
  }

  return (
    <div
      data-specimen={specimen.id}
      style={{
        minHeight: '100dvh',
        background: paintBg ? C.bg : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      {showLabel && (
        <div style={{ width: '100%', maxWidth: specimen.width ?? 420 }}>
          <p style={{
            fontFamily: MONO, fontSize: TYPE.micro.size, color: C.muted,
            letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0,
          }}>
            Specimen · {specimen.source}
          </p>
          <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600, color: C.ink, margin: '2px 0 0' }}>
            {specimen.label}
          </p>
        </div>
      )}
      <div style={{ width: '100%', maxWidth: specimen.width ?? 420 }}>
        {specimen.render(looping ? frame : 0)}
      </div>
    </div>
  );
}

/** Small label variant used by the dev index to preview a specimen inline. */
export function SpecimenLabel({ id }: { id: string }) {
  const specimen = getSpecimen(id);
  if (!specimen) return null;
  return (
    <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>
      {specimen.label}
    </span>
  );
}
