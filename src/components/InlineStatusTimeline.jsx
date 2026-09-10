import { useState } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';

/**
 * Compact, collapsible application-status timeline shown inline on a tracking card.
 * Collapsed → just the latest status (with a chevron); expanded → the full path
 * newest-first, each row with its timestamp.
 *
 * Prefers the real per-transition history (from application_status_history) when
 * provided, so every step shows its exact time. Falls back to synthesizing two
 * submission rows (applied_at) + the current status (updated_at) when a row has
 * no history yet.
 */

const LABEL_JOB = {
  SUBMITTED: 'Đã nộp đơn',
  VIEWED: 'Nhà tuyển dụng đã xem hồ sơ',
  SHORTLISTED: 'Hồ sơ vào danh sách tiềm năng',
  ACCEPTED: 'Nhà tuyển dụng đã chấp thuận',
  COMPLETED: 'Công việc đã hoàn thành',
  REJECTED: 'Hồ sơ chưa được chọn lần này',
  WITHDRAWN: 'Bạn đã rút đơn',
};

const LABEL_QUEST = {
  SUBMITTED: 'Đã đăng ký tham gia',
  ACCEPTED: 'Đã được nhận tham gia Quest',
  COMPLETED: 'Quest đã hoàn thành',
  REJECTED: 'Đơn chưa được chọn lần này',
  WITHDRAWN: 'Bạn đã rút đơn',
};

function fmt(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function parseHistory(history) {
  if (!history) return [];
  let arr = history;
  if (typeof history === 'string') {
    try { arr = JSON.parse(history); } catch { return []; }
  }
  return Array.isArray(arr) ? arr.filter((e) => e && e.status && e.at) : [];
}

function buildRows({ history, status, appliedAt, updatedAt, isQuest }) {
  const labels = isQuest ? LABEL_QUEST : LABEL_JOB;
  const sentLabel = isQuest ? 'Đơn đã gửi tới Nhà tổ chức' : 'Hồ sơ đã gửi tới Nhà tuyển dụng';

  const events = parseHistory(history);
  if (events.length > 0) {
    const sorted = [...events].sort((a, b) => new Date(b.at) - new Date(a.at)); // newest first
    const rows = [];
    sorted.forEach((e) => {
      const s = String(e.status).toUpperCase();
      if (s === 'SUBMITTED') {
        rows.push({ label: sentLabel, at: e.at });
        rows.push({ label: labels.SUBMITTED, at: e.at });
      } else {
        rows.push({ label: labels[s] || s, at: e.at });
      }
    });
    if (rows[0]) rows[0].current = true;
    return rows;
  }

  // Fallback when there's no recorded history yet.
  const st = (status || 'SUBMITTED').toUpperCase();
  const advanced = isQuest ? LABEL_QUEST : LABEL_JOB;
  const rows = [];
  if (st !== 'SUBMITTED' && advanced[st]) {
    rows.push({ label: advanced[st], at: updatedAt || appliedAt, current: true });
  }
  rows.push({ label: sentLabel, at: appliedAt, current: rows.length === 0 });
  rows.push({ label: labels.SUBMITTED, at: appliedAt });
  return rows;
}

export function InlineStatusTimeline({ status = 'SUBMITTED', appliedAt, updatedAt, color = '#2563eb', isQuest = false, history }) {
  const [open, setOpen] = useState(false);
  const rows = buildRows({ history, status, appliedAt, updatedAt, isQuest });
  const header = rows[0];

  return (
    <div className="np-inline-timeline">
      <button type="button" className="np-itl-header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Globe size={14} style={{ color, flexShrink: 0 }} />
        <span className="np-itl-header-label">{header.label}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="np-itl-body">
          {rows.map((r, i) => (
            <div className="np-itl-row" key={i}>
              <span className="np-itl-dot" style={{ background: r.current ? color : 'var(--c-line-strong, #cbd5e1)' }} />
              <span className="np-itl-label" style={{ color: r.current ? 'var(--c-ink, #1e293b)' : 'var(--c-muted, #64748b)', fontWeight: r.current ? 700 : 500 }}>{r.label}</span>
              <span className="np-itl-time">{fmt(r.at)}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .np-inline-timeline { margin-top: 6px; border-top: 1px solid var(--c-line, #eef2f7); padding-top: 6px; }
        .np-itl-header { display: flex; align-items: center; gap: 8px; width: 100%; background: none; border: none; padding: 4px 0; cursor: pointer; font: inherit; }
        .np-itl-header-label { flex: 1; text-align: left; font-size: 0.86rem; font-weight: 700; color: var(--c-ink, #1e293b); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .np-itl-header > svg:last-child { color: var(--c-muted, #94a3b8); flex-shrink: 0; }
        .np-itl-body { position: relative; display: flex; flex-direction: column; gap: 12px; padding: 10px 0 2px 0; }
        .np-itl-body::before { content: ''; position: absolute; left: 6px; top: 16px; bottom: 16px; width: 2px; background: var(--c-line, #e5e9f0); }
        .np-itl-row { position: relative; display: grid; grid-template-columns: 14px 1fr auto; align-items: center; gap: 12px; }
        .np-itl-dot { width: 10px; height: 10px; border-radius: 50%; margin-left: 2px; box-shadow: 0 0 0 3px var(--c-bg, #fff); }
        .np-itl-label { font-size: 0.84rem; overflow: hidden; text-overflow: ellipsis; }
        .np-itl-time { font-size: 0.78rem; color: var(--c-muted, #94a3b8); white-space: nowrap; }
      `}</style>
    </div>
  );
}
