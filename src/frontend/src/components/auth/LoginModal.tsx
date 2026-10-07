import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, redirectPathAfterLogin } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens & reset state
  useEffect(() => {
    if (isLoginModalOpen) {
      setError(null);
      setSuccess(false);
      const timer = setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoginModalOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginModalOpen && !loading) {
        closeLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, loading, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameOrEmail.trim()) {
      setError('Harap masukkan Username atau Email Anda.');
      return;
    }
    if (!password) {
      setError('Harap masukkan Kata Sandi Anda.');
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(usernameOrEmail.trim(), password);
      setSuccess(true);

      const isStaff =
        loggedInUser?.roles?.includes('SuperAdmin') ||
        loggedInUser?.roles?.includes('Pengurus') ||
        loggedInUser?.roles?.includes('Verifikator') ||
        loggedInUser?.roles?.includes('Koordinator') ||
        loggedInUser?.roles?.includes('PimpinanYayasan');

      setTimeout(() => {
        if (redirectPathAfterLogin) {
          navigate(redirectPathAfterLogin, { replace: true });
        } else if (isStaff) {
          navigate('/admin/dashboard', { replace: true });
        }
        // If recipient on /portal, closeLoginModal is already called inside AuthContext.login()
      }, 350);
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        'Gagal masuk. Periksa kembali username/email dan password Anda.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (usr: string, pwd: string) => {
    setUsernameOrEmail(usr);
    setPassword(pwd);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
      onClick={() => {
        if (!loading) closeLoginModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            if (!loading) closeLoginModal();
          }}
          disabled={loading}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-center text-white relative">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 id="login-modal-title" className="text-xl font-black tracking-tight">
            Yayasan Al-Ikhwan
          </h2>
          <p className="text-emerald-100 text-xs mt-0.5">
            Portal Terpadu Beasiswa & Tracer Karir
          </p>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 sm:p-7">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800">Masuk ke Sistem</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan akun Pengurus, Siswa, Mahasiswa, atau Alumni Anda.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="font-semibold">Berhasil masuk! Mengalihkan ke dashboard...</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username atau Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  ref={usernameInputRef}
                  type="text"
                  required
                  placeholder="admin@alikhwan.id atau username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Akun Uji Coba Cepat (Seeded):
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Klik untuk isi otomatis</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@alikhwan.id', 'Admin123!')}
                className="py-1.5 px-2.5 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg border border-slate-200 text-slate-700 transition flex items-center justify-between"
              >
                <span>🔑 <span className="font-semibold">SuperAdmin</span></span>
                <span className="text-[9px] text-slate-400">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('verifikator@alikhwan.id', 'Verifikator123!')}
                className="py-1.5 px-2.5 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg border border-slate-200 text-slate-700 transition flex items-center justify-between"
              >
                <span>📋 <span className="font-semibold">Verifikator</span></span>
                <span className="text-[9px] text-slate-400">Review</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('koordinator@alikhwan.id', 'Koordinator123!')}
                className="py-1.5 px-2.5 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg border border-slate-200 text-slate-700 transition flex items-center justify-between"
              >
                <span>⚖️ <span className="font-semibold">Koordinator</span></span>
                <span className="text-[9px] text-slate-400">Tahap 2</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('pimpinan@alikhwan.id', 'Pimpinan123!')}
                className="py-1.5 px-2.5 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg border border-slate-200 text-slate-700 transition flex items-center justify-between"
              >
                <span>🏛️ <span className="font-semibold">Pimpinan</span></span>
                <span className="text-[9px] text-slate-400">Final</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-600">
            Belum memiliki akun penerima?{' '}
            <Link
              to="/register"
              onClick={() => closeLoginModal()}
              className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Daftar Mandiri Disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
