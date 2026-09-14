import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconFile, IconPlus, IconExternalLink, IconDownload } from '../ui/icons';
import { Badge, Text } from '../ui';
import { C, GRAD, LAYOUT, PLANE, SANS, SHADOW, TYPE } from '../components/shared';
import { ScopedAskButton, ScopedAskSheet } from '../components/ai/Turn';
import { useDemo } from '../context/DemoContext';
import { toast } from 'sonner';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .docs-scroll::-webkit-scrollbar       { width: 5px; }
  .docs-scroll::-webkit-scrollbar-track { background: transparent; }
  .docs-scroll::-webkit-scrollbar-thumb { background: var(--role-hairline); border-radius: 3px; }

  /* Card hover: surface change only — transform/lift was removed from the
     system as marketing-button physics that visually stuck on touch. The
     card lifts through the contact shadow only on hover, never translates. */
  .doc-card {
    background: var(--role-raised);
    border: 1px solid var(--role-hairline);
    border-radius: 16px;
    box-shadow: 0 1px 2px rgba(26,25,22,0.04), 0 2px 8px rgba(26,25,22,0.05);
    overflow: hidden;
    transition: box-shadow 0.18s ease;
    cursor: pointer;
  }
  .doc-card:hover {
    box-shadow: 0 4px 14px rgba(26,25,22,0.07), 0 8px 24px rgba(26,25,22,0.06);
  }

  .filter-tab {
    font-family: ${SANS};
    font-size: 13px;
    border: none;
    border-radius: 8px;
    padding: 6px 18px;
    cursor: pointer;
    transition: background 0.14s ease, color 0.14s ease;
    white-space: nowrap;
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus = 'Draft' | 'Completed';
type FilterTab  = 'All' | 'Draft' | 'Completed';

interface DocItem {
  id:          number;
  type:        string;
  title:       string;
  status:      DocStatus;
  date:        string;
  linkedChat:  string;
  linkedPath:  string;
  thumbLines:  Array<{ w: string; kind: 'title' | 'text' | 'thin' | 'field' }>;
  accentColor: string; // top stripe of mini-doc
}

// ─── Case Documents ───────────────────────────────────────────────────────────
const DOCUMENTS: DocItem[] = [
  {
    id: 1,
    type: 'Demand Notice',
    title: 'Consumer Demand Notice — Damaged Mixer',
    status: 'Draft',
    date: 'Prepared Jul 22, 2026',
    linkedChat: 'Consumer refund case',
    linkedPath: '/desktop/document-draft',
    accentColor: C.saffron,
    thumbLines: [
      { w: '55%', kind: 'title' },
      { w: '82%', kind: 'text'  },
      { w: '48%', kind: 'field' },
      { w: '90%', kind: 'text'  },
      { w: '64%', kind: 'thin'  },
    ],
  },
  {
    id: 2,
    type: 'Evidence Summary',
    title: 'Evidence Summary — Damaged Mixer',
    status: 'Completed',
    date: 'Prepared Jul 22, 2026',
    linkedChat: 'Consumer refund case',
    linkedPath: '/desktop/chat/consumer',
    accentColor: C.navy,
    thumbLines: [
      { w: '62%', kind: 'title' },
      { w: '38%', kind: 'field' },
      { w: '76%', kind: 'text'  },
      { w: '52%', kind: 'field' },
      { w: '85%', kind: 'thin'  },
    ],
  },
  {
    id: 3,
    type: 'Source Summary',
    title: 'Illustrative Sources — Expert Review Pending',
    status: 'Completed',
    date: 'Prepared Jul 22, 2026',
    linkedChat: 'Consumer refund case',
    linkedPath: '/desktop/chat/consumer',
    accentColor: C.green,
    thumbLines: [
      { w: '68%', kind: 'title' },
      { w: '90%', kind: 'text'  },
      { w: '57%', kind: 'text'  },
      { w: '43%', kind: 'field' },
      { w: '79%', kind: 'thin'  },
    ],
  },
  {
    id: 4,
    type: 'Case History',
    title: 'Audit Trail — Consumer Refund Case',
    status: 'Completed',
    date: 'Prepared Jul 22, 2026',
    linkedChat: 'Consumer refund case',
    linkedPath: '/desktop/chat/consumer',
    accentColor: C.navy,
    thumbLines: [
      { w: '52%', kind: 'title' },
      { w: '78%', kind: 'text'  },
      { w: '44%', kind: 'field' },
      { w: '86%', kind: 'text'  },
      { w: '60%', kind: 'thin'  },
    ],
  },
];

// ─── Status Chip ──────────────────────────────────────────────────────────────
const STATUS_BADGE_TONE: Record<DocStatus, 'flag' | 'ok'> = {
  'Draft':     'flag',
  'Completed': 'ok',
};

function StatusChip({ status }: { status: DocStatus }) {
  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
      <Badge tone={STATUS_BADGE_TONE[status]}>{status}</Badge>
    </div>
  );
}

// ─── Document Thumbnail ───────────────────────────────────────────────────────
// Renders a miniaturized paper-feel document preview — no icon, no colored
// top stripe (the stripe was a per-type accent, deleted as the generic
// SaaS tell — coverage now travels in the <Badge>).
function DocThumbnail({ doc }: { doc: DocItem }) {
  return (
    <div style={{
      position: 'relative', height: '140px',
      background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '14px',
    }}>
      <StatusChip status={doc.status} />

      {/* Mini document paper */}
      <div style={{
        width: '100%', height: '100%',
        background: 'var(--role-raised)',
        borderRadius: LAYOUT.radius.sm,
        border: `1px solid ${C.border}`,
        boxShadow: SHADOW.md,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Content area — no colored top stripe. Status travels in the chip
           above; the doc type lives in the body label below. */}
        <div style={{ padding: '14px 12px 10px', flex: 1, overflow: 'hidden' }}>
          {doc.thumbLines.map((line, i) => {
            if (line.kind === 'title') {
              return (
                <div key={i} style={{
                  width: line.w, height: '7px',
                  background: C.navy,
                  borderRadius: LAYOUT.radius.xs,
                  marginBottom: '7px',
                  opacity: 0.75,
                }} />
              );
            }
            if (line.kind === 'field') {
              return (
                <div key={i} style={{
                  width: line.w, height: '6px',
                  borderBottom: `1.5px dashed ${C.saffron}`,
                  background: 'rgba(232,131,42,0.08)',
                  borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.xs} ${LAYOUT.radius.none} ${LAYOUT.radius.none}`,
                  marginBottom: '7px',
                }} />
              );
            }
            if (line.kind === 'thin') {
              return (
                <div key={i} style={{
                  width: line.w, height: '4px',
                  background: 'var(--role-hairline)',
                  borderRadius: LAYOUT.radius.xs,
                  marginBottom: '7px',
                  opacity: 0.7,
                }} />
              );
            }
            // 'text'
            return (
              <div key={i} style={{
                width: line.w, height: '6px',
                background: 'var(--role-hairline-firm)',
                borderRadius: LAYOUT.radius.xs,
                marginBottom: '7px',
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────
function DocCard({ doc, onOpenChat }: { doc: DocItem; onOpenChat: (path: string) => void }) {
  const borderColor = doc.status === 'Completed' ? 'var(--role-anchor-tint)' : C.border;

  return (
    <div className="doc-card" style={{ border: `1px solid ${borderColor}` }}>
      {/* Thumbnail zone */}
      <DocThumbnail doc={doc} />

      {/* Card body */}
      <div style={{ padding: '14px 16px 12px' }}>
        {/* Document type chip */}
        <Text role="label" tone="faint" measured={false} style={{
          display: 'inline-block',
          background: C.surface2, borderRadius: LAYOUT.radius.xs,
          padding: '3px 8px', marginBottom: '9px',
        }}>
          {doc.type}
        </Text>

        {/* Title — 2 lines max */}
        <Text role="bodyStrong" tone="default" as="h3" measured={false} style={{
          lineHeight: 1.4, margin: '0 0 7px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {doc.title}
        </Text>

        {/* Date */}
        <Text role="caption" tone="faint" measured={false} style={{ marginBottom: '7px' }}>
          {doc.date}
        </Text>

        {/* Linked chat — link style */}
        <div
          onClick={e => { e.stopPropagation(); onOpenChat(doc.linkedPath); }}
          style={{ cursor: 'pointer' }}
        >
          <Text role="meta" tone="faint" measured={false}>
            Linked to:{' '}
            <span style={{
              color: C.navy,
              borderBottom: `1px solid rgba(28,58,110,0.28)`,
              paddingBottom: '1px',
            }}>
              {doc.linkedChat}
            </span>
          </Text>
        </div>
      </div>

      {/* Card footer — primary + quiet. Two filled buttons was the form-wizard
         tell; the L5 rule (one anchor per screen) forbids an outlined twin. */}
      <div style={{
        padding: '10px 16px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        <button
          type="button"
          className="lokai-pressable"
          onClick={e => { e.stopPropagation(); onOpenChat(doc.linkedPath); }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            flex: 1, minHeight: 36, padding: '0 12px',
            background: C.navy, color: 'var(--role-on-anchor)',
            border: 'none', borderRadius: LAYOUT.radius.control,
            fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <IconExternalLink style={{ width: '12px', height: '12px' }} />
          Open
        </button>
        <button
          type="button"
          className="lokai-pressable"
          onClick={e => { e.stopPropagation(); downloadDocument(doc); }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            minHeight: 36, padding: '0 10px',
            background: 'none', color: C.muted,
            border: 'none', borderRadius: LAYOUT.radius.sm,
            fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <IconDownload style={{ width: '12px', height: '12px' }} />
          Download
        </button>
      </div>
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS: FilterTab[] = ['All', 'Draft', 'Completed'];

function downloadDocument(doc: DocItem) {
  const body = [
    doc.title,
    '',
    `Type: ${doc.type}`,
    `Status: ${doc.status}`,
    `Created: ${doc.date}`,
    `Linked conversation: ${doc.linkedChat}`,
    '',
    'Document export preview',
  ].join('\n');

  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function FilterTabs({ active, onSelect }: { active: FilterTab; onSelect: (t: FilterTab) => void }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: C.surface2,
      borderRadius: LAYOUT.radius.control,
      padding: '4px',
      gap: '2px',
    }}>
      {FILTER_TABS.map(tab => (
        <button
          key={tab}
          className="filter-tab"
          onClick={() => onSelect(tab)}
          style={{
            background: active === tab ? C.navy : 'transparent',
            color: active === tab ? 'var(--role-on-anchor)' : C.muted,
            fontWeight: active === tab ? 600 : 400,
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Case Files Page ──────────────────────────────────────────────────────────
export default function Documents() {
  const navigate               = useNavigate();
  const { scenario, facts, language, auditEvents, draftAllowed, draftApproved } = useDemo();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [askOpen, setAskOpen] = useState(false);

  const confirmedCount = facts.filter((f) => f.state === 'confirmed').length;
  const matterDocs: DocItem[] = DOCUMENTS.map((doc) => ({
    ...doc,
    linkedChat: scenario.matterTitle,
    status: doc.id === 1
      ? (draftAllowed && draftApproved ? 'Completed' : 'Draft')
      : doc.status,
    title: doc.id === 1
      ? `Consumer Demand Notice — ${scenario.matterTitle}`
      : doc.id === 4
        ? `Audit Trail — ${scenario.matterTitle}`
        : doc.title,
  }));

  // Filter documents based on active tab
  const filtered = matterDocs.filter(doc => {
    if (activeTab === 'All')       return true;
    if (activeTab === 'Draft')     return doc.status === 'Draft';
    if (activeTab === 'Completed') return doc.status === 'Completed';
    return true;
  });

  // Dynamic subtitle per filter
  const subtitle = (() => {
    if (activeTab === 'All')       return `${filtered.length} case files · ${confirmedCount}/${facts.length} facts confirmed · ${language.toUpperCase()}`;
    if (activeTab === 'Draft')     return `${filtered.length} draft${filtered.length !== 1 ? 's' : ''}`;
    if (activeTab === 'Completed') return `${filtered.length} completed file${filtered.length !== 1 ? 's' : ''}`;
    return '';
  })();

  // Empty state label per filter
  const emptyLabel = (() => {
    if (activeTab === 'All')       return 'No case files yet';
    if (activeTab === 'Draft')     return 'No drafts yet';
    if (activeTab === 'Completed') return 'No completed files yet';
    return 'No case files yet';
  })();

  return (
    <main style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: PLANE.reading, overflow: 'hidden',
    }}>
      <style>{PAGE_CSS}</style>

      <div
        className="docs-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '36px 48px 48px' }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* ── Page Header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', marginBottom: '6px',
          }}>
            {/* Left: heading */}
            <div>
              <h1 style={{
                fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 600,
                color: C.ink, margin: '0 0 5px',
              }}>
                Case Files
              </h1>
              <p style={{
                fontFamily: SANS, fontSize: TYPE.body.size, color: C.muted, margin: 0,
              }}>
                {subtitle}
              </p>
              <p style={{
                fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, margin: '6px 0 0',
              }}>
                {scenario.statusTitle} · {auditEvents.length} audit events
              </p>
            </div>

            {/* Right: Create Document CTA — uses the system Button primitive
                (flat navy fill) instead of the legacy GRAD.buttonPrimary
                two-stop gradient, which read as decoration on a legal tool. */}
            <button
              type="button"
              className="lokai-pressable"
              onClick={() => navigate('/desktop/document-draft')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: C.navy,
                border: 'none', borderRadius: LAYOUT.radius.control,
                fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600,
                color: 'var(--role-on-anchor)', padding: '10px 22px',
                cursor: 'pointer', flexShrink: 0,
                opacity: draftAllowed ? 1 : 0.55,
              }}
              title={draftAllowed ? 'Open the demand-notice packet' : 'Draft blocked until facts and policy allow it'}
            >
              <IconPlus style={{ width: '15px', height: '15px' }} />
              Open Packet
            </button>
          </div>

          {/* ── Filter Tabs ── */}
          <div style={{ marginTop: '24px', marginBottom: '28px' }}>
            <FilterTabs active={activeTab} onSelect={setActiveTab} />
          </div>

          {/* ── Document Grid — 3 columns ── */}
          {filtered.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}>
              {filtered.map(doc => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onOpenChat={path => navigate(path)}
                />
              ))}
            </div>
          ) : (
            /* Empty state when filter returns no results */
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '80px 0', textAlign: 'center',
            }}>
              {/* Document icon ring */}
              <div style={{
                width: '64px', height: '64px', borderRadius: LAYOUT.radius.full,
                background: 'var(--role-raised)', border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: SHADOW.sm,
              }}>
                <IconFile style={{ width: 24, height: 24, color: C.navy }} />
              </div>
              <p style={{
                fontFamily: SANS, fontSize: TYPE.title.size, fontWeight: 600,
                color: C.ink, margin: '0 0 8px',
              }}>
                {emptyLabel}
              </p>
              <p style={{
                fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted,
                margin: '0 0 24px', lineHeight: 1.6,
              }}>
                Packets, source notes, evidence summaries, and case history will appear here.
              </p>
              <button
                type="button"
                className="lokai-pressable"
                onClick={() => navigate('/desktop/chat')}
                style={{
                  fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 500,
                  color: C.navy, background: 'transparent',
                  border: `1px solid ${C.navy}`, borderRadius: LAYOUT.radius.control,
                  padding: '8px 20px', cursor: 'pointer',
                }}
              >
                Start a conversation
              </button>
            </div>
          )}

        </div>
      </div>
      <ScopedAskButton label="Ask about a file" onClick={() => setAskOpen(true)} />
      <ScopedAskSheet
        open={askOpen}
        onClose={() => setAskOpen(false)}
        title="Ask about a case file"
        suggestions={[
          'What evidence is still missing?',
          'Summarise the demand notice draft',
          'Which claims are source-backed?',
        ]}
        onSubmit={(text) => {
          toast.message('Prepared answer queued', { description: text.slice(0, 80) });
          navigate('/desktop/chat/consumer', { state: { initialQuestion: text } });
        }}
      />
    </main>
  );
}
