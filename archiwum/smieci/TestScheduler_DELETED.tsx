import { Link } from 'react-router-dom';

export const TestScheduler = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">📅 Kalendarz Egzaminów</h1>
          <Link to="/admin" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all">
            ← Powrót
          </Link>
        </div>
        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-cyber/20 p-8 text-center">
          <div className="text-8xl mb-4">📅</div>
          <p className="text-2xl text-white">Harmonogram Testów</p>
        </div>
      </div>
    </div>
  );
};
