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
  resolvePreparedTurn,
} from '../data/responseTurns';
import { localizeConsumerExplain } from '../data/languagePacks';
import {
  DEMO_PROGRESS_STAGES,
  runProgressThen,
  turnAsLokAIResponse,
  type ProgressController,
} from '../demo/responseEngine';
import type { LokAIResponse } from '../services/api';
import type { WorkflowStage } from '../data/caseWorkflow';

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

  selectedTerm: GlossaryEntry | null;
  openTerm: (id: string) => void;
  closeTerm: () => void;

  auditEvents: string[];
  addAuditEvent: (event: string) => void;

  /** Active hybrid turn (latest resolved) */
  activeTurn: ResponseTurn | null;
  legacyResponse: LokAIResponse | null;
  progressIndex: number;
  progressLabel: string | null;
  isProgressing: boolean;
  skipProgress: () => void;
  replayProgress: () => void;

  /** Resolve input through progress → prepared turn */
  runPreparedInput: (input: string) => Promise<ResponseTurn>;
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
  const [progressIndex, setProgressIndex] = useState(-1);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [isProgressing, setIsProgressing] = useState(false);
  const progressRef = useRef<ProgressController | null>(null);

  const scenario = useMemo(() => getDemoScenario(scenarioId), [scenarioId]);

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
    setAuditEvents((events) => [...events, `Opened guardrail scene: ${next.label}`]);
  }, []);

  const openTerm = useCallback((id: string) => {
    if (LEGAL_GLOSSARY[id]) setSelectedTermId(id);
  }, []);

  const closeTerm = useCallback(() => setSelectedTermId(null), []);

  const confirmFact = useCallback((id: string) => {
    setFacts((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, state: 'confirmed' as const, confirmedByUser: true } : f,
      ),
    );
    addAuditEvent(`Fact confirmed: ${id}`);
  }, [addAuditEvent]);

  const correctFact = useCallback((id: string, value: string) => {
    setFacts((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, value, state: 'confirmed' as const, confirmedByUser: true }
          : f,
      ),
    );
    setDraftApprovedState(false);
    addAuditEvent(`Fact corrected: ${id} → ${value}`);
  }, [addAuditEvent]);

  const finishTurn = useCallback((turn: ResponseTurn) => {
    setActiveTurn(turn);
    setIsProgressing(false);
    setProgressIndex(-1);
    setProgressLabel(null);
    addAuditEvent(`Response mode: ${turn.mode} (${turn.id})`);
    if (!turn.draftAllowed) setDraftApprovedState(false);
    return turn;
  }, [addAuditEvent]);

  const runPreparedInput = useCallback(async (input: string) => {
    let target = resolvePreparedTurn(input, { scenarioId, language });
    if (target.id === 'consumer-explain' && language !== 'en') {
      target = localizeConsumerExplain(language);
    }
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
  }, [scenarioId, language, finishTurn]);

  const runScenario = useCallback(async (id?: string) => {
    const sid = id ?? scenarioId;
    if (id && id !== scenarioId) {
      selectScenario(id);
    }
    let target = resolvePreparedTurn('', { scenarioId: sid, language });
    if (target.id === 'consumer-explain' && language !== 'en') {
      target = localizeConsumerExplain(language);
    }
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
  }, [scenarioId, language, selectScenario, finishTurn]);

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

  const draftAllowed = activeTurn?.draftAllowed
    ?? (scenario.policyTier === 'self_service');

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
    selectedTerm: selectedTermId ? LEGAL_GLOSSARY[selectedTermId] : null,
    openTerm,
    closeTerm,
    auditEvents,
    addAuditEvent,
    activeTurn,
    legacyResponse,
    progressIndex,
    progressLabel,
    isProgressing,
    skipProgress,
    replayProgress,
    runPreparedInput,
    runScenario,
  }), [
    scenarioId, scenario, selectScenario, language, stage, facts,
    confirmFact, correctFact, draftApproved, setDraftApproved, draftAllowed, selectedTermId,
    openTerm, closeTerm, auditEvents, addAuditEvent, activeTurn, legacyResponse,
    progressIndex, progressLabel, isProgressing, skipProgress, replayProgress,
    runPreparedInput, runScenario,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}
