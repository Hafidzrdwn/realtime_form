import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useSurveyData } from '../hooks/useSurveyData';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { Toast } from '../components/ui/Toast';
import { copyFormLink } from '../services/exportService';
import { EducationChart } from '../components/charts/EducationChart';
import { AgeDistributionChart } from '../components/charts/AgeDistributionChart';
import { MajorDistributionChart } from '../components/charts/MajorDistributionChart';
import { MasterTable } from '../components/dashboard/MasterTable';

const FormList = lazy(() => import('../components/dashboard/FormList'));
const FormBuilder = lazy(() => import('../components/dashboard/FormBuilder'));
const FormDashboard = lazy(() => import('../components/dashboard/FormDashboard'));

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'forms', label: 'Forms' },
  { key: 'settings', label: 'Settings' },
];

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);

export default function Result() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const selectedFormId = searchParams.get('formId') || null;

  const { isChecking, logout, requireAuth } = useAuth();
  const { settings, updateSetting, changePassword } = useSettings();
  const { data, selectedEducation, setSelectedEducation, handleDelete, eduData, ageData, majorData } = useSurveyData();
  const { toast, showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [titleDraft, setTitleDraft] = useState(settings.title);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    setTitleDraft(settings.title);
  }, [settings.title]);

  const handleUpdateTitle = async (e) => {
    e.preventDefault();
    const result = await updateSetting('title', titleDraft);
    if (result.success) showToast('Judul form berhasil disimpan!', 'success');
    else showToast('Gagal menyimpan judul', 'error');
  };

  const handleToggleMultiple = async () => {
    const newVal = !settings.allowMultiple;
    const result = await updateSetting('allowMultiple', newVal);
    if (result.success) {
      showToast(newVal ? 'Multi-submission diaktifkan' : 'Multi-submission dinonaktifkan', 'success');
    } else {
      showToast('Gagal mengubah pengaturan', 'error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    const result = await changePassword(newPassword);
    if (result.success) {
      setNewPassword('');
      showToast('Password berhasil diubah!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const executeDelete = async (id) => {
    const result = await handleDelete(id);
    if (result.success) {
      showToast("Data berhasil dihapus!", "success");
    } else {
      showToast("Gagal menghapus data.", "error");
    }
  };

  const navigateToTab = (tab, extra = {}) => {
    setSearchParams({ tab, ...extra });
  };

  if (isChecking) return null;

  const renderContent = () => {
    if (activeTab === 'settings') {
      return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl animate-in fade-in duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Pengaturan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/50">
              <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Judul Form Survei</label>
              <form onSubmit={handleUpdateTitle} className="flex gap-2">
                <input type="text" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer">Simpan</button>
              </form>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Izinkan Multi-Submission</label>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Satu perangkat bisa isi form berkali-kali</p>
                </div>
                <button 
                  onClick={handleToggleMultiple}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${settings.allowMultiple ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.allowMultiple ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/50">
              <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Ganti Password Admin</label>
              <form onSubmit={handleUpdatePassword} className="flex gap-2">
                <input type="password" placeholder="Password Baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm" required />
                <button type="submit" className="bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 hover:bg-red-500/30 hover:border-red-500/50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer">Ubah</button>
              </form>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col justify-center">
              <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Bagikan Link Survei</label>
              <button onClick={async () => { const r = await copyFormLink('/'); if (r.success) showToast('Link survei disalin!', 'success'); }} className="flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl border border-indigo-500/20 text-sm font-semibold transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Salin Link
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'forms') {
      return (
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Memuat...</div>}>
          <FormList onConfigure={(formId) => navigateToTab('form-config', { formId })} onViewDashboard={(formId) => navigateToTab('form-dashboard', { formId })} showToast={showToast} />
        </Suspense>
      );
    }

    if (activeTab === 'form-config' && selectedFormId) {
      return (
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Memuat...</div>}>
          <FormBuilder formId={selectedFormId} onBack={() => navigateToTab('forms')} showToast={showToast} />
        </Suspense>
      );
    }

    if (activeTab === 'form-dashboard' && selectedFormId) {
      return (
        <Suspense fallback={<div className="text-center py-20 text-gray-400">Memuat...</div>}>
          <FormDashboard formId={selectedFormId} onBack={() => navigateToTab('forms')} showToast={showToast} />
        </Suspense>
      );
    }

    // Default: dashboard
    return (
      <div className="animate-in fade-in duration-300">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 shadow-xl min-h-[50vh] text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800/80 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-200 dark:border-gray-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 tracking-tight">Belum Ada Data Survei</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Dashboard masih kosong. Grafik dan visualisasi data akan otomatis muncul secara real-time ketika ada peserta yang mengirimkan form survei mereka.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-blue-500 dark:text-blue-400 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              Menunggu respons pertama...
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <EducationChart 
                eduData={eduData} 
                dataLength={data.length} 
                rawData={data} 
                selectedEducation={selectedEducation} 
                setSelectedEducation={setSelectedEducation} 
              />
              <AgeDistributionChart data={ageData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MajorDistributionChart data={majorData} />

              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Feed: Harapan Peserta
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-80 custom-scrollbar">
                  {data.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                      <p className="text-gray-700 dark:text-gray-200 mb-2 leading-relaxed">"{item.expectations}"</p>
                      <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                        <span className="font-semibold text-blue-500 dark:text-blue-400">{item.name}</span>
                        <span>{item.major} • {item.education}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <MasterTable data={data} onDelete={executeDelete} showToast={showToast} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 font-sans transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header & Navigation */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Admin Panel</h1>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-6 border-r border-gray-300 dark:border-gray-700 pr-6">
              {NAV_ITEMS.map(item => (
                <button 
                  key={item.key}
                  onClick={() => navigateToTab(item.key)} 
                  className={`text-sm transition-colors outline-none cursor-pointer ${activeTab === item.key || (item.key === 'forms' && (activeTab === 'form-config' || activeTab === 'form-dashboard')) ? 'text-blue-500 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'dashboard' && (
                <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-bold border border-blue-500/20">
                  Total Responden: {data.length}
                </span>
              )}
              <button onClick={toggleTheme} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 outline-none cursor-pointer" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <button onClick={logout} className="bg-gray-100 dark:bg-gray-800 hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 hover:border-red-500/50 text-sm font-semibold outline-none cursor-pointer">
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex items-center justify-center gap-6 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          {NAV_ITEMS.map(item => (
            <button 
              key={item.key}
              onClick={() => navigateToTab(item.key)} 
              className={`text-sm transition-colors outline-none cursor-pointer pb-2 border-b-2 ${activeTab === item.key || (item.key === 'forms' && (activeTab === 'form-config' || activeTab === 'form-dashboard')) ? 'text-blue-500 dark:text-blue-400 font-bold border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium border-transparent'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Toast toast={toast} />

        {renderContent()}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}} />
    </div>
  );
}
