import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, FileText, Mail, ArrowLeft,
  HelpCircle, Check, Info
} from 'lucide-react';
import { SiteHeader } from './layout/SiteHeader.jsx';
import { SiteFooter } from './layout/SiteFooter.jsx';
import { WaveBg, WAVE_BASE } from './WaveBg.jsx';

/* ── Emerald / xanh ngọc palette (Matching Homepage NextPlease) ── */
const TEAL = '#0d9488';        // deep teal — logo accent, stat numbers, primary links
const EMERALD = '#10b981';     // brand accent — underlines, headline accent, badges
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const LINE = '#e2efe9';
const MINT = '#e7f7f0';        // pastel section / badge background
const YELLOW = '#facc15';      // warm accent on dark bands
const WHITE = '#ffffff';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

function Badge({ children, onDark = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      background: onDark ? 'rgba(255,255,255,0.14)' : MINT,
      color: onDark ? '#eafff7' : TEAL,
      border: `1px solid ${onDark ? 'rgba(255,255,255,0.22)' : '#cdeee2'}`,
      borderRadius: '999px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 800,
      letterSpacing: '0.02em',
    }}>{children}</span>
  );
}

export function LegalPageLayout({ eyebrow, title, updated, intro, sections }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{
      background: WHITE,
      color: INK,
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      marginTop: '-34px',
      overflowX: 'clip',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        .np-lift { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease; will-change: transform; }
        .np-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 45px rgba(13,148,136,0.12); }
      `}</style>

      {/* 0. SHARED SITE HEADER */}
      <SiteHeader />

      {/* 1. HERO — Emerald wave band with NextPlease typography */}
      <section style={{ background: WAVE_BASE.emerald, width: '100%', position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="emerald" pattern="waves" />
        <div style={{
          width: 'min(1480px, calc(100% - 48px))',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(52px, 7vw, 84px) 20px clamp(48px, 6vw, 72px)',
          textAlign: 'center',
        }}>
          {/* Eyebrow Badge */}
          <div style={{ marginBottom: '18px' }}>
            <Badge onDark={true}>
              <ShieldCheck size={16} />
              {eyebrow || 'PHÁP LÝ & QUY ĐỊNH'}
            </Badge>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: intro ? '0 auto 28px' : '0 auto',
            maxWidth: '48rem',
          }}>
            {title} <span style={{ color: YELLOW }}>nextplease</span>
          </h1>

          {/* Intro Card */}
          {intro && (
            <div style={{
              maxWidth: '48rem',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '24px',
              padding: '24px 32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
              textAlign: 'left',
              display: 'flex',
              gap: '18px',
              alignItems: 'center',
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: MINT,
                color: TEAL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Info size={24} />
              </div>
              <p style={{
                margin: 0,
                color: INK,
                fontSize: '1.02rem',
                lineHeight: 1.65,
                fontWeight: 500,
              }}>
                {intro}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN DOCUMENT BODY — A4 Paper Style (Centered) */}
      <section style={{ background: WAVE_BASE.snow, position: 'relative', overflow: 'hidden', padding: '54px 20px 80px' }}>
        <WaveBg variant="snow" pattern="contour" />
        
        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* A4 Paper Document Container */}
          <article
            style={{
              background: '#ffffff',
              border: `1px solid ${LINE}`,
              borderRadius: '24px',
              padding: 'clamp(32px, 5vw, 64px) clamp(24px, 5vw, 56px)',
              boxShadow: '0 20px 50px rgba(13,148,136,0.07)',
              boxSizing: 'border-box',
            }}
          >
            {/* Document Internal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '24px',
              borderBottom: `2px solid ${LINE}`,
              marginBottom: '36px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: MINT,
                  color: TEAL,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: INK }}>Văn bản Quy định & Điều khoản</div>
                  <div style={{ fontSize: '0.82rem', color: MUTED }}>Hệ thống xác thực uy tín nextplease</div>
                </div>
              </div>

              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: TEAL,
                background: MINT,
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid #cdeee2',
              }}>
                Chính thức & Hiệu lực
              </div>
            </div>

            {/* Continuous Sections */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sections.map((s, idx) => {
                const numStr = String(idx + 1).padStart(2, '0');
                const isLast = idx === sections.length - 1;

                return (
                  <div
                    key={s.id}
                    id={s.id}
                    style={{
                      paddingBottom: isLast ? 0 : '32px',
                      marginBottom: isLast ? 0 : '32px',
                      borderBottom: isLast ? 'none' : `1px solid #edf4f1`,
                      scrollMarginTop: '100px',
                    }}
                  >
                    {/* Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: MINT,
                        color: TEAL,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        border: '1px solid #cdeee2',
                        flexShrink: 0,
                      }}>
                        {numStr}
                      </span>
                      <h2 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: INK,
                        letterSpacing: '-0.02em',
                      }}>
                        {s.h}
                      </h2>
                    </div>

                    {/* Section Paragraphs & Lists */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '44px' }}>
                      {s.p.map((item, pIdx) => {
                        if (typeof item === 'string') {
                          return (
                            <p
                              key={pIdx}
                              style={{
                                margin: 0,
                                fontSize: '0.98rem',
                                color: '#334155',
                                lineHeight: 1.75,
                                fontWeight: 450,
                              }}
                            >
                              {item}
                            </p>
                          );
                        }
                        if (item.list) {
                          return (
                            <div
                              key={pIdx}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                marginTop: '4px',
                                background: '#f8fcf9',
                                border: `1px solid ${LINE}`,
                                borderRadius: '14px',
                                padding: '14px 18px',
                              }}
                            >
                              {item.list.map((li, lIdx) => (
                                <div
                                  key={lIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                  }}
                                >
                                  <span style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '999px',
                                    background: MINT,
                                    color: EMERALD,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '3px',
                                  }}>
                                    <Check size={11} strokeWidth={3} />
                                  </span>
                                  <span style={{
                                    fontSize: '0.95rem',
                                    color: INK,
                                    lineHeight: 1.6,
                                    fontWeight: 500,
                                  }}>
                                    {li}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Document Bottom Footer Note */}
            <div style={{
              marginTop: '36px',
              paddingTop: '20px',
              borderTop: `2px solid ${LINE}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: MUTED,
              fontSize: '0.84rem',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <span>Văn bản có giá trị áp dụng trên toàn bộ hệ thống <strong>nextplease</strong>.</span>
              <span>© 2026 next please. All rights reserved.</span>
            </div>
          </article>
        </div>
      </section>

      {/* 3. FINAL SUPPORT CTA BAND (Emerald wave band) */}
      <section style={{ background: WAVE_BASE.teal, position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="teal" pattern="waves2" />
        <div style={{
          ...INNER,
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(64px, 8vw, 100px) 20px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.9rem, 4vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: '0 auto 16px',
            maxWidth: '36rem',
          }}>
            Bạn có thắc mắc?<br />
            <span style={{ color: YELLOW }}>Chúng tôi luôn sẵn sàng hỗ trợ.</span>
          </h2>
          
          <p style={{
            margin: '0 auto 32px',
            fontSize: '1.08rem',
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1.65,
            maxWidth: '36rem',
          }}>
            Đội ngũ NextPlease cam kết bảo vệ quyền lợi người dùng và duy trì môi trường minh bạch cho cộng đồng sinh viên & doanh nghiệp.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:support@nextplease.vn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fff',
                color: TEAL,
                padding: '14px 28px',
                borderRadius: '999px',
                fontSize: '0.98rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              <Mail size={18} />
              <span>Gửi email tới support@nextplease.vn</span>
            </a>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                padding: '14px 28px',
                borderRadius: '999px',
                fontSize: '0.98rem',
                fontWeight: 800,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
            >
              <ArrowLeft size={18} />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SHARED SITE FOOTER */}
      <SiteFooter />
    </div>
  );
}
