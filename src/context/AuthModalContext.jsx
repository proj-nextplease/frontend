import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LoginModal } from '../components/LoginModal.jsx';

const AuthModalContext = createContext({
  isOpen: false,
  role: 'candidate',
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState('candidate'); // 'candidate' | 'business'

  const openLoginModal = useCallback((targetRole = 'candidate') => {
    setRole(targetRole);
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
  }, []);

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
