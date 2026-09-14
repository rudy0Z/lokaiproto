import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import { IconChevronRight, IconFile, IconSettings, IconSearch, IconPlus, IconClose } from '../../ui/icons';
import {
  Stack, Row, Rule, Text, Label, Amount, Badge, IconButton,
  HairlineList, HairlineRow,
  T, M, S, LAYOUT, SHADOW, ICON, useSystemStyles,
} from '../../ui';
import { Wordmark } from '../shared';
import { useConversations, type Conversation } from '../../context/ConversationContext';
import { getEvidenceLocker, getVerificationFacts } from '../../data/caseWorkflow';
import { DEMO_JURISDICTION } from '../../data/demoScenarios';

/**
 * The navigation drawer.
 *
 * Structurally this is the ChatGPT / Gemini pattern, deliberately: it is the
 * learned gesture for "where is everything else" on a mobile AI app, and
 * inventing a novel one would cost recognition for nothing. Reference read:
 *
 *   TAKEN     the left drawer itself, search at the top, a chat list under a
 *             quiet header, account + settings pinned to the bottom rail
 *   TAKEN     from Wkeel: language and appearance living at the bottom of the
 *             drawer rather than buried in a settings route
 *   REJECTED  Wkeel's dark ground. Dark is not LokAI's theme, it is LokAI's
 *             STOP state (L8) — spending it on chrome would cost the one
 *             tonal move the refusal screens depend on.
 *   REJECTED  nav rows for features that do not exist (Wkeel's Blog,
 *             Notifications; Gemini's Notebooks). Navigation that advertises
 *             absent capability is the same dishonesty as a language picker
 *             offering twelve languages with four packs.
 *
 * ONE STRUCTURAL DEPARTURE, and it is the product argument:
 *
 * ChatGPT and Gemini treat every conversation as equal — the list is flat and
 * "New chat" is the loudest thing in the drawer, because their user has many
 * chats and no state that persists between them. LokAI's user has ONE matter,
 * once, and it has a status that changes while they are away from it. So the
 * active matter is the drawer's anchor and "New chat" is a quiet row beneath
 * it. Copying the chat-app hierarchy here would have imported an information
 * architecture built for a different user.
 */

const DRAWER_WIDTH = 320;

/** Conversation status → the badge tone that carries it. */
const STATUS_TONE: Record<Conversation['status'], 'flag' | 'neutral' | 'ok' | 'halt'> = {
  'Action Required': 'flag',
  'In Progress':     'neutral',
  'Ready to File':   'ok',
  'Out of Scope':    'halt',
};

/** Status → the live-dot colour (the marker that replaced the left stripe). */
const DOT_TONE: Record<Conversation['status'], string> = {
  'Action Required': T.flag,
  'In Progress':     T.anchor,
  'Ready to File':   T.ok,
  'Out of Scope':    T.halt,
};

/** A nav destination. A row, never a card — these are doors, not objects. */
function NavRow({
  icon,
  label,
  trailing,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lokai-pressable"
      style={{
        display: 'flex', alignItems: 'center', gap: S[3],
        width: '100%', minHeight: M.tap,
        padding: `0 ${S[2]}`, margin: `0 -${S[2]}`,
        background: 'none', border: 'none', borderRadius: LAYOUT.radius.sm,
        cursor: 'pointer', textAlign: 'left', font: 'inherit',
      }}
    >
      <span style={{ display: 'flex', color: T.inkQuiet, flexShrink: 0 }}>{icon}</span>
      <Text role="bodyStrong" measured={false} style={{ flex: 1 }}>{label}</Text>
      {trailing}
    </button>
  );
}

/**
 * The active matter — the drawer's one card, and the one thing here that a
 * general-purpose chat app has no equivalent for.
 *
 * It earns its container under L1: a matter is a discrete object with state
 * that changes while the user is not looking. That is exactly what a card is
 * for, and it is why the rest of this drawer is rows.
 *
 * It carries a tint rather than the navy fill, because L5 reserves the anchor
 * for the composer, the single primary CTA, and stop grounds. A drawer is
 * chrome; chrome does not get the anchor.
 */
/**
 * What is actually waiting on the user, from real workflow state.
 *
 * Deliberately never a generic "Tap to continue" — the whole product claim is
 * that the user owns the facts, so the drawer says which facts are still
 * theirs to confirm rather than implying the AI is waiting politely.
 */
function waitingLine(status: Conversation['status']): string {
  const pending = getVerificationFacts().filter((f) => f.status === 'needs_review').length;
  const missing = getEvidenceLocker().filter((e) => e.status === 'missing').length;

  if (status === 'Ready to File') return 'Reviewed and ready to send';
  if (status === 'Out of Scope')  return 'Closed — outside what LokAI covers';

  /* Report the first real thing that is actually outstanding, and never a
     count of zero. `pending` is currently 0 because every fact in
     getVerificationFacts() ships `confirmed` — see the note in that file,
     which says one should be flagged and none is. When that data is fixed
     this line starts leading with the facts, correctly, with no change here. */
  if (pending > 0) return `${pending} fact${pending === 1 ? '' : 's'} need${pending === 1 ? 's' : ''} your confirmation`;
  if (missing > 0) return `${missing} document${missing === 1 ? '' : 's'} still missing`;
  if (status === 'Action Required') return 'Waiting on you to continue';
  return 'Nothing waiting on you';
}

function ActiveMatter({ matter, onOpen }: { matter: Conversation; onOpen: () => void }) {
  const done = matter.completedSteps.length;
  const total = 6;
  const waiting = waitingLine(matter.status);
  /* The pending facts carry the *what* of "what's waiting on you". The
     rail above shows progress; this list is the actual decisions the
     user has to make. A first-time user lands here knowing the count but
     not the content — the list closes that gap. */
  const pendingFacts = getVerificationFacts().filter((f) => f.status === 'needs_review');

  return (
    <button
      type="button"
      onClick={onOpen}
      className="lokai-pressable"
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit',
        /* No left stripe, no border. The colored left edge was the single most
           generic tell in the app (it belongs to a checklist of vibecoded
           patterns). A live matter is a discrete object: a raised paper surface
           with a contact shadow, fully rounded. "Live" is carried by a small
           filled status dot beside the title and by the progress rail — signals
           that mean something — not by a decorative stripe. */
        background: T.raised,
        border: 'none',
        borderRadius: LAYOUT.radius.card,
        boxShadow: SHADOW.sm,
        padding: S[4],
        boxSizing: 'border-box',
      }}
    >
      <Stack gap={2}>
        <Row gap={2} align="center">
          {/* The live marker — a small filled dot in the status tone, replacing
              the stripe. Meaningful (it reads the matter's actual state) and
              quiet. */}
          <span style={{ width: 7, height: 7, borderRadius: LAYOUT.radius.full, background: DOT_TONE[matter.status], flexShrink: 0 }} />
          <Text role="title" measured={false} style={{ flex: 1 }}>{matter.title}</Text>
        </Row>

        <Row gap={2}>
          <Badge tone={STATUS_TONE[matter.status]}>{matter.status}</Badge>
          <Text role="caption" tone="faint" measured={false}>{matter.since}</Text>
        </Row>

        {/* Stage rail — six segments, not a percentage. The product never
            fabricates a confidence number; it does not fabricate a progress
            number either. Six steps, this many done. */}
        <Row gap={1} style={{ paddingTop: S[1] }}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: LAYOUT.radius.xs,
                background: i < done ? T.anchor : T.hairlineFirm,
              }}
            />
          ))}
        </Row>

        {/* NOT "Step 2 of 6" — the rail already says that, and restating it in
            words is the exact redundancy (L7) that put two identical progress
            readouts on the verify screen. This line carries what the rail
            cannot: what is actually waiting on the user. */}
        <Row justify="between" gap={2}>
          <Text role="caption" tone="quiet" measured={false} style={{ flex: 1 }}>{waiting}</Text>
          <IconChevronRight size={ICON.inline} color={T.anchor} />
        </Row>

        {pendingFacts.length > 0 && matter.status === 'Action Required' && (
          <HairlineList>
            {pendingFacts.slice(0, 3).map((f) => (
              <HairlineRow key={f.id} leading={
                <span style={{
                  width: 6, height: 6, borderRadius: LAYOUT.radius.full,
                  background: T.flag, flexShrink: 0, marginTop: 6,
                }} />
              }>
                <Text role="captionStrong" tone="default" measured={false}>{f.label}</Text>
                <Text role="caption" tone="faint" measured={false}>{f.value}</Text>
              </HairlineRow>
            ))}
            {pendingFacts.length > 3 && (
              <Text role="meta" tone="faint" measured={false}>
                +{pendingFacts.length - 3} more waiting
              </Text>
            )}
          </HairlineList>
        )}
      </Stack>
    </button>
  );
}

function ChatRow({ chat, active, onClick }: { chat: Conversation; active: boolean; onClick: () => void }) {
  const dotTone = {
    'Action Required': T.flag,
    'In Progress':     T.hairlineFirm,
    'Ready to File':   T.ok,
    'Out of Scope':    T.halt,
  }[chat.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="lokai-pressable"
      style={{
        display: 'flex', alignItems: 'center', gap: S[3],
        width: '100%', minHeight: M.tap,
        padding: `0 ${S[2]}`, margin: `0 -${S[2]}`,
        background: active ? T.sunken : 'none',
        border: 'none', borderRadius: LAYOUT.radius.sm,
        cursor: 'pointer', textAlign: 'left', font: 'inherit',
      }}
    >
      {/* Status as a dot, not a chip. A chip per row would make the list a
          wall of badges and the one row that needs attention would stop
          standing out — the exception has to stay exceptional. */}
      <span style={{ width: 6, height: 6, borderRadius: LAYOUT.radius.full, background: dotTone, flexShrink: 0 }} />
      <Text
        role="body"
        tone={active ? 'default' : 'quiet'}
        measured={false}
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {chat.title}
      </Text>
    </button>
  );
}

export function MatterDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useSystemStyles();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { conversations, activeId } = useConversations();

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const earlier = conversations.filter((c) => c.id !== active?.id);
  const documentCount = getEvidenceLocker().filter((e) => e.status === 'uploaded').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const go = (route: string) => { onClose(); navigate(route); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0, background: T.scrim, zIndex: 60 }}
          />

          <motion.nav
            aria-label="Matters and settings"
            initial={reduced ? { opacity: 0 } : { x: -DRAWER_WIDTH }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: -DRAWER_WIDTH }}
            /* Same spring as Sheet — a surface the user summoned, so a little
               overshoot reads as momentum rather than as a glitch. */
            transition={reduced ? { duration: 0.15 } : { type: 'spring', bounce: 0.2, duration: 0.32 }}
            style={{
              position: 'absolute', top: 0, bottom: 0, left: 0,
              width: DRAWER_WIDTH, zIndex: 61,
              /* A sheet of paper laid over the page, not a dark panel: raised
                 surface, hairline edge, no heavy scrim shadow. */
              background: T.raised,
              borderRight: `1px solid ${T.hairline}`,
              boxShadow: SHADOW.lg,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* ── Brand row + greeting ──────────────────────────────────────
                The greeting lives here, not on the home canvas — home is a
                minimal chat surface now, and the personal touch belongs with
                the person's own navigation (matters, documents, account). */}
            <Stack gap={3} style={{ padding: `${S[4]} ${S[4]} ${S[3]}`, flexShrink: 0 }}>
              <Row justify="between" align="center">
                <Wordmark size={20} />
                <IconButton label="Close menu" onClick={onClose} style={{ marginRight: `-${S[2]}` }}>
                  <IconClose size={ICON.row} />
                </IconButton>
              </Row>
              <Stack gap={0}>
                <Text role="lead">{greeting}, Priya</Text>
                <Text role="caption" tone="faint" measured={false}>{today} · {DEMO_JURISDICTION.short}</Text>
              </Stack>
            </Stack>

            {/* ── Search ────────────────────────────────────────────────── */}
            <div style={{ padding: `0 ${S[4]} ${S[4]}`, flexShrink: 0 }}>
              <Row
                gap={2}
                style={{
                  background: T.sunken,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: LAYOUT.radius.control,
                  padding: `0 ${S[3]}`,
                  minHeight: M.tap,
                }}
              >
                <IconSearch size={ICON.ui} color={T.inkFaint} />
                <Text role="body" tone="faint" measured={false}>Search matters and documents</Text>
              </Row>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${S[4]}` }}>
              <Stack gap={4}>
                <NavRow
                  icon={<IconFile size={ICON.row} />}
                  label="My documents"
                  trailing={<Amount tone="faint">{documentCount}</Amount>}
                  onClick={() => go('/mobile/files')}
                />

                {active && (
                  <Stack gap={2}>
                    <Label>Active matter</Label>
                    <ActiveMatter matter={active} onOpen={() => go('/mobile/case/consumer')} />
                  </Stack>
                )}

                <Stack gap={2}>
                  <Rule />
                  <NavRow
                    icon={<IconPlus size={ICON.row} />}
                    label="New chat"
                    onClick={() => go('/mobile/home')}
                  />
                </Stack>

                {earlier.length > 0 && (
                  <Stack gap={1}>
                    <Label>Earlier</Label>
                    {earlier.map((c) => (
                      <ChatRow
                        key={c.id}
                        chat={c}
                        active={false}
                        /* Open the matter that was clicked, not always the
                           consumer case. The out-of-scope example opens its own
                           boundary screen instead of dead-ending on someone
                           else's matter. */
                        onClick={() => go(`/mobile/case/${c.id}`)}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </div>

            {/* Preferences removed (2026-08-28): Language + Appearance were two
                rows that both dead-ended on the profile route, restating what
                the Settings gear below already opens — and language is set at
                onboarding, so it earns no standing drawer real estate. Settings
                (gear, account rail) is the one door to both. */}

            {/* ── Account rail ──────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, borderTop: `1px solid ${T.hairline}`, padding: `${S[3]} ${S[4]}`, marginTop: S[3] }}>
              <Row justify="between" gap={2}>
                <button
                  type="button"
                  onClick={() => go('/mobile/profile')}
                  className="lokai-pressable"
                  aria-label="Open profile"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    minWidth: 0, color: 'inherit', font: 'inherit',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 32, height: 32, borderRadius: LAYOUT.radius.full,
                      background: T.anchorTint, color: T.anchor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Text role="captionStrong" tone="anchor" measured={false}>PS</Text>
                  </span>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text role="bodyStrong" measured={false}>Priya S.</Text>
                    <Text role="caption" tone="faint" measured={false}>Karnataka</Text>
                  </Stack>
                </button>
                <IconButton label="Settings" onClick={() => go('/mobile/profile')}>
                  <IconSettings size={ICON.row} />
                </IconButton>
              </Row>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
