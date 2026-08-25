import React from 'react';
import { Link } from 'react-router';
import { C, LAYOUT, MONO, SANS, SERIF, TYPE } from '../components/shared';
import { DEV_CATALOG } from '../dev/catalog';
import { SPECIMENS, SPECIMEN_GROUPS } from '../dev/specimens';

/**
 * /dev — a clickable index of every screen, state, and specimen in LokAI.
 *
 * The point is to make the whole app testable from one place: every entry is
 * a real deep link into the actual screen in the actual state, and every
 * specimen opens its bare /specimen/:id capture. This is a developer surface,
 * not a shipped one — it is not in any nav and is only reachable by URL.
 */
export default function DevIndex() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      padding: '40px 24px 80px',
      fontFamily: SANS,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontFamily: MONO, fontSize: TYPE.micro.size, color: C.muted,
          letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px',
        }}>
          LokAI · dev harness
        </p>
        <h1 style={{
          fontFamily: SERIF, fontSize: TYPE.display2.size, fontWeight: 300,
          color: C.ink, margin: '0 0 8px', lineHeight: 1.1,
        }}>
          Every screen and state
        </h1>
        <p style={{ fontSize: TYPE.body.size, color: C.inkSoft, margin: '0 0 40px', maxWidth: 560, lineHeight: 1.6 }}>
          Each link opens the real screen in the real state. Specimens open a
          single component alone on a bare canvas; add <code style={codeStyle}>?loop=1</code> to
          cycle the ones that declare frames.
        </p>

        {/* ── Specimens ── */}
        <Section title="Component specimens" note="For case-study embeds — one component, natural size.">
          {SPECIMEN_GROUPS.map((group) => (
            <div key={group} style={{ marginBottom: 20 }}>
              <GroupLabel>{group}</GroupLabel>
              <div style={cardGrid}>
                {SPECIMENS.filter((s) => s.group === group).map((s) => (
                  <div key={s.id} style={card}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: TYPE.small.size, fontWeight: 600, color: C.ink }}>{s.label}</span>
                      {s.frames && <span style={loopTag}>{s.frames.length}f</span>}
                    </div>
                    {s.note && <p style={cardNote}>{s.note}</p>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Link to={`/specimen/${s.id}?bg=1`} style={linkBtn}>Open</Link>
                      {s.frames && <Link to={`/specimen/${s.id}?bg=1&loop=1`} style={linkBtnGhost}>Loop</Link>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* ── Screens & states ── */}
        {DEV_CATALOG.map((group) => (
          <Section key={group.title} title={group.title} note={group.note}>
            <div style={cardGrid}>
              {group.entries.map((entry) => (
                <Link key={entry.path} to={entry.path} style={{ ...card, textDecoration: 'none', display: 'block' }}>
                  <span style={{ fontSize: TYPE.small.size, fontWeight: 600, color: C.navy }}>{entry.label}</span>
                  {entry.note && <p style={cardNote}>{entry.note}</p>}
                  <code style={{ ...codeStyle, display: 'block', marginTop: 8, color: C.muted, wordBreak: 'break-all' }}>{entry.path}</code>
                </Link>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h2 style={{ fontFamily: SERIF, fontSize: TYPE.h3.size, fontWeight: 400, color: C.ink, margin: '0 0 4px' }}>{title}</h2>
      {note && <p style={{ fontSize: TYPE.caption.size, color: C.muted, margin: '0 0 16px' }}>{note}</p>}
      {children}
    </section>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: MONO, fontSize: TYPE.label.size, color: C.muted,
      letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 8px',
    }}>
      {children}
    </p>
  );
}

const cardGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 10,
};

const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: LAYOUT.radius.card,
  padding: 14,
};

const cardNote: React.CSSProperties = {
  fontSize: TYPE.caption.size,
  color: C.inkSoft,
  lineHeight: 1.45,
  margin: '6px 0 0',
};

const linkBtn: React.CSSProperties = {
  fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 600,
  color: '#fff', background: C.navy, textDecoration: 'none',
  padding: '6px 12px', borderRadius: LAYOUT.radius.control,
};

const linkBtnGhost: React.CSSProperties = {
  ...linkBtn, color: C.navy, background: C.navySoft,
};

const loopTag: React.CSSProperties = {
  fontFamily: MONO, fontSize: TYPE.label.size, color: C.saffronDark,
  background: C.saffronSoft, padding: '1px 6px', borderRadius: LAYOUT.radius.xs,
  flexShrink: 0,
};

const codeStyle: React.CSSProperties = {
  fontFamily: MONO, fontSize: TYPE.label.size,
};
