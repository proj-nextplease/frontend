import { useState, useEffect } from 'react';
import { MessageSquarePlus, Plus, Trash2, GripVertical } from 'lucide-react';
import { createQuest, updateQuest, getQuestExpConfig } from '../api/questApi.js';
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
  const [customFields, setCustomFields] = useState(
    initialData?.formFields
      ? initialData.formFields.map((f) => ({ label: f.label, fieldType: f.fieldType || 'TEXT', options: f.options || '', required: !!f.required }))
      : [],
  );

  const [expMap, setExpMap] = useState({});
  useEffect(() => { getQuestExpConfig().then(setExpMap).catch(() => setExpMap({})); }, []);
  const expOf = (cat) => expMap[cat] ?? QUEST_CATEGORIES.find((c) => c.value === cat)?.exp ?? 0;

  const [dragIdx, setDragIdx] = useState(null);
  function addCustomField() { setCustomFields((p) => [...p, { label: '', fieldType: 'TEXT', options: '', required: false }]); }
  function updateCustomField(i, patch) { setCustomFields((p) => p.map((f, idx) => (idx === i ? { ...f, ...patch } : f))); }
  function removeCustomField(i) { setCustomFields((p) => p.filter((_, idx) => idx !== i)); }
  function reorderCustomField(to) {
    setCustomFields((prev) => {
      if (dragIdx === null || dragIdx === to) return prev;
      const a = [...prev]; const [m] = a.splice(dragIdx, 1); a.splice(to, 0, m); return a;
    });
    setDragIdx(null);
  }

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
      formFields: customFields
        .filter((f) => f.label.trim())
        .map((f) => ({ label: f.label.trim(), fieldType: f.fieldType, options: f.fieldType === 'SELECT' ? f.options : null, required: f.required })),
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
                  <option key={o.value} value={o.value}>{o.label} — +{expOf(o.value)} EXP</option>
                ))}
              </select>
              {currentCat && (
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '600' }}>
                  Ứng viên nhận +{expOf(form.questCategory)} EXP khi Admin xác nhận hoàn thành.
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

        {/* Custom application questions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(255,122,26,0.12)', color: '#ff7a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquarePlus size={20} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--ink)' }}>Câu hỏi thêm cho ứng viên</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>Ứng viên sẽ trả lời khi đăng ký Quest. Để trống nếu không cần.</p>
              </div>
            </div>
            <button type="button" onClick={addCustomField}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 15px', borderRadius: '10px', border: 'none', background: '#ff7a1a', color: '#fff', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={16} /> Thêm câu hỏi
            </button>
          </div>

          {customFields.length === 0 ? (
            <div style={{ padding: '28px 20px', border: '1.5px dashed var(--line)', borderRadius: '14px', textAlign: 'center', background: 'var(--surface-soft, #f7f9fc)' }}>
              <MessageSquarePlus size={26} style={{ color: 'var(--muted)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', fontWeight: '600' }}>Chưa có câu hỏi nào</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {customFields.map((f, idx) => (
                <div key={idx}
                  onDragOver={(e) => e.preventDefault()} onDrop={() => reorderCustomField(idx)}
                  style={{ padding: '14px 16px', border: `1px solid ${dragIdx === idx ? '#ff7a1a' : 'var(--line)'}`, borderRadius: '14px', background: 'var(--card-bg-strong, #fff)', opacity: dragIdx === idx ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span draggable onDragStart={() => setDragIdx(idx)} onDragEnd={() => setDragIdx(null)} title="Kéo để sắp xếp"
                      style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', cursor: 'grab', flexShrink: 0 }}>
                      <GripVertical size={16} />
                    </span>
                    <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(255,122,26,0.12)', color: '#ff7a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>{idx + 1}</span>
                    <input value={f.label} onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                      placeholder="Nhập câu hỏi (vd: Bạn rảnh những buổi nào?)"
                      style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.9rem', fontWeight: '600', background: 'var(--bg)' }} />
                    <button type="button" onClick={() => removeCustomField(idx)} title="Xoá câu hỏi"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingLeft: '36px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '600' }}>Kiểu trả lời:</span>
                    <select value={f.fieldType} onChange={(e) => updateCustomField(idx, { fieldType: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: '9px', border: '1px solid var(--line)', fontSize: '0.83rem', cursor: 'pointer', background: 'var(--bg)' }}>
                      <option value="TEXT">Văn bản ngắn</option>
                      <option value="TEXTAREA">Văn bản dài</option>
                      <option value="SELECT">Chọn 1 đáp án</option>
                    </select>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.83rem', color: 'var(--ink)', fontWeight: '600', cursor: 'pointer', padding: '7px 12px', borderRadius: '9px', border: `1px solid ${f.required ? 'rgba(255,122,26,0.4)' : 'var(--line)'}`, background: f.required ? 'rgba(255,122,26,0.08)' : 'var(--bg)' }}>
                      <input type="checkbox" checked={f.required} onChange={(e) => updateCustomField(idx, { required: e.target.checked })} style={{ accentColor: '#ff7a1a', cursor: 'pointer' }} /> Bắt buộc
                    </label>
                  </div>
                  {f.fieldType === 'SELECT' && (
                    <div style={{ marginTop: '10px', paddingLeft: '36px' }}>
                      <input value={f.options} onChange={(e) => updateCustomField(idx, { options: e.target.value })}
                        placeholder="Các lựa chọn, cách nhau bằng dấu phẩy (vd: Sáng, Chiều, Tối)"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1px solid var(--line)', fontSize: '0.85rem', background: 'var(--bg)', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
