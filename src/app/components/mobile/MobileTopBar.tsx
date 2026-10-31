import React from 'react';
import { useNavigate } from 'react-router';
import { IconBack, IconDots, IconMenu, IconNewChat } from '../../ui/icons';
import { Row, IconButton, Text, T, S, ICON } from '../../ui';
import { Wordmark } from '../shared';
import { useDrawer } from '../../context/DrawerContext';

/**
 * The minimal top bar — the ChatGPT/Gemini/Claude mobile pattern.
 *
 * Replaces the old `TopNav` (brand-left + a persistent language chip right).
 * Language selection now happens in onboarding and Settings, so it earns no
 * permanent header real estate. What remains is the three-part chat-app bar:
 * a menu affordance, the wordmark, and new-chat.
 *
 *  - hamburger (or a back arrow for modal flows) — opens the drawer, the app's
 *    one navigation surface now that the bottom tab bar is gone.
 *  - wordmark, centred — quiet identity.
 *  - new-chat — the single most-used action on a chat home, always one tap away.
 *
 * `tone="stop"` inverts it for a full-bleed stop state.
 */
export function MobileTopBar({
  onBack,
  onNewChat,
  onMenu,
  tone = 'paper',
  showWordmark = true,
  showNewChat = true,
  showMenu = false,
}: {
  /** When set, the leading control is a back arrow (modal flow) instead of the
   *  drawer hamburger. */
  onBack?: () => void;
  /** When set, "new chat" clears the current conversation in place instead of
   *  navigating (Home holds the chat, so a route change would not reset it). */
  onNewChat?: () => void;
  /** When set, the trailing control becomes the matter's three-dots menu —
   *  currently the Quick Recap flashcard deck. Takes precedence over
   *  new-chat: a conversation with work in it has something to recap. */
  onMenu?: () => void;
  tone?: 'paper' | 'stop';
  /** Home is itself the chat canvas, so it carries neither the centred wordmark
   *  (identity already lives in onboarding + drawer) nor a "new chat" button
   *  (you are already on it) — both read as noise on the one screen that should
   *  feel like an open invitation to speak. */
  showWordmark?: boolean;
  showNewChat?: boolean;
  showMenu?: boolean;
}) {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const ink = tone === 'stop' ? T.stopInk : T.ink;

  return (
    <Row justify="between" align="center" style={{ padding: `${S[2]} ${S[3]}`, flexShrink: 0 }}>
      {onBack ? (
        <IconButton label="Back" onClick={onBack}>
          <IconBack size={ICON.row} color={ink} />
        </IconButton>
      ) : (
        <IconButton label="Open menu" onClick={openDrawer}>
          <IconMenu size={ICON.row} color={ink} />
        </IconButton>
      )}

      {showWordmark ? <Wordmark size={19} color={ink} /> : <span aria-hidden style={{ width: 44 }} />}

      {showMenu && onMenu ? (
        <IconButton label="Quick recap" onClick={onMenu}>
          <IconDots size={ICON.row} color={ink} />
        </IconButton>
      ) : showNewChat ? (
        <IconButton label="New chat" onClick={onNewChat ?? (() => navigate('/mobile/home'))}>
          <IconNewChat size={ICON.row} color={ink} />
        </IconButton>
      ) : <span aria-hidden style={{ width: 44 }} />}
    </Row>
  );
}
