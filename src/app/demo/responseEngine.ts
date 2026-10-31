import {
  DEMO_PROGRESS_STAGES,
  getTurnById,
  resolvePreparedTurn,
  turnToLegacyLokAIResponse,
  type DemoLanguage,
  type ResponseTurn,
} from '../data/responseTurns';
import type { LokAIResponse } from '../services/api';

export type ProgressController = {
  promise: Promise<ResponseTurn>;
  skip: () => void;
  replay: () => void;
};

/**
 * Consequence-scaled working beat (DECISION-INTERACTION-2026-09 §4-S1).
 *
 * CHI '26 (Tan et al., n=240): identical answers at ~2s read as LESS
 * thoughtful than 9s; 20s adds nothing and triggers reliability doubt.
 * The law derived there: delay must be earned, narrated, consequence-
 * scaled, and predictable. The engine answers all four:
 *  - earned   — every stage names work the decision actually performs;
 *  - narrated — the stage label IS the narration (TurnStatus);
 *  - scaled   — the beat length follows the turn's consequence class:
 *               stops arrive fastest of all (a refusal that stalls reads
 *               as the system struggling to say no); advice-class turns
 *               (explain/disclose) carry the full narrated beat, which
 *               the research found Advice tasks *reward*;
 *  - predictable — the prototype is deterministic: same input, same beat,
 *               every time (Riemer et al.: deviations erode trust, not
 *               the delay itself).
 *
 * The beat is always skippable (TurnStatus) — the CHI ethics section's own
 * prescription: latency framing needs user insight or control.
 */
const STAGE_MS_BY_CLASS: Record<ResponseTurn['mode'], number> = {
  stop: 240,        // ≤1.2s to the stop card — refusal lands fast, lands hard
  confirm: 300,     // near-instant bookkeeping
  progress: 300,
  recover: 700,     // "paused, nothing lost" — brief, honest
  clarify: 450,     // one question, short beat
  explain: 1050,    // the advice-class full beat: 4 × 1050 ≈ 4.2s narrated
  disclose: 1050,   // partial delivery deserves the same deliberation
};

const DEFAULT_STAGE_MS = 700;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Deterministic staged progress then resolve to the target turn.
 * Skip jumps to the final turn; Replay restarts from stage 0.
 *
 * `opts.stages` / `opts.stageMs` let a caller run a shorter or different
 * beat (the clarify chain's confirm-after-answer uses two stages) — the
 * default remains the full prepared arc.
 */
export function runProgressThen(
  targetTurn: ResponseTurn,
  onStage?: (index: number, label: string) => void,
  opts?: { stages?: readonly string[]; stageMs?: number },
): ProgressController {
  const stages = opts?.stages ?? DEMO_PROGRESS_STAGES;
  const stageMs = opts?.stageMs ?? STAGE_MS_BY_CLASS[targetTurn.mode] ?? DEFAULT_STAGE_MS;
  let cancelled = false;
  let skipped = false;
  let resolveFn: (turn: ResponseTurn) => void = () => {};
  const promise = new Promise<ResponseTurn>((resolve) => {
    resolveFn = resolve;
  });

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    resolveFn(targetTurn);
  };

  const run = async () => {
    if (prefersReducedMotion() || skipped) {
      onStage?.(stages.length - 1, stages[stages.length - 1]);
      finish();
      return;
    }
    for (let i = 0; i < stages.length; i++) {
      if (cancelled || skipped) break;
      onStage?.(i, stages[i]);
      await new Promise((r) => window.setTimeout(r, stageMs));
    }
    finish();
  };

  void run();

  return {
    promise,
    skip: () => {
      skipped = true;
      finish();
    },
    replay: () => {
      cancelled = false;
      skipped = false;
      void run();
    },
  };
}

export function resolveTurnFromInput(
  input: string,
  opts?: { scenarioId?: string; language?: DemoLanguage },
): ResponseTurn {
  return resolvePreparedTurn(input, opts);
}

export function resolveTurnFromScenario(scenarioId: string, language: DemoLanguage = 'en'): ResponseTurn {
  return resolvePreparedTurn('', { scenarioId, language });
}

export function turnAsLokAIResponse(turn: ResponseTurn): LokAIResponse {
  return turnToLegacyLokAIResponse(turn) as LokAIResponse;
}

export function getProgressTurn(): ResponseTurn {
  return getTurnById('progress-default')!;
}

export { DEMO_PROGRESS_STAGES };
