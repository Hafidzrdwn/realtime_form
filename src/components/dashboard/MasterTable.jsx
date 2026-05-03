import { copyFormLink, exportToExcel, exportToPDF } from '../../services/exportService';

const ExportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
);

export const MasterTable = ({ data, onDelete, showToast }) => {
  const handleExportExcel = () => {
    const headers = ['Nama Lengkap', 'Usia', 'Pendidikan', 'Semester', 'Program Studi', 'Harapan'];
    const rows = data.map(item => [item.name, item.age, item.education, item.semester || '-', item.major, item.expectations]);
    exportToExcel(headers, rows, 'survei-data');
    showToast?.('Data berhasil diekspor ke Excel!', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Nama', 'Usia', 'Pendidikan', 'Smt', 'Prodi', 'Harapan'];
    const rows = data.map(item => [item.name, item.age, item.education, item.semester || '-', item.major, item.expectations]);
    exportToPDF('Data Survei', headers, rows, 'survei-data');
    showToast?.('Data berhasil diekspor ke PDF!', 'success');
  };

  const handleCopyLink = async () => {
    const result = await copyFormLink('/');
    if (result.success) showToast?.('Link survei berhasil disalin!', 'success');
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          Master Data Survei
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors font-medium">
            <LinkIcon /> Salin Link
          </button>
          <button onClick={handleExportExcel} disabled={data.length === 0} className="flex items-center gap-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-2 rounded-xl border border-green-500/20 cursor-pointer transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
            <ExportIcon /> Excel
          </button>
          <button onClick={handleExportPDF} disabled={data.length === 0} className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl border border-red-500/20 cursor-pointer transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
            <ExportIcon /> PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="py-4 px-5 rounded-tl-xl whitespace-nowrap font-semibold tracking-wider">Nama Lengkap</th>
              <th className="py-4 px-5 whitespace-nowrap text-center font-semibold tracking-wider">Usia</th>
              <th className="py-4 px-5 whitespace-nowrap text-center font-semibold tracking-wider">Pendidikan</th>
              <th className="py-4 px-5 whitespace-nowrap text-center font-semibold tracking-wider">Semester</th>
              <th className="py-4 px-5 whitespace-nowrap font-semibold tracking-wider">Program Studi</th>
              <th className="py-4 px-5 rounded-tr-xl text-center whitespace-nowrap font-semibold tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                <td className="py-3.5 px-5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{item.name}</td>
                <td className="py-3.5 px-5 text-center">{item.age}</td>
                <td className="py-3.5 px-5 text-center">
                  <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-500/20 inline-block min-w-[70px]">
                    {item.education}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-center text-gray-400">{item.semester || '-'}</td>
                <td className="py-3.5 px-5 whitespace-nowrap">{item.major}</td>
                <td className="py-3.5 px-5 text-center">
                  <button 
                    onClick={() => {
                      if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
                        onDelete(item.id);
                      }
                    }}
                    className="text-red-500 dark:text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 px-4 py-2 rounded-xl border border-red-500/20 transition-all text-xs font-bold shadow-sm opacity-50 group-hover:opacity-100 cursor-pointer"
                    title="Hapus Data"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
