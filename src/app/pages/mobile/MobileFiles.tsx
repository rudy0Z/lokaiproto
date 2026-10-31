import React, { useMemo, useState } from 'react';
import { IconFile, IconFolder, IconPlus } from '../../ui/icons';
import { useNavigate } from 'react-router';
import {
  Stack, Row, Rule, HairlineList, HairlineRow,
  Text, Label, Amount, Badge, Button, IconButton,
  T, S, LAYOUT, ICON, useSystemStyles,
} from '../../ui';
import { MobileRouteCanvas } from './MobileHome';
import { AppScreen } from '../../components/mobile/AppScreen';
import { ExhibitPaper } from '../../components/mobile/ExhibitPaper';
import { MatterFolder } from '../../components/mobile/MatterFolder';
import { Sheet } from '../../components/Sheet';
import { getEvidenceLocker, type EvidenceItem } from '../../data/caseWorkflow';
import { getPreparedDocumentForExhibit } from '../../data/noticeInterpretation';
import { EVIDENCE_STATUS_VIEW } from '../../data/statusVocabulary';
import { useConversations } from '../../context/ConversationContext';

/**
 * Documents — exhibits in a matter, not files in folders.
 *
 * Replaces the old files screen (4 hardcoded rows, every one an identical
 * generic file icon in a 42px tile). The reframe is `MOBILE_AI_SYSTEM.md` §3.9:
 * in a legal matter a document exists because it *proves* something, and its
 * value is its relationship to a claim. So each row is an exhibit — a mono
 * reference (how it will be cited), a paper thumbnail, what it proves, and its
 * state — grouped under its matter.
 *
 * Reference read (product owner's decks): date/case grouping, a left rail, and
 * documents as real paper objects rather than icon rows. Taken: the paper
 * object (`ExhibitPaper`) and case grouping. The 2026-08-26 pass also rejected
 * a "glossy 3D folder" as skeuomorphic for the flat-paper register — that
 * rejection is superseded 2026-09-28 by the Vellum direction (owner-approved):
 * `MatterFolder` is the restrained, paper-toned descendant of that idea, now
 * the screen's hero object. One matter today shows as one folder; the
 * structure holds for more matters without a redesign.
 *
 * States (L1 — only the exception gets a fill): `uploaded` plain, `missing` a
 * dashed placeholder with a quiet add, `conflicting` the one filled row. That
 * conflicting row is reachable for the first time — the data that feeds it was
 * restored 2026-08-26 (see getEvidenceLocker).
 */

/** Exhibit references are assigned in source order, so EX-01 is stable no
 *  matter how the list is sorted for display. */
function withReferences(items: EvidenceItem[]) {
  return items.map((item, i) => ({ item, ref: `EX-${String(i + 1).padStart(2, '0')}` }));
}

/** Display order: the conflict first (it needs a decision), then gathered, then
 *  the optional gaps. */
const STATUS_ORDER: Record<EvidenceItem['status'], number> = {
  conflicting: 0, uploaded: 1, missing: 2,
};

/* Labels + tones come from the shared status vocabulary — the same state
   renders identically everywhere (audit V4). */
function statusBadge(status: EvidenceItem['status']) {
  const view = EVIDENCE_STATUS_VIEW[status];
  return <Badge tone={view.tone}>{view.label}</Badge>;
}

/** A clean document glyph tile, tinted by state — replaces the colour-lined
 *  paper thumbnail, which read as noisy at row size. Missing gets a dashed
 *  outline (a slot to fill); a conflict gets the one warm fill. */
function DocIcon({ status }: { status: EvidenceItem['status'] }) {
  const conflicting = status === 'conflicting';
  const missing = status === 'missing';
  return (
    <span style={{
      width: 44, height: 44, borderRadius: LAYOUT.radius.panel,
      background: conflicting ? T.flagFill : missing ? 'transparent' : T.sunken,
      color: conflicting ? T.flag : T.inkQuiet,
      border: missing ? `1px dashed ${T.hairlineFirm}` : 'none',
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      {missing
        ? <IconPlus size={ICON.row} color="var(--role-ink-faint)" />
        : <IconFile size={ICON.row} />}
    </span>
  );
}

function ExhibitRow({
  item, refId, onOpen,
}: {
  item: EvidenceItem;
  refId: string;
  onOpen: () => void;
}) {
  const conflicting = item.status === 'conflicting';
  const missing = item.status === 'missing';
  return (
    <HairlineRow
      flagged={conflicting}
      onClick={missing ? undefined : onOpen}
      leading={<DocIcon status={item.status} />}
    >
      {/* Reference and status share the meta line, so the title gets the full
          width below them. A badge riding alongside the title wrapped it to
          four lines — the same trap the drawer's status badge hit. */}
      <Row gap={2} justify="between" align="center">
        <Amount tone="faint">{refId}</Amount>
        {statusBadge(item.status)}
      </Row>
      <Text role="bodyStrong" measured={false}>{item.label}</Text>
      {item.proves && (
        <Text role="caption" tone="quiet" measured={false}>{item.proves}</Text>
      )}
      {/* The row flags the conflict in one line; the full note lives in the
          sheet the row opens (L7 — say it once, and say the detail where the
          decision is made). */}
      {conflicting && (
        <Text role="caption" tone="flag" measured={false}>
          The dates disagree, so tap to confirm the purchase date.
        </Text>
      )}
    </HairlineRow>
  );
}

/** The detail sheet — In plain words / Original. Clause-linking on the Original
 *  view is the notice-interpreter pass (§3.8a); this is the shell and the tap
 *  target it opens. */
function ExhibitSheet({ open, item, refId, onClose }: {
  open: boolean; item: EvidenceItem | null; refId: string; onClose: () => void;
}) {
  const [view, setView] = useState<'plain' | 'original'>('plain');
  const navigate = useNavigate();
  if (!item) return null;
  const prepared = getPreparedDocumentForExhibit(item.id);

  return (
    <Sheet open={open} onClose={onClose} label={item.label} contain maxHeight="82%">
      <Stack gap={4} style={{ padding: `${S[4]} ${S[5]} ${S[6]}` }}>
        <Stack gap={2}>
          <Row gap={2}>
            <Amount tone="faint">{refId}</Amount>
            {statusBadge(item.status)}
          </Row>
          <Text role="answer">{item.label}</Text>
          {item.proves && <Text tone="quiet">{item.proves}</Text>}
        </Stack>

        {/* View toggle — plain-words vs the original document */}
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
                font: 'inherit',
              }}
            >
              <Text role="captionStrong" tone={view === v ? 'default' : 'faint'} measured={false}>
                {v === 'plain' ? 'In plain words' : 'Original'}
              </Text>
            </button>
          ))}
        </Row>

        {view === 'plain' ? (
          <Stack gap={3}>
            {item.extractedFacts?.length ? (
              <HairlineList>
                {item.extractedFacts.map((f) => (
                  <HairlineRow key={f.label} trailing={<Amount>{f.value}</Amount>}>
                    <Text role="body" measured={false}>{f.label}</Text>
                  </HairlineRow>
                ))}
              </HairlineList>
            ) : (
              <Text tone="quiet">
                This document has not been added yet, so there is nothing to read from it.
              </Text>
            )}
            <Text role="meta" tone="faint" style={{ letterSpacing: 'normal', textTransform: 'none' }}>
              Read from a prepared example — nothing is uploaded or sent.
            </Text>
          </Stack>
        ) : (
          <Stack gap={3}>
            <Row gap={4} align="flex-start">
              <ExhibitPaper kind={item.kind} status={item.status} width={96} />
              <Text tone="quiet" style={{ flex: 1 }}>
                The original stays with the prepared notice example — LokAI never stores what you attach.
              </Text>
            </Row>
            {/* The connected path: a document's interpretation belongs in the
                conversation it is relevant to, not in a separate reader you
                have to remember you opened. The reader stays available as the
                quiet action for when you want the original side by side.

                Both doors route by PREPARED id, not by exhibit id — the two
                namespaces are different, and routing by exhibit id sent the
                reader to a deep link that resolved to nothing. When there is
                no prepared reading, neither door renders and the sheet says so,
                because the sheet's own plain-words tab IS the reading here. */}
            {prepared ? (
              <>
                <Button
                  size="md"
                  onClick={() => navigate(`/mobile/home?doc=${prepared.id}`)}
                >
                  Ask about this in chat
                </Button>
                <Button
                  variant="quiet"
                  size="sm"
                  align="start"
                  onClick={() => navigate(`/mobile/notice?doc=${prepared.id}`)}
                >
                  Open the original reader
                </Button>
              </>
            ) : (
              <Text role="caption" tone="quiet" measured={false}>
                This one has no separate reading to open — what LokAI can say about
                it is above, on the plain-words side.
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
}

function DocumentsArtboard() {
  useSystemStyles();
  const navigate = useNavigate();
  const { conversations, activeId } = useConversations();
  const [openId, setOpenId] = useState<string | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const referenced = useMemo(() => withReferences(getEvidenceLocker()), []);
  const sorted = useMemo(
    () => [...referenced].sort((a, b) => STATUS_ORDER[a.item.status] - STATUS_ORDER[b.item.status]),
    [referenced],
  );

  const gathered = referenced.filter((r) => r.item.status === 'uploaded').length;
  const flagged = referenced.filter((r) => r.item.status === 'conflicting').length;
  const optional = referenced.filter((r) => r.item.status === 'missing').length;

  const open = referenced.find((r) => r.item.id === openId) ?? null;

  return (
    <AppScreen
      context={<Text role="meta" tone="faint">Documents</Text>}
      scrollClearance={S[6]}
    >
      {/* The matter is the group; its heading is the only place the name
          appears (the context strip above says just "Documents", so the name
          is not stated twice). One quiet summary line under it — not a card,
          not a meter. */}
      <Stack gap={4}>
      {/* The matter as a folder — documents are grouped case-wise, so the
          hero IS the case folder (MatterFolder: tap swings the flap, the
          first exhibits fan out, tap a card to open its sheet). The counts
          stay one quiet line beneath — not a card, not a meter. */}
      <Stack gap={3} align="center">
        <MatterFolder
          items={referenced.slice(0, 3).map(({ item, ref }) => ({ id: item.id, reference: ref, label: item.label }))}
          label={`${active?.title ?? 'Consumer refund'} · ${referenced.length} documents — tap to open`}
          onOpenExhibit={(id) => setOpenId(id)}
        />
        <Text role="caption" tone="quiet" measured={false}>
          <Amount>{gathered}</Amount> gathered
          {flagged ? <> · <Amount tone="flag">{flagged}</Amount> to check</> : null}
          {optional ? <> · <Amount tone="faint">{optional}</Amount> optional</> : null}
        </Text>
      </Stack>
      <Rule />
      <HairlineList>
        {sorted.map(({ item, ref }) => (
          <ExhibitRow key={item.id} item={item} refId={ref} onOpen={() => setOpenId(item.id)} />
        ))}
      </HairlineList>
      </Stack>

      {/* Add a document — a prepared pick, never a real file input (the demo
          forbids type=file). Quiet, not a primary CTA: browsing is the job here. */}
      <Row gap={2} align="center">
        <IconButton label="Add a document" onClick={() => navigate('/mobile/notice')}>
          <IconPlus size={ICON.row} />
        </IconButton>
        <Button variant="quiet" size="sm" onClick={() => navigate('/mobile/notice')}>
          Add a document to this matter
        </Button>
      </Row>

      <ExhibitSheet
        open={openId !== null}
        item={open?.item ?? null}
        refId={open?.ref ?? ''}
        onClose={() => setOpenId(null)}
      />
    </AppScreen>
  );
}

export default function MobileFiles() {
  return (
    <MobileRouteCanvas>
      <DocumentsArtboard />
    </MobileRouteCanvas>
  );
}
