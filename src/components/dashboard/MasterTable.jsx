export const MasterTable = ({ data, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl mt-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        Master Data Survei
      </h2>
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
