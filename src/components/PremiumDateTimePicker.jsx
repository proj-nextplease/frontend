import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toLocalISOString } from './postingConstants.js';

export function PremiumDateTimePicker({ value, onChange, error, placeholder = 'Chọn ngày và giờ...' }) {
  const [isOpen, setIsOpen] = useState(false);

  const initialDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(initialDate || new Date());

  const selectedDate = initialDate
    ? new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate())
    : null;
  const selectedHour = initialDate ? initialDate.getHours() : 12;
  const selectedMinute = initialDate ? initialDate.getMinutes() : 0;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const [minAllowed] = useState(() => new Date(Date.now() + 60 * 60 * 1000));
  const [minAllowedDateOnly] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDayIndex = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const monthLabels = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  function handleSelectDay(day) {
    const targetDate = new Date(year, month, day);
    if (targetDate < minAllowedDateOnly) return;
    let h = selectedHour;
    let m = selectedMinute;
    const isMinAllowedDate = targetDate.getTime() === minAllowedDateOnly.getTime();
    if (isMinAllowedDate) {
      const minH = minAllowed.getHours();
      const minM = minAllowed.getMinutes();
      if (h < minH) { h = minH; m = Math.ceil(minM / 5) * 5 % 60; }
      else if (h === minH && m < minM) { m = Math.ceil(minM / 5) * 5 % 60; }
    }
    onChange(toLocalISOString(new Date(year, month, day, h, m)));
  }

  function handleSelectHour(e) {
    const h = parseInt(e.target.value);
    const day = selectedDate ? selectedDate.getDate() : new Date().getDate();
    onChange(toLocalISOString(new Date(year, month, day, h, selectedMinute)));
  }

  function handleSelectMinute(e) {
    const m = parseInt(e.target.value);
    const day = selectedDate ? selectedDate.getDate() : new Date().getDate();
    onChange(toLocalISOString(new Date(year, month, day, selectedHour, m)));
  }

  const dayCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(<div key={`e-${i}`} style={{ width: '34px', height: '34px' }} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const isPast = cellDate < minAllowedDateOnly;
    const isSelected =
      selectedDate &&
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === d;
    const isToday =
      d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    dayCells.push(
      <button
        key={`d-${d}`}
        type="button"
        disabled={isPast}
        onClick={() => handleSelectDay(d)}
        style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: isSelected ? 'linear-gradient(135deg, #2563eb, #ff7a1a)' : 'transparent',
          color: isSelected ? '#fff' : isPast ? 'var(--muted)' : 'var(--ink)',
          fontWeight: isSelected || isToday ? 'bold' : 'normal',
          cursor: isPast ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.82rem',
          border: isToday && !isSelected ? '1.5px solid #2563eb' : 'none',
          opacity: isPast ? 0.3 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        {d}
      </button>,
    );
  }

  let displayValue = placeholder;
  if (value) {
    const dObj = new Date(value);
    const hh = String(dObj.getHours()).padStart(2, '0');
    const mm = String(dObj.getMinutes()).padStart(2, '0');
    const dd = String(dObj.getDate()).padStart(2, '0');
    const mo = String(dObj.getMonth() + 1).padStart(2, '0');
    displayValue = `${hh}:${mm} - ${dd}/${mo}/${dObj.getFullYear()}`;
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: '12px',
          border: error ? '1.5px solid #dc2626' : '1px solid var(--line)',
          background: 'var(--bg)', color: value ? 'var(--ink)' : 'var(--muted)',
          height: '46px', cursor: 'pointer', boxSizing: 'border-box',
          userSelect: 'none', transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: value ? '650' : 'normal' }}>{displayValue}</span>
        <Calendar size={18} style={{ color: 'var(--muted)' }} />
      </div>

      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
          <div style={{
            position: 'absolute', top: '52px', left: 0, zIndex: 1000, width: '320px',
            background: 'var(--card-bg-strong, #ffffff)', border: '1px solid var(--line)',
            borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            padding: '20px', boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={18} />
              </button>
              <strong style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>{monthLabels[month]} {year}</strong>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
              {['T2','T3','T4','T5','T6','T7','CN'].map(w => (
                <span key={w} style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--muted)' }}>{w}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', justifyItems: 'center', marginBottom: '16px' }}>
              {dayCells}
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Giờ:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <select value={selectedHour} onChange={handleSelectHour}
                  style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.84rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  {hours.map(h => {
                    const isMinDate = selectedDate && selectedDate.getTime() === minAllowedDateOnly.getTime();
                    return <option key={h} value={h} disabled={isMinDate && h < minAllowed.getHours()}>{String(h).padStart(2,'0')}</option>;
                  })}
                </select>
                <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>:</span>
                <select value={selectedMinute} onChange={handleSelectMinute}
                  style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.84rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  {minutes.map(m => {
                    const isMinDate = selectedDate && selectedDate.getTime() === minAllowedDateOnly.getTime();
                    const isMinHour = isMinDate && selectedHour === minAllowed.getHours();
                    return <option key={m} value={m} disabled={isMinHour && m < minAllowed.getMinutes()}>{String(m).padStart(2,'0')}</option>;
                  })}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsOpen(false)}
                style={{ padding: '6px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Xác nhận
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
