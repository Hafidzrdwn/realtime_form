export const Toast = ({ toast }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className={`fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 fade-in duration-300 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border font-semibold text-sm ${
      isSuccess ? 'bg-green-500/10 border-green-500/20 text-green-400 backdrop-blur-xl' : 'bg-red-500/10 border-red-500/20 text-red-400 backdrop-blur-xl'
    }`}>
      {isSuccess ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      )}
      {toast.message}
    </div>
  );
};
