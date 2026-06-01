import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { C, SANS, SHADOW } from './components/shared';
import { CAPTURE_ROUTE_GROUPS } from './captureRoutes';

function isCaptureSession(hash: string) {
  return hash.includes('figmacapture=');
}

export default function CaptureLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const captureActive = isCaptureSession(location.hash);

  const navigateWithCapture = (pathname: string) => {
    navigate({
      pathname,
      hash: location.hash || undefined,
    });
  };

  return (
    <>
      <Outlet />
      {captureActive && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            width: '272px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.96)',
            border: `1px solid ${C.border}`,
            borderRadius: '20px',
            boxShadow: SHADOW.float,
            padding: '16px',
            zIndex: 9999,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: '10px',
                fontWeight: 700,
                color: C.navy,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '6px',
              }}
            >
              Figma Capture
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: '13px',
                fontWeight: 600,
                color: C.ink,
                marginBottom: '4px',
              }}
            >
              Session navigation stays in-app
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: '12px',
                lineHeight: 1.5,
                color: C.textSoft,
              }}
            >
              Jump between screens here, then use the Figma toolbar to capture the current view.
            </div>
          </div>

          <div
            style={{
              fontFamily: SANS,
              fontSize: '11px',
              color: C.muted,
              marginBottom: '12px',
              padding: '8px 10px',
              borderRadius: '10px',
              background: C.bg,
            }}
          >
            Current: {location.pathname}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {CAPTURE_ROUTE_GROUPS.map((group) => (
              <div key={group.title}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: '10px',
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}
                >
                  {group.title}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigateWithCapture(item.path)}
                        style={{
                          fontFamily: SANS,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: active ? '#FFFFFF' : C.navy,
                          background: active ? C.navy : C.navySoft,
                          border: active ? `1px solid ${C.navy}` : `1px solid ${C.badgeBorder}`,
                          borderRadius: '999px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
