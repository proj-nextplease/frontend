import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';
import {
  getPendingB2bRegistrations,
  approveB2bRegistration,
  rejectB2bRegistration,
} from '../api/b2bApi.js';
import {
  ShieldAlert,
  Check,
  X,
  Building,
  GraduationCap,
  ExternalLink,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export function AdminB2bReviewPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function handleLogout() {
    try {
      sessionStorage.removeItem('nextplease:admin-bypass');
      localStorage.removeItem('nextplease:admin-bypass');
      if (supabase) {
        await supabase.auth.signOut();
      }
      navigate('/nextplease-admin-portal/login');
    } catch (err) {
      console.error('Lỗi khi đăng xuất admin:', err);
      navigate('/nextplease-admin-portal/login');
    }
  }

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });

  async function loadPending() {
    try {
      setLoading(true);
      const data = await getPendingB2bRegistrations();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách phê duyệt.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchOnMount() {
      try {
        setLoading(true);
        const data = await getPendingB2bRegistrations();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải danh sách phê duyệt.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOnMount();
    return () => { cancelled = true; };
  }, []);

  async function handleApprove(companyId) {
    if (!window.confirm('Bạn có chắc chắn muốn PHÊ DUYỆT cho tổ chức đối tác này hoạt động không?')) {
      return;
    }

    setActionStatus({ type: 'loading', message: 'Đang gửi yêu cầu phê duyệt...' });
    try {
      await approveB2bRegistration(companyId);
      setActionStatus({ type: 'success', message: 'Đã phê duyệt tài khoản thành công!' });
      setTimeout(() => {
        setActionStatus({ type: 'idle', message: '' });
        loadPending();
      }, 1000);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Phê duyệt thất bại.' });
    }
  }

  async function handleRejectSubmit(event) {
    event.preventDefault();
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    setActionStatus({ type: 'loading', message: 'Đang gửi lý do từ chối...' });
    try {
      await rejectB2bRegistration(rejectingItem.id, rejectReason);
      setActionStatus({ type: 'success', message: 'Đã từ chối phê duyệt thành công.' });
      setTimeout(() => {
        setActionStatus({ type: 'idle', message: '' });
        setRejectingItem(null);
        setRejectReason('');
        loadPending();
      }, 1000);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Từ chối thất bại.' });
    }
  }

  if (loading) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--muted)',
        background: 'var(--bg)',
      }}>
        Đang tải danh sách chờ duyệt B2B...
      </div>
    );
  }

  return (
    <section className="dashboard-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Admin Quick Action Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px 20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '500' }}>
            Đang hoạt động với quyền <strong style={{ color: '#dc2626' }}>Administrator</strong>
          </span>
        </div>
        <button
          className="button secondary-button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderColor: '#dc2626',
            color: '#dc2626',
            padding: '8px 16px',
            fontSize: '0.85rem',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={15} />
          Đăng xuất Admin
        </button>
      </div>

      <div className="dashboard-hero admin-hero" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(37,99,235,0.03) 100%)', marginBottom: '32px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#dc2626' }}>Hệ thống Quản trị</p>
          <h1>Xét duyệt đối tác Doanh nghiệp & CLB</h1>
          <p>
            Đối chiếu Mã số thuế doanh nghiệp và Quyết định thành lập CLB.
            Mọi phê duyệt ở đây sẽ cấp quyền hoạt động tuyển dụng chính thức cho đối tác.
          </p>
        </div>
        <div className="admin-alert-card" style={{ border: '1px solid rgba(220,38,38,0.15)' }}>
          <ShieldAlert size={28} style={{ color: '#dc2626' }} />
          <h2>An ninh tuyển dụng là ưu tiên hàng đầu.</h2>
          <p>
            Vui lòng nhắn tin xác thực qua Fanpage đối với CLB sinh viên và kiểm tra MST đối với Doanh nghiệp trên trang của Tổng cục Thuế trước khi duyệt.
          </p>
        </div>
      </div>

      {actionStatus.message && (
        <div className={`register-status ${actionStatus.type}`} style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <p>{actionStatus.message}</p>
        </div>
      )}

      {error && (
        <div className="register-status error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="panel">
        <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={22} style={{ color: '#2563eb' }} />
            <h2>Hồ sơ chờ phê duyệt ({items.length})</h2>
          </div>
          <button className="button secondary-button" onClick={loadPending} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Làm mới danh sách
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <Check size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
            <h3>Đã xử lý sạch hàng chờ!</h3>
            <p>Không có doanh nghiệp hoặc CLB nào đang chờ phê duyệt.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
            {items.map((item) => {
              const isClub = item.companyType === 'CLUB';
              return (
                <article key={item.id} style={{
                  backgroundColor: 'var(--card-bg)',
                  border: isClub ? '1px solid rgba(255,122,26,0.2)' : '1px solid rgba(37,99,235,0.2)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.02)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                }}>
                  {/* Left Column: Org info */}
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      backgroundColor: isClub ? 'rgba(255,122,26,0.1)' : 'rgba(37,99,235,0.1)',
                      color: isClub ? '#ff7a1a' : '#2563eb',
                      marginBottom: '12px',
                    }}>
                      {isClub ? <GraduationCap size={14} /> : <Building size={14} />}
                      {isClub ? 'Câu lạc bộ' : item.companyType}
                    </span>

                    <h3 style={{ margin: '0 0 8px', fontSize: '1.35rem', fontWeight: '800' }}>{item.name}</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--muted)' }}>{item.description || 'Chưa cung cấp mô tả.'}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                      {item.taxCode && (
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Mã số thuế:</span>
                          <strong style={{ marginLeft: '8px' }}>{item.taxCode}</strong>
                        </div>
                      )}
                      {item.schoolName && (
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Trường học:</span>
                          <strong style={{ marginLeft: '8px' }}>{item.schoolName}</strong>
                        </div>
                      )}
                      {item.websiteUrl && (
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Website:</span>
                          <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {item.websiteUrl}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                      {item.fanpageUrl && (
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Facebook Fanpage:</span>
                          <a href={item.fanpageUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#ff7a1a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Truy cập Fanpage
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Rep Info & Verify Doc */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={16} />
                        Người đăng ký liên hệ:
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} style={{ color: 'var(--muted)' }} />
                          {item.ownerEmail}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--muted)' }} />
                          {item.representativeName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={14} style={{ color: 'var(--muted)' }} />
                          {item.representativePhone}
                        </span>
                      </div>

                      {/* File Verification */}
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={20} style={{ color: isClub ? '#ff7a1a' : '#2563eb' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Tài liệu xác thực</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>GPKD / Quyết định thành lập</span>
                          </div>
                        </div>
                        <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" className="button secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}>
                          Xem file
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button
                        className="button primary-button"
                        onClick={() => handleApprove(item.id)}
                        style={{
                          flex: 1,
                          backgroundColor: '#16a34a',
                          borderColor: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Check size={18} />
                        Phê duyệt
                      </button>
                      <button
                        className="button secondary-button"
                        onClick={() => setRejectingItem(item)}
                        style={{
                          flex: 1,
                          color: '#dc2626',
                          borderColor: 'rgba(220,38,38,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <X size={18} />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Modal overlay */}
      {rejectingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <form onSubmit={handleRejectSubmit} className="panel" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
              <AlertTriangle size={24} />
              Từ chối phê duyệt đối tác
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Nhập lý do chi tiết để gửi cho <strong>{rejectingItem.name}</strong>. Họ có thể xem lý do này và upload lại tài liệu xác thực phù hợp.
            </p>

            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Ảnh giấy phép kinh doanh bị mờ, không khớp mã số thuế doanh nghiệp đã điền..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--fg)',
                outline: 'none',
                resize: 'none',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="button secondary-button" onClick={() => setRejectingItem(null)}>
                Hủy bỏ
              </button>
              <button type="submit" className="button primary-button" style={{ backgroundColor: '#dc2626', borderColor: 'transparent' }}>
                Xác nhận từ chối
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}