import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, Clock, Building, Shield, Zap, Award, LockKeyhole,
  ArrowLeft, Users, Calendar, Briefcase, CheckCircle2, Star,
} from 'lucide-react';
import { getJobDetail } from '../api/jobApi.js';
import { applyToJob } from '../api/applicationApi.js';
import { applyToQuest } from '../api/questApi.js';
import { getMyPortfolio } from '../api/portfolioApi.js';

const JOB_TYPE_LABELS = {
  INTERNSHIP: 'Thực tập sinh',
  PART_TIME: 'Bán thời gian',
  FREELANCE: 'Freelance',
  EVENT_STAFF: 'Event Staff',
  MICRO_INTERNSHIP: 'Thực tập ngắn hạn',
  SMALL_EVENT: 'Sự kiện nhỏ',
  SCHOOL_CAMPAIGN: 'Chiến dịch trường',
};

const CATEGORY_COLOR = {
  SMALL_EVENT: '#8b5cf6',
  SCHOOL_CAMPAIGN: '#0ea5e9',
  COMPANY_PROJECT: '#f59e0b',
  SHORT_INTERNSHIP: '#10b981',
  FREELANCE_GIG: '#ec4899',
};

export function JobDetailPage() {
  const { id } = useParams();
  const isQuestPage = window.location.pathname.startsWith('/quests/');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [portfolio, setPortfolio] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobDetail(id);
        setJob(data);
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin.');
      } finally {
        setLoading(false);
      }
    }
    load();
    getMyPortfolio().then(setPortfolio).catch(() => {});
  }, [id]);

  async function handleApply() {
    setApplyLoading(true);
    setApplyError('');
    try {
      if (job.postType === 'QUEST' || isQuestPage) {
        await applyToQuest(id, coverNote);
      } else {
        await applyToJob(id, coverNote);
      }
      setApplySuccess('Nộp đơn thành công! Nhà tuyển dụng sẽ liên hệ sớm.');
      setShowApplyModal(false);
    } catch (err) {
      const code = err.errorCode;
      if (code === 'RS_TOO_LOW') setApplyError('RS của bạn chưa đủ để ứng tuyển vị trí này.');
      else if (code === 'PREMIUM_REQUIRED') setApplyError('Vị trí này yêu cầu Premium Pass.');
      else if (code === 'ALREADY_APPLIED') setApplyError('Bạn đã ứng tuyển vị trí này rồi.');
      else setApplyError(err.message || 'Không thể nộp đơn. Vui lòng thử lại.');
    } finally {
      setApplyLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #f8fafc)' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted, #64748b)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          Đang tải...
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #f8fafc)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error || 'Không tìm thấy bài đăng.'}</p>
          <button onClick={() => window.close()} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}>Đóng tab</button>
        </div>
      </div>
    );
  }

  const isQuest = job.postType === 'QUEST' || isQuestPage;
  const accent = isQuest ? '#ff7a1a' : '#2563eb';
  const rs = portfolio?.reputationScore || 0;
  const isLocked = rs < (job.minReqRs || 0);
  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType || (isQuest ? 'Quest' : 'Job');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* ── Hero ── */}
      <div style={{
        background: isQuest
          ? `linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)`
          : `linear-gradient(135deg, #0a0f1e 0%, #0e2156 50%, #0a0f1e 100%)`,
        padding: '40px 0 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Back button */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>
          <button
            onClick={() => window.close()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '600', marginBottom: '24px', padding: 0 }}
          >
            <ArrowLeft size={15} /> Đóng tab
          </button>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px 40px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* Company logo */}
            <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {job.companyLogo
                ? <img src={job.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Building size={32} style={{ color: 'rgba(255,255,255,0.6)' }} />
              }
            </div>
            <div style={{ flex: 1 }}>
              {/* Badge */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '800', color: accent, background: `${accent}25`, border: `1px solid ${accent}50`, padding: '4px 10px', borderRadius: '8px' }}>
                  {isQuest ? <Zap size={11} /> : <Star size={11} />}
                  {isQuest ? 'Quest' : 'Cơ hội việc làm'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                  {typeLabel}
                </span>
              </div>
              <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: '900', color: '#ffffff', lineHeight: 1.15 }}>{job.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <Building size={14} />
                <span>{job.companyName || 'Đối tác'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Overview chips */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '18px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink, #1e293b)' }}>Tổng quan</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {(job.location || job.isRemote) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--line, #e2e8f0)', fontSize: '0.84rem', color: 'var(--ink, #1e293b)', fontWeight: '600' }}>
                  <MapPin size={13} style={{ color: accent }} />
                  {job.isRemote ? 'Remote' : job.location}
                </span>
              )}
              {typeLabel && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--line, #e2e8f0)', fontSize: '0.84rem', color: 'var(--ink, #1e293b)', fontWeight: '600' }}>
                  <Briefcase size={13} style={{ color: accent }} />
                  {typeLabel}
                </span>
              )}
              {(job.deadlineAt || job.endsAt) && (() => {
                const dl = new Date(job.deadlineAt || job.endsAt);
                const isExpired = dl < new Date();
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: `1px solid ${isExpired ? 'rgba(220,38,38,0.3)' : 'var(--line, #e2e8f0)'}`, fontSize: '0.84rem', color: isExpired ? '#dc2626' : 'var(--ink, #1e293b)', fontWeight: '600' }}>
                    <Calendar size={13} style={{ color: isExpired ? '#dc2626' : accent }} />
                    {isQuest ? 'Kết thúc: ' : 'Hạn nộp: '}{dl.toLocaleDateString('vi-VN')}
                    {isExpired && ' · Đã hết hạn'}
                  </span>
                );
              })()}
              {job.capacity && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--line, #e2e8f0)', fontSize: '0.84rem', color: 'var(--ink, #1e293b)', fontWeight: '600' }}>
                  <Users size={13} style={{ color: accent }} />
                  {job.capacity} chỉ tiêu
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--muted, #64748b)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '18px', padding: '24px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink, #1e293b)' }}>Kỹ năng yêu cầu</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.skills.map((s, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '10px', border: `1px solid ${accent}30`, background: `${accent}08`, fontSize: '0.84rem', fontWeight: '700', color: accent }}>
                    <CheckCircle2 size={12} /> {s.skillName || s.name || s}
                    {s.requiredLevel && <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>· {s.requiredLevel}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '18px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink, #1e293b)' }}>Yêu cầu ứng tuyển</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ padding: '14px 20px', borderRadius: '14px', border: `1.5px solid ${isLocked ? '#dc2626' : accent}30`, background: `${isLocked ? '#dc2626' : accent}06` }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>MIN REP SCORE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: isLocked ? '#dc2626' : accent, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {job.minReqRs > 0 ? `${job.minReqRs} RS` : 'Không có'}
                  {isLocked && <LockKeyhole size={14} />}
                </div>
              </div>
              {isQuest && job.expReward > 0 && (
                <div style={{ padding: '14px 20px', borderRadius: '14px', border: '1.5px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>PHẦN THƯỞNG</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} /> +{job.expReward} EXP
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>

          {/* Compensation / Reward */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '18px', padding: '22px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {isQuest ? 'Phần thưởng' : 'Thù lao'}
            </div>
            {isQuest ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Zap size={22} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f59e0b' }}>+{job.expReward || 0} EXP</span>
              </div>
            ) : (
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: accent, marginBottom: '4px' }}>
                {job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Thỏa thuận'}
              </div>
            )}
            <p style={{ margin: '0 0 18px', fontSize: '0.8rem', color: 'var(--muted, #64748b)' }}>
              {isQuest ? 'trao khi hoàn thành Quest' : 'trả khi hoàn thành công việc'}
            </p>

            {/* Deadline */}
            {(job.deadlineAt || job.endsAt) && (() => {
              const dl = new Date(job.deadlineAt || job.endsAt);
              const isExpired = dl < new Date();
              return (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: isExpired ? 'rgba(220,38,38,0.06)' : 'rgba(37,99,235,0.05)', border: `1px solid ${isExpired ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.15)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} style={{ color: isExpired ? '#dc2626' : accent, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isQuest ? 'Kết thúc' : 'Hạn nộp hồ sơ'}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: isExpired ? '#dc2626' : 'var(--ink, #1e293b)', marginTop: '2px' }}>
                      {dl.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {isExpired && <span style={{ fontSize: '0.74rem', marginLeft: '6px', color: '#dc2626', fontWeight: '700' }}>· Đã hết hạn</span>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Apply button */}
            {applySuccess ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#16a34a', fontSize: '0.88rem', fontWeight: '700' }}>
                <CheckCircle2 size={16} /> {applySuccess}
              </div>
            ) : (
              <button
                onClick={() => { setShowApplyModal(true); setApplyError(''); }}
                disabled={isLocked}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                  background: isLocked ? 'var(--muted, #94a3b8)' : `linear-gradient(135deg, ${accent}, ${isQuest ? '#e55a00' : '#1d4ed8'})`,
                  color: '#fff', fontSize: '0.96rem', fontWeight: '800', cursor: isLocked ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isLocked ? 'none' : `0 4px 16px ${accent}40`,
                }}
              >
                {isLocked ? <><LockKeyhole size={15} /> Chưa đủ RS</> : (isQuest ? <><Zap size={15} /> Tham gia Quest</> : <><Briefcase size={15} /> Ứng tuyển ngay</>)}
              </button>
            )}

            {job.minReqRs > 0 && (
              <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: isLocked ? '#dc2626' : 'var(--muted, #64748b)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Shield size={12} /> Yêu cầu {job.minReqRs}+ Reputation Score
                {isLocked && ` (bạn có ${rs} RS)`}
              </p>
            )}
          </div>

          {/* Organizer info */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '18px', padding: '22px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.92rem', fontWeight: '800', color: 'var(--ink, #1e293b)' }}>Thông tin tổ chức</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {job.companyLogo
                  ? <img src={job.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Building size={20} style={{ color: accent }} />
                }
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--ink, #1e293b)' }}>{job.companyName}</strong>
                <span style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <CheckCircle2 size={11} /> Đã xác thực
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <div
          onClick={() => setShowApplyModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--card-bg, #fff)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: '1.15rem', fontWeight: '800', color: 'var(--ink, #1e293b)' }}>
              {isQuest ? '⚡ Xác nhận tham gia Quest' : '📋 Xác nhận ứng tuyển'}
            </h2>

            {/* Profile preview */}
            {portfolio && (
              <div style={{ border: '1px solid var(--line, #e2e8f0)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hồ sơ của bạn</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, #1d4ed8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '1rem', flexShrink: 0 }}>
                    {portfolio.name ? portfolio.name.slice(0, 2).toUpperCase() : 'UV'}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--ink, #1e293b)' }}>{portfolio.name}</strong>
                    {portfolio.headline && <span style={{ fontSize: '0.78rem', color: 'var(--muted, #64748b)' }}>{portfolio.headline}</span>}
                    {portfolio.school && <span style={{ fontSize: '0.76rem', color: accent, fontWeight: '700', display: 'block' }}>🎓 {portfolio.school}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ l: 'RS', v: portfolio.reputationScore, c: '#2563eb' }, { l: 'Level', v: portfolio.currentLevel, c: '#ff7a1a' }, { l: 'EXP', v: portfolio.totalExp, c: '#7c3aed' }].map(s => (
                    <div key={s.l} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', background: `${s.c}08`, borderRadius: '10px', border: `1px solid ${s.c}20` }}>
                      <strong style={{ fontSize: '0.88rem', color: s.c, display: 'block' }}>{s.v}</strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted, #64748b)', fontWeight: '700' }}>{s.l}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="/portfolio/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: `1px solid ${accent}30`, background: `${accent}08`, color: accent, fontSize: '0.84rem', fontWeight: '700', textDecoration: 'none' }}
                >
                  🗂 Xem lại Portfolio của bạn
                </a>
              </div>
            )}

            {/* Cover note */}
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.86rem', fontWeight: '700', color: 'var(--ink, #1e293b)' }}>Giới thiệu bản thân (tùy chọn)</label>
            <textarea
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              placeholder="Chia sẻ lý do bạn muốn ứng tuyển vị trí này..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line, #e2e8f0)', background: 'var(--surface-soft, #f8fafc)', fontSize: '0.88rem', color: 'var(--ink, #1e293b)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
            />

            {applyError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontSize: '0.84rem', fontWeight: '700', marginBottom: '14px' }}>
                {applyError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowApplyModal(false)} disabled={applyLoading} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1px solid var(--line, #e2e8f0)', background: 'var(--bg, #f8fafc)', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem' }}>
                Hủy bỏ
              </button>
              <button onClick={handleApply} disabled={applyLoading} style={{ flex: 2, padding: '11px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${accent}, ${isQuest ? '#e55a00' : '#1d4ed8'})`, color: '#fff', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', boxShadow: `0 4px 14px ${accent}40` }}>
                {applyLoading ? 'Đang nộp...' : (isQuest ? 'Xác nhận tham gia' : 'Xác nhận nộp đơn')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
