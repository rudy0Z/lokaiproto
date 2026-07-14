import React from 'react';
import { ArrowRight, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';
import { C, SANS, SERIF, SHADOW } from '../../components/shared';
import { StatusBar, TopNav, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { MATTER_INTELLIGENCE } from '../../data/matterIntelligence';
import { ARTBOARD } from '../../embed';

const FILE_ITEMS = [
  {
    id: 'deposit-notice',
    title: 'Demand notice draft',
    meta: 'Security Deposit · Ready',
    route: '/mobile/case/consumer?stage=audit',
    matterId: 'deposit',
  },
  {
    id: 'rti-appeal',
    title: 'First appeal checklist',
    meta: 'BMC RTI · 1 detail needed',
    route: '/mobile/case/consumer?stage=audit',
    matterId: 'rti',
  },
  {
    id: 'consumer-summary',
    title: 'Complaint summary',
    meta: 'Consumer · Draft ready after invoice date',
    route: '/mobile/case/consumer?stage=packet',
    matterId: 'consumer',
  },
  {
    id: 'notice-source',
    title: 'Notice source summary',
    meta: 'Notice reply · Source limited',
    route: '/mobile/case/consumer?failure=ocr_unreadable',
    matterId: 'notice',
  },
];

function FileRow({ item }: { item: typeof FILE_ITEMS[0] }) {
  const navigate = useNavigate();
  const intelligence = MATTER_INTELLIGENCE[item.matterId];
  return (
    <button
      onClick={() => navigate(item.route)}
      style={{
        width: '100%',
        minHeight: '76px',
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 16,
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
        borderRadius: 12,
        background: '#F4F2EE',
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
          fontSize: 14,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.title}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, margin: '0 0 5px' }}>
          {item.meta}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
          {intelligence.dailyUpdate.title}
        </p>
      </div>
      <ArrowRight size={16} color={C.muted} />
    </button>
  );
}

function FilesArtboard() {
  const navigate = useNavigate();
  return (
    <div style={{
      ...ARTBOARD,
      background: [
        'radial-gradient(ellipse 110% 42% at 50% 0%, rgba(221,231,255,0.48), transparent 70%)',
        'linear-gradient(180deg, #FFFDFC 0%, #F8F5EE 100%)',
      ].join(', '),
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
            fontSize: 30,
            fontWeight: 400,
            color: C.ink,
            lineHeight: 1.08,
            letterSpacing: '-0.4px',
            margin: '0 0 8px',
          }}>
            Drafts and files
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, lineHeight: 1.55, margin: 0 }}>
            Your notices, drafts, summaries, and source notes stay together by matter.
          </p>
        </div>

        <button
          onClick={() => navigate('/mobile/case/consumer?failure=ocr_unreadable')}
          style={{
            width: '100%',
            minHeight: 54,
            borderRadius: 16,
            border: `1px dashed ${C.borderStrong}`,
            background: 'rgba(255,255,255,0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            color: C.navy,
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <Upload size={16} />
          Upload notice or evidence
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FILE_ITEMS.map(item => <FileRow key={item.id} item={item} />)}
        </div>

        <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted, lineHeight: 1.55, textAlign: 'center', margin: '18px 18px 0' }}>
          LokAI stores drafts locally. Review before filing.
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
