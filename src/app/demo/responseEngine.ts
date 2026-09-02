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

const STAGE_MS = 400;

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
  const stageMs = opts?.stageMs ?? STAGE_MS;
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
