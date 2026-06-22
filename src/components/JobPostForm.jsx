import { useState, useEffect } from 'react';
import { BriefcaseBusiness, MessageSquarePlus, Plus, Trash2, GripVertical } from 'lucide-react';
import { createJob, updateJob, getSkills } from '../api/jobApi.js';
import { PremiumDateTimePicker } from './PremiumDateTimePicker.jsx';
import {
  CATEGORY_MAP, JOB_TYPES, SKILL_LEVELS,
  formatVND, toLocalISOString,
} from './postingConstants.js';

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

export function JobPostForm({ onSuccess, onCancel, initialData = null }) {
  const isEdit = Boolean(initialData);

  // specialty stored as comma-separated string; split for multi-select
  const initSpecialties = initialData?.specialty
    ? initialData.specialty.split(',').map((s) => s.trim()).filter(Boolean)
    : ['SOFTWARE_ENG'];

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    jobType: initialData?.jobType ?? 'INTERNSHIP',
    category: initialData?.category ?? 'TECH',
    specialties: initSpecialties,
    compensation: initialData?.compensation ? String(Math.round(initialData.compensation)) : '',
    minReqRs: initialData?.minReqRs ?? 0,
    location: initialData?.location ?? '',
    isRemote: initialData?.isRemote ?? false,
    capacity: initialData?.capacity ? String(initialData.capacity) : '',
    deadlineAt: initialData?.deadlineAt ?? '',
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState(
    initialData?.skills
      ? initialData.skills.map((s) => ({ skillId: s.skillId, requiredLevel: s.requiredLevel || 'BEGINNER' }))
      : [],
  );
  const [skillsSearch, setSkillsSearch] = useState('');
  const [customFields, setCustomFields] = useState(
    initialData?.formFields
      ? initialData.formFields.map((f) => ({ label: f.label, fieldType: f.fieldType || 'TEXT', options: f.options || '', required: !!f.required }))
      : [],
  );
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [errors, setErrors] = useState({});

  const [dragIdx, setDragIdx] = useState(null);
  function addCustomField() {
    setCustomFields((prev) => [...prev, { label: '', fieldType: 'TEXT', options: '', required: false }]);
  }
  function updateCustomField(idx, patch) {
    setCustomFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }
  function removeCustomField(idx) {
    setCustomFields((prev) => prev.filter((_, i) => i !== idx));
  }
  function reorderCustomField(to) {
    setCustomFields((prev) => {
      if (dragIdx === null || dragIdx === to) return prev;
      const a = [...prev];
      const [moved] = a.splice(dragIdx, 1);
      a.splice(to, 0, moved);
      return a;
    });
    setDragIdx(null);
  }

  useEffect(() => {
    getSkills().then((s) => setAvailableSkills(s || [])).catch(() => {});
  }, []);

  // When category changes, reset specialties to first available in new category
  useEffect(() => {
    const specs = CATEGORY_MAP[form.category]?.specialties ?? [];
    if (specs.length > 0) {
      const valid = form.specialties.filter((v) => specs.some((s) => s.value === v));
      if (valid.length === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((prev) => ({ ...prev, specialties: [specs[0].value] }));
      } else if (valid.length !== form.specialties.length) {
        setForm((prev) => ({ ...prev, specialties: valid }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category]);

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === 'compensation') {
      set(name, value.replace(/\D/g, ''));
    } else {
      set(name, type === 'checkbox' ? checked : value);
    }
  }

  function toggleSpecialty(val) {
    setForm((prev) => {
      const cur = prev.specialties;
      if (cur.includes(val)) {
        if (cur.length === 1) return prev; // keep at least 1
        return { ...prev, specialties: cur.filter((v) => v !== val) };
      }
      return { ...prev, specialties: [...cur, val] };
    });
    if (errors.specialties) setErrors((prev) => { const n = { ...prev }; delete n.specialties; return n; });
  }

  function toggleSkill(skillId) {
    setSelectedSkills((cur) => {
      if (cur.find((s) => s.skillId === skillId)) return cur.filter((s) => s.skillId !== skillId);
      return [...cur, { skillId, requiredLevel: 'BEGINNER' }];
    });
  }

  function changeSkillLevel(skillId, level) {
    setSelectedSkills((cur) => cur.map((s) => (s.skillId === skillId ? { ...s, requiredLevel: level } : s)));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Tiêu đề không được để trống.';
    else if (form.title.trim().length < 10) e.title = 'Tiêu đề quá ngắn (tối thiểu 10 ký tự).';
    else if (form.title.trim().length > 200) e.title = 'Tiêu đề quá dài (tối đa 200 ký tự).';
    if (!form.description.trim()) e.description = 'Mô tả không được để trống.';
    else if (form.description.trim().length < 30) e.description = 'Mô tả quá ngắn (tối thiểu 30 ký tự).';
    if (form.compensation) {
      const c = parseFloat(form.compensation);
      if (isNaN(c) || c <= 0) e.compensation = 'Thù lao phải là số dương.';
    }
    if (form.capacity) {
      const c = parseInt(form.capacity);
      if (isNaN(c) || c <= 0) e.capacity = 'Số lượng phải là số nguyên dương.';
    }
    if (form.deadlineAt && new Date(form.deadlineAt) < new Date(Date.now() + 3600_000)) {
      e.deadlineAt = 'Hạn nộp phải lớn hơn hiện tại ít nhất 1 giờ.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) { setStatus({ type: 'error', message: 'Vui lòng sửa các lỗi còn sót bên dưới.' }); return; }
    setStatus({ type: 'loading', message: isEdit ? 'Đang lưu thay đổi...' : 'Đang đăng tin...' });

    const deadline = form.deadlineAt
      ? (form.deadlineAt.length > 19 ? toLocalISOString(new Date(form.deadlineAt)) : form.deadlineAt)
      : null;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      jobType: form.jobType,
      category: form.category,
      specialty: form.specialties.join(','),
      compensation: form.compensation ? parseFloat(form.compensation) : null,
      minReqRs: parseInt(form.minReqRs) || 0,
      location: form.isRemote ? null : (form.location || null),
      isRemote: form.isRemote,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      deadlineAt: deadline,
      skills: selectedSkills,
      formFields: customFields
        .filter((f) => f.label.trim())
        .map((f) => ({ label: f.label.trim(), fieldType: f.fieldType, options: f.fieldType === 'SELECT' ? f.options : null, required: f.required })),
    };

    try {
      if (isEdit) {
        await updateJob(initialData.id, payload);
        setStatus({ type: 'success', message: 'Đã lưu. Tin sẽ được gửi lại để duyệt.' });
      } else {
        await createJob(payload);
        setStatus({ type: 'success', message: 'Đăng tin thành công. Tin đang chờ Admin duyệt.' });
      }
      setTimeout(() => { setStatus({ type: 'idle', message: '' }); onSuccess(); }, 1800);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Không thể lưu tin tuyển dụng.' });
    }
  }

  const filteredSkills = availableSkills.filter((s) =>
    s.name.toLowerCase().includes(skillsSearch.toLowerCase()),
  );
  const availableSpecs = CATEGORY_MAP[form.category]?.specialties ?? [];

  return (
    <section className="panel" style={{ borderRadius: '24px', padding: '36px', border: '1px solid var(--line)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
          <BriefcaseBusiness size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--ink)', fontWeight: '800' }}>
            {isEdit ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.83rem', color: 'var(--muted)' }}>
            {isEdit ? 'Thay đổi sẽ được gửi lại để Admin duyệt.' : 'Tin sẽ hiển thị sau khi Admin duyệt.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Section 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionLabel num={1} label="Thông tin vị trí tuyển dụng" color="#2563eb" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Tiêu đề (10–200 ký tự) *</label>
              <input name="title" value={form.title} onChange={handleChange} style={errStyle(errors.title)}
                placeholder="VD: Thực tập sinh Thiết kế UI/UX Mobile App" />
              {errors.title && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.title}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Lĩnh vực *</label>
              <select name="category" value={form.category} onChange={handleChange} style={{ ...FIELD_STYLE, height: '46px' }}>
                {Object.keys(CATEGORY_MAP).map((k) => (
                  <option key={k} value={k}>{CATEGORY_MAP[k].label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Loại hình công việc *</label>
              <select name="jobType" value={form.jobType} onChange={handleChange} style={{ ...FIELD_STYLE, height: '46px' }}>
                {JOB_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '600' }}>
                Ứng viên nhận +{JOB_TYPES.find((t) => t.value === form.jobType)?.exp || 300} EXP khi hoàn thành.
              </span>
            </div>

            {/* Multi-specialty */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>
                Chuyên ngành phù hợp *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableSpecs.map((spec) => {
                  const sel = form.specialties.includes(spec.value);
                  return (
                    <button
                      key={spec.value}
                      type="button"
                      onClick={() => toggleSpecialty(spec.value)}
                      style={{
                        padding: '7px 14px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: sel ? '700' : '500',
                        border: `1.5px solid ${sel ? '#2563eb' : 'var(--line)'}`,
                        background: sel ? 'rgba(37,99,235,0.08)' : 'var(--card-bg-strong)',
                        color: sel ? '#2563eb' : 'var(--ink)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {sel && <span style={{ marginRight: '5px' }}>&#10003;</span>}{spec.label}
                    </button>
                  );
                })}
              </div>
              {errors.specialties && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.specialties}</span>}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionLabel num={2} label="Đãi ngộ & Yêu cầu" color="#ff7a1a" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Thù lao / Phụ cấp (VND)</label>
              <input name="compensation" value={formatVND(form.compensation)} onChange={handleChange}
                style={errStyle(errors.compensation)} placeholder="VD: 1.500.000 — để trống nếu thỏa thuận" />
              {errors.compensation && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.compensation}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Số lượng tuyển</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                style={errStyle(errors.capacity)} placeholder="Để trống nếu không giới hạn" />
              {errors.capacity && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.capacity}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Hạn nộp hồ sơ *</label>
              <PremiumDateTimePicker value={form.deadlineAt}
                onChange={(v) => { set('deadlineAt', v); }}
                error={errors.deadlineAt} placeholder="Chọn hạn nộp hồ sơ..." />
              {errors.deadlineAt && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.deadlineAt}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Uy tín tối thiểu yêu cầu</span>
                <span style={{ color: '#2563eb', fontWeight: '800' }}>{form.minReqRs} RS</span>
              </label>
              <input type="range" name="minReqRs" min="0" max="100" value={form.minReqRs} onChange={handleChange}
                style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer', marginTop: '8px' }} />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionLabel num={3} label="Địa điểm, Kỹ năng & Mô tả" color="#16a34a" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Địa điểm làm việc</label>
              <input name="location" value={form.location} onChange={handleChange}
                disabled={form.isRemote}
                placeholder={form.isRemote ? 'Làm việc từ xa (Remote)' : 'VD: Quận 9, TP. HCM'}
                style={{ ...errStyle(false), background: form.isRemote ? 'var(--surface-soft)' : 'var(--bg)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" name="isRemote" checked={form.isRemote} onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)' }}>Làm việc từ xa (Remote)</span>
              </label>
            </div>

            {/* Skills */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Kỹ năng yêu cầu</label>
              <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px' }}>
                <input type="text" value={skillsSearch} onChange={(e) => setSkillsSearch(e.target.value)}
                  placeholder="Tìm kỹ năng — Figma, Java, Excel..."
                  style={{ ...FIELD_STYLE, marginBottom: '14px' }} />

                {selectedSkills.length > 0 && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Đã chọn ({selectedSkills.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                      {selectedSkills.map((sel) => {
                        const skillObj = availableSkills.find((s) => s.id === sel.skillId);
                        return (
                          <div key={sel.skillId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--card-bg-strong)', border: '1px solid #2563eb', borderRadius: '10px', fontSize: '0.84rem' }}>
                            <strong style={{ color: '#2563eb' }}>{skillObj?.name ?? '?'}</strong>
                            <select value={sel.requiredLevel} onChange={(e) => changeSkillLevel(sel.skillId, e.target.value)}
                              style={{ border: 'none', background: 'var(--surface-soft)', color: 'var(--ink)', fontSize: '0.8rem', borderRadius: '4px', padding: '2px 4px', fontWeight: '700' }}>
                              {SKILL_LEVELS.map((lvl) => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                            </select>
                            <button type="button" onClick={() => toggleSkill(sel.skillId)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: '700', fontSize: '1rem', padding: '2px', marginLeft: '4px' }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                  {filteredSkills.map((skill) => {
                    const isSel = selectedSkills.some((s) => s.skillId === skill.id);
                    return (
                      <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid', borderColor: isSel ? '#2563eb' : 'var(--line)', background: isSel ? 'rgba(37,99,235,0.06)' : 'var(--card-bg-strong)', color: isSel ? '#2563eb' : 'var(--ink)', fontSize: '0.82rem', fontWeight: isSel ? '700' : 'normal', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {skill.name}
                      </button>
                    );
                  })}
                  {filteredSkills.length === 0 && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: '600' }}>
                      Không tìm thấy &ldquo;{skillsSearch}&rdquo;. Chọn từ danh sách chuẩn.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)' }}>Mô tả công việc (JD) — tối thiểu 30 ký tự *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={8}
                placeholder="Mô tả công việc, quyền lợi, yêu cầu ứng tuyển..."
                style={{ ...errStyle(errors.description), resize: 'vertical' }} />
              {errors.description && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{errors.description}</span>}
            </div>
          </div>
        </div>

        {/* Custom application questions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquarePlus size={20} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--ink)' }}>Câu hỏi thêm cho ứng viên</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>Ứng viên sẽ trả lời khi bấm Ứng tuyển. Để trống nếu không cần.</p>
              </div>
            </div>
            <button type="button" onClick={addCustomField}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 15px', borderRadius: '10px', border: 'none', background: '#0d1b33', color: '#fff', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={16} /> Thêm câu hỏi
            </button>
          </div>

          {customFields.length === 0 ? (
            <div style={{ padding: '28px 20px', border: '1.5px dashed var(--line)', borderRadius: '14px', textAlign: 'center', background: 'var(--surface-soft, #f7f9fc)' }}>
              <MessageSquarePlus size={26} style={{ color: 'var(--muted)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', fontWeight: '600' }}>Chưa có câu hỏi nào</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>Vd: &ldquo;Link portfolio của bạn?&rdquo;, &ldquo;Vì sao bạn phù hợp?&rdquo;</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {customFields.map((f, idx) => (
                <div key={idx}
                  onDragOver={(e) => e.preventDefault()} onDrop={() => reorderCustomField(idx)}
                  style={{ padding: '14px 16px', border: `1px solid ${dragIdx === idx ? '#2563eb' : 'var(--line)'}`, borderRadius: '14px', background: 'var(--card-bg-strong, #fff)', opacity: dragIdx === idx ? 0.6 : 1 }}>
                  {/* Row 1: drag + number + label + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span draggable onDragStart={() => setDragIdx(idx)} onDragEnd={() => setDragIdx(null)} title="Kéo để sắp xếp"
                      style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', cursor: 'grab', flexShrink: 0 }}>
                      <GripVertical size={16} />
                    </span>
                    <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>{idx + 1}</span>
                    <input value={f.label} onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                      placeholder="Nhập câu hỏi (vd: Link portfolio của bạn?)"
                      style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.9rem', fontWeight: '600', background: 'var(--bg)' }} />
                    <button type="button" onClick={() => removeCustomField(idx)} title="Xoá câu hỏi"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--line)'; }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Row 2: type + required */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingLeft: '36px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '600' }}>Kiểu trả lời:</span>
                    <select value={f.fieldType} onChange={(e) => updateCustomField(idx, { fieldType: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: '9px', border: '1px solid var(--line)', fontSize: '0.83rem', cursor: 'pointer', background: 'var(--bg)' }}>
                      <option value="TEXT">Văn bản ngắn</option>
                      <option value="TEXTAREA">Văn bản dài</option>
                      <option value="SELECT">Chọn 1 đáp án</option>
                    </select>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.83rem', color: 'var(--ink)', fontWeight: '600', cursor: 'pointer', padding: '7px 12px', borderRadius: '9px', border: `1px solid ${f.required ? 'rgba(37,99,235,0.4)' : 'var(--line)'}`, background: f.required ? 'rgba(37,99,235,0.06)' : 'var(--bg)' }}>
                      <input type="checkbox" checked={f.required} onChange={(e) => updateCustomField(idx, { required: e.target.checked })} style={{ accentColor: '#2563eb', cursor: 'pointer' }} /> Bắt buộc
                    </label>
                  </div>

                  {/* Row 3: options for SELECT */}
                  {f.fieldType === 'SELECT' && (
                    <div style={{ marginTop: '10px', paddingLeft: '36px' }}>
                      <input value={f.options} onChange={(e) => updateCustomField(idx, { options: e.target.value })}
                        placeholder="Các lựa chọn, cách nhau bằng dấu phẩy (vd: Có, Không, Tùy)"
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
            style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent', padding: '12px 28px', fontSize: '0.92rem', fontWeight: '800' }}>
            {status.type === 'loading' ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Đăng tin'}
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
