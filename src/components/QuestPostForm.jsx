import { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, Plus, Minus, Trash2, GripVertical, ImagePlus, Sparkles, AlertTriangle, Move } from 'lucide-react';
import { createQuest, updateQuest, getQuestExpConfig } from '../api/questApi.js';
import { PremiumDateTimePicker } from './PremiumDateTimePicker.jsx';
import { QUEST_CATEGORIES, toLocalISOString, parseBanner, serializeBanner } from './postingConstants.js';

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
    bannerUrl: initialData?.bannerUrl ?? '',
    bannerPos: initialData?.bannerPos ?? '50% 50%',
  });

  function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setStatus({ type: 'error', message: 'Ảnh banner phải dưới 2MB.' }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((c) => ({ ...c, bannerUrl: reader.result }));
    reader.readAsDataURL(file);
  }

  // Banner editor: drag to pan (both axes), wheel / buttons to zoom. Encoded
  // into bannerPos as "x% y% zoom".
  const bannerDragRef = useRef(null);
  const banner = parseBanner(form.bannerPos);
  function applyBanner(x, y, z) {
    setForm((c) => ({ ...c, bannerPos: serializeBanner(x, y, z) }));
  }
  function onBannerPointerDown(e) {
    if (!form.bannerUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const b = parseBanner(form.bannerPos);
    bannerDragRef.current = { startX: e.clientX, startY: e.clientY, px: b.x, py: b.y, z: b.z, w: rect.width, h: rect.height };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onBannerPointerMove(e) {
    const d = bannerDragRef.current;
    if (!d) return;
    const clamp = (n) => Math.max(0, Math.min(100, n));
    const nx = clamp(d.px - ((e.clientX - d.startX) / d.w) * 100 / d.z);
    const ny = clamp(d.py - ((e.clientY - d.startY) / d.h) * 100 / d.z);
    applyBanner(nx, ny, d.z);
  }
  function onBannerPointerUp(e) {
    bannerDragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }
  function onBannerWheel(e) {
    if (!form.bannerUrl) return;
    const b = parseBanner(form.bannerPos);
    applyBanner(b.x, b.y, Math.max(1, Math.min(3, b.z + (e.deltaY < 0 ? 0.12 : -0.12))));
  }
  function zoomBanner(delta) {
    const b = parseBanner(form.bannerPos);
    applyBanner(b.x, b.y, Math.max(1, Math.min(3, b.z + delta)));
  }

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
  const [overIdx, setOverIdx] = useState(null);
  function addCustomField() { setCustomFields((p) => [...p, { label: '', fieldType: 'TEXT', options: '', required: false }]); }
  function updateCustomField(i, patch) { setCustomFields((p) => p.map((f, idx) => (idx === i ? { ...f, ...patch } : f))); }
  function removeCustomField(i) { setCustomFields((p) => p.filter((_, idx) => idx !== i)); }
  function reorderCustomField(to) {
    setCustomFields((prev) => {
      if (dragIdx === null || dragIdx === to) return prev;
      const a = [...prev]; const [m] = a.splice(dragIdx, 1); a.splice(to, 0, m); return a;
    });
    setDragIdx(null);
    setOverIdx(null);
  }

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'capacity') set(name, value.replace(/\D/g, ''));
    else set(name, value);
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
    customFields.forEach((f, idx) => {
      if (!f.label.trim()) {
        e[`cf_${idx}`] = 'Câu hỏi chưa có nội dung — nhập nội dung hoặc xoá câu hỏi này.';
      } else if (f.fieldType === 'SELECT') {
        const opts = (f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) e[`cf_${idx}`] = 'Kiểu "Chọn 1 đáp án" cần ít nhất 2 lựa chọn (cách nhau bằng dấu phẩy).';
      }
    });
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
      bannerUrl: form.bannerUrl || null,
      bannerPos: form.bannerUrl ? (form.bannerPos || '50% 50%') : null,
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

        {/* Banner */}
        <div>
          <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Ảnh banner cho Quest (tùy chọn)</label>
          <div
            onPointerDown={onBannerPointerDown} onPointerMove={onBannerPointerMove} onPointerUp={onBannerPointerUp} onPointerCancel={onBannerPointerUp} onWheel={onBannerWheel}
            style={{ position: 'relative', width: '100%', aspectRatio: '4 / 1', borderRadius: '16px', overflow: 'hidden', border: `1.5px ${form.bannerUrl ? 'solid' : 'dashed'} var(--line)`, background: form.bannerUrl ? '#0d1b33' : 'linear-gradient(135deg, #ff7a1a12, #2563eb12)', cursor: form.bannerUrl ? 'move' : 'default', touchAction: 'none', userSelect: 'none' }}>
            {form.bannerUrl && (
              <img src={form.bannerUrl} alt="" draggable={false}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${banner.x}% ${banner.y}%`, transform: `scale(${banner.z})`, transformOrigin: `${banner.x}% ${banner.y}%`, pointerEvents: 'none' }} />
            )}
            {!form.bannerUrl && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--muted)' }}>
                <Sparkles size={26} />
                <span style={{ fontSize: '0.84rem', fontWeight: '600' }}>Chưa có banner — sẽ dùng ảnh mặc định của hệ thống</span>
              </div>
            )}
            {form.bannerUrl && (
              <div style={{ position: 'absolute', left: '12px', top: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 11px', borderRadius: '999px', background: 'rgba(13,27,51,0.7)', color: '#fff', fontWeight: '700', fontSize: '0.76rem', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
                <Move size={13} /> Kéo để di chuyển · cuộn chuột để zoom
              </div>
            )}
            {form.bannerUrl && (
              <div onPointerDown={(e) => e.stopPropagation()} style={{ position: 'absolute', left: '12px', bottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(13,27,51,0.7)', borderRadius: '999px', padding: '4px', backdropFilter: 'blur(4px)' }}>
                <button type="button" onClick={() => zoomBanner(-0.25)} title="Thu nhỏ" style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={15} /></button>
                <span style={{ color: '#fff', fontSize: '0.76rem', fontWeight: '800', minWidth: '34px', textAlign: 'center' }}>{Math.round(banner.z * 100)}%</span>
                <button type="button" onClick={() => zoomBanner(0.25)} title="Phóng to" style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={15} /></button>
              </div>
            )}
            <div onPointerDown={(e) => e.stopPropagation()} style={{ position: 'absolute', right: '12px', bottom: '12px', display: 'flex', gap: '8px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', background: 'rgba(13,27,51,0.85)', color: '#fff', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}>
                <ImagePlus size={15} /> {form.bannerUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
              </label>
              {form.bannerUrl && (
                <button type="button" onClick={() => setForm((c) => ({ ...c, bannerUrl: '', bannerPos: '50% 50%' }))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '9px', background: 'rgba(220,38,38,0.9)', color: '#fff', fontWeight: '700', fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={15} /> Gỡ
                </button>
              )}
            </div>
          </div>
        </div>

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
              <input type="text" inputMode="numeric" name="capacity" value={form.capacity} onChange={handleChange}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              {errors.description
                ? <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.description}</span>
                : <span />}
              {(() => {
                const len = form.description.trim().length;
                const ok = len >= 30;
                return (
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: ok ? '#16a34a' : 'var(--muted)' }}>
                    {len} ký tự{ok ? '' : ` · cần thêm ${30 - len}`}
                  </span>
                );
              })()}
            </div>
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
                  className={`np-drag ${dragIdx === idx ? 'is-dragging' : ''} ${overIdx === idx && dragIdx !== idx ? 'is-over' : ''}`}
                  onDragOver={(e) => e.preventDefault()} onDragEnter={() => setOverIdx(idx)} onDrop={() => reorderCustomField(idx)}
                  style={{ '--np-drag-accent': '#ff7a1a', padding: '14px 16px', border: '1px solid var(--line)', borderRadius: '14px', background: 'var(--card-bg-strong, #fff)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="np-drag-handle" draggable onDragStart={() => setDragIdx(idx)} onDragEnd={() => { setDragIdx(null); setOverIdx(null); }} title="Kéo để sắp xếp"
                      style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', flexShrink: 0 }}>
                      <GripVertical size={16} />
                    </span>
                    <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(255,122,26,0.12)', color: '#ff7a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>{idx + 1}</span>
                    <input value={f.label} onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                      placeholder="Nhập câu hỏi (vd: Bạn rảnh những buổi nào?)"
                      style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: `1px solid ${errors[`cf_${idx}`] && !f.label.trim() ? '#dc2626' : 'var(--line)'}`, fontSize: '0.9rem', fontWeight: '600', background: 'var(--bg)' }} />
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
                  {f.fieldType === 'SELECT' && (() => {
                    const opts = (f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean);
                    return (
                      <div style={{ marginTop: '10px', paddingLeft: '36px' }}>
                        <input value={f.options} onChange={(e) => updateCustomField(idx, { options: e.target.value })}
                          placeholder="Nhập các lựa chọn, cách nhau bằng dấu phẩy (vd: Sáng, Chiều, Tối)"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: `1px solid ${errors[`cf_${idx}`] ? '#dc2626' : 'var(--line)'}`, fontSize: '0.85rem', background: 'var(--bg)', boxSizing: 'border-box' }} />
                        {opts.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: '700' }}>{opts.length} lựa chọn:</span>
                            {opts.map((o, i) => (
                              <span key={i} style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ff7a1a', background: 'rgba(255,122,26,0.1)', border: '1px solid rgba(255,122,26,0.25)', padding: '3px 9px', borderRadius: '999px' }}>{o}</span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: 'var(--muted)' }}>Mỗi lựa chọn cách nhau bằng dấu phẩy. Ứng viên sẽ chọn 1 trong các lựa chọn này từ danh sách thả xuống.</p>
                        )}
                      </div>
                    );
                  })()}

                  {errors[`cf_${idx}`] && (
                    <p style={{ margin: '10px 0 0', paddingLeft: '36px', fontSize: '0.8rem', color: '#dc2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <AlertTriangle size={13} /> {errors[`cf_${idx}`]}
                    </p>
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
