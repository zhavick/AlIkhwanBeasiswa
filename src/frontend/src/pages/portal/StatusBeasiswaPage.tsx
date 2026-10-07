import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Banknote,
  FileText,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  Download,
} from 'lucide-react';

export const StatusBeasiswaPage: React.FC = () => {
  const { user } = useAuth();
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailMap, setDetailMap] = useState<Record<number, any>>({});
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      // Try user-scoped endpoint first, fallback to penerima/{id}
      let res;
      try {
        res = await api.get('/beasiswa/my-pengajuan');
      } catch {
        const pId = user?.profileId || 1;
        res = await api.get(`/beasiswa/penerima/${pId}`);
      }
      setPengajuanList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const toggleDetail = async (pengajuanId: number) => {
    if (expandedId === pengajuanId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(pengajuanId);

    if (!detailMap[pengajuanId]) {
      setLoadingDetail(pengajuanId);
      try {
        const res = await api.get(`/beasiswa/pengajuan/${pengajuanId}`);
        setDetailMap((prev) => ({ ...prev, [pengajuanId]: res.data }));
      } catch (err) {
        console.error('Gagal mengambil detail pengajuan:', err);
      } finally {
        setLoadingDetail(null);
      }
    }
  };

  const steps = [
    { num: 1, title: 'Diajukan', desc: 'Permohonan Masuk' },
    { num: 2, title: 'Verifikasi Administrasi', desc: 'Pemeriksaan Berkas' },
    { num: 3, title: 'Approval Koordinator', desc: 'Penetapan Pagu' },
    { num: 4, title: 'Approval Pimpinan', desc: 'Pengesahan Yayasan' },
    { num: 5, title: 'Pencairan Dana', desc: 'Penyaluran Transfer' },
  ];

  // Helper calculates current step 1..5
  const getStageNumber = (item: any) => {
    if (item.statusPengajuan === 'Selesai' || item.statusPengajuan === 5 || item.telahDibayarLunas) return 5;
    if (item.statusPengajuan === 'Disetujui' || item.statusPengajuan === 'Approved' || item.statusPengajuan === 3) return 4;
    if (item.currentApprovalLevel >= 2) return 3;
    if (item.currentApprovalLevel >= 1 || item.statusPengajuan === 'Verifikasi' || item.statusPengajuan === 2) return 2;
    return 1;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Status & Tracking Beasiswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau proses verifikasi berkas, persetujuan pimpinan, hingga penyaluran dana secara transparan.
          </p>
        </div>
        <Link
          to="/portal/pengajuan"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
        >
          <FileText className="w-4 h-4" />
          <span>Ajukan Beasiswa Baru</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Memuat status pengajuan Anda...</div>
      ) : pengajuanList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-700">Belum Ada Pengajuan Beasiswa</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Anda belum pernah mengajukan beasiswa pada akun ini. Silakan mulai mengajukan pada periode yang sedang dibuka.
          </p>
          <Link
            to="/portal/pengajuan"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
          >
            <span>Mulai Formulir Pengajuan</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pengajuanList.map((item) => {
            const currentStep = getStageNumber(item);
            const isFinished = currentStep === 5;
            const isApproved = currentStep >= 4;
            const isRejected = item.statusPengajuan === 'Rejected' || item.statusPengajuan === 4;
            const detail = detailMap[item.pengajuanId];

            return (
              <div
                key={item.pengajuanId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Header Card */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        #{item.pengajuanId}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{item.namaPeriode}</span>
                      <span className="text-[10px] text-slate-500 bg-white border px-2 py-0.5 rounded">
                        {item.tipePenerima === 1 ? 'Siswa' : 'Mahasiswa'} - {item.institusiPendidikan || '-'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Diajukan pada {new Date(item.tanggalPengajuan).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Pagu Disetujui:</span>
                      <span className="text-base font-black text-emerald-700">
                        Rp {(item.paguTertanggung > 0 ? item.paguTertanggung : item.paguBeasiswa)?.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleDetail(item.pengajuanId)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                      title="Lihat Rincian Approval & Pencairan"
                    >
                      {expandedId === item.pengajuanId ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Visual Tracking Stepper */}
                <div className="p-6">
                  {isRejected ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Permohonan Beasiswa Belum Disetujui (Ditolak)</span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Mohon periksa catatan evaluasi dari tim penilai yayasan di bawah ini.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                      {steps.map((st) => {
                        const isCompleted = currentStep > st.num || (st.num === 5 && isFinished);
                        const isCurrent = currentStep === st.num && !isFinished;

                        return (
                          <div
                            key={st.num}
                            className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                              isCurrent
                                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                                : isCompleted
                                ? 'bg-slate-50 border-emerald-200 text-slate-700'
                                : 'bg-white border-slate-100 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : isCurrent
                                    ? 'bg-emerald-700 text-white animate-pulse'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isCompleted ? '✓' : st.num}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide">
                                  Proses
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{st.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{st.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Banner if Disbursed */}
                  {isFinished && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900">
                          Alhamdulillah! Dana beasiswa telah lunas disalurkan oleh Bendahara Yayasan.
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                        Status: Telah Dibayar Lunas
                      </span>
                    </div>
                  )}

                  {/* Expanded Detail Panel */}
                  {expandedId === item.pengajuanId && (
                    <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                      {loadingDetail === item.pengajuanId ? (
                        <div className="py-4 text-center text-xs text-slate-400">Mengambil rincian approval...</div>
                      ) : detail ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Approval Timeline */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Riwayat Persetujuan Berjenjang</span>
                            </h4>
                            {detail.riwayatApproval && detail.riwayatApproval.length > 0 ? (
                              <div className="space-y-2">
                                {detail.riwayatApproval.map((app: any, idx: number) => (
                                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-800">
                                        Tahap: {app.tingkatApproval} ({app.statusApproval})
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(app.tanggalApproval).toLocaleDateString('id-ID')}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-1">
                                      Penilai: {app.approverName || 'Tim Yayasan'}
                                    </p>
                                    {app.catatanApproval && (
                                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                                        "{app.catatanApproval}"
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-[11px]">Belum ada catatan evaluasi bertingkat.</p>
                            )}
                          </div>

                          {/* Disbursement History */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                              <Banknote className="w-4 h-4 text-emerald-600" />
                              <span>Riwayat Termin Penyaluran Dana</span>
                            </h4>
                            {detail.riwayatPencairan && detail.riwayatPencairan.length > 0 ? (
                              <div className="space-y-2">
                                {detail.riwayatPencairan.map((pc: any, idx: number) => (
                                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-emerald-800">
                                        Termin #{pc.terminKe}: Rp {pc.biaya?.toLocaleString('id-ID')}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(pc.tanggalPembayaran).toLocaleDateString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                                      <span>Ref: {pc.nomorReferensiBank || '-'}</span>
                                      {pc.buktiPembayaran && (
                                        <a
                                          href={pc.buktiPembayaran}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                                        >
                                          <span>Bukti Transfer</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-[11px]">Belum ada catatan pencairan dana yang diterbitkan.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs">Informasi rincian tidak tersedia.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusBeasiswaPage;
