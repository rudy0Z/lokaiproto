import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_SCENARIO_ID,
  LEGAL_GLOSSARY,
  getDemoScenario,
  type DemoFact,
  type DemoScenario,
  type GlossaryEntry,
} from '../data/demoScenarios';
import {
  type DemoLanguage,
  type ResponseTurn,
  getTurnById,
  resolvePreparedTurn,
} from '../data/responseTurns';
import { CLARIFY_RESOLVE_STAGES } from '../data/responseTurns';
import { clarifyOptionsFor, localizeConsumerClarify, localizeConsumerExplain, localizeConsumerFollowUp, localizeStopTurn, localizeNoticeExplain, localizeReceiptFiled, turnChrome } from '../data/languagePacks';
import {
  DEMO_PROGRESS_STAGES,
  runProgressThen,
  turnAsLokAIResponse,
  type ProgressController,
} from '../demo/responseEngine';
import type { LokAIResponse } from '../services/api';
import type { WorkflowStage } from '../data/caseWorkflow';
import { decide, computeDraftAllowed } from '../decision/engine';
import { buildReceipt } from '../decision/receipts';
import type { DecisionReceipt } from '../decision/types';

export type MatterFact = DemoFact & { confirmedByUser?: boolean };

/*
 * Initial language — reads `?lang=` from the hash-route query ONCE at module
 * load, mirroring IS_EMBED's detection pattern in ../embed.ts. Lets deep
 * links (portfolio specimens, guided-tour steps) and directly-shared URLs
 * open in a specific language without waiting for an in-app click.
 */
function detectInitialLanguage(): DemoLanguage {
  if (typeof window === 'undefined') return 'en';
  const query = window.location.hash.split('?')[1] ?? '';
  const value = new URLSearchParams(query).get('lang');
  return value === 'hi' || value === 'mr' || value === 'ta' ? value : 'en';
}

interface DemoContextValue {
  scenarioId: string;
  scenario: DemoScenario;
  selectScenario: (id: string) => void;

  language: DemoLanguage;
  setLanguage: (lang: DemoLanguage) => void;

  stage: WorkflowStage;
  setStage: (stage: WorkflowStage) => void;

  facts: MatterFact[];
  confirmFact: (id: string) => void;
  correctFact: (id: string, value: string) => void;

  draftApproved: boolean;
  setDraftApproved: (v: boolean) => void;
  draftAllowed: boolean;
  /**
   * WHY drafting is locked, so the packet sheet can say something true.
   * `'stop'` — the last answer refused (the stop rule outranks preference).
   * `'facts'` — an answer is available but a fact is unconfirmed, so the
   * engine will not draft from it (`computeDraftAllowed`, G8).
   */
  draftLockReason: 'stop' | 'facts' | null;

  selectedTerm: GlossaryEntry | null;
  openTerm: (id: string) => void;
  closeTerm: () => void;

  auditEvents: string[];
  addAuditEvent: (event: string) => void;

  /** Active hybrid turn (latest resolved) */
  activeTurn: ResponseTurn | null;
  /** Decision layer: receipt for the latest routed input (audit surface). */
  lastReceipt: DecisionReceipt | null;
  /** Decision layer: full receipt trail for the Spine (P5). */
  receipts: DecisionReceipt[];
  legacyResponse: LokAIResponse | null;
  progressIndex: number;
  progressLabel: string | null;
  isProgressing: boolean;
  skipProgress: () => void;
  replayProgress: () => void;

  /** Resolve input through progress → prepared turn */
  runPreparedInput: (input: string) => Promise<ResponseTurn>;
  /**
   * The conversation's middle (audit F1): first exchange on the consumer
   * matter runs progress → the clarify turn, so the chat ASKS one real
   * question before answering. Returns the clarify turn; the caller renders
   * `clarifyOptionsFor(language)` under it and resolves the tapped answer
   * through `resolveClarify`. Every later exchange (and every guardrail
   * scene) behaves like runPreparedInput.
   */
  runPreparedConversation: (input: string) => Promise<ResponseTurn>;
  /** The user answered the clarify turn: short progress → the mapped follow-up. */
  resolveClarify: (nextTurnId: string) => Promise<ResponseTurn>;
  /** New conversation: clears the active turn and re-arms the clarify middle,
      so a fresh chat runs the full arc again (one matter, one clarify). */
  resetConversation: () => void;
  /** Jump straight to scenario's primary turn (with progress) */
  runScenario: (scenarioId?: string) => Promise<ResponseTurn>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function factsFromScenario(scenario: DemoScenario): MatterFact[] {
  return scenario.facts.map((f) => ({ ...f, confirmedByUser: f.state === 'confirmed' }));
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO_ID);
  const [language, setLanguage] = useState<DemoLanguage>(detectInitialLanguage);
  const [stage, setStage] = useState<WorkflowStage>('intake');
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [draftApproved, setDraftApprovedState] = useState(false);
  const [facts, setFacts] = useState<MatterFact[]>(() =>
    factsFromScenario(getDemoScenario(DEFAULT_SCENARIO_ID)),
  );
  const [auditEvents, setAuditEvents] = useState<string[]>([
    'Prepared consumer-refund example loaded',
    'No network or device permission requested',
  ]);
  const [activeTurn, setActiveTurn] = useState<ResponseTurn | null>(null);
  const [lastReceipt, setLastReceipt] = useState<DecisionReceipt | null>(null);
  const [receipts, setReceipts] = useState<DecisionReceipt[]>([]);
  const [progressIndex, setProgressIndex] = useState(-1);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [isProgressing, setIsProgressing] = useState(false);
  const progressRef = useRef<ProgressController | null>(null);
  /* The clarify middle runs ONCE per conversation — after the user has
     answered it, later exchanges resolve straight to their turns. */
  const clarifyAnsweredRef = useRef(false);
  /* Live recompute (DECISION-INTERACTION R6): the last input is re-decided
     when a fact is confirmed or corrected — gates re-fire, the receipt and
     its ledger rewrite, and if the decision itself changes, the answer is
     re-run through the short honest beat. */
  const lastInputRef = useRef<string | null>(null);

  const scenario = useMemo(() => getDemoScenario(scenarioId), [scenarioId]);

  /* One language, one truth (P0-2): every turn the engine resolves passes
     through this gate — a localized question must never meet an unlocalized
     answer, including the whole stop family. */
  const localizeTurn = useCallback((turn: ResponseTurn): ResponseTurn => {
    if (language === 'en') return turn;
    if (turn.id === 'consumer-explain') return localizeConsumerExplain(language);
    if (turn.id === 'consumer-clarify') return localizeConsumerClarify(language);
    if (turn.id === 'notice-explain') return localizeNoticeExplain(language);
    if (turn.id === 'receipt-filed') return localizeReceiptFiled(language) ?? turn;
    const stopLocalized = localizeStopTurn(turn.id, language);
    if (stopLocalized) return stopLocalized;
    return localizeConsumerFollowUp(turn.id as 'statute-expiry-stop' | 'source-gap-disclose', language) ?? turn;
  }, [language]);

  /** The narrated beat for an outcome: structural stage keys rendered from
     the language packs, so a stop never claims a law check it skipped. */
  const stagesFor = useCallback((outcome: { stageKeys: Array<string> }): string[] => {
    const chrome = turnChrome(language);
    return outcome.stageKeys.map((k) => chrome.stages[k] ?? k);
  }, [language]);

  const addAuditEvent = useCallback((event: string) => {
    setAuditEvents((events) => [...events, event]);
  }, []);

  const setDraftApproved = useCallback((v: boolean) => {
    setDraftApprovedState(v);
    setAuditEvents((events) => [
      ...events,
      v ? 'Draft approved by user for copy/print' : 'Draft approval cleared',
    ]);
  }, []);

  const selectScenario = useCallback((id: string) => {
    const next = getDemoScenario(id);
    setScenarioId(next.id);
    setSelectedTermId(null);
    setFacts(factsFromScenario(next));
    setDraftApprovedState(false);
    setStage('intake');
    setActiveTurn(null);
    setLastReceipt(null);
    setReceipts([]);
    setAuditEvents((events) => [...events, `Opened guardrail scene: ${next.label}`]);
  }, []);

  const openTerm = useCallback((id: string) => {
    if (LEGAL_GLOSSARY[id]) setSelectedTermId(id);
  }, []);

  const closeTerm = useCallback(() => setSelectedTermId(null), []);

  
  const finishTurn = useCallback((turn: ResponseTurn) => {
    setActiveTurn(turn);
    setIsProgressing(false);
    setProgressIndex(-1);
    setProgressLabel(null);
    addAuditEvent(`Response mode: ${turn.mode} (${turn.id})`);
    if (!turn.draftAllowed) setDraftApprovedState(false);
    return turn;
  }, [addAuditEvent]);

  /** Live recompute (T32, DECISION-INTERACTION R6): after a fact changes, the
     last input is decided again against the new state. If the decision
     itself changed, the answer re-runs through the short honest beat with
     its fresh receipt; if only the receipt moved (a fact now confirmed),
     the gate trail and ledger rewrite in place. */
  const recomputeAfterFact = useCallback((nextFacts: MatterFact[]) => {
    const input = lastInputRef.current;
    if (!input || !activeTurn || isProgressing) return;
    const outcome = decide({
      scenarioId,
      policyTier: scenario.policyTier,
      userMessage: scenario.userMessage,
      facts: nextFacts.map((f) => ({ id: f.id, state: f.state, confirmedByUser: f.confirmedByUser ?? false })),
      sources: scenario.sources.map((src) => ({ id: src.id, support: src.support })),
      input,
      inputKind: 'typed',
      language,
      turnIndex: auditEvents.length,
    });
    if (outcome.turnId !== activeTurn.id) {
      setLastReceipt(outcome.receipt);
      setReceipts((prev) => [...prev, outcome.receipt]);
      addAuditEvent(`Decision ${outcome.receipt.id}: ${outcome.rationale.rule} -> ${outcome.turnId} (recomputed after fact change)`);
      const target = localizeTurn(getTurnById(outcome.turnId) ?? activeTurn);
      const chrome = turnChrome(language);
      setIsProgressing(true);
      setProgressIndex(0);
      setProgressLabel(chrome.stages.read);
      const controller = runProgressThen(target, (index, label) => {
        setProgressIndex(index);
        setProgressLabel(label);
      }, { stages: outcome.stageKeys.map((k) => chrome.stages[k] ?? k) });
      progressRef.current = controller;
      void controller.promise.then((turn) => finishTurn(turn));
    } else if (outcome.receipt.id !== lastReceipt?.id) {
      setLastReceipt(outcome.receipt);
      addAuditEvent(`Receipt recomputed after fact change: ${outcome.receipt.id}`);
    }
  }, [scenarioId, scenario, language, activeTurn, isProgressing, auditEvents.length, lastReceipt?.id, addAuditEvent, localizeTurn, finishTurn]);

  const confirmFact = useCallback((id: string) => {
    let next: MatterFact[] = [];
    setFacts((prev) => {
      next = prev.map((f) =>
        f.id === id ? { ...f, state: 'confirmed' as const, confirmedByUser: true } : f,
      );
      return next;
    });
    addAuditEvent(`Fact confirmed: ${id}`);
    recomputeAfterFact(next);
  }, [addAuditEvent, recomputeAfterFact]);

  const correctFact = useCallback((id: string, value: string) => {
    let next: MatterFact[] = [];
    setFacts((prev) => {
      next = prev.map((f) =>
        f.id === id
          ? { ...f, value, state: 'confirmed' as const, confirmedByUser: true }
          : f,
      );
      return next;
    });
    setDraftApprovedState(false);
    addAuditEvent(`Fact corrected: ${id} → ${value}`);
    recomputeAfterFact(next);
  }, [addAuditEvent, recomputeAfterFact]);


  const runPreparedInput = useCallback(async (input: string) => {
    /* P2 engine wiring: text-first resolution through the gate cascade.
       Safety (G2/G3) outranks the clarify middle — a criminal or high-risk
       first message must stop immediately, never ask about purchase date.
       The clarify middle only fires for genuinely consumer-shaped input
       that the engine routes to proceed/clarify on the consumer matter. */
    lastInputRef.current = input;
    const engineOutcome = decide({
      scenarioId,
      policyTier: scenario.policyTier,
      userMessage: scenario.userMessage,
      facts: facts.map((f) => ({ id: f.id, state: f.state, confirmedByUser: f.confirmedByUser ?? false })),
      sources: scenario.sources.map((s) => ({ id: s.id, support: s.support })),
      input,
      inputKind: 'typed',
      language,
      turnIndex: auditEvents.length,
    });
    const beatStages = stagesFor(engineOutcome);
    /* Safety bypass: scope and risk stops skip the clarify middle entirely. */
    if (
      engineOutcome.rationale.gate === 'G2_SCOPE' ||
      engineOutcome.rationale.gate === 'G3_HIGH_RISK' ||
      engineOutcome.kind === 'escalate'
    ) {
      clarifyAnsweredRef.current = true;
      setLastReceipt(engineOutcome.receipt);
      setReceipts((prev) => [...prev, engineOutcome.receipt]);
      addAuditEvent(`Decision ${engineOutcome.receipt.id}: ${engineOutcome.rationale.rule} -> ${engineOutcome.turnId}`);
      const target = localizeTurn(getTurnById(engineOutcome.turnId) ?? resolvePreparedTurn(input, { language }));
      setIsProgressing(true);
      setProgressIndex(0);
      setProgressLabel(beatStages[0]);
      const controller = runProgressThen(target, (index, label) => {
        setProgressIndex(index);
        setProgressLabel(label);
      }, { stages: beatStages });
      progressRef.current = controller;
      const turn = await controller.promise;
      return finishTurn(turn);
    }

    /* The clarify middle (audit F1/F5) is the conversation's first beat: the
       first call about THE CONSUMER MATTER returns the prepared clarify turn
       UNLESS the user has already answered one.

       The guard is the engine's own routing, not just the scenario id. It used
       to be `scenarioId === 'consumer' && kind !== 'stop'`, which meant ANY
       non-stop input in the consumer matter got the purchase-date question —
       including input the engine had already routed somewhere else entirely.
       Two real consequences, both wrong in the same way:

         · requesting a notice interpretation asked "when did you buy the
           mixer?" — so a document dropped into the composer produced a
           response about a different matter than the document
         · a "but the seller says…" message, which the engine routes to the
           conflicting-rules stop, was asked the purchase-date question first

       The clarify exists to supply the missing fact for the consumer explain
       path. Scoping it to the turns that actually consume that fact keeps the
       intended first beat (a mixer message still gets it) and stops it from
       hijacking every other route. */
    const routesToConsumerMatter =
      engineOutcome.turnId === 'consumer-explain' || engineOutcome.turnId === 'consumer-clarify';
    if (
      !clarifyAnsweredRef.current &&
      scenarioId === 'consumer' &&
      engineOutcome.kind !== 'stop' &&
      routesToConsumerMatter
    ) {
      clarifyAnsweredRef.current = true;
      const target = localizeConsumerClarify(language);
      setIsProgressing(true);
      setProgressIndex(0);
      setProgressLabel(beatStages[0]);
      const controller = runProgressThen(target, (index, label) => {
        setProgressIndex(index);
        setProgressLabel(label);
      }, { stages: beatStages });
      progressRef.current = controller;
      const turn = await controller.promise;
      addAuditEvent('Clarify asked: purchase date (routes the next step)');
      return finishTurn(turn);
    }

    /* Decision layer: the engine resolves input -> prepared turn through the
       gate cascade (scene, scope, risk, conflict, source, facts, content).
       Same turns for every prepared input - but unmatched input now hits a
       designed stop instead of falling through to the nearest answer. */
    setLastReceipt(engineOutcome.receipt);
    setReceipts((prev) => [...prev, engineOutcome.receipt]);
    addAuditEvent(`Decision ${engineOutcome.receipt.id}: ${engineOutcome.rationale.rule} -> ${engineOutcome.turnId}`);
    const target = localizeTurn(getTurnById(engineOutcome.turnId) ?? resolvePreparedTurn(input, { language }));
    setIsProgressing(true);
    setProgressIndex(0);
    setProgressLabel(beatStages[0]);

    const controller = runProgressThen(target, (index, label) => {
      setProgressIndex(index);
      setProgressLabel(label);
    }, { stages: beatStages });
    progressRef.current = controller;
    const turn = await controller.promise;
    return finishTurn(turn);
  }, [scenarioId, scenario, facts, language, auditEvents.length, finishTurn, addAuditEvent, localizeTurn, stagesFor]);

  /** Thin delegating wrapper. Retained for one release cycle as the chat
   *  home page migrates off its first-call clarifier. Calls `runPreparedInput`,
   *  which carries the clarify-middle logic, so the two paths converge. */
  const runPreparedConversation = useCallback(async (input: string) => {
    return runPreparedInput(input);
  }, [runPreparedInput]);

  const resolveClarify = useCallback(async (nextTurnId: string) => {
    const target = localizeTurn(getTurnById(nextTurnId)!);
    /* The clarify answer is itself a decision (G6): the user resolved the
       disputed date, and the receipt for the answer it unlocks is computed
       here — so the gate trail and the auditable "Why this response?" ride
       on the answer, not just on direct asks. */
    const humanLine = nextTurnId === 'consumer-explain'
      ? 'You confirmed the purchase date, so LokAI matched the law to your facts.'
      : nextTurnId === 'statute-expiry-stop'
        ? 'Your date sits outside the illustrated window, so LokAI stopped instead of preparing a filing.'
        : 'The exact date is unconfirmed, so LokAI said only what the reviewed source supports.';
    const outcome = {
      turnId: nextTurnId,
      kind: target.mode === 'stop' ? ('stop' as const) : target.mode === 'disclose' ? ('clarify' as const) : ('proceed' as const),
      rationale: {
        gate: 'G6_FACTS' as const,
        rule: 'FACT_DATE_CONFIRMED' as const,
        because: ['fact:purchase-date'],
        humanLine,
      },
      draftComputed: target.draftAllowed,
    };
    const receipt: DecisionReceipt = {
      ...buildReceipt(outcome, auditEvents.length),
      becauseRefs: [{ label: 'purchase-date', kind: 'fact', ref: 'purchase-date' }],
    };
    setLastReceipt(receipt);
    setReceipts((prev) => [...prev, receipt]);
    addAuditEvent(`Decision ${receipt.id}: G6_FACTS/FACT_DATE_CONFIRMED -> ${nextTurnId}`);
    setIsProgressing(true);
    setProgressIndex(0);
    setProgressLabel(CLARIFY_RESOLVE_STAGES[0]);
    const controller = runProgressThen(
      target,
      (index, label) => {
        setProgressIndex(index);
        setProgressLabel(label);
      },
      { stages: CLARIFY_RESOLVE_STAGES },
    );
    progressRef.current = controller;
    const turn = await controller.promise;
    return finishTurn(turn);
  }, [language, finishTurn, localizeTurn, auditEvents.length, addAuditEvent]);

  const runScenario = useCallback(async (id?: string) => {
    const sid = id ?? scenarioId;
    if (id && id !== scenarioId) {
      selectScenario(id);
    }
    let target = localizeTurn(resolvePreparedTurn('', { scenarioId: sid, language }));
    setIsProgressing(true);
    setProgressIndex(0);
    setProgressLabel(DEMO_PROGRESS_STAGES[0]);
    const controller = runProgressThen(target, (index, label) => {
      setProgressIndex(index);
      setProgressLabel(label);
    });
    progressRef.current = controller;
    const turn = await controller.promise;
    return finishTurn(turn);
  }, [scenarioId, language, selectScenario, finishTurn, localizeTurn]);

  const resetConversation = useCallback(() => {
    clarifyAnsweredRef.current = false;
    setActiveTurn(null);
    setLastReceipt(null);
    setReceipts([]);
    setIsProgressing(false);
    setProgressIndex(-1);
    setProgressLabel(null);
    setDraftApprovedState(false);
    addAuditEvent('New conversation started — clarify middle re-armed');
  }, [addAuditEvent]);

  const skipProgress = useCallback(() => {
    progressRef.current?.skip();
  }, []);

  const replayProgress = useCallback(() => {
    if (activeTurn) {
      void runPreparedInput(activeTurn.trigger instanceof RegExp
        ? (scenario.userMessage)
        : String(activeTurn.trigger));
    } else {
      void runScenario();
    }
  }, [activeTurn, runPreparedInput, runScenario, scenario.userMessage]);

  /* G8 — DRAFT: permission computed from state, never asserted.
   *
   * This is the prototype's central promise, and it was the one promise the
   * interface did not keep. `draftAllowed` used to be read straight off the
   * prepared turn — a static `draftAllowed: true` written into the data — so
   * the packet sheet would happily draft while a fact sat unconfirmed and the
   * header on the same screen said "5 of 6 facts confirmed". `computeDraftAllowed`
   * already existed, already encoded the rule (every fact confirmed by the user,
   * every source supporting, self-service tier), and was already asserted by
   * the conformance fixtures. Nothing called it.
   *
   * Now the live fact store and the scene's sources are fed through the engine
   * function itself. There is no second implementation to drift from it, and
   * correcting a fact in the chat re-locks the draft through the same path
   * that unlocked it.
   *
   * `turnDraftAllowed` still applies on top: a stop's `draftAllowed: false` is
   * the refusal, and the refusal outranks the preference. */
  const turnDraftAllowed = activeTurn?.draftAllowed
    ?? (scenario.policyTier === 'self_service');
  const stateDraftAllowed = computeDraftAllowed({
    scenarioId,
    policyTier: scenario.policyTier,
    userMessage: scenario.userMessage,
    facts: facts.map((f) => ({
      id: f.id,
      state: f.state,
      confirmedByUser: f.confirmedByUser ?? false,
    })),
    sources: scenario.sources.map((s) => ({ id: s.id, support: s.support })),
    input: '',
    inputKind: 'typed',
    turnIndex: auditEvents.length,
  });
  const draftLockReason: 'stop' | 'facts' | null = !turnDraftAllowed
    ? 'stop'
    : !stateDraftAllowed
      ? 'facts'
      : null;
  const draftAllowed = draftLockReason === null;

  const legacyResponse = useMemo(
    () => (activeTurn ? turnAsLokAIResponse(activeTurn) : null),
    [activeTurn],
  );

  const value = useMemo<DemoContextValue>(() => ({
    scenarioId,
    scenario,
    selectScenario,
    language,
    setLanguage,
    stage,
    setStage,
    facts,
    confirmFact,
    correctFact,
    draftApproved,
    setDraftApproved,
    draftAllowed,
    draftLockReason,
    selectedTerm: selectedTermId ? LEGAL_GLOSSARY[selectedTermId] : null,
    openTerm,
    closeTerm,
    auditEvents,
    addAuditEvent,
    activeTurn,
    lastReceipt,
    receipts,
    legacyResponse,
    progressIndex,
    progressLabel,
    isProgressing,
    skipProgress,
    replayProgress,
    runPreparedInput,
    runPreparedConversation,
    resolveClarify,
    resetConversation,
    runScenario,
  }), [
    scenarioId, scenario, selectScenario, language, stage, facts,
    confirmFact, correctFact, draftApproved, setDraftApproved, draftAllowed, draftLockReason, selectedTermId,
    localizeTurn,
    openTerm, closeTerm, auditEvents, addAuditEvent, activeTurn, lastReceipt, receipts, legacyResponse,
    progressIndex, progressLabel, isProgressing, skipProgress, replayProgress,
    runPreparedInput, runPreparedConversation, resolveClarify, resetConversation, runScenario,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}
