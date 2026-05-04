import { ref, get, push, remove, update, onValue } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence, updatePassword } from 'firebase/auth';
import { db, auth } from '../firebase';

export const firebaseService = {
  // --- Auth (Firebase Authentication) ---
  loginAdmin: async (email, password, rememberMe) => {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    return await signInWithEmailAndPassword(auth, email, password);
  },

  logoutAdmin: async () => {
    return await signOut(auth);
  },

  subscribeToAuthState: (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileSnapshot = await get(ref(db, `users/${user.uid}`));
        const profile = profileSnapshot.val();
        
        if (!profile) {
          const usersRef = ref(db, 'users');
          const allUsersSnapshot = await get(usersRef);
          const isFirstUser = !allUsersSnapshot.exists();
          const defaultProfile = {
            email: user.email,
            role: isFirstUser ? 'superadmin' : 'admin',
            createdAt: Date.now()
          };
          await update(ref(db, `users/${user.uid}`), defaultProfile);
          callback({ ...user, ...defaultProfile });
        } else {
          callback({ ...user, ...profile });
        }
      } else {
        callback(null);
      }
    });
  },

  changePassword: async (newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Tidak ada user yang sedang login.');
    return await updatePassword(user, newPassword);
  },

  // --- User Management (RTDB) ---
  subscribeToUsers: (callback) => {
    const usersRef = ref(db, 'users');
    return onValue(usersRef, (snapshot) => {
      const rawData = snapshot.val();
      if (rawData) {
        const dataList = Object.keys(rawData).map(key => ({
          uid: key,
          ...rawData[key]
        }));
        callback(dataList);
      } else {
        callback([]);
      }
    });
  },

  updateUserRole: async (uid, role) => {
    return await update(ref(db, `users/${uid}`), { role });
  },

  deleteUserAccount: async (uid) => {
    return await remove(ref(db, `users/${uid}`));
  },

  createAdminAccount: async (email, password, role = 'admin') => {
    const { initializeApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
    
    const secondaryConfig = { ...auth.app.options };
    const secondaryApp = initializeApp(secondaryConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;
      
      const profile = {
        email: email,
        role: role,
        createdAt: Date.now()
      };
      
      await update(ref(db, `users/${newUid}`), profile);
      await signOut(secondaryAuth);
      return { success: true, uid: newUid };
    } catch (error) {
      console.error("Gagal membuat akun:", error);
      throw error;
    }
  },

  updateAdminAccount: async (uid, data) => {
    return await update(ref(db, `users/${uid}`), data);
  },

  resetUserPassword: async (email) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    return await sendPasswordResetEmail(auth, email);
  },

  // --- Settings ---
  subscribeToSettings: (callback) => {
    const settingsRef = ref(db, 'settings');
    return onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  },
  
  updateSetting: async (key, value) => {
    return await update(ref(db, 'settings'), { [key]: value });
  },

  // --- Responses ---
  subscribeToResponses: (callback) => {
    const responsesRef = ref(db, 'responses');
    return onValue(responsesRef, (snapshot) => {
      const rawData = snapshot.val();
      if (rawData) {
        const dataList = Object.keys(rawData).map(key => ({
          id: key,
          ...rawData[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        callback(dataList);
      } else {
        callback([]);
      }
    });
  },

  submitResponse: async (formData) => {
    const responsesRef = ref(db, 'responses');
    return await push(responsesRef, {
      ...formData,
      age: Number(formData.age),
      semester: formData.semester ? Number(formData.semester) : null,
      timestamp: Date.now()
    });
  },

  deleteResponse: async (id) => {
    return await remove(ref(db, `responses/${id}`));
  },

  checkSubmissionExists: async (submissionId) => {
    const snapshot = await get(ref(db, `responses/${submissionId}`));
    return snapshot.exists();
  }
};
