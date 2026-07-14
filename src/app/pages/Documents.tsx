import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ExternalLink, Download } from 'lucide-react';
import { SANS, C, GRAD, SHADOW } from '../components/shared';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .docs-scroll::-webkit-scrollbar       { width: 5px; }
  .docs-scroll::-webkit-scrollbar-track { background: transparent; }
  .docs-scroll::-webkit-scrollbar-thumb { background: #E0DDD5; border-radius: 3px; }
  .docs-scroll::-webkit-scrollbar-thumb:hover { background: ${C.saffron}; }

  .doc-card {
    background: #FFFFFF;
    border: 1px solid #E8E4DC;
    border-radius: 16px;
    box-shadow: 0 1px 2px rgba(26,25,22,0.04), 0 2px 8px rgba(26,25,22,0.05);
    overflow: hidden;
    transition: box-shadow 0.18s ease, transform 0.18s ease;
    cursor: pointer;
  }
  .doc-card:hover {
    box-shadow: 0 8px 24px rgba(26,25,22,0.09), 0 2px 8px rgba(26,25,22,0.06);
    transform: translateY(-3px);
  }

  .doc-footer-btn {
    font-family: ${SANS};
    font-size: 12px;
    border-radius: 8px;
    padding: 6px 0;
    cursor: pointer;
    flex: 1;
    transition: background 0.13s ease;
    background: transparent;
  }
  .doc-footer-btn-primary {
    color: ${C.navy};
    border: 1px solid ${C.navy};
  }
  .doc-footer-btn-primary:hover { background: rgba(28,58,110,0.06); }
  .doc-footer-btn-secondary {
    color: ${C.muted};
    border: 1px solid ${C.border};
  }
  .doc-footer-btn-secondary:hover { background: #F5F2EC; }

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

  .create-btn:hover { opacity: 0.88; }
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
    title: 'Consumer Demand Notice — Defective Phone',
    status: 'Draft',
    date: 'Created Mar 25, 2026',
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
    title: 'Evidence Summary — Defective Phone',
    status: 'Completed',
    date: 'Updated Mar 25, 2026',
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
    title: 'Sources Used — Consumer Protection Act',
    status: 'Completed',
    date: 'Checked Mar 25, 2026',
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
    date: 'Updated Mar 25, 2026',
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
const STATUS_STYLES: Record<DocStatus, React.CSSProperties> = {
  'Draft':     { background: '#FFF3E8', color: '#E8832A' },
  'Completed': { background: '#EEF2F8', color: '#132846' },
};

function StatusChip({ status }: { status: DocStatus }) {
  return (
    <div style={{
      position: 'absolute', top: '10px', right: '10px', zIndex: 2,
      ...STATUS_STYLES[status],
      fontFamily: SANS, fontSize: '10px', fontWeight: 600,
      borderRadius: '4px', padding: '3px 8px',
      letterSpacing: '0.02em',
    }}>
      {status}
    </div>
  );
}

// ─── Document Thumbnail ───────────────────────────────────────────────────────
// Renders a miniaturized paper-feel document preview — no icon, rendered content
function DocThumbnail({ doc }: { doc: DocItem }) {
  return (
    <div style={{
      position: 'relative', height: '140px',
      background: '#F5F2EC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '14px',
    }}>
      <StatusChip status={doc.status} />

      {/* Mini document paper */}
      <div style={{
        width: '100%', height: '100%',
        background: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid #E8E4DC',
        boxShadow: '0 2px 8px rgba(26,25,22,0.09)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Document type accent stripe — 5px, colored by doc type */}
        <div style={{
          height: '5px', flexShrink: 0,
          background: doc.accentColor,
          opacity: 0.8,
        }} />

        {/* Content area */}
        <div style={{ padding: '10px 12px', flex: 1, overflow: 'hidden' }}>
          {doc.thumbLines.map((line, i) => {
            if (line.kind === 'title') {
              return (
                <div key={i} style={{
                  width: line.w, height: '7px',
                  background: C.navy,
                  borderRadius: '3px',
                  marginBottom: '7px',
                  opacity: 0.75,
                }} />
              );
            }
            if (line.kind === 'field') {
              return (
                <div key={i} style={{
                  width: line.w, height: '6px',
                  borderBottom: '1.5px dashed #E8832A',
                  background: 'rgba(232,131,42,0.08)',
                  borderRadius: '2px 2px 0 0',
                  marginBottom: '7px',
                }} />
              );
            }
            if (line.kind === 'thin') {
              return (
                <div key={i} style={{
                  width: line.w, height: '4px',
                  background: '#D8D4CC',
                  borderRadius: '2px',
                  marginBottom: '7px',
                  opacity: 0.7,
                }} />
              );
            }
            // 'text'
            return (
              <div key={i} style={{
                width: line.w, height: '6px',
                background: '#C8C4BC',
                borderRadius: '3px',
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
  const borderColor = doc.status === 'Completed' ? '#C8D8F0' : '#E8E4DC';

  return (
    <div className="doc-card" style={{ border: `1px solid ${borderColor}` }}>
      {/* Thumbnail zone */}
      <DocThumbnail doc={doc} />

      {/* Card body */}
      <div style={{ padding: '14px 16px 12px' }}>
        {/* Document type chip */}
        <div style={{
          display: 'inline-block',
          fontFamily: SANS, fontSize: '10px', fontWeight: 600,
          color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.08em',
          background: '#F4F2EE', borderRadius: '4px',
          padding: '3px 8px', marginBottom: '9px',
        }}>
          {doc.type}
        </div>

        {/* Title — 2 lines max */}
        <h3 style={{
          fontFamily: SANS, fontSize: '14px', fontWeight: 600,
          color: '#1A1916', lineHeight: 1.4, margin: '0 0 7px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {doc.title}
        </h3>

        {/* Date */}
        <div style={{
          fontFamily: SANS, fontSize: '12px', color: '#8A8880',
          marginBottom: '7px',
        }}>
          {doc.date}
        </div>

        {/* Linked chat — 11px, link style */}
        <div
          onClick={e => { e.stopPropagation(); onOpenChat(doc.linkedPath); }}
          style={{
            fontFamily: SANS, fontSize: '11px', color: '#8A8880',
            cursor: 'pointer',
          }}
        >
          Linked to:{' '}
          <span style={{
            color: C.navy,
            borderBottom: `1px solid rgba(28,58,110,0.28)`,
            paddingBottom: '1px',
          }}>
            {doc.linkedChat}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #E8E4DC',
        display: 'flex', gap: '8px',
      }}>
        <button
          className="doc-footer-btn doc-footer-btn-primary"
          onClick={e => { e.stopPropagation(); onOpenChat(doc.linkedPath); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <ExternalLink style={{ width: '11px', height: '11px' }} />
          Open
        </button>
        <button
          className="doc-footer-btn doc-footer-btn-secondary"
          onClick={e => { e.stopPropagation(); downloadDocument(doc); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Download style={{ width: '11px', height: '11px' }} />
          Download text
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
      background: '#EEEAE4',
      borderRadius: '10px',
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
            color: active === tab ? '#FFFFFF' : C.muted,
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
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  // Filter documents based on active tab
  const filtered = DOCUMENTS.filter(doc => {
    if (activeTab === 'All')       return true;
    if (activeTab === 'Draft')     return doc.status === 'Draft';
    if (activeTab === 'Completed') return doc.status === 'Completed';
    return true;
  });

  // Dynamic subtitle per filter
  const subtitle = (() => {
    if (activeTab === 'All')       return `${filtered.length} case files`;
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
      background: C.bg, overflow: 'hidden',
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
                fontFamily: SANS, fontSize: '16px', fontWeight: 600,
                color: '#1A1916', margin: '0 0 5px',
              }}>
                Case Files
              </h1>
              <p style={{
                fontFamily: SANS, fontSize: '14px', color: '#8A8880', margin: 0,
              }}>
                {subtitle}
              </p>
            </div>

            {/* Right: Create Document CTA */}
            <button
              className="create-btn"
              onClick={() => navigate('/desktop/document-draft')}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: GRAD.buttonPrimary,
                border: 'none', borderRadius: '10px',
                fontFamily: SANS, fontSize: '14px', fontWeight: 600,
                color: '#FFFFFF', padding: '10px 22px',
                cursor: 'pointer', flexShrink: 0,
                boxShadow: SHADOW.sm,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Plus style={{ width: '15px', height: '15px' }} />
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
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#FFFFFF', border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: SHADOW.sm,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke={C.navy} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8"
                    stroke={C.navy} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8" y1="13" x2="16" y2="13"
                    stroke={C.navy} strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="8" y1="17" x2="12" y2="17"
                    stroke={C.navy} strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <p style={{
                fontFamily: SANS, fontSize: '15px', fontWeight: 600,
                color: '#1A1916', margin: '0 0 8px',
              }}>
                {emptyLabel}
              </p>
              <p style={{
                fontFamily: SANS, fontSize: '13px', color: C.muted,
                margin: '0 0 24px', lineHeight: 1.6,
              }}>
                Packets, source notes, evidence summaries, and case history will appear here.
              </p>
              <button
                onClick={() => navigate('/desktop/chat')}
                style={{
                  fontFamily: SANS, fontSize: '13px', fontWeight: 500,
                  color: C.navy, background: 'transparent',
                  border: `1px solid ${C.navy}`, borderRadius: '10px',
                  padding: '8px 20px', cursor: 'pointer',
                }}
              >
                Start a conversation
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
