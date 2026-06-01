import { createBrowserRouter, Navigate } from 'react-router';
import CaptureLayout             from './CaptureLayout';

// Shells
import DesktopShell              from './shells/DesktopShell';
import MobileShell               from './shells/MobileShell';

// Desktop pages
import Home                      from './pages/Home';
import Chat                      from './pages/Chat';
import Notice                    from './pages/Notice';
import Draft                     from './pages/Draft';
import Documents                 from './pages/Documents';

// Mobile pages
import MobileLogin               from './pages/mobile/MobileLogin';
import MobileOnboarding1         from './pages/mobile/MobileOnboarding1';
import MobileOnboarding2         from './pages/mobile/MobileOnboarding2';
import MobileOnboarding3         from './pages/mobile/MobileOnboarding3';
import MobileOnboarding4         from './pages/mobile/MobileOnboarding4';
import MobileHome                from './pages/mobile/MobileHome';
import MobileChat                from './pages/mobile/MobileChat';
import MobileChatTamil           from './pages/mobile/MobileChatTamil';
import MobileChatMarathi         from './pages/mobile/MobileChatMarathi';
import MobileChatBoundary        from './pages/mobile/MobileChatBoundary';
import MobileVoiceActive         from './pages/mobile/MobileVoiceActive';
import MobileProfile             from './pages/mobile/MobileProfile';

export const router = createBrowserRouter([
  {
    Component: CaptureLayout,
    children: [
      // ── Desktop shell (sidebar + content) ───────────────────────────────
      {
        path: '/desktop',
        Component: DesktopShell,
        children: [
          { index: true, element: <Navigate to="/desktop/dashboard" replace /> },

          // Dashboard
          { path: 'dashboard',          Component: Home            },

          // Chat variants
          { path: 'chat',               Component: Chat            }, // Active/new conversation fallback
          { path: 'chat/deposit',       Component: Chat            }, // English + Marathi
          { path: 'chat/rti',           Component: Chat            }, // English + Hindi
          { path: 'chat/consumer',      Component: Chat            }, // Consumer demo
          { path: 'chat/:chatId',       Component: Chat            }, // Dynamic conversations

          // Tools
          { path: 'notice-interpreter', Component: Notice          }, // English + Marathi
          { path: 'document-draft',     Component: Draft           }, // English + Hindi header
          { path: 'documents',          Component: Documents       }, // My Documents
        ],
      },

      // ── Mobile shell (390px frame, bottom nav) ──────────────────────────────────
      {
        path: '/mobile',
        Component: MobileShell,
        children: [
          { index: true, element: <Navigate to="/mobile/home" replace /> },

          // Auth & onboarding
          { path: 'login',              Component: MobileLogin       },
          { path: 'onboarding/1',       Component: MobileOnboarding1 },
          { path: 'onboarding/2',       Component: MobileOnboarding2 },
          { path: 'onboarding/3',       Component: MobileOnboarding3 },
          { path: 'onboarding/4',       Component: MobileOnboarding4 },

          // Main screens
          { path: 'home',               Component: MobileHome          },
          { path: 'chat/hindi',         Component: MobileChat          },
          { path: 'chat/tamil',         Component: MobileChatTamil     },
          { path: 'chat/marathi',       Component: MobileChatMarathi   },
          { path: 'chat/out-of-scope',  Component: MobileChatBoundary  },
          { path: 'voice',              Component: MobileVoiceActive   },
          { path: 'profile',            Component: MobileProfile       },
        ],
      },

      // Fallback
      { path: '/', element: <Navigate to="/desktop/dashboard" replace /> }
    ],
  },
]);
