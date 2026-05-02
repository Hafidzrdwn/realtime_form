import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const MajorDistributionChart = ({ data }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
      <h2 className="text-lg font-semibold text-gray-300 mb-4">Top 5 Program Studi</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" stroke="#9ca3af" allowDecimals={false} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" tick={{ fontSize: 12, fill: '#9ca3af' }} width={80} />
            <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
