import { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { useSettings } from '../hooks/useSettings';

export default function Form() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education: '',
    semester: '',
    major: '',
    expectations: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { settings } = useSettings();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (settings.allowMultiple === true) {
        setHasSubmitted(false);
        return;
      }

      const submissionId = localStorage.getItem('submissionId');
      const oldHasSubmitted = localStorage.getItem('hasSubmitted');

      if (submissionId) {
        try {
          const exists = await firebaseService.checkSubmissionExists(submissionId);
          if (exists) {
            setHasSubmitted(true);
          } else {
            localStorage.removeItem('submissionId');
            setHasSubmitted(false);
          }
        } catch (error) {
          console.error("Error checking submission:", error);
          localStorage.removeItem('submissionId');
          setHasSubmitted(false);
        }
      } else if (oldHasSubmitted === 'true') {
        setHasSubmitted(true);
      } else {
        setHasSubmitted(false);
      }
    };

    checkSubmissionStatus();
  }, [settings.allowMultiple]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
    
    if (!formData.age) {
      newErrors.age = 'Usia wajib diisi.';
    } else if (Number(formData.age) < 10 || Number(formData.age) > 100) {
      newErrors.age = 'Usia harus 10 - 100 tahun.';
    }

    if (!formData.education) newErrors.education = 'Pendidikan wajib dipilih.';
    if (!formData.major.trim()) newErrors.major = 'Program studi/jurusan wajib diisi.';
    if (!formData.expectations.trim()) newErrors.expectations = 'Harapan wajib diisi.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const newResponseRef = await firebaseService.submitResponse(formData);
      setShowSuccess(true);
      
      if (settings.allowMultiple === false) {
        localStorage.setItem('submissionId', newResponseRef.key);
        setTimeout(() => setHasSubmitted(true), 3000);
      }

      setFormData({ name: '', age: '', education: '', semester: '', major: '', expectations: '' });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal mengirim data. Pastikan Firebase sudah dikonfigurasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSemester = formData.education === 'S1' || formData.education === 'S2';

  if (!settings.allowMultiple && hasSubmitted && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 dark:border-gray-700/50 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sudah Mengisi Survei</h2>
          <p className="text-gray-500 dark:text-gray-400">Terima kasih atas partisipasinya! Sistem mendeteksi Anda sudah mengisi formulir ini sebelumnya.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 dark:border-gray-700/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-3 tracking-tight">{settings.title || 'Survey Workshop'}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Silakan isi formulir di bawah ini dengan data yang valid.</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl text-center font-semibold animate-bounce shadow-sm border border-green-200 dark:border-green-800">
            Terima kasih! Data Anda berhasil disimpan. 🎉
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Nama Lengkap</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500'} focus:ring-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none`} placeholder="Masukkan nama Anda" />
            {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Usia</label>
              <input type="number" name="age" min="10" max="100" value={formData.age} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl border ${errors.age ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500'} focus:ring-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none`} placeholder="Contoh: 20" />
              {errors.age && <p className="text-red-500 text-xs ml-1 font-medium">{errors.age}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Pendidikan</label>
              <select name="education" value={formData.education} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl border ${errors.education ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500'} focus:ring-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none appearance-none cursor-pointer`}>
                <option value="" disabled>Pilih tingkat</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
              </select>
              {errors.education && <p className="text-red-500 text-xs ml-1 font-medium">{errors.education}</p>}
            </div>
          </div>

          {showSemester && (
            <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-500">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Semester (Opsional)</label>
              <input type="number" name="semester" min="1" max="14" value={formData.semester} onChange={handleChange} className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none" placeholder="Contoh: 5" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Program Studi / Jurusan</label>
            <input type="text" name="major" value={formData.major} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl border ${errors.major ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500'} focus:ring-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none`} placeholder="Contoh: Teknik Informatika" />
            {errors.major && <p className="text-red-500 text-xs ml-1 font-medium">{errors.major}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Harapan dari Workshop</label>
            <textarea name="expectations" rows="4" value={formData.expectations} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl border ${errors.expectations ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500'} focus:ring-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none resize-none`} placeholder="Tuliskan harapan Anda mengikuti workshop ini..."></textarea>
            {errors.expectations && <p className="text-red-500 text-xs ml-1 font-medium">{errors.expectations}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
            {isSubmitting ? 'Mengirim Data...' : 'Kirim Survei'}
          </button>
        </form>
      </div>
    </div>
  );
}
