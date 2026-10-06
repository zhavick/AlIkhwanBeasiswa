import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck2,
  Banknote,
  CalendarCheck,
  Briefcase,
  Sliders,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pengurus & RBAC', path: '/admin/pengurus', icon: Users },
    { name: 'Penerima Beasiswa', path: '/admin/penerima', icon: GraduationCap },
    { name: 'Verifikasi & Approval', path: '/admin/approval', icon: FileCheck2 },
    { name: 'Pencairan Dana', path: '/admin/pencairan', icon: Banknote },
    { name: 'Kaderisasi & Pembinaan', path: '/admin/kaderisasi', icon: CalendarCheck },
    { name: 'Tracer Karir Alumni', path: '/admin/alumni', icon: Briefcase },
    { name: 'Manajemen Portal CMS', path: '/admin/portal-cms', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-slate-100 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-white font-bold text-lg">
              AI
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white">Al-Ikhwan</h1>
              <p className="text-xs text-emerald-400 font-medium">Management Backoffice</p>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Portal shortcut & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            to="/portal"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg hover:bg-emerald-900/50 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Portal Mandiri</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <div className="px-3 py-2 rounded-lg bg-slate-800/60 flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-xs font-semibold text-white truncate">{user?.namaLengkap || user?.username}</p>
              <p className="text-[10px] text-emerald-400 truncate">{user?.roles?.join(', ') || 'Pengurus'}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Keluar / Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Panel Pengurus</span>
              <h2 className="text-sm font-bold text-slate-800">Sistem Informasi Beasiswa Yayasan Al-Ikhwan</h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.namaLengkap || 'SuperAdmin'}</div>
              <div className="text-[11px] text-slate-500">{user?.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {(user?.namaLengkap || user?.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
