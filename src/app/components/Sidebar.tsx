import React, { useState } from 'react';
import {
  IconBack, IconFilePen, IconFiles, IconGrid, IconChat,
  IconScanSearch,
  IconSettings,
} from '../ui/icons';
import { useNavigate, useLocation } from 'react-router';
import { BrandLogo, C, LAYOUT, LogoMark, SANS, SHADOW, TYPE } from './shared';
import { useSidebar } from '../context/SidebarContext';
import { useConversations } from '../context/ConversationContext';

const EXPANDED_W = parseInt(LAYOUT.sidebarOpen, 10);
const COLLAPSED_W = parseInt(LAYOUT.sidebarShut, 10);

const NAV_ITEMS = [
  { path: '/desktop/dashboard',           label: 'Dashboard',          Icon: IconGrid,    exact: true },
  { path: '/desktop/chat',                label: 'Consumer Guide',     Icon: IconChat, prefix: true, createsChat: true },
  { path: '/desktop/documents',           label: 'Case Files',         Icon: IconFiles },
  { path: '/desktop/document-draft',      label: 'Demand Notice',      Icon: IconFilePen },
  { path: '/desktop/notice-interpreter',  label: 'Sample Notice',      Icon: IconScanSearch },
];

type NavItem = (typeof NAV_ITEMS)[number];

const D = {
  text: '#FFFFFF',
  text2: 'rgba(255,255,255,0.72)',
  text3: 'rgba(255,255,255,0.44)',
  line: 'rgba(255,255,255,0.10)',
  hover: 'rgba(255,255,255,0.075)',
  active: 'rgba(255,255,255,0.13)',
};

/**
 * Sidebar surface — flat.
 *
 * Was a navy poster: two radial washes (cool blue top, saffron bottom — the
 * tricolour again) over a 3-stop navy gradient, plus an SVG turbulence
 * noise layer. Chrome was louder than the conversation, which for a legal
 * product should be quieter than ChatGPT's, not louder. .design-os/
 * 03-direction.md already rejects decorative gradients and repeated colour
 * stripes; the code was ignoring its own contract.
 *
 * Now one flat navy field. The rail recedes; the matter is the content.
 */
function SidebarAura() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: C.navyDark,
    }} />
  );
}

function shortTitle(title: string) {
  if (title === 'New conversation') return 'Untitled matter';
  return title.replace(' — ', ': ');
}

export function Sidebar() {
  const { collapsed, toggle, openSettings } = useSidebar();
  const { conversations, activeId, setActiveId, createConversation } = useConversations();
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const expanded = !collapsed || previewOpen;

  const isActive = (item: NavItem) => {
    if ('exact' in item && item.exact) return pathname === item.path;
    if ('prefix' in item && item.prefix) return pathname === item.path || pathname.startsWith(item.path + '/');
    return pathname === item.path;
  };

  const handleNavClick = (item: NavItem) => {
    if ('createsChat' in item && item.createsChat) {
      const conv = createConversation();
      setActiveId(conv.id);
      navigate(`/desktop/chat/${conv.id}`);
      return;
    }
    navigate(item.path);
  };

  return (
    <aside
      onMouseEnter={() => collapsed && setPreviewOpen(true)}
      onMouseLeave={() => setPreviewOpen(false)}
      onClick={() => collapsed && toggle()}
      style={{
      width: expanded ? EXPANDED_W : COLLAPSED_W,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      fontFamily: SANS,
      transition: 'width 0.22s cubic-bezier(0.22,1,0.36,1)',
      overflow: 'visible',
      cursor: collapsed && !previewOpen ? 'pointer' : 'default',
    }}>
      <style>{`
        .lokai-sidebar-scroll::-webkit-scrollbar{width:3px}
        .lokai-sidebar-scroll::-webkit-scrollbar-track{background:transparent}
        .lokai-sidebar-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:999px}
      `}</style>
      <div style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        boxShadow: SHADOW.insetEdge,
      }}>
        <SidebarAura />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{
            minHeight: expanded ? 118 : 82,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            padding: expanded ? '0 24px' : '0',
            borderBottom: `1px solid ${D.line}`,
            position: 'relative',
          }}>
            {expanded ? <BrandLogo size={38} light /> : <LogoMark size={34} light />}
            {expanded && (
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); if (!collapsed) toggle(); }}
                title="Collapse sidebar"
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 42,
                  width: 30,
                  height: 30,
                  borderRadius: LAYOUT.radius.control,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.055)',
                  color: D.text2,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background .14s ease, color .14s ease',
                }}
              >
                <IconBack size={16} />
              </button>
            )}
          </div>

          <nav style={{ padding: expanded ? '16px 12px 8px' : '14px 8px 8px', flexShrink: 0 }}>
            {NAV_ITEMS.map(item => {
              const active = isActive(item);
              const hovered = hoveredNav === item.path;
              const { Icon } = item;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  onMouseEnter={() => setHoveredNav(item.path)}
                  onMouseLeave={() => setHoveredNav(null)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    minHeight: expanded ? 46 : 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: expanded ? 'flex-start' : 'center',
                    gap: 12,
                    padding: expanded ? '0 14px' : '0',
                    marginBottom: 5,
                    border: '1px solid transparent',
                    borderRadius: expanded ? 16 : 14,
                    background: active
                      ? 'linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))'
                      : hovered ? D.hover : 'transparent',
                    color: active ? D.text : D.text2,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.09)' : 'none',
                    position: 'relative',
                    transition: 'background 0.14s ease, color 0.14s ease, transform 0.12s ease',
                  }}
                >
                  {active && expanded && (
                    <span style={{
                      position: 'absolute',
                      left: -1,
                      top: 10,
                      bottom: 10,
                      width: 3,
                      borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.pill} ${LAYOUT.radius.pill} ${LAYOUT.radius.none}`,
                      background: C.saffron,
                    }} />
                  )}
                  <Icon size={expanded ? 18 : 19} />
                  {expanded && (
                    <span style={{ fontSize: TYPE.body.size, fontWeight: active ? 650 : 500, letterSpacing: '-0.01em' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {expanded && (
            <div style={{ flex: 1, overflow: 'hidden', paddingTop: 14 }}>
              <div style={{
                padding: '0 24px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  color: D.text3,
                  fontSize: TYPE.label.size,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}>
                  Recent matters
                </span>
                <span style={{ width: 44, height: 1, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              <div className="lokai-sidebar-scroll" style={{ height: '100%', overflowY: 'auto', padding: '0 12px 18px' }}>
                {/* Cap the recent list so the rail stays calm — full history lives in the dashboard */}
                {conversations.slice(0, 5).map(conv => {
                  const chatPath = `/desktop/chat/${conv.id}`;
                  const chatActive = pathname === chatPath;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => { setActiveId(conv.id); navigate(chatPath); }}
                      onMouseEnter={() => setHoveredChat(conv.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                      style={{
                        width: '100%',
                        border: '1px solid transparent',
                        borderRadius: LAYOUT.radius.panel,
                        background: chatActive
                          ? 'rgba(255,255,255,0.12)'
                          : hoveredChat === conv.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                        color: chatActive ? D.text : D.text2,
                        cursor: 'pointer',
                        padding: '11px 12px',
                        marginBottom: 6,
                        textAlign: 'left',
                        borderLeft: chatActive ? `3px solid ${C.saffron}` : '3px solid transparent',
                        boxShadow: chatActive ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{
                          fontSize: TYPE.small.size,
                          fontWeight: chatActive ? 650 : 560,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {shortTitle(conv.title)}
                        </span>
                        <span style={{
                          flexShrink: 0,
                          width: 7,
                          height: 7,
                          borderRadius: LAYOUT.radius.full,
                          background: conv.status === 'Ready to File' ? C.green : conv.status === 'Out of Scope' ? C.muted : C.saffron,
                          opacity: chatActive ? 1 : 0.65,
                        }} />
                      </div>
                      <div style={{
                        marginTop: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 0,
                      }}>
                        <span style={{
                          fontSize: TYPE.micro.size,
                          color: D.text3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {conv.tags.slice(0, 2).join(' · ') || conv.status}
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: LAYOUT.radius.full, background: D.text3, flexShrink: 0 }} />
                        <span style={{ fontSize: TYPE.micro.size, color: D.text3, flexShrink: 0 }}>
                          {conv.since.split(' · ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{
            borderTop: `1px solid ${D.line}`,
            padding: expanded ? '16px 18px 18px' : '14px 0 18px',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: expanded ? 'flex-start' : 'center',
              gap: 11,
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); openSettings(); }}
                title="Profile settings"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: LAYOUT.radius.full,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: SHADOW.xs,
                }}
              >
                <span style={{ fontSize: TYPE.body.size, fontWeight: 700 }}>P</span>
              </button>
              {expanded && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: D.text, fontSize: TYPE.small.size, fontWeight: 650 }}>Priya Sharma</div>
                    <div style={{ color: D.text3, fontSize: TYPE.micro.size, marginTop: 3 }}>Mumbai · India</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openSettings(); }}
                    title="Settings"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: LAYOUT.radius.control,
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(255,255,255,0.06)',
                      color: D.text2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSettings size={15} />
                  </button>
                </>
              )}
            </div>
            {expanded && (
              <p style={{ color: D.text3, fontSize: TYPE.micro.size, lineHeight: 1.55, margin: '12px 0 0' }}>
                Legal information, not legal advice.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
