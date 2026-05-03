import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const MajorDistributionChart = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Top 5 Program Studi</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} allowDecimals={false} />
            <YAxis dataKey="name" type="category" stroke={axisColor} tick={{ fontSize: 12, fill: axisColor }} width={80} />
            <Tooltip cursor={{ fill: gridColor, opacity: 0.4 }} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '0.5rem' }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
