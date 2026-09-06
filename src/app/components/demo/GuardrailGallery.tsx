import React from 'react';
import { IconCircleCheck, IconShield, IconWarning } from '../../ui/icons';
import { useDemo } from '../../context/DemoContext';
import { DEMO_SCENARIOS, type DemoPolicyTier } from '../../data/demoScenarios';
import { C, LAYOUT, MONO, SANS, TYPE } from '../shared';

/* Tier glyphs from the aliased set (Phase 8 icon era). The stop tier reads
   ShieldCheck on purpose — the stop routes to professional protection. */
const tierMeta: Record<DemoPolicyTier, { label: string; color: string; bg: string; Icon: typeof IconCircleCheck }> = {
  self_service: { label: 'Can explain and prepare', color: C.green, bg: C.successSoft, Icon: IconCircleCheck },
  review_recommended: { label: 'Needs a check first', color: C.amber, bg: C.cautionSoft, Icon: IconWarning },
  human_help_required: { label: 'Stops for professional help', color: C.oxblood, bg: C.oxbloodSoft, Icon: IconShield },
};

export function GuardrailGallery({ compact = false }: { compact?: boolean }) {
  const { scenario, selectScenario } = useDemo();
  const meta = tierMeta[scenario.policyTier];
  const source = scenario.sources[0];

  return (
    <section aria-labelledby={`guardrail-scenes-${compact ? 'mobile' : 'desktop'}`}>
      <div style={{ marginBottom: compact ? 12 : 18 }}>
        <p style={{
          color: C.saffronDark,
          fontFamily: SANS,
          fontSize: TYPE.micro.size,
          fontWeight: 700,
          letterSpacing: '0.08em',
          margin: '0 0 6px',
          textTransform: 'uppercase',
        }}>
          Prepared guardrail scenes
        </p>
        <h2 id={`guardrail-scenes-${compact ? 'mobile' : 'desktop'}`} style={{
          color: C.ink,
          fontFamily: SANS,
          fontSize: compact ? 18 : 26,
          lineHeight: 1.2,
          margin: 0,
        }}>
          See why LokAI proceeds, asks, or stops
        </h2>
      </div>

      <div
        role="list"
        aria-label="Choose a prepared guardrail scene"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 6,
          scrollbarWidth: 'thin',
        }}
      >
        {Object.values(DEMO_SCENARIOS).map((item) => {
          const active = item.id === scenario.id;
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              onClick={() => selectScenario(item.id)}
              aria-pressed={active}
              style={{
                minHeight: 44,
                flex: compact ? '0 0 auto' : '1 0 132px',
                border: `1px solid ${active ? C.navy : C.border}`,
                borderRadius: LAYOUT.radius.control,
                background: active ? 'var(--role-anchor-tint)' : C.surface,
                color: active ? C.navy : C.inkSoft,
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: compact ? 11 : 12,
                fontWeight: active ? 700 : 600,
                lineHeight: 1.35,
                padding: '9px 12px',
                textAlign: 'left',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        style={{
          display: 'grid',
          gap: compact ? 12 : 20,
          gridTemplateColumns: compact ? '1fr' : 'minmax(0, 1.4fr) minmax(220px, .6fr)',
          marginTop: 10,
        }}
      >
        <div>
          <div style={{
            alignItems: 'center',
            background: meta.bg,
            borderRadius: LAYOUT.radius.pill,
            color: meta.color,
            display: 'inline-flex',
            fontFamily: SANS,
            fontSize: TYPE.micro.size,
            fontWeight: 700,
            gap: 6,
            marginBottom: 10,
            padding: '5px 9px',
          }}>
            <meta.Icon size={14} aria-hidden="true" />
            {meta.label}
          </div>
          <h3 style={{ color: C.ink, fontFamily: SANS, fontSize: compact ? 16 : 20, lineHeight: 1.3, margin: '0 0 7px' }}>
            {scenario.statusTitle}
          </h3>
          <p style={{ color: C.inkSoft, fontFamily: SANS, fontSize: compact ? 12 : 14, lineHeight: 1.6, margin: 0 }}>
            {scenario.statusBody}
          </p>
        </div>

        <div style={{ borderLeft: compact ? 0 : `1px solid ${C.border}`, paddingLeft: compact ? 0 : 20 }}>
          <div style={{ color: C.muted, fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>
            Available now
          </div>
          <ul style={{ display: 'grid', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
            {scenario.allowedActions.map((action) => (
              <li key={action} style={{ color: C.inkSoft, display: 'flex', fontFamily: SANS, fontSize: TYPE.caption.size, gap: 7, lineHeight: 1.45 }}>
                <IconCircleCheck size={14} color={meta.color} style={{ flex: '0 0 auto', marginTop: 1 }} aria-hidden="true" />
                {action}
              </li>
            ))}
          </ul>
        </div>

        {source ? (
          <div style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: LAYOUT.radius.control,
            gridColumn: compact ? 'auto' : '1 / -1',
            padding: '10px 12px',
          }}>
            <div style={{ color: C.navy, fontFamily: MONO, fontSize: TYPE.label.size, lineHeight: 1.5 }}>
              {source.title} · {source.reference}
            </div>
            <div style={{ color: C.muted, fontFamily: SANS, fontSize: TYPE.label.size, marginTop: 3 }}>
              {source.reviewLabel}
            </div>
          </div>
        ) : (
          <div style={{ color: C.muted, display: 'flex', fontFamily: SANS, fontSize: TYPE.micro.size, gap: 7, gridColumn: compact ? 'auto' : '1 / -1' }}>
            <IconWarning size={14} aria-hidden="true" />
            No legal source is used for this boundary scene.
          </div>
        )}
      </div>
    </section>
  );
}

export function DemoDisclosure() {
  return (
    <div className="demo-disclosure" role="note">
      Interactive demo · prepared examples · no data sent
    </div>
  );
}
