import { useState, useEffect } from 'react';
import { firebaseService } from '../../services/firebaseService';

export default function UserManagement({ showToast }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', role: 'admin' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = firebaseService.subscribeToUsers((data) => {
      setUsers(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) return;
    
    setIsSubmitting(true);
    try {
      await firebaseService.createAdminAccount(newAdmin.email, newAdmin.password, newAdmin.role);
      showToast('Admin baru berhasil dibuat', 'success');
      setShowAddModal(false);
      setNewAdmin({ email: '', password: '', role: 'admin' });
    } catch (err) {
      let msg = 'Gagal membuat admin';
      if (err.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar';
      if (err.code === 'auth/weak-password') msg = 'Password minimal 6 karakter';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (uid, currentRole) => {
    const newRole = currentRole === 'superadmin' ? 'admin' : 'superadmin';
    if (!window.confirm(`Ubah role user ini menjadi ${newRole}?`)) return;
    
    try {
      await firebaseService.updateUserRole(uid, newRole);
      showToast('Role berhasil diperbarui', 'success');
    } catch (err) {
      showToast('Gagal memperbarui role', 'error');
    }
  };

  const handleResetPassword = async (email) => {
      if (!window.confirm(`Kirim email reset password ke ${email}?`)) return;
      
      try {
        await firebaseService.resetUserPassword(email);
        showToast('Email reset password telah dikirim', 'success');
      } catch (err) {
        showToast('Gagal mengirim email reset', 'error');
      }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm('Hapus akses admin ini? (Data di database akan dihapus)')) return;
    
    try {
      await firebaseService.deleteUserAccount(uid);
      showToast('Akses admin dicabut', 'success');
    } catch (err) {
      showToast('Gagal menghapus user', 'error');
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-400">Memuat data user...</div>;

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manajemen User
            </h2>
            <div className="bg-blue-500/10 text-blue-500 text-xs px-3 py-1 rounded-full border border-blue-500/20 font-bold">
              Total Admin: {users.length}
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Admin
          </button>
        </div>

        {/* Modal Tambah Admin */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Buat Akun Admin Baru</h3>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email</label>
                  <input 
                    type="email" 
                    value={newAdmin.email} 
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password Awal</label>
                  <input 
                    type="password" 
                    value={newAdmin.password} 
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Role</label>
                  <select 
                    value={newAdmin.role} 
                    onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="admin">Admin (Terbatas)</option>
                    <option value="superadmin">Superadmin (Akses Penuh)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Memproses...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="py-3 px-4 rounded-tl-xl font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold text-center">Role</th>
              <th className="py-3 px-4 font-semibold text-center">Dibuat Pada</th>
              <th className="py-3 px-4 rounded-tr-xl font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {users.map((u) => (
              <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                <td className="py-4 px-4 font-medium">{u.email}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'superadmin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-gray-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleResetPassword(u.email)}
                      className="p-2 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                      title="Reset Password (Kirim Email)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleUpdateRole(u.uid, u.role)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                      title="Ubah Role"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Hapus Admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-10 text-gray-500">Belum ada user terdaftar.</div>
        )}
      </div>

      <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl text-sm">
        <h3 className="font-bold text-blue-500 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Kontrol Akses Superadmin
        </h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          Sebagai Superadmin, Anda dapat membuat akun Admin baru secara langsung. Gunakan fitur <strong>Reset Password</strong> untuk mengirimkan link pembaruan kredensial jika Admin lupa kata sandi mereka. Perubahan <strong>Role</strong> akan segera berdampak pada hak akses mereka di panel ini.
        </p>
      </div>
    </div>
  );
}
