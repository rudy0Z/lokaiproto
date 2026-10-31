import React from 'react';
import { useNavigate } from 'react-router';
import { LogoMark } from '../components/shared';
import { Stack, Text, Button, useSystemStyles, T, S } from '../ui';

export default function NotFound() {
  useSystemStyles();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: T.ground,
        padding: S[6],
      }}
    >
      <Stack
        gap={4}
        align="center"
        style={{
          maxWidth: 380,
          textAlign: 'center',
        }}
      >
        <LogoMark size={48} />
        <Stack gap={2} align="center">
          <Text role="title" measured={false}>Matter not found</Text>
          <Text tone="quiet" measured={false}>
            The link you followed doesn't match an active matter or tool in this prototype.
          </Text>
        </Stack>
        <Button onClick={() => navigate('/desktop/dashboard')}>
          Return to dashboard
        </Button>
      </Stack>
    </div>
  );
}
