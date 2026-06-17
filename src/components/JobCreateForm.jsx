import { useState, useEffect } from 'react';
import { createJob, getSkills } from '../api/jobApi.js';
import { createQuest } from '../api/questApi.js';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  BriefcaseBusiness,
  Building,
  DollarSign,
  UserCheck,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const CATEGORY_MAP = {
  TECH: {
    label: 'Công nghệ & Kỹ thuật',
    specialties: [
      { value: 'SOFTWARE_ENG', label: 'Kỹ thuật phần mềm' },
      { value: 'INFO_SYSTEMS', label: 'Hệ thống thông tin' },
      { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
      { value: 'CYBER_SEC', label: 'An toàn thông tin' },
      { value: 'OTHER_TECH', label: 'Lĩnh vực công nghệ khác' },
    ]
  },
  BUSINESS: {
    label: 'Kinh tế & Quản lý',
    specialties: [
      { value: 'MARKETING', label: 'Marketing / PR / Quảng cáo' },
      { value: 'FINANCE_ACC', label: 'Tài chính / Kế toán / Kiểm toán' },
      { value: 'BUSINESS_ADMIN', label: 'Quản trị kinh doanh / Vận hành' },
      { value: 'HR', label: 'Quản trị nhân sự' },
      { value: 'LOGISTICS', label: 'Logistics & Chuỗi cung ứng' },
      { value: 'OTHER_BIZ', label: 'Lĩnh vực kinh doanh khác' },
    ]
  },
  DESIGN: {
    label: 'Thiết kế & Nghệ thuật',
    specialties: [
      { value: 'GRAPHIC_DESIGN', label: 'Thiết kế đồ họa' },
      { value: 'UI_UX', label: 'Thiết kế giao diện UI/UX' },
      { value: 'FASHION', label: 'Thời trang / Nội thất' },
      { value: 'OTHER_DESIGN', label: 'Lĩnh vực thiết kế khác' },
    ]
  },
  MEDIA: {
    label: 'Truyền thông & Sự kiện',
    specialties: [
      { value: 'EVENT_PLANNING', label: 'Tổ chức sự kiện' },
      { value: 'CONTENT_CREATIVE', label: 'Sáng tạo nội dung / Copywriter' },
      { value: 'VIDEO_PRODUCTION', label: 'Quay dựng phim / Biên tập video' },
      { value: 'OTHER_MEDIA', label: 'Lĩnh vực truyền thông khác' },
    ]
  },
  LANGUAGE: {
    label: 'Ngôn ngữ & Nhân văn',
    specialties: [
      { value: 'TRANSLATION', label: 'Biên phiên dịch' },
      { value: 'TEACHING', label: 'Giảng dạy / Sư phạm / Đào tạo' },
      { value: 'OTHER_LANG', label: 'Lĩnh vực ngôn ngữ khác' },
    ]
  },
  OTHER: {
    label: 'Lĩnh vực khác',
    specialties: [
      { value: 'OTHER', label: 'Công việc / Lĩnh vực khác' }
    ]
  }
};

const JOB_TYPES = [
  { value: 'INTERNSHIP', label: 'Thực tập sinh (Internship)', exp: 500 },
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)', exp: 300 },
  { value: 'FREELANCE', label: 'Công việc tự do (Freelance)', exp: 300 },
  { value: 'EVENT_STAFF', label: 'Nhân sự sự kiện (Event staff)', exp: 200 },
  { value: 'MICRO_INTERNSHIP', label: 'Thực tập ngắn hạn / Dự án (Micro-internship)', exp: 500 },
];

// Quest categories for CLUB partners — EXP reward fixed server-side by category.
const QUEST_CATEGORIES = [
  { value: 'SMALL_EVENT', label: 'Sự kiện CLB nhỏ', exp: 100 },
  { value: 'SCHOOL_CAMPAIGN', label: 'Chiến dịch cấp trường', exp: 300 },
];

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung bình' },
  { value: 'ADVANCED', label: 'Nâng cao' },
  { value: 'EXPERT', label: 'Chuyên gia' }
];

function formatVND(value) {
  if (!value) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return parseInt(clean, 10).toLocaleString('vi-VN');
}

// Premium Date & Time Picker Component to resolve past hour/date selection & native UI issues
function PremiumDateTimePicker({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(initialDate || new Date());

  const selectedDate = initialDate ? new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate()) : null;
  const selectedHour = initialDate ? initialDate.getHours() : 12;
  const selectedMinute = initialDate ? initialDate.getMinutes() : 0;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Minimum allowed datetime = now + 1 hour
  const minAllowed = new Date(Date.now() + 60 * 60 * 1000);
  const minAllowedDateOnly = new Date(minAllowed.getFullYear(), minAllowed.getMonth(), minAllowed.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDayIndex = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const monthLabels = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  function handlePrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function handleSelectDay(day) {
    const targetDate = new Date(year, month, day);
    if (targetDate < minAllowedDateOnly) return;

    let h = selectedHour;
    let m = selectedMinute;
    const isMinAllowedDate = targetDate.getTime() === minAllowedDateOnly.getTime();

    if (isMinAllowedDate) {
      const minH = minAllowed.getHours();
      const minM = minAllowed.getMinutes();
      if (h < minH) {
        h = minH;
        m = Math.ceil(minM / 5) * 5 % 60;
      } else if (h === minH && m < minM) {
        m = Math.ceil(minM / 5) * 5 % 60;
      }
    }

    const newCombined = new Date(year, month, day, h, m);
    onChange(newCombined.toISOString());
  }

  function handleSelectHour(e) {
    const h = parseInt(e.target.value);
    const day = selectedDate ? selectedDate.getDate() : new Date().getDate();
    const newCombined = new Date(year, month, day, h, selectedMinute);
    onChange(newCombined.toISOString());
  }

  function handleSelectMinute(e) {
    const m = parseInt(e.target.value);
    const day = selectedDate ? selectedDate.getDate() : new Date().getDate();
    const newCombined = new Date(year, month, day, selectedHour, m);
    onChange(newCombined.toISOString());
  }

  const dayCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(<div key={`empty-${i}`} style={{ width: '34px', height: '34px' }} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const isPast = cellDate < minAllowedDateOnly;
    const isSelected = selectedDate && 
                       selectedDate.getFullYear() === year && 
                       selectedDate.getMonth() === month && 
                       selectedDate.getDate() === d;
    const isCurrentToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

    dayCells.push(
      <button
        key={`day-${d}`}
        type="button"
        disabled={isPast}
        onClick={() => handleSelectDay(d)}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: isSelected ? 'linear-gradient(135deg, #2563eb, #ff7a1a)' : 'transparent',
          color: isSelected ? '#ffffff' : (isPast ? 'var(--muted)' : 'var(--ink)'),
          fontWeight: isSelected || isCurrentToday ? 'bold' : 'normal',
          cursor: isPast ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.82rem',
          boxShadow: isSelected ? '0 4px 10px rgba(37,99,235,0.2)' : 'none',
          border: isCurrentToday && !isSelected ? '1.5px solid #2563eb' : 'none',
          transition: 'all 0.15s ease',
          opacity: isPast ? 0.3 : 1,
        }}
      >
        {d}
      </button>
    );
  }

  let displayValue = 'Chọn hạn nộp hồ sơ...';
  if (value) {
    const dObj = new Date(value);
    const hh = String(dObj.getHours()).padStart(2, '0');
    const mm = String(dObj.getMinutes()).padStart(2, '0');
    const dd = String(dObj.getDate()).padStart(2, '0');
    const mMonth = String(dObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dObj.getFullYear();
    displayValue = `${hh}:${mm} - ${dd}/${mMonth}/${yyyy}`;
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '12px',
          border: error ? '1.5px solid #dc2626' : '1px solid var(--line)',
          background: 'var(--bg)',
          color: value ? 'var(--ink)' : 'var(--muted)',
          height: '46px',
          cursor: 'pointer',
          boxSizing: 'border-box',
          userSelect: 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: value ? '650' : 'normal' }}>{displayValue}</span>
        <Calendar size={18} style={{ color: 'var(--muted)' }} />
      </div>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
          />
          
          <div style={{
            position: 'absolute',
            top: '52px',
            left: 0,
            zIndex: 1000,
            width: '320px',
            background: 'var(--card-bg-strong, #ffffff)',
            border: '1px solid var(--line)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            padding: '20px',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={18} />
              </button>
              <strong style={{ fontSize: '0.9rem', color: 'var(--ink)', textTransform: 'capitalize' }}>
                {monthLabels[month]} {year}
              </strong>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(w => (
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
                <select
                  value={selectedHour}
                  onChange={handleSelectHour}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '0.84rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {hours.map(h => {
                    const isMinDate = selectedDate && selectedDate.getTime() === minAllowedDateOnly.getTime();
                    const isBeforeMin = isMinDate && h < minAllowed.getHours();
                    return (
                      <option key={h} value={h} disabled={isBeforeMin}>{String(h).padStart(2, '0')}</option>
                    );
                  })}
                </select>
                <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>:</span>
                <select
                  value={selectedMinute}
                  onChange={handleSelectMinute}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '0.84rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {minutes.map(m => {
                    const isMinDate = selectedDate && selectedDate.getTime() === minAllowedDateOnly.getTime();
                    const isMinHour = isMinDate && selectedHour === minAllowed.getHours();
                    const isBeforeMin = isMinHour && m < minAllowed.getMinutes();
                    return (
                      <option key={m} value={m} disabled={isBeforeMin}>{String(m).padStart(2, '0')}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #ff7a1a)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function JobCreateForm({ onSuccess, onCancel, companyType }) {
  // CLB/Tổ chức đăng Quest sự kiện; Doanh nghiệp đăng tin tuyển dụng (Job).
  const isQuestMode = companyType === 'CLUB';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'INTERNSHIP',
    category: 'TECH',
    specialty: 'SOFTWARE_ENG',
    compensation: '',
    minReqRs: 0,
    location: '',
    isRemote: false,
    capacity: '',
    deadlineAt: '',
    // Quest-only fields
    questCategory: 'SMALL_EVENT',
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // Array of { skillId, requiredLevel }
  const [skillsSearch, setSkillsSearch] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadSkills() {
      try {
        const skills = await getSkills();
        setAvailableSkills(skills || []);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    }
    loadSkills();
  }, []);

  // Update specialty when category changes
  useEffect(() => {
    const specs = CATEGORY_MAP[formData.category]?.specialties || [];
    if (specs.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, specialty: specs[0].value }));
    }
  }, [formData.category]);

  // Validation function
  function validateForm() {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề tuyển dụng không được để trống.';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = `Tiêu đề tuyển dụng quá ngắn (tối thiểu 10 ký tự, hiện tại: ${formData.title.trim().length} ký tự).`;
    } else if (formData.title.trim().length > 200) {
      newErrors.title = `Tiêu đề tuyển dụng quá dài (tối đa 200 ký tự, hiện tại: ${formData.title.trim().length} ký tự).`;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả tuyển dụng không được để trống.';
    } else if (formData.description.trim().length < 30) {
      newErrors.description = `Mô tả tuyển dụng quá ngắn (tối thiểu 30 ký tự, hiện tại: ${formData.description.trim().length} ký tự).`;
    }

    if (!isQuestMode && formData.compensation) {
      const comp = parseFloat(formData.compensation);
      if (isNaN(comp) || comp <= 0) {
        newErrors.compensation = 'Thù lao tuyển dụng phải là số dương lớn hơn 0.';
      }
    }

    if (formData.capacity) {
      const cap = parseInt(formData.capacity);
      if (isNaN(cap) || cap <= 0) {
        newErrors.capacity = 'Số lượng tuyển dụng phải là số nguyên lớn hơn 0.';
      }
    }

    if (formData.deadlineAt) {
      const deadline = new Date(formData.deadlineAt);
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
      if (deadline < oneHourLater) {
        newErrors.deadlineAt = 'Hạn nộp hồ sơ phải lớn hơn thời gian hiện tại ít nhất 1 giờ.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === 'compensation') {
      const cleanDigits = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleanDigits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear specific inline error when typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function toggleSkill(skillId) {
    setSelectedSkills(current => {
      const idx = current.findIndex(s => s.skillId === skillId);
      if (idx > -1) {
        return current.filter(s => s.skillId !== skillId);
      } else {
        return [...current, { skillId, requiredLevel: 'BEGINNER' }];
      }
    });
  }

  function changeSkillLevel(skillId, level) {
    setSelectedSkills(current =>
      current.map(s => s.skillId === skillId ? { ...s, requiredLevel: level } : s)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
      setStatus({ type: 'error', message: 'Vui lòng điền đúng thông tin và sửa lại các lỗi bên dưới.' });
      return;
    }

    setStatus({ type: 'loading', message: isQuestMode ? 'Đang gửi Quest...' : 'Đang gửi thông tin tuyển dụng...' });

    // Format deadline
    let formattedDeadline = null;
    if (formData.deadlineAt) {
      formattedDeadline = new Date(formData.deadlineAt).toISOString().split('.')[0];
    }

    try {
      if (isQuestMode) {
        await createQuest({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.questCategory,
          minReqRs: parseInt(formData.minReqRs) || 0,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          endsAt: formattedDeadline,
        });
        setStatus({ type: 'success', message: 'Đăng Quest thành công! Quest đang chờ Admin duyệt.' });
      } else {
        await createJob({
          title: formData.title.trim(),
          description: formData.description.trim(),
          jobType: formData.jobType,
          category: formData.category,
          specialty: formData.specialty,
          compensation: formData.compensation ? parseFloat(formData.compensation) : null,
          minReqRs: parseInt(formData.minReqRs) || 0,
          location: formData.isRemote ? null : (formData.location || null),
          isRemote: formData.isRemote,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          deadlineAt: formattedDeadline,
          skills: selectedSkills,
        });
        setStatus({ type: 'success', message: 'Đăng tin thành công! Tin tuyển dụng đang ở trạng thái chờ duyệt.' });
      }
      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
        onSuccess();
      }, 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || (isQuestMode ? 'Không thể đăng Quest.' : 'Không thể đăng tin tuyển dụng.') });
    }
  }

  // Filter skills based on search query
  const filteredSkills = availableSkills.filter(s => {
    return s.name.toLowerCase().includes(skillsSearch.toLowerCase());
  });

  return (
    <section className="panel" style={{ borderRadius: '24px', padding: '36px', border: '1px solid var(--line)' }}>
      {/* Title */}
      <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isQuestMode ? 'rgba(255, 122, 26, 0.1)' : 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isQuestMode ? '#ff7a1a' : '#2563eb' }}>
          {isQuestMode ? <Sparkles size={24} /> : <BriefcaseBusiness size={24} />}
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--ink)' }}>
            {isQuestMode ? 'Tạo Quest Sự kiện / Chiến dịch CLB' : 'Đăng tin tuyển dụng mới'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
            {isQuestMode
              ? 'Tạo Quest cho sự kiện / chiến dịch của CLB, thưởng EXP cho ứng viên hoàn thành. Gửi hệ thống chờ Admin xét duyệt.'
              : 'Tạo Job/Gig mới gửi hệ thống chờ Admin xét duyệt.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* SECTION 1: THÔNG TIN VỊ TRÍ TUYỂN DỤNG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '3px solid #2563eb', paddingLeft: '10px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isQuestMode ? '1. Thông tin Quest' : '1. Thông tin vị trí tuyển dụng'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>{isQuestMode ? 'Tiêu đề Quest (từ 10 - 200 ký tự) *' : 'Tiêu đề tuyển dụng (từ 10 - 200 ký tự) *'}</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder={isQuestMode ? 'VD: Ban Tổ chức Sự kiện Chào Tân Sinh Viên 2026' : 'VD: Thực tập sinh Thiết kế UI/UX Mobile App'}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.title ? '1.5px solid #dc2626' : '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  transition: 'border-color 0.15s ease'
                }}
              />
              {errors.title && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>
                  {errors.title}
                </span>
              )}
            </div>

            {isQuestMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Loại hình Quest *</label>
                <select
                  name="questCategory"
                  value={formData.questCategory}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', height: '46px' }}
                  required
                >
                  {QUEST_CATEGORIES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label} (+{opt.exp} EXP)</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Lĩnh vực chính *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', height: '46px' }}
                    required
                  >
                    {Object.keys(CATEGORY_MAP).map(key => (
                      <option key={key} value={key}>{CATEGORY_MAP[key].label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Chuyên ngành chi tiết *</label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', height: '46px' }}
                    required
                  >
                    {(CATEGORY_MAP[formData.category]?.specialties || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Loại hình công việc *</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', height: '46px' }}
                    required
                  >
                    {JOB_TYPES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={13} /> Ứng viên nhận +{JOB_TYPES.find(t => t.value === formData.jobType)?.exp || 300} EXP khi hoàn thành (cao hơn Quest vì đây là kinh nghiệm thực tế với Doanh nghiệp).
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: CHẾ ĐỘ ĐÃI NGỘ & UY TÍN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '3px solid #ff7a1a', paddingLeft: '10px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>2. Chế độ đãi ngộ & Uy tín</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {isQuestMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Phần thưởng khi hoàn thành Quest</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(255, 122, 26, 0.3)',
                  background: 'rgba(255, 122, 26, 0.05)',
                }}>
                  <Award size={18} style={{ color: '#ff7a1a', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ff7a1a' }}>
                    +{QUEST_CATEGORIES.find(c => c.value === formData.questCategory)?.exp || 100} EXP
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>— tự động trao khi Admin xác nhận hoàn thành Quest</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Thù lao / Phụ cấp (VND)</label>
                <input
                  type="text"
                  name="compensation"
                  value={formatVND(formData.compensation)}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="VD: 1.500.000 (để trống nếu thỏa thuận)"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.compensation ? '1.5px solid #dc2626' : '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.compensation && (
                  <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>
                    {errors.compensation}
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Số lượng tuyển (Capacity)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="input-field"
                placeholder="VD: 5 (bỏ trống nếu không giới hạn)"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.capacity ? '1.5px solid #dc2626' : '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)'
                }}
              />
              {errors.capacity && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>
                  {errors.capacity}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} style={{ color: '#ff7a1a' }} />
                <span>{isQuestMode ? 'Hạn kết thúc Quest (Tối thiểu 1 giờ kể từ hiện tại) *' : 'Hạn nộp hồ sơ (Tối thiểu 1 giờ kể từ hiện tại) *'}</span>
              </label>
              <PremiumDateTimePicker
                value={formData.deadlineAt}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, deadlineAt: val }));
                  if (errors.deadlineAt) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.deadlineAt;
                      return next;
                    });
                  }
                }}
                error={errors.deadlineAt}
              />
              {errors.deadlineAt && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} /> {errors.deadlineAt}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Yêu cầu Uy tín tối thiểu</span>
                <span style={{ color: '#2563eb', fontWeight: '800' }}>{formData.minReqRs} RS</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '46px' }}>
                <input
                  type="range"
                  name="minReqRs"
                  min="0"
                  max="100"
                  value={formData.minReqRs}
                  onChange={handleInputChange}
                  style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MÔ TẢ & YÊU CẦU CHI TIẾT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '3px solid #16a34a', paddingLeft: '10px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isQuestMode ? '3. Mô tả chi tiết Quest' : '3. Yêu cầu chi tiết & Mô tả công việc'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {!isQuestMode && (
            <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Địa điểm làm việc</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder={formData.isRemote ? "Làm việc từ xa (Remote)" : "VD: Quận 9, TP. Hồ Chí Minh"}
                  disabled={formData.isRemote}
                  style={{ padding: '12px 16px 12px 36px', borderRadius: '12px', border: '1px solid var(--line)', background: formData.isRemote ? 'var(--surface-soft)' : 'var(--bg)', color: 'var(--ink)', width: '100%', boxSizing: 'border-box' }}
                />
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '46px', marginTop: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)' }}>Làm việc từ xa (Remote)</span>
              </label>
            </div>

            {/* Skills Requirement Block */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>Yêu cầu kỹ năng tuyển dụng</label>
              
              <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={skillsSearch}
                    onChange={(e) => setSkillsSearch(e.target.value)}
                    placeholder="Tìm kiếm kỹ năng (Figma, Java, Excel, Marketing...)"
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Selected skills block */}
                {selectedSkills.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kỹ năng yêu cầu ({selectedSkills.length})</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {selectedSkills.map(sel => {
                        const skillObj = availableSkills.find(s => s.id === sel.skillId);
                        return (
                          <div key={sel.skillId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--card-bg-strong)', border: '1px solid #2563eb', borderRadius: '10px', fontSize: '0.84rem' }}>
                            <strong style={{ color: '#2563eb' }}>{skillObj ? skillObj.name : 'Kỹ năng'}</strong>
                            <select
                              value={sel.requiredLevel}
                              onChange={(e) => changeSkillLevel(sel.skillId, e.target.value)}
                              style={{ border: 'none', background: 'var(--surface-soft)', color: 'var(--ink)', fontSize: '0.8rem', borderRadius: '4px', padding: '2px 4px', fontWeight: 'bold' }}
                            >
                              {SKILL_LEVELS.map(lvl => (
                                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => toggleSkill(sel.skillId)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold', padding: '2px', marginLeft: '4px' }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skill choices list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                  {filteredSkills.map(skill => {
                    const isSelected = selectedSkills.some(s => s.skillId === skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: isSelected ? '#2563eb' : 'var(--line)',
                          background: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--card-bg-strong)',
                          color: isSelected ? '#2563eb' : 'var(--ink)',
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                  {filteredSkills.length === 0 && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: '600' }}>
                      Không tìm thấy kỹ năng "{skillsSearch}". Hệ thống yêu cầu chọn các kỹ năng có sẵn để đối chiếu chính xác với hồ sơ ứng viên.
                    </span>
                  )}
                </div>
              </div>
            </div>

            </>
            )}

            {/* Description TextArea (chung cho Job & Quest) */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)' }}>{isQuestMode ? 'Mô tả chi tiết Quest (nhiệm vụ, quyền lợi, yêu cầu) (tối thiểu 30 ký tự) *' : 'Mô tả chi tiết công việc (JD) (tối thiểu 30 ký tự) *'}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                className="input-field"
                placeholder="Mô tả các công việc cần thực hiện, quyền lợi, yêu cầu ứng tuyển tuyển dụng..."
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.description ? '1.5px solid #dc2626' : '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  resize: 'vertical'
                }}
              />
              {errors.description && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>
                  {errors.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Premium Status Alerts */}
        {status.message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid',
            transition: 'all 0.3s ease',
            background: status.type === 'success'
              ? 'linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(22,163,74,0.02) 100%)'
              : status.type === 'error'
                ? 'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, rgba(220,38,38,0.02) 100%)'
                : 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)',
            borderColor: status.type === 'success'
              ? 'rgba(22,163,74,0.2)'
              : status.type === 'error'
                ? 'rgba(220,38,38,0.2)'
                : 'rgba(37,99,235,0.2)',
            color: status.type === 'success'
              ? '#16a34a'
              : status.type === 'error'
                ? '#dc2626'
                : '#2563eb'
          }}>
            <div style={{ flexShrink: 0 }}>
              {status.type === 'success' && <CheckCircle2 size={22} />}
              {status.type === 'error' && <AlertTriangle size={22} />}
              {status.type === 'loading' && (
                <div className="b2b-loader" style={{ width: '20px', height: '20px', borderTopColor: '#2563eb' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '750', lineHeight: 1.4 }}>{status.message}</p>
            </div>
          </div>
        )}

        {/* Actions Button Block */}
        <div style={{ display: 'flex', gap: '14px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="button primary-button"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #ff7a1a)',
              borderColor: 'transparent',
              padding: '12px 28px',
              fontSize: '0.92rem',
              fontWeight: '800'
            }}
          >
            {isQuestMode ? 'Đăng Quest' : 'Đăng tin tuyển dụng'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="button secondary-button"
            style={{ padding: '12px 28px', fontSize: '0.92rem', fontWeight: '700' }}
          >
            Hủy bỏ
          </button>
        </div>
      </form>
    </section>
  );
}

