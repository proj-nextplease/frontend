/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal.jsx';
import { rememberReturnTo } from '../lib/returnTo.js';

const AuthModalContext = createContext({
  isOpen: false,
  role: 'candidate',
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState('candidate'); // 'candidate' | 'business'
  const location = useLocation();

  const openLoginModal = useCallback((targetRole = 'candidate') => {
    // Ghi lại trang đang xem trước khi mở form, để đăng nhập xong quay về đây.
    rememberReturnTo();
    setRole(targetRole);
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Tự động mở modal đăng nhập khi URL có ?auth=login hoặc ?login=1
  useEffect(() => {
    if (!location) return;
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'login' || params.get('login') === '1') {
      const targetRole = params.get('role') === 'business' ? 'business' : 'candidate';
      setRole(targetRole);
      setIsOpen(true);

      // Dọn sạch search param khỏi URL để giữ URL trang chủ đẹp mắt
      params.delete('auth');
      params.delete('login');
      params.delete('role');
      const cleanSearch = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState(null, '', `${location.pathname}${cleanSearch}${location.hash}`);
    }
  }, [location]);

  // Close modal on Escape key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        closeLoginModal();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeLoginModal]);

  return (
    <AuthModalContext.Provider value={{ isOpen, role, openLoginModal, closeLoginModal }}>
      {children}
      {isOpen && <LoginModal isOpen={isOpen} role={role} onClose={closeLoginModal} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
