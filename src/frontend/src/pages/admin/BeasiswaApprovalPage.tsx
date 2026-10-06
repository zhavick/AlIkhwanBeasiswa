import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';

export const BeasiswaApprovalPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [decision, setDecision] = useState<'Approve' | 'Reject' | 'RequestRevision'>('Approve');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approval/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setMsg(null);
    try {
      await api.post('/approval/process', {
        pengajuanId: selectedApp.pengajuanId,
        decision,
        catatan,
      });

      setMsg({
        text: `Keputusan [${decision}] untuk pengajuan ${selectedApp.nomorPengajuan} berhasil disimpan.`,
        type: 'success',
      });
      setSelectedApp(null);
      setCatatan('');
      fetchQueue();
    } catch (err: any) {
      setMsg({
        text: err.response?.data?.message || 'Gagal memproses keputusan approval.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Verifikasi & Approval Beasiswa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Alur persetujuan berjenjang: Tahap 1 Verifikator Berkas $\rightarrow$ Tahap 2 Koordinator $\rightarrow$ Tahap 3 Pimpinan Yayasan.
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 text-xs rounded-xl border flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Antrean Menunggu Persetujuan ({queue.length})
          </h2>
          <button
            onClick={fetchQueue}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Segarkan Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Pengajuan & Pemohon</th>
                <th className="py-3 px-4">Periode & Program</th>
                <th className="py-3 px-4">Tahapan Approval Saat Ini</th>
                <th className="py-3 px-4">Nominal Diajukan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat antrean persetujuan...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-600">Semua Antrean Bersih!</p>
                    <p className="text-[11px] text-slate-400">
                      Tidak ada permohonan beasiswa yang menunggu persetujuan pada akun Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.pengajuanId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.nomorPengajuan}</div>
                      <div className="text-slate-600 font-medium">{item.namaPenerima}</div>
                      <div className="text-[10px] text-slate-400">{item.institusi}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.namaPeriode}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                        {item.tipePenerima === 1 ? 'Siswa' : 'Mahasiswa'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Tahap {item.currentApprovalStage}: {item.nextApproverRole}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      Rp {item.nominalDiajukan?.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs inline-flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Tinjau & Putuskan</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tinjau & Putuskan */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  Tinjauan Pengajuan: {selectedApp.nomorPengajuan}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Summary Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Pemohon:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedApp.namaPenerima}</span>
                  <div className="text-[11px] text-slate-500">{selectedApp.institusi}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Nominal Diajukan:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    Rp {selectedApp.nominalDiajukan?.toLocaleString('id-ID')}
                  </span>
                  <div className="text-[11px] text-slate-500">Periode: {selectedApp.namaPeriode}</div>
                </div>
              </div>

              {/* Approval Stage Indicator */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">
                  Persetujuan Tahap {selectedApp.currentApprovalStage} ({selectedApp.nextApproverRole}):
                </span>
                <p className="text-[11px] text-amber-800">
                  {selectedApp.currentApprovalStage === 1 &&
                    'Pemeriksaan validitas administratif dan kelengkapan dokumen siswa/mahasiswa.'}
                  {selectedApp.currentApprovalStage === 2 &&
                    'Evaluasi nilai rapor/IPK, latar belakang keluarga, dan kelayakan menerima beasiswa.'}
                  {selectedApp.currentApprovalStage === 3 &&
                    'Pengesahan akhir oleh Pimpinan Yayasan untuk pencairan dana beasiswa.'}
                </p>
              </div>

              {/* Form Input Decision */}
              <form onSubmit={handleProcess} className="space-y-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Keputusan Anda:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision('Approve')}
                      className={`p-2.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1.5 transition ${
                        decision === 'Approve'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui (Approve)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('RequestRevision')}
                      className={`p-2.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1.5 transition ${
                        decision === 'RequestRevision'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Minta Revisi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('Reject')}
                      className={`p-2.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1.5 transition ${
                        decision === 'Reject'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak (Reject)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Evaluasi / Alasan Keputusan:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Berkas telah lengkap dan nilai memenuhi syarat minimum yayasan..."
                    className="w-full p-2.5 border rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan Keputusan...' : 'Simpan & Lanjutkan Tahap'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeasiswaApprovalPage;
