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
    return onAuthStateChanged(auth, callback);
  },

  changePassword: async (newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Tidak ada user yang sedang login.');
    return await updatePassword(user, newPassword);
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
