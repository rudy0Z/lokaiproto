import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router';
import { IconGrid, IconChat, IconFiles, IconFilePen, IconScanSearch, IconArrowRight } from '../ui/icons';
import { C, LAYOUT, MONO, SANS, SHADOW, TYPE } from './shared';
import { useConversations } from '../context/ConversationContext';

const PALETTE_CSS = `
  [cmdk-overlay] { position: fixed; inset: 0; background: rgba(16,25,22,0.42); z-index: 400; }
  [cmdk-dialog]  {
    position: fixed; top: 16vh; left: 50%; transform: translateX(-50%);
    width: min(560px, calc(100vw - 32px)); z-index: 401;
  }
  [cmdk-root] {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 16px;
    box-shadow: ${SHADOW.float};
    overflow: hidden;
  }
  [cmdk-input] {
    width: 100%; box-sizing: border-box;
    font-family: ${SANS}; font-size: 16px; color: ${C.ink};
    padding: 18px 20px; border: none;
    background: transparent;
    border-bottom: 1px solid ${C.border};
  }
  [cmdk-input]:focus-visible {
    outline: 2px solid ${C.saffron};
    outline-offset: -2px;
  }
  [cmdk-input]::placeholder { color: ${C.muted}; }
  [cmdk-list] { max-height: 360px; overflow-y: auto; padding: 8px; }
  [cmdk-list]::-webkit-scrollbar { width: 4px; }
  [cmdk-list]::-webkit-scrollbar-thumb { background: #D8D4CC; border-radius: 2px; }
  [cmdk-group-heading] {
    font-family: ${SANS}; font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: ${C.muted};
    padding: 12px 12px 6px;
  }
  [cmdk-item] {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    font-family: ${SANS}; font-size: 14px; color: ${C.ink};
    transition: background 0.12s ease;
  }
  [cmdk-item][data-selected="true"] { background: rgba(16,42,76,0.07); }
  [cmdk-item][data-disabled="true"] { opacity: 0.4; pointer-events: none; }
  [cmdk-empty] {
    font-family: ${SANS}; font-size: 13px; color: ${C.muted};
    text-align: center; padding: 28px 12px;
  }
`;

const NAV = [
  { id: 'dashboard', label: 'Dashboard',     Icon: IconGrid,    to: '/desktop/dashboard' },
  { id: 'chat',      label: 'Ask a Question', Icon: IconChat, to: '/desktop/chat', newChat: true },
  { id: 'documents', label: 'Case Files',     Icon: IconFiles,         to: '/desktop/documents' },
  { id: 'draft',     label: 'Filing Packet',  Icon: IconFilePen,   to: '/desktop/document-draft' },
  { id: 'notice',    label: 'Notice Upload',  Icon: IconScanSearch,    to: '/desktop/notice-interpreter' },
];

/**
 * Global ⌘K command palette. Moves conversation search out of the sidebar rail
 * (which is now capped to a calm recent list) and gives a fast jump-to for every
 * destination and matter.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { conversations, setActiveId, createConversation } = useConversations();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (fn: () => void) => { setOpen(false); fn(); };

  const openNav = (item: typeof NAV[number]) => go(() => {
    if (item.newChat) {
      const conv = createConversation();
      setActiveId(conv.id);
      navigate(`/desktop/chat/${conv.id}`);
    } else {
      navigate(item.to);
    }
  });

  const openConversation = (id: string) => go(() => {
    setActiveId(id);
    navigate(`/desktop/chat/${id}`);
  });

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette">
      <style>{PALETTE_CSS}</style>
      <Command.Input placeholder="Search matters or jump to a page…" />
      <Command.List>
        <Command.Empty>No matches found.</Command.Empty>

        <Command.Group heading="Go to">
          {NAV.map(item => (
            <Command.Item key={item.id} value={`go ${item.label}`} onSelect={() => openNav(item)}>
              <item.Icon size={16} color={C.navy} />
              <span style={{ flex: 1 }}>{item.label}</span>
              <IconArrowRight size={13} color={C.muted} />
            </Command.Item>
          ))}
        </Command.Group>

        {conversations.length > 0 && (
          <Command.Group heading="Recent matters">
            {conversations.map(conv => (
              <Command.Item
                key={conv.id}
                value={`matter ${conv.title} ${conv.tags.join(' ')}`}
                onSelect={() => openConversation(conv.id)}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: LAYOUT.radius.full, flexShrink: 0,
                  background: conv.status === 'Ready to File' ? C.green
                    : conv.status === 'Out of Scope' ? C.muted : C.saffron,
                }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.title === 'New conversation' ? 'Untitled matter' : conv.title}
                </span>
                <span style={{ fontFamily: MONO, fontSize: TYPE.label.size, color: C.muted }}>
                  {conv.tags[0] || conv.status}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
