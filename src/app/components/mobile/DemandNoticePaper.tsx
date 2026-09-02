import React from 'react';
import { Stack, Row, Text, Amount, T, S, LAYOUT, SHADOW } from '../../ui';
import type { FilingPacket } from '../../data/caseWorkflow';

/**
 * The demand notice, rendered as a physical page resting on the ground.
 *
 * The packet stage used to stack ~9 containers on one 844px screen — an
 * autonomy dial, a repeated action plan, a bordered field-list "preview", a
 * review gate, an exit checklist, a tracking banner, and a two-up CTA grid — so
 * the final, most authoritative step of the journey read as the most anxious.
 *
 * This replaces the bordered field-list with the actual document: a warm page
 * with a ruled-paper texture, a letterhead, and the notice as typed prose with
 * the amount and the legal basis pulled out for the eye. It is the ONE focal
 * object of the packet stage; the consent gate pins below it. A demand notice
 * is a discrete object a person could print and post, so it legitimately looks
 * like paper (L1) rather than a settings form.
 *
 * The type is typed-document clean (the app's sans), not serif prose — that is
 * how a real notice looks, and it keeps the whole thing on the primitives with
 * no bespoke type scale. `PaperTexture`'s ruled lines carry the same asymmetry
 * as `Notice.tsx` (horizontals stronger than verticals) so it reads as ruled
 * stationery, not graph paper.
 */

function PaperTexture() {
  const lines: React.ReactNode[] = [];
  const step = 22;
  for (let y = 0; y <= 1200; y += step) {
    lines.push(<line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke={T.ink} strokeWidth="0.4" opacity="0.04" />);
  }
  for (let x = 0; x <= 1000; x += step) {
    lines.push(<line key={`v${x}`} x1={x} y1="0" x2={x} y2="1200" stroke={T.ink} strokeWidth="0.4" opacity="0.028" />);
  }
  return (
    <svg
      viewBox="0 0 1000 1200"
      preserveAspectRatio="xMinYMin slice"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {lines}
    </svg>
  );
}

function RefLine({ label, value }: { label: string; value: string }) {
  return (
    <Row justify="between" gap={3} align="baseline">
      <Text role="meta" tone="faint" measured={false}>{label}</Text>
      <Text role="caption" tone="quiet" measured={false} style={{ textAlign: 'right' }}>{value}</Text>
    </Row>
  );
}

export function DemandNoticePaper({ packet }: { packet: FilingPacket }) {
  const buyer = packet.fields.find((f) => f.id === 'buyer')?.value ?? '';
  const seller = packet.fields.find((f) => f.id === 'seller')?.value ?? '';
  const basis = packet.fields.find((f) => f.id === 'basis')?.value ?? '';

  return (
    <div
      style={{
        position: 'relative',
        background: T.paper,
        borderRadius: LAYOUT.radius.sm,
        boxShadow: SHADOW.md,
        overflow: 'hidden',
        // No border: a drop shadow lifts the page off the ground; a 1px rule
        // would flatten it back into a card.
      }}
    >
      <PaperTexture />

      <div style={{ position: 'relative', zIndex: 1, padding: `${S[5]} ${S[5]} ${S[6]}` }}>
        {/* Letterhead — the one serif moment */}
        <Stack gap={2} align="center" style={{ paddingBottom: S[4] }}>
          <Text role="answer" style={{ textAlign: 'center' }}>Consumer Demand Notice</Text>
          <div style={{ width: '48%', height: 1, background: T.hairlineFirm }} />
        </Stack>

        <Stack gap={1} style={{ paddingBottom: S[4] }}>
          <RefLine label="From" value={buyer} />
          <RefLine label="To" value={seller} />
          <RefLine label="Re" value="Damaged mixer grinder" />
        </Stack>

        <Text role="body">
          I purchased a mixer grinder that arrived with a cracked jar and is
          unsafe to run. I asked for a repair, replacement, or{' '}
          <span style={{ color: T.attest, fontWeight: 600 }}>full refund of ₹8,999</span>, and the request
          was refused in writing.
        </Text>

        <div style={{ height: 1, background: T.hairline, margin: `${S[4]} 0` }} />

        <Text role="body">
          This request is made under the{' '}
          <span style={{ color: T.anchor, fontWeight: 600 }}>{basis}</span>. I am keeping the invoice,
          defect photos, and seller messages as evidence and request a resolution
          within a reasonable period.
        </Text>

        {/* Signature rule — a drawn line standing in for a signature */}
        <Stack gap={1} align="flex-end" style={{ marginTop: S[6] }}>
          <div style={{ width: 120, height: 1, background: T.hairlineFirm }} />
          <Text role="meta" tone="faint" measured={false}>Signature</Text>
        </Stack>
      </div>

      {/* Draft strip — honest that this is not yet a sent document */}
      <Row gap={2} align="center" style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${T.hairline}`, padding: `${S[2]} ${S[5]}` }}>
        <Amount tone="faint">DRAFT</Amount>
        <Text role="caption" tone="faint" measured={false}>AI draft · review every line before sending</Text>
      </Row>
    </div>
  );
}
