import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

export const EducationChart = ({ eduData, dataLength, rawData, selectedEducation, setSelectedEducation }) => {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Tingkat Pendidikan</h2>
        {selectedEducation && (
          <button 
            onClick={() => setSelectedEducation(null)} 
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
        )}
      </div>
      
      {!selectedEducation ? (
        <div className="h-64 relative animate-in fade-in duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={eduData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" labelLine={false}>
                {eduData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    onClick={() => setSelectedEducation(selectedEducation === entry.name ? null : entry.name)}
                    style={{ outline: 'none' }}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
                <Label 
                  value={dataLength} 
                  position="center"
                  fill={isDark ? '#f3f4f6' : '#1f2937'}
                  style={{ fontSize: '28px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '0.5rem' }} itemStyle={{ color: isDark ? '#f3f4f6' : '#1f2937' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ cursor: 'pointer' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50 animate-in fade-in duration-300 flex flex-col h-64">
          <h3 className="text-sm font-semibold text-blue-500 dark:text-blue-400 mb-3">
            Rincian: {selectedEducation}
          </h3>
          <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 rounded-tl-lg font-medium">Nama</th>
                  <th className="py-2 px-3 rounded-tr-lg font-medium text-center">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                {rawData.filter(d => d.education === selectedEducation).map(d => (
                  <tr key={d.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-2.5 px-3">{d.name}</td>
                    <td className="py-2.5 px-3 text-center text-gray-400">{d.semester || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
