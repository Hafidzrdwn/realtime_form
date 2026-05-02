import { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';

export const useSettings = () => {
  const [settings, setSettings] = useState({ title: 'Survey Workshop', allowMultiple: true });

  useEffect(() => {
    const unsub = firebaseService.subscribeToSettings((data) => {
      setSettings(prev => ({ ...prev, ...data }));
    });
    return () => unsub();
  }, []);

  const updateSetting = async (key, value) => {
    try {
      await firebaseService.updateSetting(key, value);
      if (key === 'allowMultiple') {
        setSettings(prev => ({ ...prev, allowMultiple: value }));
      }
      return { success: true, key, value };
    } catch (error) {
      console.error("Gagal mengupdate pengaturan", error);
      return { success: false, error };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      await firebaseService.changePassword(newPassword);
      return { success: true };
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        return { success: false, reloginRequired: true, message: 'Sesi terlalu lama. Silakan logout, login ulang, lalu coba ganti password lagi.' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, message: 'Password terlalu lemah. Gunakan minimal 6 karakter.' };
      }
      console.error(error);
      return { success: false, message: 'Gagal mengubah password.' };
    }
  };

  return { settings, updateSetting, changePassword };
};
