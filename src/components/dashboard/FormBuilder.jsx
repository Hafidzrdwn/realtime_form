import { useState } from 'react';
import { useFormBuilder } from '../../hooks/useFormBuilder';

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Teks Pendek' },
  { value: 'long_text', label: 'Teks Panjang' },
  { value: 'multiple_choice', label: 'Pilihan Ganda' },
];

export default function FormBuilder({ formId, onBack, showToast }) {
  const { form, questions, isLoading, addQuestion, updateQuestion, deleteQuestion, updateFormConfig } = useFormBuilder(formId);
  const [newQ, setNewQ] = useState({ label: '', type: 'short_text', required: true, options: [''] });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  if (isLoading) return <div className="text-center py-20 text-gray-400">Memuat form...</div>;
  if (!form) return <div className="text-center py-20 text-gray-400">Form tidak ditemukan.</div>;

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.label.trim()) return;
    const questionData = { label: newQ.label.trim(), type: newQ.type, required: newQ.required };
    if (newQ.type === 'multiple_choice') {
      questionData.options = newQ.options.filter(o => o.trim());
      if (questionData.options.length < 2) {
        showToast('Pilihan ganda memerlukan minimal 2 opsi.', 'error');
        return;
      }
    }
    const res = await addQuestion(questionData);
    if (res.success) {
      setNewQ({ label: '', type: 'short_text', required: true, options: [''] });
      setShowAddForm(false);
      showToast('Pertanyaan ditambahkan!', 'success');
    } else {
      showToast('Gagal menambahkan pertanyaan.', 'error');
    }
  };

  const handleSaveEdit = async (qId) => {
    const data = { ...editData };
    if (data.type === 'multiple_choice' && data.options) {
      data.options = data.options.filter(o => o.trim());
    }
    const res = await updateQuestion(qId, data);
    if (res.success) {
      setEditingId(null);
      showToast('Pertanyaan diperbarui!', 'success');
    }
  };

  const handleDeleteQ = async (qId) => {
    if (!window.confirm('Hapus pertanyaan ini?')) return;
    const res = await deleteQuestion(qId);
    if (res.success) showToast('Pertanyaan dihapus.', 'success');
  };

  const handleToggleActive = async () => {
    const res = await updateFormConfig({ isActive: !form.isActive });
    if (res.success) showToast(form.isActive ? 'Form dinonaktifkan' : 'Form diaktifkan', 'success');
  };

  const handleToggleMultiple = async () => {
    const res = await updateFormConfig({ allowMultiple: !form.allowMultiple });
    if (res.success) showToast(form.allowMultiple ? 'Single submission aktif' : 'Multi-submission aktif', 'success');
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{form.title}</h2>
          <p className="text-xs text-gray-400">/forms/{form.slug}</p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Konfigurasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status Form</p>
              <p className="text-xs text-gray-400">{form.isActive ? 'Menerima responden' : 'Ditutup'}</p>
            </div>
            <button onClick={handleToggleActive} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Multi-Submission</p>
              <p className="text-xs text-gray-400">{form.allowMultiple ? 'Boleh isi berkali-kali' : 'Sekali isi saja'}</p>
            </div>
            <button onClick={handleToggleMultiple} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${form.allowMultiple ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${form.allowMultiple ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pertanyaan ({questions.length})</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-semibold flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddQuestion} className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3 animate-in fade-in duration-200">
            <input type="text" value={newQ.label} onChange={(e) => setNewQ({...newQ, label: e.target.value})} placeholder="Label pertanyaan..." className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" required />
            <div className="flex gap-3 items-center flex-wrap">
              <select value={newQ.type} onChange={(e) => setNewQ({...newQ, type: e.target.value})} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none cursor-pointer">
                {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={newQ.required} onChange={(e) => setNewQ({...newQ, required: e.target.checked})} className="rounded cursor-pointer" /> Wajib
              </label>
            </div>
            {newQ.type === 'multiple_choice' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium">Opsi Jawaban:</p>
                {newQ.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={opt} onChange={(e) => { const opts = [...newQ.options]; opts[i] = e.target.value; setNewQ({...newQ, options: opts}); }} placeholder={`Opsi ${i+1}`} className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none" />
                    {newQ.options.length > 1 && (
                      <button type="button" onClick={() => { const opts = newQ.options.filter((_, idx) => idx !== i); setNewQ({...newQ, options: opts}); }} className="text-red-400 hover:text-red-500 text-sm cursor-pointer">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setNewQ({...newQ, options: [...newQ.options, '']})} className="text-xs text-blue-500 hover:text-blue-400 cursor-pointer font-medium">+ Tambah opsi</button>
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors">Simpan</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors">Batal</button>
            </div>
          </form>
        )}

        {questions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Belum ada pertanyaan. Klik "Tambah" untuk membuat.</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 group">
                {editingId === q.id ? (
                  <div className="space-y-3">
                    <input type="text" value={editData.label || ''} onChange={(e) => setEditData({...editData, label: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                    <div className="flex gap-3 items-center">
                      <select value={editData.type} onChange={(e) => setEditData({...editData, type: e.target.value})} className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm cursor-pointer text-gray-900 dark:text-white focus:outline-none">
                        {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={editData.required || false} onChange={(e) => setEditData({...editData, required: e.target.checked})} className="rounded cursor-pointer" /> Wajib
                      </label>
                    </div>
                    {editData.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {(editData.options || ['']).map((opt, j) => (
                          <div key={j} className="flex gap-2">
                            <input type="text" value={opt} onChange={(e) => { const opts = [...(editData.options || [])]; opts[j] = e.target.value; setEditData({...editData, options: opts}); }} className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none" />
                            {(editData.options || []).length > 1 && (
                              <button type="button" onClick={() => { const opts = (editData.options || []).filter((_, idx) => idx !== j); setEditData({...editData, options: opts}); }} className="text-red-400 text-sm cursor-pointer">✕</button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => setEditData({...editData, options: [...(editData.options || []), '']})} className="text-xs text-blue-500 cursor-pointer font-medium">+ Tambah opsi</button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(q.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer">Simpan</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer">Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q.label}</span>
                        {q.required && <span className="text-red-500 text-xs">*</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-medium">{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                        {q.type === 'multiple_choice' && q.options && (
                          <span className="text-xs text-gray-400">{q.options.length} opsi</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(q.id); setEditData({ label: q.label, type: q.type, required: q.required, options: q.options || [''] }); }} className="text-gray-400 hover:text-blue-500 p-1 cursor-pointer transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteQ(q.id)} className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
