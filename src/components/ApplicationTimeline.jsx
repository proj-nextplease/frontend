import { Check, Clock3, X, Undo2 } from 'lucide-react';

/**
 * Vertical progress stepper for a candidate's application journey.
 * Removes the "black hole" feeling by showing exactly where an application sits.
 *
 * Job path:   Đã nộp → Đã xem → Vào vòng tiếp → Chấp thuận → Hoàn thành
 * Quest path: Đã nộp → Chấp thuận → Hoàn thành
 * Terminal-negative statuses (REJECTED / WITHDRAWN) render a distinct end node.
 */

const JOB_STEPS = [
  { key: 'SUBMITTED', label: 'Đã nộp', desc: 'Đơn của bạn đã được gửi tới nhà tuyển dụng.' },
  { key: 'VIEWED', label: 'Đã xem', desc: 'Nhà tuyển dụng đã xem hồ sơ của bạn.' },
  { key: 'SHORTLISTED', label: 'Vào vòng tiếp', desc: 'Bạn được đưa vào danh sách tiềm năng.' },
  { key: 'ACCEPTED', label: 'Chấp thuận', desc: 'Chúc mừng! Bạn đã được chấp nhận.' },
  { key: 'COMPLETED', label: 'Hoàn thành', desc: 'Công việc đã hoàn thành — điểm thưởng đã được cộng.' },
];

const QUEST_STEPS = [
  { key: 'SUBMITTED', label: 'Đã nộp', desc: 'Đơn tham gia của bạn đã được gửi đi.' },
  { key: 'ACCEPTED', label: 'Chấp thuận', desc: 'Bạn đã được nhận tham gia Quest.' },
  { key: 'COMPLETED', label: 'Hoàn thành', desc: 'Quest hoàn thành — EXP/NP đã được cộng.' },
];

const ACCENT = '#16a34a';

export function ApplicationTimeline({ status, isQuest = false }) {
  const current = (status || 'SUBMITTED').toUpperCase();
  const steps = isQuest ? QUEST_STEPS : JOB_STEPS;

  const negative = current === 'REJECTED' || current === 'WITHDRAWN';
  const currentIndex = steps.findIndex((s) => s.key === current);

  // Rows to render: the positive path up to the current step, or (for a
  // terminal-negative outcome) the first step plus a distinct end node.
  const rows = [];
  if (negative) {
    rows.push({ ...steps[0], state: 'done' });
    rows.push(
      current === 'REJECTED'
        ? { key: 'REJECTED', label: 'Từ chối', desc: 'Rất tiếc, đơn của bạn chưa phù hợp lần này.', state: 'rejected' }
        : { key: 'WITHDRAWN', label: 'Đã rút đơn', desc: 'Bạn đã rút đơn ứng tuyển này.', state: 'withdrawn' },
    );
  } else {
    steps.forEach((s, i) => {
      let state = 'upcoming';
      if (i < currentIndex) state = 'done';
      else if (i === currentIndex) state = i === steps.length - 1 ? 'done' : 'current';
      rows.push({ ...s, state });
    });
  }

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Hành trình đơn ứng tuyển
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const v = nodeVisual(row.state);
          return (
            <div key={row.key} style={{ display: 'flex', gap: '12px' }}>
              {/* node + connector rail */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: v.bg, color: v.fg, border: `2px solid ${v.border}`,
                    boxShadow: row.state === 'current' ? `0 0 0 4px ${ACCENT}22` : 'none',
                  }}
                >
                  {v.icon}
                </span>
                {!isLast && (
                  <span style={{ width: '2px', flex: 1, minHeight: '22px', background: row.state === 'done' ? ACCENT : 'var(--line)', margin: '2px 0' }} />
                )}
              </div>
              {/* label + desc */}
              <div style={{ paddingBottom: isLast ? 0 : '14px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: v.textStrong ? 'var(--ink)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {row.label}
                  {row.state === 'current' && (
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, color: ACCENT, background: `${ACCENT}18`, padding: '2px 7px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Hiện tại
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.5 }}>{row.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function nodeVisual(state) {
  switch (state) {
    case 'done':
      return { bg: ACCENT, fg: '#fff', border: ACCENT, icon: <Check size={14} />, textStrong: true };
    case 'current':
      return { bg: '#fff', fg: ACCENT, border: ACCENT, icon: <Clock3 size={14} />, textStrong: true };
    case 'rejected':
      return { bg: '#dc2626', fg: '#fff', border: '#dc2626', icon: <X size={14} />, textStrong: true };
    case 'withdrawn':
      return { bg: 'var(--surface-soft)', fg: '#6b7280', border: '#9ca3af', icon: <Undo2 size={13} />, textStrong: true };
    default: // upcoming
      return { bg: 'var(--surface-soft)', fg: 'var(--muted)', border: 'var(--line)', icon: <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--muted)', opacity: 0.5 }} />, textStrong: false };
  }
}
