import React from 'react';
import { Row, Stack, Label, Text, T, LAYOUT, typeStyle } from '../../ui';
import type { VoiceEntity } from '../../hooks/useVoiceCapture';

/**
 * The facts LokAI caught in the transcript, as scannable chips.
 *
 * This is the confirm phase's companion: the words below are the user's to
 * edit, and these chips are what the app extracted from them — amount,
 * product, the defect they described. Tapping a chip selects those exact
 * words in the transcript (the caller wires the selection), so a fact points
 * back at the user's own sentence rather than asserting itself. Derived by
 * pattern over the real transcript; a chip only appears for something the
 * words actually contain.
 */
export function VoiceFactChips({
  entities,
  onJump,
}: {
  entities: VoiceEntity[];
  /** Selects the entity's words in the transcript when wired. */
  onJump?: (entity: VoiceEntity) => void;
}) {
  if (entities.length === 0) return null;
  return (
    <Stack gap={2}>
      <Label>What LokAI caught</Label>
      <Row gap={2} wrap>
        {entities.map((entity) => {
          const interactive = !!onJump;
          return (
            <button
              key={entity.id}
              type="button"
              onClick={onJump ? () => onJump(entity) : undefined}
              className={interactive ? 'lokai-pressable' : undefined}
              disabled={!interactive}
              style={{
                display: 'inline-flex', alignItems: 'baseline', gap: 6,
                background: T.anchorTint, border: 'none',
                borderRadius: LAYOUT.radius.pill, padding: '6px 12px',
                cursor: interactive ? 'pointer' : 'default',
                textAlign: 'left',
              }}
            >
              <span style={{ ...typeStyle('caption'), color: T.inkFaint }}>{entity.label}</span>
              <span style={{ ...typeStyle('bodyStrong'), color: T.ink }}>{entity.value}</span>
            </button>
          );
        })}
      </Row>
    </Stack>
  );
}
