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
 */
export function runProgressThen(
  targetTurn: ResponseTurn,
  onStage?: (index: number, label: string) => void,
): ProgressController {
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
      onStage?.(DEMO_PROGRESS_STAGES.length - 1, DEMO_PROGRESS_STAGES[DEMO_PROGRESS_STAGES.length - 1]);
      finish();
      return;
    }
    for (let i = 0; i < DEMO_PROGRESS_STAGES.length; i++) {
      if (cancelled || skipped) break;
      onStage?.(i, DEMO_PROGRESS_STAGES[i]);
      await new Promise((r) => window.setTimeout(r, STAGE_MS));
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
