import { useState } from 'react';
import { createQuest, updateQuest } from '../api/questApi.js';
import { PremiumDateTimePicker } from './PremiumDateTimePicker.jsx';
import { QUEST_CATEGORIES, toLocalISOString } from './postingConstants.js';

const FIELD_STYLE = {
  padding: '12px 16px', borderRadius: '12px',
  border: '1px solid var(--line)', background: 'var(--bg)',
  color: 'var(--ink)', width: '100%', boxSizing: 'border-box',
};

function errStyle(hasErr) {
  return { ...FIELD_STYLE, border: hasErr ? '1.5px solid #dc2626' : '1px solid var(--line)' };
}

function SectionLabel({ num, label, color }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: '10px' }}>
      <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {num}. {label}
      </span>
    </div>
  );
}

function StatusBanner({ status }) {
  if (!status.message) return null;
  const cfg = {
    success: { bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.2)', color: '#16a34a' },
    error:   { bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)',   color: '#dc2626' },
    loading: { bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.2)',   color: '#2563eb' },
  }[status.type] || {};
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color }}>
      {status.type === 'loading' && <div className="b2b-loader" style={{ width: '18px', height: '18px', borderTopColor: '#2563eb', flexShrink: 0 }} />}
      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>{status.message}</p>
    </div>
  );
}

export function QuestPostForm({ onSuccess, onCancel, initialData = null }) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    questCategory: initialData?.category ?? 'SMALL_EVENT',
    minReqRs: initialData?.minReqRs ?? 0,
    capacity: initialData?.capacity ? String(initialData.capacity) : '',
    deadlineAt: initialData?.endsAt ?? '',
  });

  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [errors, setErrors] = useState({});

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    set(name, value);
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống.';
    else if (form.title.trim().length < 10) e.title = 'Tiêu đề quá ngắn (tối thiểu 10 ký tự).';
    else if (form.title.trim().length > 200) e.title = 'Tiêu đề quá dài (tối đa 200 ký tự).';
    if (!form.description.trim()) e.description = 'Mô tả không được để trống.';
    else if (form.description.trim().length < 30) e.description = 'Mô tả quá ngắn (tối thiểu 30 ký tự).';
    if (form.capacity) {
      const c = parseInt(form.capacity);
      if (isNaN(c) || c <= 0) e.capacity = 'Số lượng phải là số nguyên dương.';
    }
    if (form.deadlineAt && new Date(form.deadlineAt) < new Date(Date.now() + 3600_000)) {
      e.deadlineAt = 'Hạn kết thúc phải lớn hơn hiện tại ít nhất 1 giờ.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) { setStatus({ type: 'error', message: 'Vui lòng sửa các lỗi còn sót bên dưới.' }); return; }
    setStatus({ type: 'loading', message: isEdit ? 'Đang lưu thay đổi...' : 'Đang tạo Quest...' });

    const deadline = form.deadlineAt
      ? (form.deadlineAt.length > 19 ? toLocalISOString(new Date(form.deadlineAt)) : form.deadlineAt)
      : null;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.questCategory,
      minReqRs: parseInt(form.minReqRs) || 0,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      endsAt: deadline,
    };

    try {
      if (isEdit) {
        await updateQuest(initialData.id, payload);
        setStatus({ type: 'success', message: 'Đã lưu. Quest sẽ được gửi lại để duyệt.' });
      } else {
        await createQuest(payload);
        setStatus({ type: 'success', message: 'Tạo Quest thành công. Quest đang chờ Admin duyệt.' });
      }
      setTimeout(() => { setStatus({ type: 'idle', message: '' }); onSuccess(); }, 1800);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Không thể lưu Quest.' });
    }
  }

  const currentCat = QUEST_CATEGORIES.find((c) => c.value === form.questCategory);

  return (
    <section className="panel" style={{ borderRadius: '24px', padding: '36px', border: '1px solid var(--line)' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
        <h2 style={{ fontSize: '1.35rem', margin: '0 0 4px', color: 'var(--ink)', fontWeight: '800' }}>
          {isEdit ? 'Chỉnh sửa Quest' : 'Tạo Quest Sự kiện / Chiến dịch CLB'}
        </h2>
        <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--muted)' }}>
          {isEdit ? 'Thay đổi sẽ được gửi lại để Admin duyệt.' : 'Quest sẽ hiển thị sau khi Admin duyệt.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Section 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionLabel num={1} label="Thông tin Quest" color="#ff7a1a" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Tiêu đề (10–200 ký tự) *</label>
              <input name="title" value={form.title} onChange={handleChange} style={errStyle(errors.title)}
                placeholder="VD: Ban Tổ chức Sự kiện Chào Tân Sinh Viên 2026" />
              {errors.title && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.title}</span>}
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Loại hình Quest *</label>
              <select name="questCategory" value={form.questCategory} onChange={handleChange}
                style={{ ...FIELD_STYLE, height: '46px' }}>
                {QUEST_CATEGORIES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} — +{o.exp} EXP</option>
                ))}
              </select>
              {currentCat && (
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '600' }}>
                  Ứng viên nhận +{currentCat.exp} EXP khi Admin xác nhận hoàn thành.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionLabel num={2} label="Yêu cầu & Thời hạn" color="#2563eb" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Số lượng tham gia</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                style={errStyle(errors.capacity)} placeholder="Để trống nếu không giới hạn" />
              {errors.capacity && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.capacity}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Hạn kết thúc Quest</label>
              <PremiumDateTimePicker value={form.deadlineAt}
                onChange={(v) => set('deadlineAt', v)}
                error={errors.deadlineAt} placeholder="Chọn ngày kết thúc..." />
              {errors.deadlineAt && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.deadlineAt}</span>}
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Uy tín tối thiểu yêu cầu</span>
                <span style={{ color: '#2563eb', fontWeight: '800' }}>{form.minReqRs} RS</span>
              </label>
              <input type="range" name="minReqRs" min="0" max="100" value={form.minReqRs} onChange={handleChange}
                style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionLabel num={3} label="Mô tả chi tiết Quest" color="#16a34a" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>
              Mô tả nhiệm vụ, quyền lợi và yêu cầu tham gia — tối thiểu 30 ký tự *
            </label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={8}
              placeholder="Mô tả các nhiệm vụ cần thực hiện, quyền lợi tham gia, yêu cầu kỹ năng..."
              style={{ ...errStyle(errors.description), resize: 'vertical' }} />
            {errors.description && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.description}</span>}
          </div>
        </div>

        <StatusBanner status={status} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
          <button type="submit" disabled={status.type === 'loading'} className="button primary-button"
            style={{ background: 'linear-gradient(135deg, #ff7a1a, #2563eb)', borderColor: 'transparent', padding: '12px 28px', fontSize: '0.92rem', fontWeight: '800' }}>
            {status.type === 'loading' ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo Quest'}
          </button>
          <button type="button" onClick={onCancel} className="button secondary-button"
            style={{ padding: '12px 28px', fontSize: '0.92rem', fontWeight: '700' }}>
            Hủy
          </button>
        </div>
      </form>
    </section>
  );
}
