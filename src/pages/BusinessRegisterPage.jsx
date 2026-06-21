/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Globe,
  GraduationCap,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { registerB2b } from '../api/b2bApi.js';
import { supabase } from '../services/supabaseClient.js';
import { BusinessAuthPanel } from '../components/BusinessAuthPanel.jsx';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const INK = '#101828';
const MUTED = '#5b6472';
const BLUE = '#2563eb';
const NAVY = '#0d1b33';
const LINE = '#e3e8ef';
const WHITE = '#ffffff';

const FIELD = {
  width: '100%', padding: '13px 14px 13px 42px', borderRadius: '10px',
  border: `1.5px solid ${LINE}`, background: WHITE, color: INK,
  fontSize: '0.94rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};
const ICON = { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex', pointerEvents: 'none' };
const EYE_BTN = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' };

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

function Divider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '26px 0 16px' }}>
      <span style={{ fontSize: '0.74rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', color: NAVY, whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', background: LINE }} />
    </div>
  );
}

const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' };

export function BusinessRegisterPage() {
  const [activeTab, setActiveTab] = useState('BUSINESS'); // BUSINESS or CLUB
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isCompleted, setIsCompleted] = useState(false);
  const [agreeProvideTaxInfo, setAgreeProvideTaxInfo] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);

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

  const lengthStyle = isPasswordEmpty ? { color: MUTED } : isLengthValid ? { color: '#16a34a', fontWeight: '600' } : { color: '#dc2626', fontWeight: '500' };
  const complexityStyle = isPasswordEmpty ? { color: MUTED } : isComplexityValid ? { color: '#16a34a', fontWeight: '600' } : { color: '#dc2626', fontWeight: '500' };

  // Clear file uploads and status messages when switching active tab
  useEffect(() => {
    setUploadedFileName('');
    setAgreeProvideTaxInfo(false);
    setFormData((current) => ({ ...current, documentUrl: '', taxCode: '' }));
    setStatus({ type: 'idle', message: '' });
  }, [activeTab]);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === 'representativePhone' || name === 'advisorPhone') {
      const filteredValue = value.replace(/\D/g, '');
      setFormData((current) => ({ ...current, [name]: filteredValue }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Kích thước tệp quá lớn (yêu cầu dưới 2MB).' });
        return;
      }
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((current) => ({ ...current, documentUrl: reader.result }));
        setStatus({ type: 'success', message: `Đã chuẩn bị tệp minh chứng: ${file.name}` });
      };
      reader.onerror = () => {
        setStatus({ type: 'error', message: 'Không thể đọc tệp này.' });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleUploadZoneClick(event) {
    if (event.target.id === 'b2b-file-input') return;
    event.preventDefault();
    setShowUploadConfirm(true);
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
    const repPhoneClean = (formData.representativePhone || '').replace(/\D/g, '');
    if (repPhoneClean.length < 10 || repPhoneClean.length > 11) {
      return 'Số điện thoại liên hệ của người đại diện phải từ 10 đến 11 số.';
    }
    if (activeTab === 'BUSINESS') {
      if (!agreeProvideTaxInfo) {
        return 'Bạn phải đồng ý cung cấp thông tin mã số thuế doanh nghiệp (MST).';
      }
      if (!formData.companyName || !formData.taxCode || !formData.documentUrl) {
        return 'Vui lòng điền Tên doanh nghiệp, Mã số thuế và upload Giấy phép kinh doanh.';
      }
    } else {
      if (!formData.companyName || !formData.documentUrl || !formData.fanpageUrl) {
        return 'Vui lòng điền Tên CLB, Link Fanpage và upload Quyết định thành lập.';
      }
      if (formData.advisorPhone) {
        const advPhoneClean = formData.advisorPhone.replace(/\D/g, '');
        if (advPhoneClean.length < 10 || advPhoneClean.length > 11) {
          return 'Số điện thoại của Giảng viên cố vấn phải từ 10 đến 11 số.';
        }
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

  const isBusiness = activeTab === 'BUSINESS';

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)', alignItems: 'start', background: WHITE, color: INK, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInL { from { opacity:0; transform: translateX(-48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @keyframes npSpin { to { transform: rotate(360deg); } }
        .np-spin { animation: npSpin 0.8s linear infinite; }
        .np-bizf:focus { border-color:${NAVY} !important; box-shadow:0 0 0 3px rgba(13,27,51,0.1); }
        @media (max-width: 980px){ .np-auth{ grid-template-columns: 1fr !important; } .np-biz-sticky{ position: static !important; height: auto !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — brand panel (sticky) */}
      <div className="np-biz-sticky" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <BusinessAuthPanel animation="npBrandInL" />
      </div>

      {/* RIGHT — form */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'clamp(32px, 4vw, 64px) clamp(24px, 4vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {!isCompleted ? (
            <>
              <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: BLUE, margin: '0 0 10px' }}>Đăng ký đối tác · B2B & Organizer</p>
              <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 8px' }}>Tạo tài khoản tổ chức</h2>
              <p style={{ fontSize: '0.96rem', color: MUTED, margin: '0 0 22px', lineHeight: 1.55 }}>Đăng ký để đăng tin, mở Quest và tiếp cận ứng viên đã được xác thực năng lực.</p>

              <div style={{ padding: '13px 16px', borderRadius: '12px', background: '#f3f6fb', border: `1px solid ${LINE}`, fontSize: '0.85rem', lineHeight: 1.55, color: MUTED, marginBottom: '24px' }}>
                <strong style={{ color: INK }}>Đã có lời mời từ tổ chức?</strong> Mở liên kết trong email mời rồi <Link to="/business/login" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>đăng nhập</Link> để tham gia — không cần đăng ký mới.
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Tab selector */}
                <div style={{ display: 'flex', gap: '6px', padding: '5px', background: '#eef1f6', borderRadius: '12px', marginBottom: '8px' }}>
                  {[
                    { key: 'BUSINESS', label: 'Doanh nghiệp', icon: <BriefcaseBusiness size={18} /> },
                    { key: 'CLUB', label: 'CLB / Tổ chức sinh viên', icon: <GraduationCap size={18} /> },
                  ].map(({ key, label, icon }) => {
                    const on = activeTab === key;
                    return (
                      <button key={key} type="button" onClick={() => setActiveTab(key)}
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', background: on ? WHITE : 'transparent', color: on ? NAVY : MUTED, boxShadow: on ? '0 2px 8px rgba(13,27,51,0.1)' : 'none', transition: 'all 0.2s' }}>
                        {icon}{label}
                      </button>
                    );
                  })}
                </div>

                <Divider>Thông tin tài khoản đại diện</Divider>
                <div style={twoCol}>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><Mail size={18} /></span>
                    <input className="np-bizf" name="email" required maxLength={300} type="email" value={formData.email} onChange={updateField} placeholder="Email đăng nhập (vd: hr@fpt.com)" style={FIELD} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><UserRound size={18} /></span>
                    <input className="np-bizf" name="displayName" required maxLength={150} type="text" value={formData.displayName} onChange={updateField} placeholder="Tên hiển thị (vd: FPT Talent)" style={FIELD} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><LockKeyhole size={18} /></span>
                    <input className="np-bizf" name="password" required type={showPassword ? 'text' : 'password'} value={formData.password} onChange={updateField}
                      onFocus={() => setShowPasswordGuide(true)} onBlur={() => setShowPasswordGuide(false)}
                      onPaste={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}
                      placeholder="Mật khẩu" style={{ ...FIELD, paddingRight: '42px' }} />
                    <button type="button" style={EYE_BTN} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><ShieldCheck size={18} /></span>
                    <input className="np-bizf" name="confirmPassword" required type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={updateField}
                      onPaste={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}
                      placeholder="Nhập lại mật khẩu" style={{ ...FIELD, paddingRight: '42px' }} />
                    <button type="button" style={EYE_BTN} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                  </div>
                </div>

                {showPasswordGuide ? (
                  <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '10px', background: '#f7f9fc', border: `1px solid ${LINE}` }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: '700', color: INK }}>Hướng dẫn tạo mật khẩu</p>
                    <div style={{ ...lengthStyle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem' }}>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{isPasswordEmpty ? '•' : isLengthValid ? '✓' : '✗'}</span>
                      Mật khẩu từ 6 đến 25 ký tự
                    </div>
                    <div style={{ ...complexityStyle, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{isPasswordEmpty ? '•' : isComplexityValid ? '✓' : '✗'}</span>
                      Bao gồm chữ hoa, chữ thường và ký tự số
                    </div>
                  </div>
                ) : null}

                <Divider>Thông tin liên hệ người đại diện</Divider>
                <div style={twoCol}>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><UserRound size={18} /></span>
                    <input className="np-bizf" name="representativeName" required maxLength={140} type="text" value={formData.representativeName} onChange={updateField} placeholder="Họ và tên người đại diện" style={FIELD} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><Phone size={18} /></span>
                    <input className="np-bizf" name="representativePhone" required maxLength={11} type="tel" value={formData.representativePhone} onChange={updateField} placeholder="Số điện thoại liên hệ" style={FIELD} />
                  </div>
                </div>

                <Divider>Thông tin {isBusiness ? 'Doanh nghiệp' : 'Câu lạc bộ'}</Divider>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><Building size={18} /></span>
                    <input className="np-bizf" name="companyName" required maxLength={180} type="text" value={formData.companyName} onChange={updateField} placeholder={isBusiness ? 'Tên doanh nghiệp chính thức' : 'Tên Câu lạc bộ / Tổ chức'} style={FIELD} />
                  </div>

                  {isBusiness ? (
                    <div style={twoCol}>
                      <div style={{ position: 'relative' }}>
                        <span style={ICON}><Building size={18} /></span>
                        <select className="np-bizf" name="companyType" value={formData.companyType} onChange={updateField} style={{ ...FIELD, appearance: 'none', cursor: 'pointer' }}>
                          {companyTypes.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ position: 'relative', opacity: agreeProvideTaxInfo ? 1 : 0.55 }}>
                          <span style={ICON}><FileText size={18} /></span>
                          <input className="np-bizf" name="taxCode" required={agreeProvideTaxInfo} disabled={!agreeProvideTaxInfo} maxLength={45} type="text" value={formData.taxCode} onChange={updateField}
                            placeholder={agreeProvideTaxInfo ? 'Mã số thuế (MST)' : 'MST (cần đồng ý)'}
                            style={{ ...FIELD, cursor: agreeProvideTaxInfo ? 'text' : 'not-allowed' }} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: MUTED, userSelect: 'none', paddingLeft: '2px' }}>
                          <input type="checkbox" checked={agreeProvideTaxInfo} onChange={(e) => {
                            const checked = e.target.checked;
                            setAgreeProvideTaxInfo(checked);
                            if (!checked) setFormData((current) => ({ ...current, taxCode: '' }));
                          }} style={{ width: '14px', height: '14px', accentColor: BLUE, cursor: 'pointer' }} />
                          <span>Đồng ý cung cấp thông tin MST</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: 'relative' }}>
                        <span style={ICON}><GraduationCap size={18} /></span>
                        <select className="np-bizf" name="schoolId" value={formData.schoolId} onChange={updateField} style={{ ...FIELD, appearance: 'none', cursor: 'pointer' }}>
                          {mockSchools.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={ICON}><Globe size={18} /></span>
                        <input className="np-bizf" name="fanpageUrl" required type="url" value={formData.fanpageUrl} onChange={updateField} placeholder="Link Fanpage Facebook chính thức của CLB (hoặc Website)" style={FIELD} />
                      </div>
                    </>
                  )}

                  <div style={{ position: 'relative' }}>
                    <span style={ICON}><Globe size={18} /></span>
                    <input className="np-bizf" name="websiteUrl" type="url" value={formData.websiteUrl} onChange={updateField} placeholder="Website chính thức (nếu có)" style={FIELD} />
                  </div>

                  {/* Upload zone */}
                  <div onClick={handleUploadZoneClick}
                    style={{ cursor: 'pointer', border: `1.5px dashed ${uploadedFileName ? BLUE : LINE}`, borderRadius: '12px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center', background: uploadedFileName ? 'rgba(37,99,235,0.04)' : '#fafbfd', transition: 'all 0.2s' }}>
                    <div style={{ flexShrink: 0, width: '46px', height: '46px', borderRadius: '11px', background: uploadedFileName ? BLUE : '#eef1f6', color: uploadedFileName ? WHITE : NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: INK }}>
                        {isBusiness ? 'Giấy phép đăng ký kinh doanh' : 'Quyết định thành lập / Giấy xác nhận Đoàn trường'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: MUTED, lineHeight: 1.5, marginTop: '2px' }}>
                        {isBusiness
                          ? 'Bắt buộc tải lên ảnh (JPEG/PNG) hoặc PDF Giấy phép Đăng ký Doanh nghiệp (dưới 2MB).'
                          : 'Bắt buộc tải lên ảnh Quyết định thành lập CLB / Giấy xác nhận có dấu đỏ (dưới 2MB).'}
                      </div>
                      {uploadedFileName ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.82rem', fontWeight: '700', color: BLUE }}>
                          <CheckCircle2 size={16} /> Đã chọn: {uploadedFileName}
                        </div>
                      ) : null}
                    </div>
                    <input id="b2b-file-input" type="file" required accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} onClick={(e) => e.stopPropagation()} />
                  </div>
                </div>

                {!isBusiness ? (
                  <>
                    <Divider>Giảng viên cố vấn / Người bảo trợ (tùy chọn)</Divider>
                    <div style={twoCol}>
                      <div style={{ position: 'relative' }}>
                        <span style={ICON}><UserRound size={18} /></span>
                        <input className="np-bizf" name="advisorName" type="text" value={formData.advisorName} onChange={updateField} placeholder="Họ tên Giảng viên cố vấn" style={FIELD} />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={ICON}><Phone size={18} /></span>
                        <input className="np-bizf" name="advisorPhone" maxLength={11} type="tel" value={formData.advisorPhone} onChange={updateField} placeholder="Số điện thoại cố vấn" style={FIELD} />
                      </div>
                    </div>
                  </>
                ) : null}

                <AuthStatusCard
                  status={status}
                  title={status.type === 'error' ? 'Chưa thể gửi hồ sơ' : undefined}
                  onClose={() => setStatus({ type: 'idle', message: '' })}
                  style={{ marginTop: '20px' }}
                />

                <button type="submit" disabled={status.type === 'loading'}
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '10px', background: NAVY, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: status.type === 'loading' ? 'default' : 'pointer', opacity: status.type === 'loading' ? 0.7 : 1, marginTop: '24px' }}>
                  {status.type === 'loading' ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ đăng ký đối tác'} <ArrowRight size={18} />
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.92rem', color: MUTED, margin: '20px 0 0' }}>
                  Tôi đã có tài khoản đối tác? <Link to="/business/login" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vh, 90px) 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(22,163,74,0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
                <CheckCircle2 size={40} />
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: BLUE, margin: '0 0 8px' }}>Đăng ký hoàn tất</p>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 14px' }}>Hồ sơ của bạn đã được gửi đi!</h2>
              <p style={{ maxWidth: '460px', margin: '0 auto 30px', color: MUTED, fontSize: '0.96rem', lineHeight: 1.6 }}>
                Chúng tôi sẽ đối chiếu Mã số thuế / Quyết định thành lập CLB trong vòng 24 giờ làm việc. Bạn có thể đăng nhập ngay để theo dõi tiến trình phê duyệt.
              </p>
              <Link to="/business/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 26px', borderRadius: '10px', background: NAVY, color: WHITE, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
                Đăng nhập đối tác ngay <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Upload Confirmation Modal ── */}
      {showUploadConfirm && (
        <div className="modal-overlay" onClick={() => setShowUploadConfirm(false)}>
          <div className="modal-card" style={{ maxWidth: '480px', width: '90%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE }}>
                <FileText size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: INK }}>Xác nhận tải lên minh chứng</h3>
                <p style={{ margin: '4px 0 0', color: MUTED, fontSize: '0.82rem' }}>
                  {isBusiness ? 'Hồ sơ xác thực doanh nghiệp' : 'Hồ sơ quyết định thành lập CLB'}
                </p>
              </div>
              <button type="button" onClick={() => setShowUploadConfirm(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', color: MUTED, lineHeight: '1.6', marginBottom: '20px' }}>
              Bạn chuẩn bị mở trình chọn tệp để tải lên tài liệu xác thực. Vui lòng đảm bảo tệp là ảnh chụp rõ nét hoặc file PDF chính thức của doanh nghiệp/tổ chức, với dung lượng dưới 2MB.
            </div>

            <div className="modal-footer" style={{ gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="button secondary-button" onClick={() => setShowUploadConfirm(false)}>
                Hủy bỏ
              </button>
              <button type="button" className="button primary-button"
                style={{ background: NAVY, borderColor: 'transparent', color: WHITE }}
                onClick={() => {
                  setShowUploadConfirm(false);
                  const inputEl = document.getElementById('b2b-file-input');
                  if (inputEl) inputEl.click();
                }}>
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
