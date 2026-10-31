import React from 'react';
import {
  Screen, Stack, Row, Rule, Text, Label, Amount, Badge,
  T, S, M, useHaptic,
} from '../../ui';
import { StatusBar } from '../../pages/mobile/MobileHome';
import { Wordmark } from '../shared';
import { getEvidenceLocker, getConsumerWorkflowState } from '../../data/caseWorkflow';
import { turnChrome } from '../../data/languagePacks';
import type { MatterFact } from '../../context/DemoContext';
import type { DecisionReceipt } from '../../decision/types';
import { DEMO_JURISDICTION } from '../../data/demoScenarios';

/**
 * The handover packet — the exit artifact (PRODUCT-JOURNEY §4.3, behavioral
 * audit P1/§45: "the receipt + confirmed facts + evidence checklist as one
 * printable page — the code already owns every piece; it only needs
 * assembly").
 *
 * A stop is not a failure state; it is a change of venue with the paperwork
 * intact. This IS the paperwork: what the matter is, what was confirmed,
 * what still needs a check, what to carry, every decision LokAI logged with
 * its receipt, and the named free channels that take it from here. Nothing
 * was sent — the user carries it.
 */
export function HandoverPacket({
  facts,
  receipts,
  language = 'en',
}: {
  facts: MatterFact[];
  receipts: DecisionReceipt[];
  language?: string;
}) {
  const chrome = turnChrome(language as 'en' | 'hi' | 'mr' | 'ta');
  const workflow = getConsumerWorkflowState();
  const evidence = getEvidenceLocker();
  const confirmed = facts.filter((f) => f.confirmedByUser && f.state === 'confirmed');
  const needsCheck = facts.filter((f) => !f.confirmedByUser || f.state === 'disputed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S[3] }}>
      <Row gap={2} align="center">
        <Amount tone="anchor">MATTER FILE · {workflow.matterId.toUpperCase()}</Amount>
        <Badge tone="attest">{chrome.decided} · dl-1.0.0</Badge>
      </Row>
      <Text role="answer" as="h2" measured={false}>
        Take this to a person who can help
      </Text>
      <Text tone="quiet" style={{ maxWidth: M.measure }}>
        Everything below was prepared with LokAI on this device. Nothing was
        sent anywhere. Hand it over as it is — it is meant to be read by a
        person, not by another app.
      </Text>

      <Stack gap={2}>
        <Label>The matter</Label>
        <Text tone="quiet">{workflow.summary}</Text>
        <Text role="caption" tone="faint" measured={false}>
          Jurisdiction assumed: {DEMO_JURISDICTION.short}
        </Text>
      </Stack>

      <Rule />

      <Stack gap={2}>
        <Label>Confirmed facts</Label>
        {confirmed.length > 0 ? (
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {confirmed.map((f) => (
              <li key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <Text role="caption" tone="quiet" measured={false} style={{ flex: '0 0 42%' }}>{f.label}</Text>
                <Text role="quiet" measured={false} style={{ flex: 1 }}>{f.value}</Text>
              </li>
            ))}
          </ol>
        ) : (
          <Text tone="quiet">None confirmed yet.</Text>
        )}
      </Stack>

      {needsCheck.length > 0 && (
        <Stack gap={2}>
          <Label>Still needs your check</Label>
          {needsCheck.map((f) => (
            <Stack gap={1} key={f.id}>
              <Text role="quiet" measured={false}>{f.label}: {f.value}</Text>
              {f.hint && <Text role="caption" tone="quiet" measured={false}>{f.hint}</Text>}
            </Stack>
          ))}
        </Stack>
      )}

      <Rule />

      <Stack gap={2}>
        <Label>Evidence to carry</Label>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {evidence.map((e) => (
            <li key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <Text role="caption" tone="quiet" measured={false} style={{ flexShrink: 0 }}>
                {(e.kind ?? 'report').toUpperCase()}
              </Text>
              <Text role="caption" measured={false}>{e.label}</Text>
            </li>
          ))}
        </ol>
      </Stack>

      {receipts.length > 0 && (
        <Stack gap={2}>
          <Label>What LokAI decided (receipt trail)</Label>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {receipts.map((r) => (
              <li key={r.id} style={{
                padding: `8px 10px`,
                borderRadius: 'var(--radius-control)',
                background: T.sunken,
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <Text role="caption" tone="quiet" measured={false}>{r.gate} · {r.rule} · {r.id}</Text>
                <Text role="quiet" measured={false}>{r.humanLine}</Text>
              </li>
            ))}
          </ol>
        </Stack>
      )}

      <Rule />

      <Stack gap={2}>
        <Label>{chrome.channelLabel}</Label>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>
            <Text role="quiet" measured={false}>National Consumer Helpline — 1915 (free)</Text>
            <Text role="caption" tone="quiet" measured={false}>Government of India. Explains your route in your language.</Text>
          </li>
          <li>
            <Text role="quiet" measured={false}>e-Daakhil — edaakhil.nic.in</Text>
            <Text role="caption" tone="quiet" measured={false}>File a consumer complaint before the District Consumer Commission.</Text>
          </li>
          <li>
            <Text role="quiet" measured={false}>District Legal Services Authority (free legal aid)</Text>
            <Text role="caption" tone="quiet" measured={false}>Every district has one — ask at the court complex.</Text>
          </li>
        </ol>
      </Stack>

      <Text role="meta" tone="faint" measured={false}>
        Prepared with LokAI · illustrative example, expert review pending ·
        no network was used and nothing was uploaded or sent.
      </Text>
    </div>
  );
}

/**
 * Full-screen stop-context wrapper for the packet: keeps the stop ground so
 * the exit artifact reads as part of the refusal, not an escape from it.
 */
export function HandoverScreen({
  facts,
  receipts,
  language = 'en',
  onBack,
}: {
  facts: MatterFact[];
  receipts: DecisionReceipt[];
  language?: string;
  onBack: () => void;
}) {
  const haptic = useHaptic();
  return (
    <Screen
      tone="stop"
      chrome={
        <>
          <StatusBar light />
          <Row justify="between" align="center" style={{ padding: `${S[2]} ${S[4]}`, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => { haptic(); onBack(); }}
              className="lokai-pressable"
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: T.stopInk, ...({} as React.CSSProperties),
              }}
            >
              <Text role="quiet" tone="inverse" measured={false}>← Back</Text>
            </button>
            <Wordmark size={18} color={T.stopInk} />
            <span style={{ width: 40 }} />
          </Row>
        </>
      }
      scrollClearance={S[6]}
    >
      <HandoverPacket facts={facts} receipts={receipts} language={language} />
    </Screen>
  );
}
