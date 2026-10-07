import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import PortalLayout from './layouts/PortalLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import PengurusPage from './pages/admin/PengurusPage';
import PenerimaPage from './pages/admin/PenerimaPage';
import BeasiswaApprovalPage from './pages/admin/BeasiswaApprovalPage';
import PencairanPage from './pages/admin/PencairanPage';
import KaderisasiPage from './pages/admin/KaderisasiPage';
import AlumniTracerPage from './pages/admin/AlumniTracerPage';
import PortalManagementPage from './pages/admin/PortalManagementPage';

// Portal Pages
import LandingHomePage from './pages/portal/LandingHomePage';
import FormPengajuanBeasiswaPage from './pages/portal/FormPengajuanBeasiswaPage';
import StatusBeasiswaPage from './pages/portal/StatusBeasiswaPage';
import PortalAkademikPage from './pages/portal/PortalAkademikPage';
import PortalKaderisasiPage from './pages/portal/PortalKaderisasiPage';
import PortalAlumniPage from './pages/portal/PortalAlumniPage';
import PortalHelpdeskPage from './pages/portal/PortalHelpdeskPage';
import VerifikasiDokumenPage from './pages/portal/VerifikasiDokumenPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Root Redirect */}
          <Route path="/" element={<Navigate to="/portal" replace />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Public Document Verification Routes */}
          <Route path="/verifikasi-dokumen/:kode" element={<VerifikasiDokumenPage />} />
          <Route path="/verifikasi-dokumen" element={<VerifikasiDokumenPage />} />

          {/* Portal Layout (Public & Self-Service) */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<LandingHomePage />} />
            <Route
              path="pengajuan"
              element={
                <ProtectedRoute>
                  <FormPengajuanBeasiswaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="status"
              element={
                <ProtectedRoute>
                  <StatusBeasiswaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="akademik"
              element={
                <ProtectedRoute>
                  <PortalAkademikPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="kaderisasi"
              element={
                <ProtectedRoute>
                  <PortalKaderisasiPage />
                </ProtectedRoute>
              }
            />
            <Route path="alumni" element={<PortalAlumniPage />} />
            <Route path="bantuan" element={<PortalHelpdeskPage />} />
          </Route>

          {/* Admin Backoffice Layout (Officers & Management) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowRoles={['SuperAdmin', 'Pengurus', 'Verifikator', 'Koordinator', 'PimpinanYayasan']}
              >
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pengurus" element={<PengurusPage />} />
            <Route path="penerima" element={<PenerimaPage />} />
            <Route path="approval" element={<BeasiswaApprovalPage />} />
            <Route path="pencairan" element={<PencairanPage />} />
            <Route path="kaderisasi" element={<KaderisasiPage />} />
            <Route path="alumni" element={<AlumniTracerPage />} />
            <Route path="portal-cms" element={<PortalManagementPage />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
