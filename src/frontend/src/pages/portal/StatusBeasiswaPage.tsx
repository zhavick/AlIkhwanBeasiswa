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
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const StatusBeasiswaPage: React.FC = () => {
  const { user } = useAuth();
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const penerimaId = user?.profileId || 1;
        const res = await api.get(`/beasiswa/penerima/${penerimaId}`);
        setPengajuanList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  const steps = [
    { num: 1, title: 'Diajukan', desc: 'Permohonan Masuk' },
    { num: 2, title: 'Verifikasi Berkas', desc: 'Pemeriksaan Admin' },
    { num: 3, title: 'Evaluasi Kelayakan', desc: 'Penilaian Koordinator' },
    { num: 4, title: 'Approval Pimpinan', desc: 'Pengesahan Yayasan' },
    { num: 5, title: 'Dana Disalurkan', desc: 'Bukti Transfer Terbit' },
  ];

  const getStageNumber = (status: string, stage: number) => {
    if (status === 'Diajukan') return 1;
    if (status === 'SedangDitinjau') return stage || 2;
    if (status === 'Disetujui') return 4;
    if (status === 'Dicairkan') return 5;
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
            const currentStep = getStageNumber(item.statusPengajuan, item.approvalTahap);
            const isApproved = item.statusPengajuan === 'Disetujui' || item.statusPengajuan === 'Dicairkan';
            const isRejected = item.statusPengajuan === 'Ditolak';

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
                        {item.nomorPengajuan}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{item.namaPeriode}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Diajukan pada {new Date(item.tanggalPengajuan).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Bantuan Disetujui:</span>
                    <span className="text-base font-black text-emerald-700">
                      Rp {(item.nominalDisetujui || item.nominalDiajukan)?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Visual Tracking Stepper */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                    {steps.map((st) => {
                      const isCompleted = currentStep > st.num || (st.num === 5 && item.statusPengajuan === 'Dicairkan');
                      const isCurrent = currentStep === st.num;

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
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                                Sedang Proses
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

                  {/* Catatan Terakhir Approver */}
                  {item.catatanVerifikasi && (
                    <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-800 block mb-1">Catatan Peninjauan Terakhir:</span>
                      <p>{item.catatanVerifikasi}</p>
                    </div>
                  )}

                  {/* Pencairan Bukti */}
                  {item.statusPengajuan === 'Dicairkan' && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-900">
                          Dana telah berhasil ditransfer ke rekening perbankan Anda.
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-700">Ref: {item.nomorPengajuan}-TRX</span>
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
