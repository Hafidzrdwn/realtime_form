import { useState, useEffect } from 'react';
import { formService } from '../services/formService';

export const useFormBuilder = (formId) => {
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!formId) return;
    const unsub = formService.subscribeToForm(formId, (data) => {
      setForm(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [formId]);

  const questions = form?.questions 
    ? Object.keys(form.questions)
        .map(key => ({ id: key, ...form.questions[key] }))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const addQuestion = async (question) => {
    try {
      const order = questions.length + 1;
      await formService.addQuestion(formId, { ...question, order });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateQuestion = async (questionId, data) => {
    try {
      await formService.updateQuestion(formId, questionId, data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      await formService.deleteQuestion(formId, questionId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateFormConfig = async (data) => {
    try {
      await formService.updateForm(formId, data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { form, questions, isLoading, addQuestion, updateQuestion, deleteQuestion, updateFormConfig };
};
