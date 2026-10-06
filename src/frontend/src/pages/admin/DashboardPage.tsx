import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  GraduationCap,
  Banknote,
  FileCheck2,
  Briefcase,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalMahasiswa: 0,
    totalPengurus: 0,
    pendingApproval: 0,
    totalPencairan: 0,
    alumniBekerjaPct: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentAgendas, setRecentAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [siswaRes, mhsRes, pengurusRes, approvalRes, alumniRes, agendaRes] = await Promise.allSettled([
          api.get('/siswa'),
          api.get('/mahasiswa'),
          api.get('/pengurus'),
          api.get('/approval/queue'),
          api.get('/alumni/statistik'),
          api.get('/kaderisasi/agenda'),
        ]);

        const siswaData = siswaRes.status === 'fulfilled' ? siswaRes.value.data : [];
        const mhsData = mhsRes.status === 'fulfilled' ? mhsRes.value.data : [];
        const pengurusData = pengurusRes.status === 'fulfilled' ? pengurusRes.value.data : [];
        const approvalData = approvalRes.status === 'fulfilled' ? approvalRes.value.data : [];
        const alumniStat = alumniRes.status === 'fulfilled' ? alumniRes.value.data : null;
        const agendaData = agendaRes.status === 'fulfilled' ? agendaRes.value.data : [];

        setStats({
          totalSiswa: siswaData.length || 0,
          totalMahasiswa: mhsData.length || 0,
          totalPengurus: pengurusData.length || 0,
          pendingApproval: approvalData.length || 0,
          totalPencairan: 45000000, // sample aggregated disbursement
          alumniBekerjaPct: alumniStat?.persentaseBekerja || 82,
        });

        setRecentApplications(approvalData.slice(0, 5));
        setRecentAgendas(agendaData.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan operasional beasiswa, approval berjenjang, dan pemantauan kaderisasi Al-Ikhwan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/approval"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Antrean Approval ({stats.pendingApproval})</span>
          </Link>
          <Link
            to="/admin/pencairan"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Banknote className="w-4 h-4" />
            <span>Pencairan Dana</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Penerima Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Penerima Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.totalSiswa + stats.totalMahasiswa}</span>
            <span className="text-xs text-emerald-600 font-medium">Orang</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span>Siswa: <strong className="text-slate-600">{stats.totalSiswa}</strong></span>
            <span>•</span>
            <span>Mahasiswa: <strong className="text-slate-600">{stats.totalMahasiswa}</strong></span>
          </div>
        </div>

        {/* Antrean Approval */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Menunggu Approval</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats.pendingApproval}</span>
            <span className="text-xs text-slate-500">Pengajuan</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Perlu diverifikasi & disetujui pimpinan
          </div>
        </div>

        {/* Realisasi Anggaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Serapan Beasiswa</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-800">
              Rp {(stats.totalPencairan / 1000000).toFixed(1)} Jt
            </span>
            <span className="text-xs text-blue-600 font-medium">Semester Ini</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Penyaluran tepat sasaran</span>
          </div>
        </div>

        {/* Tracer Serapan Kerja */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Serapan Kerja Alumni</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{stats.alumniBekerjaPct}%</span>
            <span className="text-xs text-slate-500">Terserap Kerja</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Dari lulusan penerima beasiswa Al-Ikhwan
          </div>
        </div>
      </div>

      {/* Grid: Antrean Pengajuan & Agenda Kaderisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Approval Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Antrean Verifikasi & Approval Terkini</h2>
              <p className="text-xs text-slate-500">Pengajuan yang membutuhkan tindakan segera</p>
            </div>
            <Link
              to="/admin/approval"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Semua Pengajuan Telah Diproses</p>
              <p className="text-[11px] text-slate-400">Tidak ada pengajuan beasiswa tertunda saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Pemohon</th>
                    <th className="py-2.5 px-3">Jenjang</th>
                    <th className="py-2.5 px-3">Tahap Approval</th>
                    <th className="py-2.5 px-3">Nominal Diajukan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app.pengajuanId} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{app.namaPenerima}</div>
                        <div className="text-[10px] text-slate-400">{app.institusi}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          {app.tipePenerima === 1 ? 'Siswa' : 'Mahasiswa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Tahap {app.currentApprovalStage}: {app.nextApproverRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        Rp {app.nominalDiajukan?.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to="/admin/approval"
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded text-[11px] transition"
                        >
                          Tinjau
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Agenda Kaderisasi & Pembinaan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Agenda Pembinaan Terdekat</h2>
              <p className="text-xs text-slate-500">Program wajib kader penerima</p>
            </div>
            <Link
              to="/admin/kaderisasi"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Kelola
            </Link>
          </div>

          {recentAgendas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Belum Ada Agenda Terjadwal</p>
              <Link
                to="/admin/kaderisasi"
                className="mt-2 text-[11px] text-emerald-600 font-bold hover:underline"
              >
                + Buat Agenda Pembinaan
              </Link>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recentAgendas.map((agenda) => (
                <div
                  key={agenda.agendaId}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xs font-bold text-slate-800">{agenda.namaKegiatan}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      {agenda.jenisAgenda}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(agenda.tanggal).toLocaleDateString('id-ID')}
                    </span>
                    <span>📍 {agenda.lokasi || 'Online via Zoom'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick CMS Action */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/admin/portal-cms"
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <span>Kelola Banner & Berita Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
