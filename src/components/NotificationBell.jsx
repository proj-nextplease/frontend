import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi.js';

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return d.toLocaleDateString('vi-VN');
}

/**
 * In-app notification bell. Self-contained: polls every 30s, shows an unread
 * badge and a dropdown of recent notifications. accent defaults to candidate red.
 */
export function NotificationBell({ accent = '#e5533f', style, buttonStyle, onNavigate, onNotificationLoaded }) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  async function load() {
    try {
      const data = await getNotifications();
      const notifList = data.items || [];
      const unreadCount = data.unreadCount || 0;
      setItems(notifList);
      setUnread(unreadCount);
      if (typeof onNotificationLoaded === 'function') {
        onNotificationLoaded(notifList, unreadCount);
      }
    } catch {
      /* silent — bell must never break the page */
    }
  }

  useEffect(() => {
    // load() is async — state updates happen after the await, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 12000);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleOpenItem(n) {
    if (!n.isRead) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      markNotificationRead(n.id).catch(() => {});
    }
    if (n.link) {
      setOpen(false);
      if (typeof onNavigate === 'function' && n.link.startsWith('/')) {
        onNavigate(n.link);
      } else if (n.link.startsWith('/')) {
        window.location.href = n.link;
      } else {
        window.open(n.link, '_blank', 'noopener');
      }
    }
  }

  async function handleMarkAll() {
    setItems((cur) => cur.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    markAllNotificationsRead().catch(() => {});
  }

  const defaultContainerStyle = { position: 'fixed', top: '18px', right: '24px', zIndex: 4000 };
  const mergedContainerStyle = { ...defaultContainerStyle, ...style };

  const defaultButtonStyle = { position: 'relative', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(15,23,42,0.10)', color: 'var(--ink)' };
  const mergedButtonStyle = { ...defaultButtonStyle, ...buttonStyle };

  return (
    <div ref={rootRef} style={mergedContainerStyle}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Thông báo"
        style={mergedButtonStyle}>
        <Bell size={buttonStyle?.width ? 16 : 20} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '999px', background: accent, color: '#fff', fontSize: '0.66rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px var(--surface)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: buttonStyle?.height ? `${parseInt(buttonStyle.height) + 8}px` : '52px',
          right: 0,
          width: '380px',
          maxWidth: 'calc(100vw - 48px)',
          background: 'var(--surface, #0f172a)',
          border: '1px solid var(--line, rgba(255,255,255,0.12))',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(139, 92, 246, 0.15)',
          overflow: 'hidden',
          zIndex: 99999,
          color: 'var(--ink, #f8fafc)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--line, rgba(255,255,255,0.08))' }}>
            <strong style={{ fontSize: '0.95rem', color: 'var(--ink, #f8fafc)' }}>Thông báo</strong>
            {unread > 0 && (
              <button type="button" onClick={handleMarkAll}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                <CheckCheck size={14} /> Đọc tất cả
              </button>
            )}
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted, #94a3b8)' }}>
                <Inbox size={26} style={{ marginBottom: '8px', opacity: 0.6 }} />
                <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '600' }}>Chưa có thông báo nào</p>
              </div>
            ) : (
              items.map((n) => {
                const isOffer = n.title?.includes('Lời mời') || n.title?.includes('tuyển dụng') || n.type === 'COMPANY_INVITATION';
                return (
                  <button key={n.id} type="button" onClick={() => handleOpenItem(n)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none',
                      borderBottom: '1px solid var(--line, rgba(255,255,255,0.06))',
                      background: !n.isRead ? (isOffer ? 'rgba(139, 92, 246, 0.14)' : 'rgba(229,83,63,0.08)') : 'transparent',
                      cursor: n.link ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      {!n.isRead && (
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: isOffer ? '#a855f7' : accent,
                          flexShrink: 0, marginTop: '5px'
                        }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <strong style={{ fontSize: '0.86rem', color: isOffer ? '#c084fc' : 'var(--ink, #f8fafc)' }}>{n.title}</strong>
                          {isOffer && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(139,92,246,0.22)', color: '#c084fc' }}>
                              Lời mời
                            </span>
                          )}
                        </div>
                        {n.body && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #94a3b8)', lineHeight: 1.5 }}>{n.body}</p>}
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)', fontWeight: '600', display: 'inline-block', marginTop: '4px' }}>{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
