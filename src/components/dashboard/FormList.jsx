import { useState, useEffect } from 'react';
import { formService } from '../../services/formService';

export default function FormList({ onConfigure, onViewDashboard, showToast }) {
  const [forms, setForms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const unsub = formService.subscribeForms(setForms);
    return () => unsub();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await formService.createForm(newTitle.trim(), newDesc.trim());
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      showToast('Form berhasil dibuat!', 'success');
    } catch (err) {
      showToast('Gagal membuat form.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus form ini beserta semua datanya?')) return;
    try {
      await formService.deleteForm(id);
      showToast('Form berhasil dihapus.', 'success');
    } catch (err) {
      showToast('Gagal menghapus form.', 'error');
    }
  };

  const handleToggleActive = async (form) => {
    try {
      await formService.updateForm(form.id, { isActive: !form.isActive });
      showToast(form.isActive ? 'Form dinonaktifkan' : 'Form diaktifkan', 'success');
    } catch (err) {
      showToast('Gagal mengubah status.', 'error');
    }
  };

  const getResponseCount = (form) => {
    return form.responses ? Object.keys(form.responses).length : 0;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Form Manager
        </h2>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Buat Form
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl mb-6 animate-in fade-in duration-200">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Buat Form Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Judul Form</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Contoh: Pendaftaran Workshop AI" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Deskripsi (opsional)</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Deskripsi singkat tentang form ini..." rows={2} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer">Simpan</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">Batal</button>
            </div>
          </form>
        </div>
      )}

      {forms.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400">Belum ada form. Klik "Buat Form" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map(form => (
            <div key={form.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 leading-snug flex-1 mr-2">{form.title}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${form.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'}`}>
                  {form.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              {form.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{form.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{getResponseCount(form)} responden</span>
                <span className="truncate">/forms/{form.slug}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onConfigure(form.id)} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors font-medium">Configure</button>
                <button onClick={() => onViewDashboard(form.id)} className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 cursor-pointer transition-colors font-medium">Dashboard</button>
                <button onClick={() => handleToggleActive(form)} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors font-medium">
                  {form.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => handleDelete(form.id)} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 cursor-pointer transition-colors font-medium">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
