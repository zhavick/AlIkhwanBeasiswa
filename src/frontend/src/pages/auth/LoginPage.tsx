import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(usernameOrEmail, password);
      // Determine redirection
      const savedUserStr = localStorage.getItem('user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const isStaff =
        savedUser?.roles?.includes('SuperAdmin') ||
        savedUser?.roles?.includes('Pengurus') ||
        savedUser?.roles?.includes('Verifikator') ||
        savedUser?.roles?.includes('Koordinator') ||
        savedUser?.roles?.includes('PimpinanYayasan');

      if (from) {
        navigate(from, { replace: true });
      } else if (isStaff) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/portal', { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Gagal masuk. Periksa kembali username/email dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (usr: string, pwd: string) => {
    setUsernameOrEmail(usr);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Yayasan Al-Ikhwan</h1>
          <p className="text-emerald-100 text-xs mt-1">Portal Terpadu Beasiswa & Tracer Karir</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Masuk ke Sistem</h2>
          <p className="text-xs text-slate-500 mb-6">
            Gunakan akun Pengurus, Siswa, Mahasiswa, atau Alumni Anda.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username atau Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin@alikhwan.id atau username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Akun Uji Coba Cepat (Seeded):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@alikhwan.id', 'Admin123!')}
                className="py-1 px-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700 transition"
              >
                🔑 <span className="font-semibold">SuperAdmin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('verifikator@alikhwan.id', 'Verifikator123!')}
                className="py-1 px-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700 transition"
              >
                📋 <span className="font-semibold">Verifikator</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('koordinator@alikhwan.id', 'Koordinator123!')}
                className="py-1 px-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700 transition"
              >
                ⚖️ <span className="font-semibold">Koordinator</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('pimpinan@alikhwan.id', 'Pimpinan123!')}
                className="py-1 px-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700 transition"
              >
                🏛️ <span className="font-semibold">Pimpinan</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            Belum memiliki akun penerima?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Daftar Mandiri Disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
