import React from 'react';
import { T, LAYOUT, SHADOW } from '../../ui';
import type { ExhibitKind, EvidenceStatus } from '../../data/caseWorkflow';

/**
 * A document rendered as a small piece of paper.
 *
 * Adapted from the one real document-preview craft in the repo — `DocThumbnail`
 * in `pages/Documents.tsx:175-252`, which was desktop-only, unexported, and
 * written in raw hex. The idea is the same: a miniature page with an accent
 * edge and a skeleton of content lines, so a document reads as paper at a
 * glance rather than as a generic file icon in a coloured tile. Two changes:
 * it is theme-safe (roles from `T`, no literals), and the skeleton is chosen by
 * the exhibit's `kind` so an invoice, a chat log and a photo are distinguishable
 * without a label — the reference decks group documents by their look, not their
 * name.
 *
 * `PaperTexture`'s ruled-line asymmetry (`Notice.tsx:43-56`, horizontals at
 * 0.035 opacity, verticals 0.025) is not reproduced at this size — at ~54px it
 * would read as noise. It belongs on the full-page view the sheet opens.
 */

const ACCENT: Record<ExhibitKind, string> = {
  invoice: T.attest,   // a money document — provenance colour
  receipt: T.attest,
  chat:    T.anchor,   // correspondence
  photo:   T.flag,     // visual evidence of the defect
  report:  T.hairlineFirm,
};

/** The content skeleton, per kind. `f` = a fill-in field, `t` = text, `h` = heading. */
const SKELETON: Record<ExhibitKind, ('h' | 'f' | 't' | 'photo')[]> = {
  invoice: ['h', 'f', 't', 'f', 't'],
  receipt: ['h', 't', 't', 't'],
  chat:    ['t', 't', 'h', 't'],
  photo:   ['photo'],
  report:  ['h', 't', 't', 't', 't'],
};

export function ExhibitPaper({
  kind = 'report',
  status = 'uploaded',
  width = 54,
}: {
  kind?: ExhibitKind;
  status?: EvidenceStatus;
  width?: number;
}) {
  const height = Math.round(width * 1.3);      // portrait page
  const missing = status === 'missing';
  const accent = ACCENT[kind];
  const rows = SKELETON[kind];

  // A missing exhibit is a placeholder: dashed outline, empty page, no accent.
  if (missing) {
    return (
      <div
        aria-hidden
        style={{
          width, height, flexShrink: 0,
          borderRadius: LAYOUT.radius.sm,
          border: `1.5px dashed ${T.hairlineFirm}`,
          background: T.sunken,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{
        width, height, flexShrink: 0,
        borderRadius: LAYOUT.radius.sm,
        background: T.raised,
        /* Border OR shadow, never both. A contact shadow lifts the page off the
           list; a 1px outline on top would flatten it back into a diagram. */
        boxShadow: SHADOW.sm,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ height: 4, flexShrink: 0, background: accent, opacity: 0.85 }} />
      <div style={{ flex: 1, padding: '7px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rows.map((r, i) => {
          if (r === 'photo') {
            return (
              <div key={i} style={{
                flex: 1, borderRadius: LAYOUT.radius.xs,
                background: T.flagFill,
                border: `1px solid ${T.hairline}`,
              }} />
            );
          }
          if (r === 'h') {
            return <div key={i} style={{ width: '58%', height: 5, borderRadius: LAYOUT.radius.xs, background: T.anchor, opacity: 0.7 }} />;
          }
          if (r === 'f') {
            // a fill-in field — dashed underline, the "form" tell
            return <div key={i} style={{ width: '84%', height: 5, borderBottom: `1.5px dashed ${T.attest}`, background: T.attestFill, borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.xs} 0 0` }} />;
          }
          return <div key={i} style={{ width: i % 2 ? '72%' : '90%', height: 4, borderRadius: LAYOUT.radius.xs, background: T.hairlineFirm }} />;
        })}
      </div>
    </div>
  );
}
