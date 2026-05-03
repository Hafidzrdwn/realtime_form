import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formService } from '../services/formService';

export default function DynamicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      try {
        const data = await formService.getFormBySlug(slug);
        setForm(data);
        if (data && !data.allowMultiple) {
          const subId = localStorage.getItem(`form_sub_${data.id}`);
          if (subId) {
            try {
              const exists = await formService.checkFormSubmissionExists(data.id, subId);
              if (exists) setHasSubmitted(true);
              else localStorage.removeItem(`form_sub_${data.id}`);
            } catch {
              localStorage.removeItem(`form_sub_${data.id}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadForm();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-white/20 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Form Tidak Ditemukan</h2>
          <p className="text-gray-500 dark:text-gray-400">Link form yang Anda akses tidak valid atau sudah dihapus.</p>
        </div>
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-white/20 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Form Ditutup</h2>
          <p className="text-gray-500 dark:text-gray-400">Form ini sedang tidak menerima responden.</p>
        </div>
      </div>
    );
  }

  if (!form.allowMultiple && hasSubmitted && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-white/20 dark:border-gray-700/50 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sudah Mengisi</h2>
          <p className="text-gray-500 dark:text-gray-400">Anda sudah mengisi form ini sebelumnya.</p>
        </div>
      </div>
    );
  }

  const questions = form.questions
    ? Object.keys(form.questions).map(key => ({ id: key, ...form.questions[key] })).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const validate = () => {
    const newErrors = {};
    questions.forEach(q => {
      if (q.required && (!answers[q.id] || !String(answers[q.id]).trim())) {
        newErrors[q.id] = 'Pertanyaan ini wajib diisi.';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const newRef = await formService.submitFormResponse(form.id, answers);
      setShowSuccess(true);
      if (!form.allowMultiple) {
        localStorage.setItem(`form_sub_${form.id}`, newRef.key);
        setTimeout(() => setHasSubmitted(true), 3000);
      }
      setAnswers({});
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full px-5 py-3 rounded-xl border focus:ring-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none";
  const inputNormal = `${inputBase} border-gray-200 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500`;
  const inputError = `${inputBase} border-red-500 focus:ring-red-500/20 focus:border-red-500`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 dark:border-gray-700/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-3 tracking-tight">{form.title}</h1>
          {form.description && <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{form.description}</p>}
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl text-center font-semibold animate-bounce shadow-sm border border-green-200 dark:border-green-800">
            Terima kasih! Data Anda berhasil disimpan. 🎉
          </div>
        )}

        {questions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Form ini belum memiliki pertanyaan.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {questions.map(q => (
              <div key={q.id} className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>
                {q.type === 'short_text' && (
                  <input type="text" value={answers[q.id] || ''} onChange={(e) => { setAnswers({...answers, [q.id]: e.target.value}); if (errors[q.id]) setErrors({...errors, [q.id]: null}); }} className={errors[q.id] ? inputError : inputNormal} placeholder="Jawaban Anda" />
                )}
                {q.type === 'long_text' && (
                  <textarea rows={3} value={answers[q.id] || ''} onChange={(e) => { setAnswers({...answers, [q.id]: e.target.value}); if (errors[q.id]) setErrors({...errors, [q.id]: null}); }} className={`${errors[q.id] ? inputError : inputNormal} resize-none`} placeholder="Jawaban Anda" />
                )}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700">
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => { setAnswers({...answers, [q.id]: opt}); if (errors[q.id]) setErrors({...errors, [q.id]: null}); }} className="w-4 h-4 text-blue-600 cursor-pointer" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {errors[q.id] && <p className="text-red-500 text-xs ml-1 font-medium">{errors[q.id]}</p>}
              </div>
            ))}

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
              {isSubmitting ? 'Mengirim...' : 'Kirim'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
