import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  Briefcase,
  HelpCircle,
  LogIn,
  LogOut,
  Menu,
  X,
  Shield,
  Home,
} from 'lucide-react';

export const PortalLayout: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isStaff = hasRole('SuperAdmin') || hasRole('Pengurus') || hasRole('Verifikator') || hasRole('Koordinator');

  const navLinks = [
    { name: 'Beranda', path: '/portal', icon: Home },
    { name: 'Pengajuan Beasiswa', path: '/portal/pengajuan', icon: FileText, authRequired: true },
    { name: 'Status Pengajuan', path: '/portal/status', icon: Clock, authRequired: true },
    { name: 'Rapor & Prestasi', path: '/portal/akademik', icon: BookOpen, authRequired: true },
    { name: 'Kaderisasi', path: '/portal/kaderisasi', icon: Calendar, authRequired: true },
    { name: 'Tracer Karir Alumni', path: '/portal/alumni', icon: Briefcase },
    { name: 'Helpdesk & Bantuan', path: '/portal/bantuan', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Banner Notice */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 text-center">
        <span>✨ Pendaftaran Beasiswa Al-Ikhwan Tahun Ajaran Berjalan Telah Dibuka. Silakan login dan lengkapi berkas Anda.</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/portal" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                Al-Ikhwan <span className="text-emerald-600 font-semibold text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">Beasiswa</span>
              </div>
              <p className="text-[11px] text-slate-500">Menebar Maslahat, Mencetak Generasi Robbani</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/portal'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden sm:flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {isStaff && (
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors flex items-center space-x-1.5 shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Backoffice Admin</span>
                  </Link>
                )}

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user?.namaLengkap || user?.username}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">{user?.roles?.[0] || 'Penerima'}</div>
                </div>

                <button
                  onClick={() => logout()}
                  title="Keluar"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs shadow-emerald-600/30"
                >
                  Daftar Beasiswa
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/portal'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  {isStaff && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold"
                    >
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Backoffice Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-rose-200 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun ({user?.namaLengkap || user?.username})</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2 px-4 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Portal Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <span className="font-bold text-white text-sm">Yayasan Al-Ikhwan</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Program Beasiswa Pendidikan Terpadu untuk pelajar SD, SMP, SMA, serta mahasiswa D3/S1 berprestasi dan dhuafa.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Program Kami</h4>
            <ul className="space-y-2">
              <li>Beasiswa Pendidikan Siswa</li>
              <li>Beasiswa Prestasi & Skripsi Mahasiswa</li>
              <li>Kaderisasi & Pembinaan Kepribadian</li>
              <li>Jejaring Karir & Tracer Alumni</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Layanan & Bantuan</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/portal/bantuan" className="hover:text-emerald-400">Pusat Bantuan & Tiket Helpdesk</Link>
              </li>
              <li>Panduan Pengunggahan Berkas</li>
              <li>Jadwal Pencairan Anggaran</li>
              <li>Syarat Ketentuan Beasiswa</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Sekretariat Yayasan</h4>
            <p className="leading-relaxed">
              Kompleks Pendidikan Al-Ikhwan<br />
              Email: beasiswa@alikhwan.id<br />
              WhatsApp Helpdesk: +62 812-3456-7890
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Sistem Informasi Manajemen Beasiswa & Portal Al-Ikhwan. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </div>
  );
};

export default PortalLayout;
