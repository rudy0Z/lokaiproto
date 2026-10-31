import { useRouteError, useNavigate } from 'react-router';
import { Warning } from '@phosphor-icons/react';
import { Screen, Stack, Row, Text, Label, Button, T, S, M } from '../ui';

/**
 * The styled error boundary (behavioral audit P1-1, test T46): a thrown render
 * error in a trust product must not surface the router's unstyled dev screen.
 * Same honest pattern as everything else: what happened in plain words, what
 * still works, and the way back — never "Something went wrong".
 */
export function RouteErrorScreen() {
  const error = useRouteError();
  const navigate = useNavigate();
  return (
    <Screen
      tone="stop"
      scrollClearance={S[6]}
      action={
        <Stack gap={2}>
          <Button onClick={() => navigate('/mobile/home')}>Back to the conversation</Button>
          <Button variant="quiet" onClick={() => window.location.reload()}>
            Try this screen again
          </Button>
        </Stack>
      }
    >
      <Row gap={2} align="center">
        <Warning size={28} aria-hidden style={{ color: T.stopInk, flexShrink: 0 }} />
        <Label>This screen stopped — your case did not</Label>
      </Row>
      <Text role="pronounce">LokAI hit an error it did not expect</Text>
      <Text tone="quiet" style={{ maxWidth: M.measure }}>
        Nothing was sent or lost — everything in this prototype lives on this
        device. The conversation and your facts are where you left them.
      </Text>
      {error instanceof Error && (
        <Text role="caption" tone="quiet" measured={false}>
          Technical detail: {error.message}
        </Text>
      )}
    </Screen>
  );
}
