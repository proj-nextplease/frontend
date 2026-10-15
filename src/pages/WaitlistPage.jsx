import { useEffect, useState } from 'react';

/**
 * WaitlistPage
 * Renders the high-performance cloned GSAP/Three.js interactive landing page
 * with Fonlio brand identity, scrollytelling narrative, and VIP Early Access form.
 */
export function WaitlistPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = 'FONLIO — Living Portfolio & Bảo chứng năng lực sinh viên';
    // Lock outer body scroll to allow iframe's Lenis scroll engine to handle scrolling seamlessly
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1f1d1d',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      <iframe
        id="fonlioWaitlistFrame"
        src="/waitlist-clone/index.html?v=10"
        title="FONLIO — Living Portfolio & Bảo chứng năng lực sinh viên"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          backgroundColor: '#1f1d1d',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f1d1d',
            color: '#f5e7df',
            fontFamily: 'sans-serif',
            fontSize: '13px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: '2px solid rgba(245, 231, 223, 0.2)',
              borderTopColor: '#34d399',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Đang kết nối không gian Fonlio...</span>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
