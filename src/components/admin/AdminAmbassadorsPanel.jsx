import { Fragment, useEffect, useState } from 'react';
import { AlertTriangle, Award, CheckCircle, Search, UserMinus, UserPlus } from 'lucide-react';
import { getAmbassadors, grantAmbassador, revokeAmbassador } from '../../api/adminApi.js';

/**
 * Tab "Đại sứ thương hiệu" trong trang quản trị.
 *
 * Đại sứ là ứng viên được dùng fonlio miễn phí: backend trả 0 NP cho mọi khoản
 * phí của họ (nhận việc có lương, cập nhật website, …). Cấp hay gỡ đều gửi
 * email báo cho người đó. Gỡ quyền không động tới số dư NP của họ.
 *
 * Dùng chung các lớp CSS của trang quản trị (adm-card, admin-table…), nên
 * component này chỉ hiển thị đúng khi nằm trong AdminB2bReviewPage.
 */
export function AdminAmbassadorsPanel() {
  const [data, setData] = useState({ active: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [granting, setGranting] = useState(false);

  const [query, setQuery] = useState('');
  const [revoking, setRevoking] = useState(null); // userId đang mở hộp xác nhận
  const [revokeReason, setRevokeReason] = useState('');
  const [busyRevoke, setBusyRevoke] = useState(false);

  /** Tải lại sau khi cấp / gỡ. Lần tải đầu nằm trong useEffect bên dưới. */
  async function load() {
    try {
      const next = await getAmbassadors();
      setData(next);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đại sứ.');
    } finally {
      setLoading(false);
    }
  }

  /* Chỉ đặt state trong .then: đặt state đồng bộ ngay trong effect bị
     react-hooks/set-state-in-effect chặn (CI fail). */
  useEffect(() => {
    let alive = true;
    getAmbassadors()
      .then((next) => { if (alive) setData(next); })
      .catch((err) => { if (alive) setError(err.message || 'Không thể tải danh sách đại sứ.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function onGrant(e) {
    e.preventDefault();
    if (!email.trim() || granting) return;
    setGranting(true);
    setError('');
    setNotice('');
    try {
      const res = await grantAmbassador(email.trim(), note.trim());
      setNotice(`Đã cấp quyền đại sứ cho ${res.email}. Email thông báo đã được gửi tới họ.`);
      setEmail('');
      setNote('');
      await load();
    } catch (err) {
      setError(err.message || 'Cấp quyền đại sứ thất bại.');
    } finally {
      setGranting(false);
    }
  }

  async function onRevoke(row) {
    if (busyRevoke) return;
    setBusyRevoke(true);
    setError('');
    setNotice('');
    try {
      await revokeAmbassador(row.userId, revokeReason.trim());
      setNotice(`Đã gỡ quyền đại sứ của ${row.email}. Email thông báo đã được gửi tới họ.`);
      setRevoking(null);
      setRevokeReason('');
      await load();
    } catch (err) {
      setError(err.message || 'Gỡ quyền đại sứ thất bại.');
    } finally {
      setBusyRevoke(false);
    }
  }

  const q = query.trim().toLowerCase();
  const active = q
    ? data.active.filter((r) =>
        [r.email, r.displayName, r.note].some((v) => (v || '').toLowerCase().includes(q)))
    : data.active;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div className="b2b-loader" style={{ borderTopColor: '#2563eb' }} />
      </div>
    );
  }

  return (
    <div className="amb-wrap">
      <style>{AMB_CSS}</style>

      {error && (
        <div className="amb-alert amb-alert--error" role="alert">
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {notice && (
        <div className="amb-alert amb-alert--ok" role="status">
          <CheckCircle size={18} /> {notice}
        </div>
      )}

      <form className="adm-card amb-grant" onSubmit={onGrant}>
        <div className="amb-head">
          <Award size={20} />
          <div>
            <h2>Cấp quyền đại sứ thương hiệu</h2>
            <p>
              Đại sứ dùng fonlio hoàn toàn miễn phí: mọi khoản phí NP (nhận việc có lương, cập nhật
              website portfolio…) đều bằng 0. Người được cấp sẽ nhận email thông báo.
            </p>
          </div>
        </div>
        <div className="amb-fields">
          <label className="amb-field">
            <span>Email tài khoản ứng viên</span>
            <input
              className="amb-input"
              type="email"
              placeholder="vidu@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="amb-field">
            <span>Ghi chú (không bắt buộc)</span>
            <input
              className="amb-input"
              placeholder="Ví dụ: Đại sứ FPTU – học kỳ Fall 2026"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button type="submit" className="amb-btn amb-btn--primary" disabled={granting || !email.trim()}>
            <UserPlus size={16} /> {granting ? 'Đang cấp…' : 'Cấp quyền'}
          </button>
        </div>
      </form>

      <div className="adm-card amb-list">
        <div className="amb-list-head">
          <h2>
            Đại sứ đang hoạt động <span className="admin-tab-count">{data.active.length}</span>
          </h2>
          <div className="admin-search-wrap amb-search">
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm theo email, tên, ghi chú…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {active.length === 0 ? (
          <p className="amb-empty">
            {data.active.length === 0 ? 'Chưa có đại sứ thương hiệu nào.' : 'Không có đại sứ khớp tìm kiếm.'}
          </p>
        ) : (
          <div className="amb-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ứng viên</th>
                  <th>Ghi chú</th>
                  <th>Cấp từ</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {active.map((r) => (
                  <Fragment key={r.userId}>
                  <tr>
                    <td>
                      <div className="amb-name">{r.displayName || r.email}</div>
                      <div className="amb-sub">{r.email}</div>
                    </td>
                    <td className="amb-note">{r.note || '—'}</td>
                    <td>
                      <div>{formatDate(r.grantedAt)}</div>
                      {r.grantedByEmail && <div className="amb-sub">bởi {r.grantedByEmail}</div>}
                    </td>
                    <td className="amb-actions">
                      <button
                        type="button"
                        className="amb-btn amb-btn--ghost-danger"
                        disabled={revoking === r.userId}
                        onClick={() => {
                          setRevoking(r.userId);
                          setRevokeReason('');
                        }}
                      >
                        <UserMinus size={16} /> Gỡ quyền
                      </button>
                    </td>
                  </tr>
                  {/* Xác nhận gỡ nằm ở dòng riêng, rộng hết bảng: nhét vào ô
                      thao tác thì ô nhập lý do bị ép hẹp và bảng tràn ngang. */}
                  {revoking === r.userId && (
                    <tr className="amb-confirm-row">
                      <td colSpan={4}>
                        <div className="amb-confirm">
                          <span className="amb-confirm-text">
                            Gỡ quyền đại sứ của <strong>{r.email}</strong>? Họ sẽ nhận email thông báo, số dư NP giữ nguyên.
                          </span>
                          <input
                            className="amb-input"
                            placeholder="Lý do gỡ (gửi kèm trong email, không bắt buộc)"
                            maxLength={500}
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="amb-btn amb-btn--danger"
                            disabled={busyRevoke}
                            onClick={() => onRevoke(r)}
                          >
                            {busyRevoke ? 'Đang gỡ…' : 'Xác nhận gỡ'}
                          </button>
                          <button
                            type="button"
                            className="amb-btn"
                            disabled={busyRevoke}
                            onClick={() => {
                              setRevoking(null);
                              setRevokeReason('');
                            }}
                          >
                            Huỷ
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.history.length > 0 && (
        <div className="adm-card amb-list">
          <div className="amb-list-head">
            <h2>Lịch sử gỡ quyền</h2>
          </div>
          <div className="amb-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ứng viên</th>
                  <th>Nhiệm kỳ</th>
                  <th>Lý do gỡ</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((r) => (
                  <tr key={`${r.userId}-${r.revokedAt}`}>
                    <td>
                      <div className="amb-name">{r.displayName || r.email}</div>
                      <div className="amb-sub">{r.email}</div>
                    </td>
                    <td>
                      {formatDate(r.grantedAt)} → {formatDate(r.revokedAt)}
                      {r.revokedByEmail && <div className="amb-sub">gỡ bởi {r.revokedByEmail}</div>}
                    </td>
                    <td className="amb-note">{r.revokeReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const AMB_CSS = `
.amb-wrap { display: flex; flex-direction: column; gap: 20px; }
.amb-alert { display: flex; gap: 10px; align-items: center; padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 0.88rem; }
.amb-alert--error { background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.25); color: #dc2626; }
.amb-alert--ok { background: rgba(22,163,74,0.07); border: 1px solid rgba(22,163,74,0.28); color: #15803d; }
.amb-grant { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.amb-head { display: flex; gap: 12px; align-items: flex-start; color: var(--ink); }
.amb-head h2 { margin: 0; font-size: 16px; font-weight: 700; }
.amb-head p { margin: 4px 0 0; font-size: 13px; color: var(--muted); line-height: 1.5; max-width: 640px; }
.amb-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto; gap: 12px; align-items: end; }
.amb-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; color: var(--muted); }
.amb-input { width: 100%; height: 40px; box-sizing: border-box; padding: 0 14px !important; border: 1px solid var(--line) !important; border-radius: 10px !important; background: transparent; color: var(--ink); font-size: 14px; }
.amb-input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
.amb-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line); background: transparent; color: var(--ink); font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; }
.amb-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.amb-btn--primary { background: #2563eb; border-color: #2563eb; color: #fff; }
.amb-btn--danger { background: #dc2626; border-color: #dc2626; color: #fff; }
.amb-btn--ghost-danger { color: #dc2626; border-color: rgba(220,38,38,0.35); }
.amb-list { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.amb-list-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.amb-list-head h2 { margin: 0; font-size: 16px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.amb-search { flex: 0 1 320px; }
.amb-empty { text-align: center; padding: 28px; color: var(--muted); margin: 0; }
.amb-table-scroll { overflow-x: auto; }
.amb-name { font-weight: 600; color: var(--ink); }
.amb-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.amb-note { max-width: 280px; color: var(--muted); }
.amb-actions { text-align: right; }
.amb-confirm-row td { background: rgba(220,38,38,0.04); }
.amb-confirm { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px 10px; align-items: center; }
.amb-confirm-text { grid-column: 1 / -1; font-size: 13px; color: var(--ink); }
@media (max-width: 760px) {
  .amb-fields { grid-template-columns: 1fr; }
  .amb-confirm { grid-template-columns: 1fr 1fr; }
  .amb-confirm .amb-input { grid-column: 1 / -1; }
}
`;
