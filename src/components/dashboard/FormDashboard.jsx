import { useState, useEffect } from 'react';
import { formService } from '../../services/formService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function FormDashboard({ formId, onBack }) {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub1 = formService.subscribeToForm(formId, (data) => {
      setForm(data);
      setIsLoading(false);
    });
    const unsub2 = formService.subscribeToFormResponses(formId, setResponses);
    return () => { unsub1(); unsub2(); };
  }, [formId]);

  if (isLoading) return <div className="text-center py-20 text-gray-400">Memuat dashboard...</div>;
  if (!form) return <div className="text-center py-20 text-gray-400">Form tidak ditemukan.</div>;

  const questions = form.questions
    ? Object.keys(form.questions).map(key => ({ id: key, ...form.questions[key] })).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const isDark = document.documentElement.classList.contains('dark');

  // Charts for multiple choice questions
  const mcQuestions = questions.filter(q => q.type === 'multiple_choice' && q.options);
  const mcChartData = mcQuestions.map(q => {
    const counts = {};
    (q.options || []).forEach(opt => { counts[opt] = 0; });
    responses.forEach(r => {
      const ans = r.answers?.[q.id];
      if (ans && counts[ans] !== undefined) counts[ans]++;
    });
    return {
      question: q,
      data: Object.keys(counts).map(name => ({ name, count: counts[name] }))
    };
  });

  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm('Hapus data responden ini?')) return;
    try {
      await formService.deleteFormResponse(formId, responseId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{form.title} — Dashboard</h2>
          <p className="text-xs text-gray-400">{responses.length} responden</p>
        </div>
      </div>

      {/* MC Charts */}
      {mcChartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mcChartData.map(({ question, data }) => (
            <div key={question.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 truncate">{question.label}</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis allowDecimals={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '0.5rem' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Table */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Data Responden</h3>
        {responses.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Belum ada responden.</p>
        ) : (
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="py-3 px-4 rounded-tl-xl font-semibold">#</th>
                {questions.map(q => (
                  <th key={q.id} className="py-3 px-4 font-semibold whitespace-nowrap">{q.label}</th>
                ))}
                <th className="py-3 px-4 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {responses.map((resp, i) => (
                <tr key={resp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                  <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                  {questions.map(q => (
                    <td key={q.id} className="py-3 px-4 max-w-[200px] truncate">{resp.answers?.[q.id] || '-'}</td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleDeleteResponse(resp.id)} className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-600 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold cursor-pointer transition-all opacity-50 group-hover:opacity-100">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
