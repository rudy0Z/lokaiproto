import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconCheck, IconFile } from '../../ui/icons';
import {
  Stack, Row, Rule, Card, HairlineList, HairlineRow,
  Text, Label, Amount, Badge,
  T, S, LAYOUT, SHADOW, ICON, useUiLanguage,
} from '../../ui';
import { Sheet } from '../Sheet';
import {
  interpretationFor, receiptAckFor,
  type PreparedDocument, type OriginalClause, type ClauseHighlight, type SurfacedField,
} from '../../data/noticeInterpretation';

/**
 * NoticeInterpret — the founding feature, in mobile chat (§3.8 / §3.8a).
 *
 * A person who cannot read a legal notice drops it into the conversation and
 * the RESPONSE is the interpretation: translated to their language, summarised
 * in plain words, with the amount / deadline / legal section surfaced from the
 * dense original — each one tappable back to the exact clause it was read from.
 *
 * The pieces here, in the order they appear in a conversation:
 *   DocumentBubble     the user's attachment, as a chat message
 *   NoticeInterpretTurn the assistant's answer — a paper-toned Card (a document
 *                       is a discrete object, so it earns a container under L1)
 *   DocumentReceiptTurn the shallow depth — a receipt is filed, one line, no card
 *   NoticeStrip         the persistent "notice · in plain words ↗" above the composer
 *   NoticeReaderSheet   full-height original-vs-plain, with clause correspondence
 *
 * What desktop does with adjacency (two columns), mobile does with correspondence
 * (tap a field → the original scrolls to that clause and lights up). That is a
 * stronger demonstration of grounding than the side-by-side, not a fallback.
 */

/* Each highlight kind borrows one existing role, so the marks in the original
   read as the same language as the rest of the app: money is provenance-toned,
   the statute is the anchor, the deadline is the flag. */
const HIGHLIGHT_TONE: Record<ClauseHighlight, { color: string; fill: string }> = {
  amount:   { color: T.attest, fill: T.attestFill },
  section:  { color: T.anchor, fill: T.anchorTint },
  deadline: { color: T.flag,   fill: T.flagFill },
};

/* ── The user's attachment, as a chat message ────────────────────────────────── */
export function DocumentBubble({ doc }: { doc: PreparedDocument }) {
  return (
    <Row justify="end">
      <Row
        gap={2}
        align="center"
        style={{
          background: T.anchorTint,
          borderRadius: LAYOUT.radius.card,
          padding: `${S[2]} ${S[3]}`,
          maxWidth: '82%',
        }}
      >
        <IconFile size={ICON.ui} color="var(--role-anchor)" />
        <Text role="captionStrong" tone="anchor" measured={false}>{doc.fileName}</Text>
      </Row>
    </Row>
  );
}

/* ── A single surfaced figure, in the turn and in the sheet's plain view ──────── */
function FieldRow({ field, onOpen }: { field: SurfacedField; onOpen: (clauseId: string) => void }) {
  return (
    <HairlineRow
      onClick={() => onOpen(field.clauseId)}
      trailing={
        <Text role="meta" tone="attest" measured={false} numeric style={{ letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap' }}>
          {field.citation}
        </Text>
      }
    >
      {field.isAmount
        ? <Amount>{field.value}</Amount>
        : <Text role="bodyStrong" measured={false} numeric>{field.value}</Text>}
      <Text role="caption" tone="quiet" measured={false}>{field.label}</Text>
    </HairlineRow>
  );
}

export type ReaderView = 'plain' | 'original';
export type OpenReader = (opts?: { clauseId?: string; view?: ReaderView }) => void;

/* ── The assistant's answer — a notice, interpreted ──────────────────────────── */
export function NoticeInterpretTurn({
  doc,
  onOpen,
}: {
  doc: PreparedDocument;
  onOpen: OpenReader;
}) {
  const lang = useUiLanguage();
  const interp = interpretationFor(doc, lang);
  if (!interp) return null;

  return (
    <Card>
      <Stack gap={3}>
        {/* Identity line — name · pages · detected language (L7: one identity row) */}
        <Row gap={3} align="center">
          <span style={{
            width: 40, height: 40, borderRadius: LAYOUT.radius.panel,
            background: T.attestFill, color: T.attest,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IconFile size={ICON.feature} />
          </span>
          <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Text role="bodyStrong" measured={false} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.fileName}
            </Text>
            <Row gap={2} align="center">
              <Text role="caption" tone="quiet" measured={false}>{doc.pages} page{doc.pages > 1 ? 's' : ''}</Text>
              <Badge tone="neutral">{doc.sourceLangLabel}</Badge>
            </Row>
          </Stack>
        </Row>

        <Rule />

        {/* The plain-language summary — the answer, in the reader's language.
            Sans, not the serif answer role: this register is deliberately NOT
            the law speaking, it is the app translating the law down. */}
        <Text role="body">{interp.summary}</Text>

        {/* The figures surfaced from the dense original. */}
        <Stack gap={2}>
          <Label>{interp.fieldsLabel}</Label>
          <HairlineList>
            {interp.fields.map((f) => (
              <FieldRow key={f.id} field={f} onOpen={(clauseId) => onOpen({ clauseId })} />
            ))}
          </HairlineList>
        </Stack>

        {/* Two quick views of the document, not a paragraph-long hyperlink: the
            plain reading and the source, each one tap. */}
        <ViewToggle onOpen={onOpen} />
      </Stack>
    </Card>
  );
}

/** A segmented control that opens the reader on the chosen view. Reads as a
 *  two-way switch (plain ⇄ original), which is what a document actually offers. */
function ViewToggle({ onOpen }: { onOpen: OpenReader }) {
  const seg: React.CSSProperties = {
    flex: 1, minHeight: 38, border: 'none', cursor: 'pointer',
    borderRadius: LAYOUT.radius.sm, background: 'transparent', font: 'inherit',
    padding: `0 ${S[3]}`,
  };
  return (
    <Row gap={1} role="tablist" style={{ background: T.sunken, borderRadius: LAYOUT.radius.control, padding: S[1] }}>
      <button type="button" className="lokai-pressable" style={{ ...seg, background: T.raised, boxShadow: SHADOW.xs }} onClick={() => onOpen({ view: 'plain' })}>
        <Text role="captionStrong" measured={false}>In plain words</Text>
      </button>
      <button type="button" className="lokai-pressable" style={seg} onClick={() => onOpen({ view: 'original' })}>
        <Text role="captionStrong" tone="faint" measured={false}>Original</Text>
      </button>
    </Row>
  );
}

/* ── The shallow depth — a receipt is filed, not interpreted ──────────────────── */
export function DocumentReceiptTurn({ doc }: { doc: PreparedDocument }) {
  const lang = useUiLanguage();
  return (
    <Row gap={2} align="flex-start">
      <span style={{ flexShrink: 0, paddingTop: '2px', color: T.ok }}>
        <IconCheck size={ICON.ui} />
      </span>
      <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
        <Text role="bodyStrong" measured={false}>{doc.fileName}</Text>
        <Text role="caption" tone="quiet">{receiptAckFor(doc, lang)}</Text>
      </Stack>
    </Row>
  );
}

/* ── The reader — original vs plain, with clause correspondence ──────────────── */

function PaperTexture() {
  const lines: React.ReactNode[] = [];
  const step = 22;
  for (let y = 0; y <= 1600; y += step) {
    lines.push(<line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke={T.ink} strokeWidth="0.4" opacity="0.04" />);
  }
  for (let x = 0; x <= 1000; x += step) {
    lines.push(<line key={`v${x}`} x1={x} y1="0" x2={x} y2="1600" stroke={T.ink} strokeWidth="0.4" opacity="0.028" />);
  }
  return (
    <svg viewBox="0 0 1000 1600" preserveAspectRatio="xMinYMin slice" aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {lines}
    </svg>
  );
}

function ClauseLine({
  clause, active, refCb,
}: {
  clause: OriginalClause;
  active: boolean;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const tone = clause.highlight ? HIGHLIGHT_TONE[clause.highlight] : null;
  const isLetterhead = clause.block === 'letterhead';
  const isSign = clause.block === 'sign';

  return (
    <div
      ref={refCb}
      style={{
        borderRadius: LAYOUT.radius.sm,
        padding: tone ? `${S[1]} ${S[2]}` : `2px ${S[2]}`,
        margin: `0 -${S[2]}`,
        background: active && tone ? tone.fill : 'transparent',
        // The mark: a left-edge tick in the highlight's colour when it carries a
        // surfaced figure, so the eye can find the amount/section/deadline in a
        // wall of Marathi even before anything is tapped.
        boxShadow: tone ? `inset 2px 0 0 ${tone.color}` : 'none',
        transition: 'background 0.25s ease',
        textAlign: isLetterhead ? 'center' : (isSign ? 'right' : 'left'),
      }}
    >
      <Text
        role={isLetterhead ? 'captionStrong' : 'caption'}
        tone={isLetterhead ? 'default' : 'quiet'}
        lang="mr"
        measured={false}
        style={{ letterSpacing: 'normal' }}
      >
        {clause.text}
      </Text>
    </div>
  );
}

export function NoticeReaderSheet({
  open, doc, initialClauseId, initialView, onClose,
}: {
  open: boolean;
  doc: PreparedDocument | null;
  initialClauseId: string | null;
  initialView?: ReaderView;
  onClose: () => void;
}) {
  const lang = useUiLanguage();
  const [view, setView] = useState<ReaderView>('plain');
  const [activeClause, setActiveClause] = useState<string | null>(null);
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const interp = useMemo(() => (doc ? interpretationFor(doc, lang) : null), [doc, lang]);

  // Opening arrives with either a clause (a tapped figure → jump to Original and
  // scroll it in) or a plain/original view choice from the turn's toggle.
  useEffect(() => {
    if (!open) return;
    if (initialClauseId) {
      setView('original');
      setActiveClause(initialClauseId);
    } else {
      setView(initialView ?? 'plain');
      setActiveClause(null);
    }
  }, [open, initialClauseId, initialView]);

  // When the highlighted clause changes on the Original view, bring it into
  // view. The correspondence beat: the figure the user tapped, found for them
  // in the original they could not read.
  useEffect(() => {
    if (view !== 'original' || !activeClause) return;
    const el = clauseRefs.current[activeClause];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [view, activeClause]);

  const jumpToClause = (clauseId: string) => {
    setView('original');
    setActiveClause(clauseId);
  };

  if (!doc) return null;

  return (
    <Sheet open={open} onClose={onClose} label={doc.fileName} contain maxHeight="92%">
      <Stack gap={4} style={{ padding: `${S[4]} ${S[5]} ${S[6]}`, minHeight: 0, flex: 1, overflowY: 'auto' }}>
        {/* Identity + view toggle */}
        <Stack gap={3}>
          <Row gap={2} align="center">
            <IconFile size={ICON.row} color="var(--role-ink-faint)" />
            <Text role="bodyStrong" measured={false} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.fileName}
            </Text>
            <Badge tone="neutral">{doc.sourceLangLabel}</Badge>
          </Row>

          <Row gap={1} role="tablist" style={{ background: T.sunken, borderRadius: LAYOUT.radius.control, padding: S[1] }}>
            {(['plain', 'original'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className="lokai-pressable"
                style={{
                  flex: 1, minHeight: 38, border: 'none', cursor: 'pointer',
                  borderRadius: LAYOUT.radius.sm,
                  background: view === v ? T.raised : 'transparent',
                  boxShadow: view === v ? SHADOW.xs : 'none',
                  font: 'inherit',
                }}
              >
                <Text role="captionStrong" tone={view === v ? 'default' : 'faint'} measured={false}>
                  {v === 'plain' ? 'In plain words' : 'Original'}
                </Text>
              </button>
            ))}
          </Row>
        </Stack>

        {view === 'plain' && interp ? (
          <Stack gap={4}>
            <Text role="body">{interp.summary}</Text>
            <Stack gap={2}>
              <Label>{interp.fieldsLabel}</Label>
              <HairlineList>
                {interp.fields.map((f) => (
                  <FieldRow key={f.id} field={f} onOpen={jumpToClause} />
                ))}
              </HairlineList>
              <Text role="meta" tone="faint" style={{ letterSpacing: 'normal', textTransform: 'none' }}>
                Tap any figure to find it in the original. Read from a prepared example — nothing is uploaded or sent.
              </Text>
            </Stack>
          </Stack>
        ) : (
          <div style={{ position: 'relative', background: T.paper, borderRadius: LAYOUT.radius.sm, boxShadow: SHADOW.md, overflow: 'hidden' }}>
            <PaperTexture />
            <Stack gap={2} style={{ position: 'relative', zIndex: 1, padding: `${S[5]} ${S[4]} ${S[6]}` }}>
              {(doc.original ?? []).map((clause) => (
                <ClauseLine
                  key={clause.id}
                  clause={clause}
                  active={activeClause === clause.id}
                  refCb={(el) => { clauseRefs.current[clause.id] = el; }}
                />
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Sheet>
  );
}
