import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  BriefcaseBusiness,
  Building,
  GraduationCap,
  Globe,
  FileText,
  Phone,
} from 'lucide-react';
import { registerB2b } from '../api/b2bApi.js';
import { supabase } from '../services/supabaseClient.js';

const companyTypes = [
  { value: 'STARTUP', label: 'Startup / Dự án khởi nghiệp' },
  { value: 'SME', label: 'Doanh nghiệp vừa & nhỏ (SME)' },
  { value: 'AGENCY', label: 'Agency tuyển dụng / Truyền thông' },
  { value: 'ENTERPRISE', label: 'Tập đoàn / Doanh nghiệp lớn' },
];

const mockSchools = [
  { value: '11111111-1111-1111-1111-111111111111', label: 'Trường Đại học FPT TP.HCM' },
  { value: '22222222-2222-2222-2222-222222222222', label: 'Trường Đại học Kinh tế TP.HCM (UEH)' },
  { value: '33333333-3333-3333-3333-333333333333', label: 'Trường Đại học Bách Khoa TP.HCM (HCMUT)' },
  { value: '44444444-4444-4444-4444-444444444444', label: 'Trường Đại học Quốc tế - ĐHQG TP.HCM (IU)' },
];

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  representativeName: '',
  representativePhone: '',
  companyName: '',
  companyType: 'SME',
  description: '',
  websiteUrl: '',
  logoUrl: '',
  documentUrl: '',
  taxCode: '',
  schoolId: '11111111-1111-1111-1111-111111111111',
  fanpageUrl: '',
  advisorName: '',
  advisorPhone: '',
};

export function BusinessRegisterPage() {
  const [activeTab, setActiveTab] = useState('BUSINESS'); // BUSINESS or CLUB
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isCompleted, setIsCompleted] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);

  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

  function isPasswordValid(password) {
    return (
      password.length >= 6 &&
      password.length <= 25 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    );
  }

  const passwordVal = formData.password || '';
  const isPasswordEmpty = passwordVal.length === 0;
  const isLengthValid = passwordVal.length >= 6 && passwordVal.length <= 25;
  const isComplexityValid = /[a-z]/.test(passwordVal) && /[A-Z]/.test(passwordVal) && /\d/.test(passwordVal);

  const lengthStyle = isPasswordEmpty
    ? { color: 'var(--muted)' }
    : isLengthValid
      ? { color: '#16a34a', fontWeight: '600' }
      : { color: '#dc2626', fontWeight: '500' };

  const complexityStyle = isPasswordEmpty
    ? { color: 'var(--muted)' }
    : isComplexityValid
      ? { color: '#16a34a', fontWeight: '600' }
      : { color: '#dc2626', fontWeight: '500' };

  const b2bRegistrationFields = [
    { key: 'email', label: 'Email tài khoản', icon: Mail },
    { key: 'displayName', label: 'Tên hiển thị', icon: UserRound },
    { key: 'password', label: 'Thiết lập mật khẩu', icon: LockKeyhole },
    { key: 'representative', label: 'Người đại diện', icon: UserRound },
    { key: 'companyName', label: activeTab === 'BUSINESS' ? 'Tên doanh nghiệp' : 'Tên Câu lạc bộ', icon: Building },
    { key: 'document', label: activeTab === 'BUSINESS' ? 'Giấy phép kinh doanh' : 'Quyết định thành lập', icon: FileText }
  ];

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function getFieldState(fieldKey) {
    if (fieldKey === 'email') {
      const val = (formData.email || '').trim();
      if (!val) return 'empty';
      return emailPattern.test(val) ? 'valid' : 'invalid';
    }
    if (fieldKey === 'displayName') {
      const val = (formData.displayName || '').trim();
      if (!val) return 'empty';
      return val.length >= 2 ? 'valid' : 'invalid';
    }
    if (fieldKey === 'password') {
      const pass = formData.password || '';
      const confirm = formData.confirmPassword || '';
      if (!pass) return 'empty';
      if (!isPasswordValid(pass)) return 'invalid';
      if (pass !== confirm) return 'invalid';
      return 'valid';
    }
    if (fieldKey === 'representative') {
      const name = (formData.representativeName || '').trim();
      const phone = (formData.representativePhone || '').trim();
      if (!name && !phone) return 'empty';
      return (name.length >= 2 && phone.length >= 8) ? 'valid' : 'invalid';
    }
    if (fieldKey === 'companyName') {
      const val = (formData.companyName || '').trim();
      if (!val) return 'empty';
      return val.length >= 3 ? 'valid' : 'invalid';
    }
    if (fieldKey === 'document') {
      const doc = formData.documentUrl;
      if (activeTab === 'BUSINESS') {
        const tax = (formData.taxCode || '').trim();
        if (!doc && !tax) return 'empty';
        return (doc && tax.length >= 5) ? 'valid' : 'invalid';
      } else {
        const fanpage = (formData.fanpageUrl || '').trim();
        if (!doc && !fanpage) return 'empty';
        return (doc && fanpage.startsWith('http')) ? 'valid' : 'invalid';
      }
    }
    return 'valid';
  }

  const isStepActive = (fieldKey) => {
    if (fieldKey === 'representative') {
      return focusedField === 'representativeName' || focusedField === 'representativePhone';
    }
    if (fieldKey === 'document') {
      return focusedField === 'taxCode' || focusedField === 'schoolId' || focusedField === 'fanpageUrl' || focusedField === 'websiteUrl' || focusedField === 'documentUrl';
    }
    return focusedField === fieldKey;
  };

  // Clear file uploads and status messages when switching active tab
  useEffect(() => {
    setUploadedFileName('');
    setFormData((current) => ({
      ...current,
      documentUrl: '',
    }));
    setStatus({ type: 'idle', message: '' });
  }, [activeTab]);

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - bounds.top}px`);
    event.currentTarget.style.setProperty('--cursor-opacity', '1');
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.setProperty('--cursor-opacity', '0');
  }

  function updateField(event) {
    const { name, value } = event.target;
    if (name === 'representativePhone' || name === 'advisorPhone') {
      const filteredValue = value.replace(/\D/g, '');
      setFormData((current) => ({ ...current, [name]: filteredValue }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  }

  // Handle mock file upload for GPKD / red stamp
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Kích thước tệp quá lớn (yêu cầu dưới 2MB để chạy thử nghiệm).' });
        return;
      }
      setUploadedFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((current) => ({
          ...current,
          documentUrl: reader.result,
        }));
        setStatus({ type: 'success', message: `Đã chuẩn bị tệp minh chứng: ${file.name}` });
      };
      reader.onerror = () => {
        setStatus({ type: 'error', message: 'Không thể đọc tệp này.' });
      };
      reader.readAsDataURL(file);
    }
  }

  function validateForm() {
    if (!formData.email || !formData.password || !formData.displayName) {
      return 'Vui lòng điền đầy đủ các thông tin đăng nhập bắt buộc.';
    }
    if (!isPasswordValid(formData.password)) {
      return 'Mật khẩu phải từ 6-25 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Mật khẩu nhập lại không khớp.';
    }
    if (!formData.representativeName || !formData.representativePhone) {
      return 'Vui lòng cung cấp đầy đủ thông tin người đại diện liên hệ.';
    }
    if (activeTab === 'BUSINESS') {
      if (!formData.companyName || !formData.taxCode || !formData.documentUrl) {
        return 'Vui lòng điền Tên doanh nghiệp, Mã số thuế và upload Giấy phép kinh doanh.';
      }
    } else {
      if (!formData.companyName || !formData.documentUrl || !formData.fanpageUrl) {
        return 'Vui lòng điền Tên CLB, Link Fanpage và upload Quyết định thành lập.';
      }
    }
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setStatus({ type: 'error', message: errorMsg });
      return;
    }

    setStatus({ type: 'loading', message: 'Đang gửi hồ sơ đăng ký đối tác lên hệ thống...' });

    // Construct request body
    const payload = {
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName,
      representativeName: formData.representativeName,
      representativePhone: formData.representativePhone,
      companyName: formData.companyName,
      companyType: activeTab === 'BUSINESS' ? formData.companyType : 'CLUB',
      description: formData.description,
      websiteUrl: formData.websiteUrl,
      logoUrl: formData.logoUrl || 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=300&q=80',
      documentUrl: formData.documentUrl,
      taxCode: activeTab === 'BUSINESS' ? formData.taxCode : null,
      schoolId: activeTab === 'CLUB' ? formData.schoolId : null,
      fanpageUrl: activeTab === 'CLUB' ? formData.fanpageUrl : null,
      advisorContact: activeTab === 'CLUB' && formData.advisorName ? JSON.stringify({
        name: formData.advisorName,
        phone: formData.advisorPhone,
      }) : null,
    };

    if (!isSupabaseConfigured) {
      setStatus({ type: 'success', message: 'Đăng ký mô phỏng thành công (Dev mode).' });
      setIsCompleted(true);
      return;
    }

    try {
      await registerB2b(payload);
      setStatus({ type: 'success', message: 'Hồ sơ của bạn đã được tiếp nhận!' });
      setIsCompleted(true);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Không thể đăng ký tài khoản B2B.',
      });
    }
  }

  return (
    <section
      className="candidate-register-page interactive-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="register-hero">
        <div className="register-hero-copy">
          <Link className="portfolio-back-link" to="/businesses">
            Quay về trang đối tác
          </Link>
          <p className="eyebrow" style={{ color: '#ff7a1a' }}>B2B & Organizer Registration</p>
          <h1 style={{ background: 'linear-gradient(to right, #2563eb, #ff7a1a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Đăng ký tài khoản đối tác tuyển dụng
          </h1>
        </div>
      </section>

      <section className={`register-workspace ${isCompleted ? 'step-3' : ''}`}>
        {!isCompleted ? (
          <aside className="register-field-rail" aria-label="Registration progress">
            <div className="field-rail-line" aria-hidden="true" />
            {b2bRegistrationFields.map((field, index) => {
              const Icon = field.icon;
              const fieldState = getFieldState(field.key);
              const isActive = isStepActive(field.key);
              return (
                <article
                  className={`field-rail-item ${isActive ? 'active' : ''} ${fieldState}`}
                  key={field.key}
                >
                  <span className="field-rail-dot">{index + 1}</span>
                  <Icon size={22} />
                  <div>
                    <strong>{field.label}</strong>
                    <p>
                      {fieldState === 'valid'
                        ? 'Đã có dữ liệu'
                        : fieldState === 'invalid'
                          ? 'Cần kiểm tra lại'
                          : 'Đang chờ nhập'}
                    </p>
                  </div>
                </article>
              );
            })}
          </aside>
        ) : null}

        {isCompleted ? (
          <div className="candidate-complete-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="candidate-complete-icon" style={{ backgroundColor: 'rgba(255,122,26,0.1)', color: '#ff7a1a' }}>
              <CheckCircle2 size={42} />
            </div>
            <p className="eyebrow">Đăng ký hoàn tất</p>
            <h2>Hồ sơ của bạn đã được gửi cho Quản trị viên!</h2>
            <p style={{ maxWidth: '580px', margin: '16px auto 32px' }}>
              Chúng tôi sẽ tiến hành đối chiếu Mã số thuế / Quyết định thành lập CLB của bạn trong vòng 24 giờ làm việc. 
              Bạn có thể tiến hành đăng nhập ngay bây giờ để kiểm tra tiến trình phê duyệt hồ sơ.
            </p>
            <div className="register-action-row complete-actions" style={{ justifyContent: 'center' }}>
              <Link className="button primary-button" to="/business/login" style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
                Đăng nhập đối tác ngay
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <form className="register-form-panel" onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="register-form-header">
              <Sparkles size={22} style={{ color: '#ff7a1a' }} />
              <div>
                <p className="eyebrow">Đăng ký thành viên</p>
                <h2>Thông tin tài khoản đối tác</h2>
              </div>
            </div>

            {/* Premium Pill Tab Selector */}
            <div className="b2b-tabs-pill">
              <button
                type="button"
                className={`b2b-tab-btn ${activeTab === 'BUSINESS' ? 'active business' : ''}`}
                onClick={() => setActiveTab('BUSINESS')}
              >
                <BriefcaseBusiness size={18} />
                Doanh nghiệp
              </button>
              <button
                type="button"
                className={`b2b-tab-btn ${activeTab === 'CLUB' ? 'active club' : ''}`}
                onClick={() => setActiveTab('CLUB')}
              >
                <GraduationCap size={18} />
                CLB / Tổ chức sinh viên
              </button>
            </div>

            {/* Form Fields Section */}
            <div className="register-divider" style={{ margin: '16px 0' }}>
              <span>Thông tin tài khoản đại diện</span>
            </div>

            <div className="register-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label className={focusedField === 'email' ? 'active' : ''}>
                <Mail size={18} />
                <input
                  name="email"
                  required
                  maxLength={300}
                  onChange={updateField}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Email đăng nhập (ví dụ: hr@fpt.com)"
                  type="email"
                  value={formData.email}
                />
              </label>
              <label className={focusedField === 'displayName' ? 'active' : ''}>
                <UserRound size={18} />
                <input
                  name="displayName"
                  required
                  maxLength={150}
                  onChange={updateField}
                  onFocus={() => setFocusedField('displayName')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Tên hiển thị (ví dụ: FPT Talent)"
                  type="text"
                  value={formData.displayName}
                />
              </label>
              <label className={focusedField === 'password' ? 'active' : ''}>
                <LockKeyhole size={18} />
                <input
                  name="password"
                  required
                  onChange={updateField}
                  onFocus={() => {
                    setFocusedField('password');
                    setShowPasswordGuide(true);
                  }}
                  onBlur={() => {
                    setFocusedField('');
                    setShowPasswordGuide(false);
                  }}
                  placeholder="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                />
                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </label>
              <label className={focusedField === 'confirmPassword' ? 'active' : ''}>
                <ShieldCheck size={18} />
                <input
                  name="confirmPassword"
                  required
                  onChange={updateField}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Nhập lại mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                />
                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </label>
            </div>

            {showPasswordGuide || focusedField === 'password' ? (
              <div className="password-guide" style={{ transition: 'all 0.3s ease', marginTop: '12px' }}>
                <p>Hướng dẫn tạo mật khẩu</p>
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                  <li style={{ ...lengthStyle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{isPasswordEmpty ? '•' : isLengthValid ? '✓' : '✗'}</span>
                    Mật khẩu từ 6 đến 25 ký tự
                  </li>
                  <li style={{ ...complexityStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{isPasswordEmpty ? '•' : isComplexityValid ? '✓' : '✗'}</span>
                    Bao gồm chữ hoa, chữ thường và ký tự số
                  </li>
                </ul>
              </div>
            ) : null}

            <div className="register-divider" style={{ margin: '24px 0 16px' }}>
              <span>Thông tin liên hệ người đại diện</span>
            </div>

            <div className="register-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label className={focusedField === 'representativeName' ? 'active' : ''}>
                <UserRound size={18} />
                <input
                  name="representativeName"
                  required
                  maxLength={140}
                  onChange={updateField}
                  onFocus={() => setFocusedField('representativeName')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Họ và tên người đại diện"
                  type="text"
                  value={formData.representativeName}
                />
              </label>
              <label className={focusedField === 'representativePhone' ? 'active' : ''}>
                <Phone size={18} />
                <input
                  name="representativePhone"
                  required
                  maxLength={18}
                  onChange={updateField}
                  onFocus={() => setFocusedField('representativePhone')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Số điện thoại liên hệ"
                  type="tel"
                  value={formData.representativePhone}
                />
              </label>
            </div>

            <div className="register-divider" style={{ margin: '24px 0 16px' }}>
              <span>Thông tin Tổ chức / Đơn vị</span>
            </div>

            <div className="register-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ gridColumn: 'span 2' }} className={focusedField === 'companyName' ? 'active' : ''}>
                <Building size={18} />
                <input
                  name="companyName"
                  required
                  maxLength={180}
                  onChange={updateField}
                  onFocus={() => setFocusedField('companyName')}
                  onBlur={() => setFocusedField('')}
                  placeholder={activeTab === 'BUSINESS' ? 'Tên doanh nghiệp chính thức' : 'Tên Câu lạc bộ / Tổ chức'}
                  type="text"
                  value={formData.companyName}
                />
              </label>

              {activeTab === 'BUSINESS' ? (
                <>
                  <label className={focusedField === 'companyType' ? 'active' : ''}>
                    <Building size={18} />
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={updateField}
                      onFocus={() => setFocusedField('companyType')}
                      onBlur={() => setFocusedField('')}
                    >
                      {companyTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className={focusedField === 'taxCode' ? 'active' : ''}>
                    <FileText size={18} />
                    <input
                      name="taxCode"
                      required
                      maxLength={45}
                      onChange={updateField}
                      onFocus={() => setFocusedField('taxCode')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Mã số thuế doanh nghiệp (MST)"
                      type="text"
                      value={formData.taxCode}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label style={{ gridColumn: 'span 2' }} className={focusedField === 'schoolId' ? 'active' : ''}>
                    <GraduationCap size={18} />
                    <select
                      name="schoolId"
                      value={formData.schoolId}
                      onChange={updateField}
                      onFocus={() => setFocusedField('schoolId')}
                      onBlur={() => setFocusedField('')}
                    >
                      {mockSchools.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ gridColumn: 'span 2' }} className={focusedField === 'fanpageUrl' ? 'active' : ''}>
                    <Globe size={18} />
                    <input
                      name="fanpageUrl"
                      required
                      onChange={updateField}
                      onFocus={() => setFocusedField('fanpageUrl')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Link Fanpage Facebook chính thức của CLB (hoặc Website)"
                      type="url"
                      value={formData.fanpageUrl}
                    />
                  </label>
                </>
              )}

              <label style={{ gridColumn: 'span 2' }} className={focusedField === 'websiteUrl' ? 'active' : ''}>
                <Globe size={18} />
                <input
                  name="websiteUrl"
                  onChange={updateField}
                  onFocus={() => setFocusedField('websiteUrl')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Website chính thức (nếu có)"
                  type="url"
                  value={formData.websiteUrl}
                />
              </label>

              {/* Styled Drag & Drop File Upload Dropzone */}
              <label htmlFor="b2b-file-input" className={`b2b-upload-zone ${activeTab === 'CLUB' ? 'club' : ''}`}>
                <div className="b2b-upload-icon">
                  <FileText size={24} />
                </div>
                <div className="b2b-upload-details">
                  <span className="b2b-upload-title">
                    {activeTab === 'BUSINESS' ? 'Giấy phép đăng ký kinh doanh' : 'Quyết định thành lập / Giấy xác nhận Đoàn trường'}
                  </span>
                  <span className="b2b-upload-desc">
                    {activeTab === 'BUSINESS'
                      ? 'Bắt buộc tải lên tệp ảnh (JPEG/PNG) hoặc PDF của Giấy chứng nhận Đăng ký Doanh nghiệp để kiểm duyệt mã số thuế.'
                      : 'Bắt buộc tải lên ảnh chụp Quyết định thành lập CLB hoặc Giấy xác nhận có đóng dấu đỏ để kiểm chứng tổ chức thật.'}
                  </span>
                </div>
                <input
                  id="b2b-file-input"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                {uploadedFileName && (
                  <div className="b2b-file-indicator">
                    <CheckCircle2 size={16} />
                    <span>Đã chọn: {uploadedFileName}</span>
                  </div>
                )}
              </label>
            </div>

            {activeTab === 'CLUB' && (
              <>
                <div className="register-divider" style={{ margin: '24px 0 16px' }}>
                  <span>Thông tin Giảng viên cố vấn / Người bảo trợ (Tùy chọn)</span>
                </div>
                <div className="register-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <label className={focusedField === 'advisorName' ? 'active' : ''}>
                    <UserRound size={18} />
                    <input
                      name="advisorName"
                      onChange={updateField}
                      onFocus={() => setFocusedField('advisorName')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Họ tên Giảng viên cố vấn"
                      type="text"
                      value={formData.advisorName}
                    />
                  </label>
                  <label className={focusedField === 'advisorPhone' ? 'active' : ''}>
                    <Phone size={18} />
                    <input
                      name="advisorPhone"
                      onChange={updateField}
                      onFocus={() => setFocusedField('advisorPhone')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Số điện thoại / Email cố vấn"
                      type="text"
                      value={formData.advisorPhone}
                    />
                  </label>
                </div>
              </>
            )}

            {status.message ? (
              <div className={`register-status ${status.type === 'loading' ? 'loading' : status.type}`}>
                <AlertCircle size={18} />
                <p>{status.message}</p>
              </div>
            ) : null}

            <div className="register-action-row" style={{ marginTop: '24px' }}>
              <button
                className="button primary-button"
                disabled={status.type === 'loading'}
                type="submit"
                style={{ background: activeTab === 'BUSINESS' ? '#2563eb' : '#ff7a1a', borderColor: 'transparent' }}
              >
                {status.type === 'loading' ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ đăng ký đối tác'}
                <ArrowRight size={18} />
              </button>
              <Link className="text-link" to="/business/login">
                Tôi đã có tài khoản đối tác
              </Link>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
