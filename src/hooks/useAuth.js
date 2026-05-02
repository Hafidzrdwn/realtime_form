import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebaseService';

export const useAuth = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsub = firebaseService.subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setIsChecking(false);
    });
    return () => unsub();
  }, []);

  const isAuthenticated = !!user;

  const login = async (email, password, rememberMe) => {
    try {
      await firebaseService.loginAdmin(email, password, rememberMe);
      return { success: true };
    } catch (error) {
      let message = 'Login gagal. Silakan coba lagi.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = 'Email atau password salah!';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Format email tidak valid.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Terlalu banyak percobaan. Coba lagi nanti.';
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await firebaseService.logoutAdmin();
      navigate('/check');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const requireAuth = useCallback(() => {
    if (!isChecking && !isAuthenticated) {
      navigate('/check');
    }
  }, [isChecking, isAuthenticated, navigate]);
  
  const requireGuest = useCallback(() => {
    if (!isChecking && isAuthenticated) {
      navigate('/result');
    }
  }, [isChecking, isAuthenticated, navigate]);

  return { user, isAuthenticated, isChecking, login, logout, requireAuth, requireGuest };
};
