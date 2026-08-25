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
 */
export default function Specimen() {
  const { specimenId } = useParams();
  const [params] = useSearchParams();
  const specimen = specimenId ? getSpecimen(specimenId) : undefined;

  const looping = params.get('loop') === '1';
  const paintBg = params.get('bg') === '1';
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
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
