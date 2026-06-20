import { useState, useEffect } from 'react';
import { getAdminJobs, approveJob, rejectJob } from '../api/adminApi.js';

const POST_TYPE_LABEL = { JOB: 'Tin tuyển dụng', QUEST: 'Quest CLB' };
const STATUS_CFG = {
  PENDING:  { text: 'Chờ duyệt',   color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
  OPEN:     { text: 'Đang mở',     color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
  CLOSED:   { text: 'Đã đóng',     color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  REJECTED: { text: 'Đã từ chối',  color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
};

function StatusChip({ status }) {
  const cfg = STATUS_CFG[status] || { text: status, color: '#6b7280', bg: 'rgba(107,114,128,0.08)' };
  return (
    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
      {cfg.text}
    </span>
  );
}

export function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Approve
  const [approving, setApproving] = useState(null); // id
  const [approveError, setApproveError] = useState('');

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null); // { id, title }
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState('');

  // Detail view
  const [detail, setDetail] = useState(null); // post object

  async function fetchPosts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminJobs();
      setPosts(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách tin đăng.');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPosts(); }, []);

  async function handleApprove(post) {
    setApproving(post.id);
    setApproveError('');
    try {
      await approveJob(post.id);
      fetchPosts();
    } catch (err) {
      setApproveError(err.message || 'Duyệt thất bại.');
    } finally {
      setApproving(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    setRejecting(true);
    setRejectError('');
    try {
      await rejectJob(rejectTarget.id, rejectReason.trim() || 'Không đáp ứng tiêu chí đăng tin.');
      setRejectTarget(null);
      setRejectReason('');
      fetchPosts();
    } catch (err) {
      setRejectError(err.message || 'Từ chối thất bại.');
    } finally {
      setRejecting(false);
    }
  }

  const filtered = posts.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchType   = typeFilter === 'ALL'   || p.postType === typeFilter;
    return matchStatus && matchType;
  });

  const pendingCount = posts.filter((p) => p.status === 'PENDING').length;

  const FIELD_STYLE = { padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', width: '100%', boxSizing: 'border-box', fontSize: '0.9rem' };

  return (
    <section className="dashboard-page">

      {/* Reject modal */}
      {rejectTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '460px', background: 'var(--card-bg-strong, #fff)', borderRadius: '20px', padding: '28px', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--ink)', fontWeight: '800' }}>Từ chối tin đăng</h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: 'var(--muted)' }}>
              Tin: <strong style={{ color: 'var(--ink)' }}>{rejectTarget.title}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--muted)' }}>Lý do từ chối (để trống sẽ dùng lý do mặc định)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="VD: Nội dung vi phạm tiêu chí đăng tin, thiếu thông tin cần thiết..."
                style={{ ...FIELD_STYLE, resize: 'vertical' }}
              />
            </div>
            {rejectError && <p style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 12px' }}>{rejectError}</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleRejectSubmit} disabled={rejecting}
                style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                {rejecting ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
              <button onClick={() => { setRejectTarget(null); setRejectReason(''); setRejectError(''); }} disabled={rejecting}
                style={{ flex: 1, padding: '10px', background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 2500, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '420px', maxWidth: '100vw', height: '100%', background: 'var(--card-bg-strong, #fff)', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', overflowY: 'auto', padding: '32px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {POST_TYPE_LABEL[detail.postType] || detail.postType}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', color: 'var(--ink)', fontWeight: '800' }}>{detail.title}</h3>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Row label="Tổ chức" value={detail.companyName} />
              <Row label="Trạng thái" value={<StatusChip status={detail.status} />} />
              <Row label="Loại hình" value={detail.jobType} />
              <Row label="Ngày tạo" value={detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '—'} />
            </div>

            {detail.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
                <button
                  onClick={() => { handleApprove(detail); setDetail(null); }}
                  style={{ flex: 1, padding: '11px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Duyệt
                </button>
                <button
                  onClick={() => { setDetail(null); setRejectTarget({ id: detail.id, title: detail.title }); setRejectReason(''); }}
                  style={{ flex: 1, padding: '11px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Từ chối
                </button>
              </div>
            )}
          </div>
          <div onClick={() => setDetail(null)} style={{ flex: 1 }} />
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: '800', color: 'var(--ink)' }}>Duyệt tin đăng</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Xem xét và duyệt / từ chối tin tuyển dụng và Quest trước khi hiển thị.
          {pendingCount > 0 && <strong style={{ color: '#d97706', marginLeft: '8px' }}>{pendingCount} tin đang chờ duyệt.</strong>}
        </p>
      </div>

      {approveError && (
        <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', color: '#dc2626', fontSize: '0.88rem', fontWeight: '600', marginBottom: '16px' }}>
          {approveError}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'OPEN', 'CLOSED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '7px 16px', borderRadius: '10px', border: `1.5px solid ${statusFilter === s ? '#2563eb' : 'var(--line)'}`, background: statusFilter === s ? 'rgba(37,99,235,0.08)' : 'var(--card-bg-strong)', color: statusFilter === s ? '#2563eb' : 'var(--ink)', fontWeight: statusFilter === s ? '700' : '500', fontSize: '0.84rem', cursor: 'pointer' }}>
            {s === 'ALL' ? 'Tất cả' : STATUS_CFG[s]?.text || s}
            {s === 'PENDING' && pendingCount > 0 && <span style={{ marginLeft: '6px', background: '#d97706', color: '#fff', borderRadius: '8px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '800' }}>{pendingCount}</span>}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '7px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.84rem', cursor: 'pointer' }}>
            <option value="ALL">Tất cả loại</option>
            <option value="JOB">Tin tuyển dụng</option>
            <option value="QUEST">Quest CLB</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading && <p style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải...</p>}
      {error && <p style={{ color: '#dc2626', fontWeight: '600' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontWeight: '600', fontSize: '0.92rem' }}>
          Không có tin nào {statusFilter !== 'ALL' ? `trạng thái "${STATUS_CFG[statusFilter]?.text || statusFilter}"` : ''}.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((post) => (
            <div key={post.id}
              style={{ background: 'var(--card-bg-strong)', border: '1px solid var(--line)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Type badge */}
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: post.postType === 'QUEST' ? '#ff7a1a' : '#2563eb', background: post.postType === 'QUEST' ? 'rgba(255,122,26,0.08)' : 'rgba(37,99,235,0.08)', padding: '3px 10px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {POST_TYPE_LABEL[post.postType]}
              </span>

              {/* Title + org */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: '700', color: 'var(--ink)', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{post.companyName} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}</p>
              </div>

              <StatusChip status={post.status} />

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => setDetail(post)}
                  style={{ padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                  Xem chi tiết
                </button>
                {post.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(post)} disabled={approving === post.id}
                      style={{ padding: '6px 14px', borderRadius: '10px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                      {approving === post.id ? 'Đang duyệt...' : 'Duyệt'}
                    </button>
                    <button onClick={() => { setRejectTarget({ id: post.id, title: post.title }); setRejectReason(''); setRejectError(''); }}
                      style={{ padding: '6px 14px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: '0.83rem', color: 'var(--muted)', fontWeight: '600' }}>{label}</span>
      <span style={{ fontSize: '0.88rem', color: 'var(--ink)', fontWeight: '700', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
