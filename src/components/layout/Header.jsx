import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sparkles, Sun, Compass, WalletCards, FileText, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabaseClient.js';
import { getMyPortfolio } from '../../api/portfolioApi.js';
import { logout } from '../../api/httpClient.js';
import { useTheme } from '../../lib/themeContext.jsx';

export function Header() {
  const navigate = useNavigate();
  const { isDark: isDarkTheme, toggleTheme } = useTheme();

  const [session, setSession] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Auth listener & portfolio loading
  useEffect(() => {
    let isMounted = true;

    async function loadPortfolio() {
      try {
        const data = await getMyPortfolio();
        if (isMounted) {
          setPortfolio(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin portfolio cho header:', err);
      }
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (isMounted) {
          setSession(session);
          if (session) {
            loadPortfolio();
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setSession(session);
          if (session) {
            loadPortfolio();
          } else {
            setPortfolio(null);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openPortfolioPreview = () => {
    if (!portfolio) return;
    const previewId = String(Date.now());
    const previewPayload = {
      avatar: portfolio.avatar || {
        gender: 'female',
        skinTone: '#f4c9a9',
        hairStyle: 'bob',
        accessory: 'none',
        pose: 'confident',
      },
      profile: {
        name: portfolio.name || '',
        headline: portfolio.headline === 'Ứng viên nextplease' ? '' : (portfolio.headline || ''),
        school: portfolio.school || '',
        location: portfolio.location || '',
        bio: portfolio.bio || '',
        skills: portfolio.skills ? portfolio.skills.join(', ') : '',
      },
      experiences: portfolio.experiences || [],
      credentials: portfolio.credentials || [],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `nextplease:portfolio-preview:${previewId}`,
      JSON.stringify(previewPayload),
    );
    window.open(`/portfolio/preview?draft=${previewId}`, '_blank', 'noopener,noreferrer');
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      navigate('/');
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>nextplease</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {session && portfolio ? (
            <div className="user-avatar-container" ref={dropdownRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="User profile menu"
                type="button"
              >
                {portfolio.name ? portfolio.name.charAt(0).toUpperCase() : 'U'}
              </button>

              {showDropdown && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-user-info">
                    <span className="user-name">{portfolio.name || 'Ứng viên'}</span>
                    <span className="user-school">{portfolio.school || 'Chưa cập nhật trường học'}</span>
                    <span className="user-wallet">
                      <WalletCards size={14} />
                      {portfolio.npBalance !== undefined ? portfolio.npBalance.toLocaleString() : '0'} NP
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  
                  <Link className="dropdown-item" to="/candidates/dashboard" onClick={() => setShowDropdown(false)}>
                    <Compass size={16} />
                    Bảng điều khiển
                  </Link>

                  {portfolio.onboardingCompleted ? (
                    <Link className="dropdown-item" to="/portfolio/edit" onClick={() => setShowDropdown(false)}>
                      <Sparkles size={16} />
                      Chỉnh sửa Portfolio 3D
                    </Link>
                  ) : (
                    <Link className="dropdown-item" to="/portfolio" onClick={() => setShowDropdown(false)}>
                      <Sparkles size={16} />
                      Hoàn thiện Portfolio
                    </Link>
                  )}

                  <button className="dropdown-item" onClick={openPortfolioPreview} type="button">
                    <FileText size={16} />
                    Xem trước Portfolio
                  </button>

                  <div className="dropdown-divider" />
                  
                  <button className="dropdown-item danger-action" onClick={handleLogout} type="button">
                    <LogOut size={16} />
                    Trở về trang chủ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/#about">Về chúng tôi</Link>
          )}

          <button
            aria-label={isDarkTheme ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            <span className="theme-toggle-icon">
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            <span>{isDarkTheme ? 'Sáng' : 'Tối'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
