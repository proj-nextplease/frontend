import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, X, Building2 } from 'lucide-react';
import { getMyApplications } from '../api/applicationApi.js';
import { getMyPendingInvitations } from '../api/b2bApi.js';
import { getStoredToken } from '../lib/authStorage.js';
import { supabase } from '../services/supabaseClient.js';

export function GlobalCandidateOfferPush() {
  const navigate = useNavigate();
  const location = useLocation();

  const [offers, setOffers] = useState([]);
  const [orgInvites, setOrgInvites] = useState([]);
  const [dismissedOfferIds, setDismissedOfferIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem('fonlio_dismissed_push_offers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const notifiedRef = useRef(new Set());

  // Function to poll for pending offers and invites
  async function checkOffersAndInvites() {
    const token = getStoredToken();
    let hasSession = Boolean(token);

    if (!hasSession && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        hasSession = Boolean(session);
      } catch {
        // silent
      }
    }

    if (!hasSession) {
      setOffers([]);
      setOrgInvites([]);
      return;
    }

    try {
      // 1. Check job offers
      const apps = await getMyApplications();
      const pendingOffers = (apps || []).filter((a) => a.status === 'OFFERED');
      setOffers(pendingOffers);

      // 2. Check organization invitations
      const invites = await getMyPendingInvitations();
      setOrgInvites(invites || []);

      // 3. Trigger Browser Web Notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          pendingOffers.forEach((o) => {
            const offerKey = `job_${o.id}`;
            if (!notifiedRef.current.has(offerKey)) {
              notifiedRef.current.add(offerKey);
              try {
                const notif = new Notification('🎉 [Fonlio] Bạn có lời mời nhận việc mới!', {
                  body: `${o.companyName || 'Doanh nghiệp'} gửi lời mời cho vị trí "${o.jobTitle || 'Công việc'}". Bấm để xem chi tiết!`,
                  icon: '/favicon.ico',
                });
                notif.onclick = () => {
                  window.focus();
                  navigate('/candidates/dashboard/applications');
                };
              } catch (err) {
                console.warn('Desktop notification error:', err);
              }
            }
          });

          (invites || []).forEach((inv) => {
            const invKey = `inv_${inv.id}`;
            if (!notifiedRef.current.has(invKey)) {
              notifiedRef.current.add(invKey);
              try {
                const notif = new Notification('✨ [Fonlio] Lời mời tham gia tổ chức!', {
                  body: `${inv.companyName || 'Tổ chức'} mời bạn gia nhập với vai trò ${inv.role || 'thành viên'}.`,
                  icon: '/favicon.ico',
                });
                notif.onclick = () => {
                  window.focus();
                  navigate('/candidates/dashboard/overview');
                };
              } catch (err) {
                console.warn('Desktop notification error:', err);
              }
            }
          });
        }
      }
    } catch {
      // Silent error handling for background polling
    }
  }

  useEffect(() => {
    // Initial check
    const initialTimer = setTimeout(() => {
      checkOffersAndInvites();
    }, 0);

    // Request desktop notification permission gently
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }

    // Poll every 15 seconds
    const interval = setInterval(checkOffersAndInvites, 15000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [location.pathname]);

  const activeOffers = offers.filter((o) => !dismissedOfferIds.includes(`job_${o.id}`));
  const activeInvites = orgInvites.filter((inv) => !dismissedOfferIds.includes(`inv_${inv.id}`));

  if (activeOffers.length === 0 && activeInvites.length === 0) {
    return null;
  }

  // Pick top actionable item
  const topOffer = activeOffers[0];
  const topInvite = activeInvites[0];

  const handleDismiss = (idKey) => {
    const updated = [...dismissedOfferIds, idKey];
    setDismissedOfferIds(updated);
    try {
      sessionStorage.setItem('fonlio_dismissed_push_offers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleNavigateToOffers = () => {
    navigate('/candidates/dashboard/applications');
  };

  const handleNavigateToInvites = () => {
    navigate('/candidates/dashboard/overview');
  };

  return (
    <>
      {topOffer && (
        <div className="np-screen-push" style={{ zIndex: 99999 }}>
          <div className="np-screen-push-header">
            <span className="np-screen-push-badge">
              <Sparkles size={13} />
              Lời mời nhận việc
            </span>
            <button
              type="button"
              onClick={() => handleDismiss(`job_${topOffer.id}`)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'rgba(233, 247, 242, 0.6)',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '6px',
              }}
              title="Đóng thông báo"
            >
              <X size={15} />
            </button>
          </div>
          <h4 className="np-screen-push-title">
            🎉 Chúc mừng! Bạn nhận được lời mời từ {topOffer.companyName || 'Doanh nghiệp'}
          </h4>
          <p className="np-screen-push-body">
            Vị trí: <strong style={{ color: '#ffffff' }}>{topOffer.jobTitle}</strong>
            {topOffer.compensation && Number(topOffer.compensation) > 0 ? (
              <>
                {' '}· Thù lao: <strong style={{ color: '#34d399' }}>{Number(topOffer.compensation).toLocaleString('vi-VN')} đ</strong> (Phí nhận việc: 19.000 Điểm khi đồng ý).
              </>
            ) : (
              <>
                {' '}· Vị trí phi lợi nhuận · <strong style={{ color: '#34d399' }}>Miễn phí 0 Điểm</strong> khi xác nhận.
              </>
            )}
          </p>
          <div className="np-screen-push-actions">
            <button
              type="button"
              className="np-screen-push-cta"
              onClick={handleNavigateToOffers}
            >
              Xem & Phản hồi ngay <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="np-screen-push-dismiss"
              onClick={() => handleDismiss(`job_${topOffer.id}`)}
            >
              Để sau
            </button>
          </div>
        </div>
      )}

      {!topOffer && topInvite && (
        <div className="np-screen-push" style={{ zIndex: 99999 }}>
          <div className="np-screen-push-header">
            <span className="np-screen-push-badge" style={{ borderColor: 'rgba(99, 102, 241, 0.45)', color: '#818cf8' }}>
              <Building2 size={13} />
              Lời mời tham gia tổ chức
            </span>
            <button
              type="button"
              onClick={() => handleDismiss(`inv_${topInvite.id}`)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'rgba(233, 247, 242, 0.6)',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '6px',
              }}
              title="Đóng thông báo"
            >
              <X size={15} />
            </button>
          </div>
          <h4 className="np-screen-push-title">
            ✨ Bạn được mời gia nhập {topInvite.companyName || 'Tổ chức / CLB'}
          </h4>
          <p className="np-screen-push-body">
            Vai trò: <strong style={{ color: '#ffffff' }}>{topInvite.role || 'Thành viên'}</strong>. Hãy vào Bảng điều khiển để xác nhận tư cách thành viên.
          </p>
          <div className="np-screen-push-actions">
            <button
              type="button"
              className="np-screen-push-cta"
              onClick={handleNavigateToInvites}
            >
              Xem & Phản hồi ngay <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="np-screen-push-dismiss"
              onClick={() => handleDismiss(`inv_${topInvite.id}`)}
            >
              Để sau
            </button>
          </div>
        </div>
      )}
    </>
  );
}
