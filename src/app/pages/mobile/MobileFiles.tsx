import React from 'react';
import { ArrowRight, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';
import { C, LAYOUT, PLANE, SANS, SERIF, SHADOW, TYPE } from '../../components/shared';
import { StatusBar, TopNav, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { useDemo } from '../../context/DemoContext';
import { ARTBOARD } from '../../embed';

function FileRow({
  item,
}: {
  item: { id: string; title: string; meta: string; route: string; detail: string };
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(item.route)}
      style={{
        width: '100%',
        minHeight: '76px',
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.card,
        boxShadow: SHADOW.xs,
        display: 'grid',
        gridTemplateColumns: '42px 1fr 20px',
        gap: 12,
        alignItems: 'center',
        padding: '13px 14px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{
        width: 42,
        height: 42,
        borderRadius: LAYOUT.radius.panel,
        background: C.surface2,
        border: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <FileText size={18} color={C.navy} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: SANS,
          fontSize: TYPE.body.size,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.title}
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, margin: '0 0 5px' }}>
          {item.meta}
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
          {item.detail}
        </p>
      </div>
      <ArrowRight size={16} color={C.muted} />
    </button>
  );
}

function FilesArtboard() {
  const navigate = useNavigate();
  const { scenario, facts, draftAllowed, draftApproved, language, auditEvents } = useDemo();
  const confirmed = facts.filter((f) => f.state === 'confirmed').length;

  const fileItems = [
    {
      id: 'consumer-summary',
      title: `${scenario.matterTitle} summary`,
      meta: `${scenario.label} · ${language.toUpperCase()}`,
      route: '/mobile/case/consumer?stage=packet',
      detail: scenario.statusTitle,
    },
    {
      id: 'consumer-evidence',
      title: 'Invoice and damage evidence',
      meta: `${confirmed}/${facts.length} facts · Ready to review`,
      route: '/mobile/case/consumer?stage=verify',
      detail: facts.map((f) => f.label).slice(0, 3).join(' · '),
    },
    {
      id: 'consumer-sources',
      title: 'Source basis',
      meta: scenario.sources[0]?.reviewLabel ?? 'Illustrative · expert review pending',
      route: '/mobile/case/consumer?stage=retrieve',
      detail: scenario.sources[0]?.title ?? 'Consumer Protection Act, 2019',
    },
    {
      id: 'consumer-draft',
      title: 'Demand notice draft',
      meta: draftAllowed
        ? (draftApproved ? 'Approved for copy/print' : 'Ready to review')
        : 'Held — policy blocks draft',
      route: draftAllowed ? '/mobile/case/consumer?stage=packet' : '/mobile/case/consumer?stage=answer',
      detail: draftAllowed
        ? `${auditEvents.length} audit events on this matter`
        : scenario.statusBody,
    },
  ];

  return (
    <div style={{
      ...ARTBOARD,
      background: PLANE.reading,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <StatusBar />
      <TopNav bg="transparent" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: TYPE.editorial.size,
            fontWeight: 400,
            color: C.ink,
            lineHeight: 1.08,
            letterSpacing: '-0.4px',
            margin: '0 0 8px',
          }}>
            Drafts and files
          </h1>
          <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted, lineHeight: 1.55, margin: 0 }}>
            Everything for {scenario.matterTitle} stays on one matter — facts, sources, and drafts.
          </p>
        </div>

        <button
          onClick={() => navigate('/mobile/case/consumer?stage=intake')}
          style={{
            width: '100%',
            minHeight: 54,
            borderRadius: LAYOUT.radius.card,
            border: `1px dashed ${C.borderStrong}`,
            background: 'rgba(255,255,255,0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: SANS,
            fontSize: TYPE.small.size,
            fontWeight: 700,
            color: C.navy,
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <Upload size={16} />
          Use sample notice
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fileItems.map(item => <FileRow key={item.id} item={item} />)}
        </div>

        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.55, textAlign: 'center', margin: '18px 18px 0' }}>
          Prepared examples only · nothing is uploaded or sent. Review every draft before use.
        </p>
      </div>

      <BottomNav active="docs" />
      <HomeIndicator />
    </div>
  );
}

export default function MobileFiles() {
  return (
    <MobileRouteCanvas>
      <FilesArtboard />
    </MobileRouteCanvas>
  );
}
