import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useReducedMotion } from 'motion/react';
import { IconFile, IconImage, IconAttach } from '../../ui/icons';
import {
  Stack, Row, Text, Button, HairlineList, HairlineRow,
  T, S, LAYOUT, ICON, typeStyle, useSystemStyles,
} from '../../ui';
import { C, LogoMark } from '../../components/shared';
import { Composer } from '../../components/ai/Turn';
import { Sheet } from '../../components/Sheet';
import { AppScreen } from '../../components/mobile/AppScreen';
import { MobileRouteCanvas } from './MobileHome';
import {
  DocumentBubble, NoticeInterpretTurn, DocumentReceiptTurn, NoticeReaderSheet, type ReaderView,
} from '../../components/mobile/NoticeInterpret';
import { ScanDocumentCard } from '../../components/mobile/ScanDocument';
import { PREPARED_DOCUMENTS, getPreparedDocument, type PreparedDocument } from '../../data/noticeInterpretation';

/**
 * The Notice Interpreter, as a mobile chat surface (§3.8 / §3.8a).
 *
 * The founding thesis rendered as an interaction: a person receiving a legal
 * notice in a language they can't read drops it into the conversation, and the
 * response IS the interpretation. Every document enters the same way; the app
 * decides the depth from the document (a notice gets fields extracted and an
 * original to read; a receipt is filed with one line), not the user.
 *
 * Deterministic-demo: attaching is a pick from a scripted set, never a file
 * input (`verify-demo.mjs` forbids `type=file`) — which also means the demo can
 * never fail on a bad scan.
 */

type StreamItem =
  | { id: number; type: 'doc'; doc: PreparedDocument }
  | { id: number; type: 'status' }
  | { id: number; type: 'notice'; doc: PreparedDocument }
  | { id: number; type: 'receipt'; doc: PreparedDocument }
  | { id: number; type: 'user-text'; text: string }
  | { id: number; type: 'assistant-text'; text: string };

const DOC_META: Record<string, { Icon: React.ComponentType<{ size?: number }>; blurb: string }> = {
  'bmc-property-tax': { Icon: IconFile, blurb: 'A government demand in Marathi, the kind you came here unable to read.' },
  'payment-receipt': { Icon: IconImage, blurb: 'A photo of a receipt, kept as evidence, nothing to act on.' },
};

export function AttachSheet({
  open, onClose, onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (doc: PreparedDocument) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} label="Attach a document" contain maxHeight="60%">
      <Stack gap={3} style={{ padding: `${S[4]} ${S[5]} ${S[6]}` }}>
        <Stack gap={1}>
          <Text role="answer">Attach a document</Text>
          <Text role="caption" tone="quiet">
            Pick a prepared example — no file, photo, or network access is requested.
          </Text>
        </Stack>
        <HairlineList>
          {PREPARED_DOCUMENTS.map((doc) => {
            const meta = DOC_META[doc.id] ?? { Icon: IconFile, blurb: '' };
            return (
              <HairlineRow
                key={doc.id}
                onClick={() => onPick(doc)}
                leading={
                  <span style={{
                    width: 40, height: 40, borderRadius: LAYOUT.radius.panel,
                    background: T.sunken, color: T.inkQuiet,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <meta.Icon size={ICON.row} />
                  </span>
                }
              >
                <Text role="bodyStrong" measured={false}>{doc.fileName}</Text>
                <Text role="caption" tone="quiet" measured={false}>{meta.blurb}</Text>
              </HairlineRow>
            );
          })}
        </HairlineList>
      </Stack>
    </Sheet>
  );
}

function NoticeArtboard() {
  useSystemStyles();
  const reduce = useReducedMotion();
  const [items, setItems] = useState<StreamItem[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);
  const [readerDoc, setReaderDoc] = useState<PreparedDocument | null>(null);
  const [readerClause, setReaderClause] = useState<string | null>(null);
  const [readerView, setReaderView] = useState<ReaderView>('plain');
  const [readerOpen, setReaderOpen] = useState(false);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  // The most recently interpreted notice — drives the persistent strip.
  const noticeDoc = [...items].reverse().find((i) => i.type === 'notice')?.doc ?? null;

  const attach = (doc: PreparedDocument, immediate = false) => {
    setAttachOpen(false);
    const docItem: StreamItem = { id: nextId(), type: 'doc', doc };
    const turnItem: StreamItem = doc.kind === 'notice'
      ? { id: nextId(), type: 'notice', doc }
      : { id: nextId(), type: 'receipt', doc };

    // Deep-linked / reduced-motion: land directly on the resolved turn with no
    // "reading…" flash. Interactive attach shows the staged read.
    if (immediate || reduce) {
      setItems((prev) => [...prev, docItem, turnItem]);
      return;
    }
    const statusItem: StreamItem = { id: nextId(), type: 'status' };
    setItems((prev) => [...prev, docItem, statusItem]);
    /* The scan beat (M4): 1.7s narrated read — the ScanDocumentCard's sweep
       is timed to this same duration, so the animation IS the staging. */
    window.setTimeout(() => {
      setItems((prev) => [...prev.filter((i) => i.id !== statusItem.id), turnItem]);
    }, 1700);
  };

  /* Deep-linkable, like the rest of the app (?stage=, ?notice=): ?doc=<id>
     lands on the interpreted turn, and &open=1 (optionally &clause=<id>) opens
     the reader — the case-study captures and the dev catalog point here. */
  const [params] = useSearchParams();
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    const docId = params.get('doc');
    if (!docId) return;
    const doc = getPreparedDocument(docId);
    if (!doc) return;
    bootstrapped.current = true;
    attach(doc, true);
    if (params.get('open') === '1') {
      openReader(doc, { clauseId: params.get('clause') ?? undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const openReader = (doc: PreparedDocument, opts?: { clauseId?: string; view?: ReaderView }) => {
    setReaderDoc(doc);
    setReaderClause(opts?.clauseId ?? null);
    setReaderView(opts?.view ?? 'plain');
    setReaderOpen(true);
  };

  const handleAsk = (text: string) => {
    setItems((prev) => [
      ...prev,
      { id: nextId(), type: 'user-text', text },
      {
        id: nextId(),
        type: 'assistant-text',
        text: noticeDoc
          ? 'The details are in the card above, or tap the strip below to read them alongside the original. Attach another document any time with the clip.'
          : 'Attach the document with the clip and I’ll read it — translate it, summarise it in plain words, and pull out the amount, deadline, and legal section.',
      },
    ]);
  };

  const isEmpty = items.length === 0;

  /* Pending attachment — the review-before-commit contract applied to the
     composer itself: picking a document parks it as a removable chip in the
     tray; nothing is read until the user sends. The same gate the voice
     transcript and the demand notice follow. */
  const [pendingDoc, setPendingDoc] = useState<PreparedDocument | null>(null);

  const action = (
    <Stack gap={2}>
      {/* The persistent strip (§3.8a): once a notice is read, ONE quiet line
          sits above the composer for the rest of the conversation — the whole
          answer to "how do I see the summary while I'm chatting", at the cost
          of one line. Always tappable, reopens the reader at any depth. */}
      {noticeDoc && (
        <button
          type="button"
          onClick={() => openReader(noticeDoc)}
          className="lokai-pressable"
          style={{
            display: 'flex', alignItems: 'center', gap: S[2],
            alignSelf: 'stretch',
            padding: `${S[2]} ${S[3]}`,
            borderRadius: LAYOUT.radius.pill,
            border: `1px solid ${C.border}`,
            background: 'var(--role-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            cursor: 'pointer',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          <IconFile size={16} style={{ flexShrink: 0, color: T.inkQuiet }} />
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...typeStyle('captionStrong'), color: C.ink }}>
            {noticeDoc.fileName} · in plain words
          </span>
          <span aria-hidden style={{ color: T.inkQuiet, flexShrink: 0 }}>↗</span>
        </button>
      )}
      <Composer
        compact
        showVoice={false}
        placeholder={pendingDoc
          ? 'Add a question, or send to read it…'
          : noticeDoc
            ? 'Ask about this document…'
            : 'Attach a notice, or ask about it…'}
        attachments={pendingDoc ? [{ id: pendingDoc.id, label: pendingDoc.fileName }] : undefined}
        onRemoveAttachment={() => setPendingDoc(null)}
        onAttach={() => setAttachOpen(true)}
        onSubmit={(text) => {
          if (pendingDoc) {
            attach(pendingDoc);
            setPendingDoc(null);
          }
          if (text) handleAsk(text);
        }}
      />
    </Stack>
  );

  return (
    <AppScreen
      context={<Text role="meta" tone="faint">Notice reader</Text>}
      action={action}
      scrollClearance={S[6]}
    >
      {isEmpty ? (
        <Stack gap={3} align="center" style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>
          <LogoMark size={44} />
          <Text role="answer" style={{ textAlign: 'center' }}>Have a document you can’t read?</Text>
          <Text tone="quiet" style={{ textAlign: 'center' }}>
            Attach a notice, letter, or receipt. LokAI reads it in its own language and
            explains it in yours — with the amount, deadline, and legal section pulled out.
          </Text>
          <Button
            size="md"
            icon={<IconAttach size={ICON.ui} />}
            onClick={() => setAttachOpen(true)}
            style={{ marginTop: S[2] }}
          >
            Attach a document
          </Button>
        </Stack>
      ) : (
        <Stack gap={4}>
          {items.map((item) => {
            switch (item.type) {
              case 'doc':
                return <DocumentBubble key={item.id} doc={item.doc} />;
              case 'status':
                /* What's arriving is a DOCUMENT being READ — the scan beat
                   (M4): a paper page with a saffron scan bar, the animation
                   timed to the prepared read. A content-shaped wait, not a
                   spinner (audit D3), now with the material of the thing
                   itself. */
                return <ScanDocumentCard key={item.id} label="Reading the document…" />;
              case 'notice':
                return (
                  <NoticeInterpretTurn
                    key={item.id}
                    doc={item.doc}
                    onOpen={(arg) => openReader(item.doc, arg)}
                  />
                );
              case 'receipt':
                return <DocumentReceiptTurn key={item.id} doc={item.doc} />;
              case 'user-text':
                return (
                  <Row key={item.id} justify="end">
                    <div style={{ background: T.anchorTint, borderRadius: LAYOUT.radius.card, padding: `${S[2]} ${S[3]}`, maxWidth: '82%' }}>
                      <Text role="body" tone="anchor" measured={false}>{item.text}</Text>
                    </div>
                  </Row>
                );
              case 'assistant-text':
                return <Text key={item.id} role="body">{item.text}</Text>;
              default:
                return null;
            }
          })}
        </Stack>
      )}

      <AttachSheet
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        onPick={(doc) => {
          setPendingDoc(doc);
          setAttachOpen(false);
        }}
      />
      <NoticeReaderSheet
        open={readerOpen}
        doc={readerDoc}
        initialClauseId={readerClause}
        initialView={readerView}
        onClose={() => setReaderOpen(false)}
      />
    </AppScreen>
  );
}

export default function MobileNoticeInterpret() {
  return (
    <MobileRouteCanvas>
      <NoticeArtboard />
    </MobileRouteCanvas>
  );
}
