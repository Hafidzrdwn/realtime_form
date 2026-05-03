import { ref, get, push, remove, update, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../firebase';

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

export const formService = {
  createForm: async (title, description = '') => {
    const slug = generateSlug(title);
    const formsRef = ref(db, 'forms');
    return await push(formsRef, {
      title,
      slug,
      description,
      isActive: true,
      allowMultiple: false,
      createdAt: Date.now(),
      questions: {}
    });
  },

  subscribeForms: (callback) => {
    const formsRef = ref(db, 'forms');
    return onValue(formsRef, (snapshot) => {
      const raw = snapshot.val();
      if (raw) {
        const list = Object.keys(raw).map(key => ({ id: key, ...raw[key] }))
          .sort((a, b) => b.createdAt - a.createdAt);
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  getFormBySlug: async (slug) => {
    const formsRef = ref(db, 'forms');
    const snapshot = await get(formsRef);
    if (!snapshot.exists()) return null;
    const raw = snapshot.val();
    for (const key of Object.keys(raw)) {
      if (raw[key].slug === slug) {
        return { id: key, ...raw[key] };
      }
    }
    return null;
  },

  getFormById: async (formId) => {
    const snapshot = await get(ref(db, `forms/${formId}`));
    if (snapshot.exists()) return { id: formId, ...snapshot.val() };
    return null;
  },

  subscribeToForm: (formId, callback) => {
    return onValue(ref(db, `forms/${formId}`), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: formId, ...snapshot.val() });
      }
    });
  },

  updateForm: async (formId, data) => {
    return await update(ref(db, `forms/${formId}`), data);
  },

  deleteForm: async (formId) => {
    return await remove(ref(db, `forms/${formId}`));
  },

  // Questions
  addQuestion: async (formId, question) => {
    const qRef = ref(db, `forms/${formId}/questions`);
    return await push(qRef, question);
  },

  updateQuestion: async (formId, questionId, data) => {
    return await update(ref(db, `forms/${formId}/questions/${questionId}`), data);
  },

  deleteQuestion: async (formId, questionId) => {
    return await remove(ref(db, `forms/${formId}/questions/${questionId}`));
  },

  // Responses
  submitFormResponse: async (formId, answers) => {
    const resRef = ref(db, `forms/${formId}/responses`);
    return await push(resRef, {
      answers,
      timestamp: Date.now()
    });
  },

  checkFormSubmissionExists: async (formId, submissionId) => {
    const snapshot = await get(ref(db, `forms/${formId}/responses/${submissionId}`));
    return snapshot.exists();
  },

  subscribeToFormResponses: (formId, callback) => {
    return onValue(ref(db, `forms/${formId}/responses`), (snapshot) => {
      const raw = snapshot.val();
      if (raw) {
        const list = Object.keys(raw).map(key => ({ id: key, ...raw[key] }))
          .sort((a, b) => b.timestamp - a.timestamp);
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  deleteFormResponse: async (formId, responseId) => {
    return await remove(ref(db, `forms/${formId}/responses/${responseId}`));
  }
};
