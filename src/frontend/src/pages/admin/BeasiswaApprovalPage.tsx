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
  ExternalLink,
  Filter,
  DollarSign,
  Download,
  Award,
  Printer,
} from 'lucide-react';
import SuratKeteranganPrintModal from '../../components/documents/SuratKeteranganPrintModal';

export const BeasiswaApprovalPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'approved'>('queue');
  const [queue, setQueue] = useState<any[]>([]);
  const [approvedList, setApprovedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [stageFilter, setStageFilter] = useState<'ALL' | 1 | 2 | 3>('ALL');
  const [selectedAppIdForSkPrint, setSelectedAppIdForSkPrint] = useState<number | null>(null);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [decision, setDecision] = useState<'Approve' | 'Reject' | 'RequestRevision'>('Approve');
  const [catatan, setCatatan] = useState('');
  const [nominalDisetujui, setNominalDisetujui] = useState<number>(0);
  const [appDocs, setAppDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

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

  const fetchApproved = async () => {
    setLoadingApproved(true);
    try {
      const res = await api.get('/beasiswa/pengajuan?status=Approved');
      setApprovedList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApproved(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchApproved();
  }, []);

  useEffect(() => {
    if (activeTab === 'approved') {
      fetchApproved();
    }
  }, [activeTab]);

  const handleSelectApp = async (app: any) => {
    setSelectedApp(app);
    setNominalDisetujui(app.nominalTertanggung || app.nominalDiajukan || 0);
    setCatatan('');
    setDecision('Approve');
    setLoadingDocs(true);
    try {
      const res = await api.get(`/portal-cms/pengajuan/${app.pengajuanId}/dokumen`);
      setAppDocs(res.data);
    } catch {
      setAppDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

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
        paguTertanggungDisetujui: decision === 'Approve' ? nominalDisetujui : null,
        tahap: selectedApp.currentApprovalStage,
      });

      setMsg({
        text: `Keputusan [${decision}] untuk permohonan ${selectedApp.nomorPengajuan} berhasil disimpan.`,
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

  const filteredQueue = queue.filter((item) => {
    if (stageFilter === 'ALL') return true;
    return item.currentApprovalStage === stageFilter;
  });

  const handleExportCSV = () => {
    if (queue.length === 0) return;

    const headers = ['Nomor Pengajuan', 'Nama Pemohon', 'Tipe Penerima', 'Asal Sekolah/Kampus', 'Nilai Rata-rata/IPK', 'Pagu Diajukan', 'Pagu Tertanggung', 'Tahap Approval', 'Status'];
    const rows = queue.map((app) => [
      `"${app.nomorPengajuan || '-'}"`,
      `"${app.namaPenerima || '-'}"`,
      `"${app.tipePenerima || '-'}"`,
      `"${app.institusiAsal || '-'}"`,
      app.nilaiRataRata || 0,
      app.nominalDiajukan || 0,
      app.nominalTertanggung || 0,
      `"Tahap ${app.currentApprovalStage}"`,
      `"${app.statusPengajuan || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `antrean_approval_beasiswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Alur persetujuan berjenjang: Tahap 1 Verifikator Berkas &rarr; Tahap 2 Koordinator Beasiswa &rarr; Tahap 3 Pimpinan Yayasan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Tab Switcher */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-xs">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'queue'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Antrean Persetujuan ({queue.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>SK Beasiswa Disetujui ({approvedList.length})</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
            title="Download Rekap CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          
          {activeTab === 'queue' && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
              <button
                onClick={() => setStageFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  stageFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({queue.length})
              </button>
              <button
                onClick={() => setStageFilter(1)}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  stageFilter === 1
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Tahap 1
              </button>
              <button
                onClick={() => setStageFilter(2)}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  stageFilter === 2
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                Tahap 2
              </button>
              <button
                onClick={() => setStageFilter(3)}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  stageFilter === 3
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Tahap 3
              </button>
            </div>
          )}
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

      {/* Main Content: Antrean Persetujuan VS SK Beasiswa Disetujui */}
      {activeTab === 'queue' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Antrean Menunggu Persetujuan ({filteredQueue.length})
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
                ) : filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-slate-600">Semua Antrean Bersih!</p>
                      <p className="text-[11px] text-slate-400">
                        Tidak ada permohonan beasiswa yang menunggu persetujuan pada filter ini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => (
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
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            item.currentApprovalStage === 1
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : item.currentApprovalStage === 2
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Tahap {item.currentApprovalStage}: {item.nextApproverRole}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        Rp {item.nominalDiajukan?.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSelectApp(item)}
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
      ) : (
        /* Tabel Pengajuan Disetujui (Cetak SK Beasiswa) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Penerbitan Surat Keputusan (SK) Beasiswa Disetujui</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daftar pengajuan yang telah disetujui penuh oleh Pimpinan Yayasan dan berhak atas Surat Keputusan (SK) resmi.
              </p>
            </div>
            <button
              onClick={fetchApproved}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Segarkan Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Pengajuan & Penerima</th>
                  <th className="py-3 px-4">Institusi & Program</th>
                  <th className="py-3 px-4">Periode Beasiswa</th>
                  <th className="py-3 px-4">Pagu Disetujui</th>
                  <th className="py-3 px-4">Status Legalitas</th>
                  <th className="py-3 px-4 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingApproved ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Memuat daftar pengajuan yang telah disetujui...
                    </td>
                  </tr>
                ) : approvedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">Belum Ada Pengajuan Disetujui</p>
                      <p className="text-[11px] text-slate-400">
                        Pengajuan beasiswa yang disetujui penuh oleh Pimpinan Yayasan akan otomatis tampil di sini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  approvedList.map((item) => (
                    <tr key={item.pengajuanId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          REG-{String(item.periodeId).padStart(4, '0')}-{String(item.pengajuanId).padStart(4, '0')}
                        </div>
                        <div className="text-slate-700 font-semibold mt-0.5">{item.namaPenerima}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{item.institusiPendidikan || '-'}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                          {item.tipePenerima === 1 ? 'Siswa' : 'Mahasiswa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.namaPeriode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-emerald-700">
                          Rp {(item.paguTertanggung > 0 ? item.paguTertanggung : item.paguBeasiswa)?.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Pagu Disetujui Yayasan
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disetujui Sah</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedAppIdForSkPrint(item.pengajuanId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                          title="Cetak Surat Keputusan (SK) Resmi Yayasan Format A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak SK Resmi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              <div
                className={`p-3 rounded-xl border ${
                  selectedApp.currentApprovalStage === 1
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : selectedApp.currentApprovalStage === 2
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}
              >
                <span className="font-bold block mb-1">
                  Persetujuan Tahap {selectedApp.currentApprovalStage} ({selectedApp.nextApproverRole}):
                </span>
                <p className="text-[11px]">
                  {selectedApp.currentApprovalStage === 1 &&
                    'Pemeriksaan validitas administratif, kelengkapan berkas KTP, KK, dan keabsahan status siswa/mahasiswa.'}
                  {selectedApp.currentApprovalStage === 2 &&
                    'Evaluasi nilai rapor/IPK, latar belakang sosial-ekonomi, dan kelayakan menerima beasiswa.'}
                  {selectedApp.currentApprovalStage === 3 &&
                    'Pengesahan akhir oleh Pimpinan Yayasan serta penentuan pagu tertanggung untuk pencairan dana beasiswa.'}
                </p>
              </div>

              {/* Attached Documents */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Berkas Persyaratan yang Diunggah Pemohon
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {appDocs.length} Dokumen
                  </span>
                </div>

                {loadingDocs ? (
                  <div className="py-3 text-center text-slate-400 text-[11px]">Memuat berkas pendaftar...</div>
                ) : appDocs.length === 0 ? (
                  <div className="py-2 text-slate-400 text-[11px] italic">
                    Belum ada berkas terlampir pada pengajuan ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {appDocs.map((doc: any) => (
                      <div
                        key={doc.dokumenId}
                        className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{doc.namaSyarat}</p>
                          <p className="text-[10px] text-slate-400 truncate">{doc.namaFileAsli || 'Dokumen Terlampir'}</p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
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

                {decision === 'Approve' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nominal Pagu Disetujui (Rp):
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={nominalDisetujui}
                      onChange={(e) => setNominalDisetujui(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded-lg text-xs font-bold text-emerald-700 focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Dapat disesuaikan jika yayasan memberikan persetujuan sebagian atau penuh.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Evaluasi / Alasan Keputusan:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Berkas telah lengkap dan nilai rapor/IPK memenuhi kualifikasi beasiswa..."
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

      {/* Modal Cetak Surat Keputusan (SK) */}
      {selectedAppIdForSkPrint && (
        <SuratKeteranganPrintModal
          pengajuanId={selectedAppIdForSkPrint}
          onClose={() => setSelectedAppIdForSkPrint(null)}
        />
      )}
    </div>
  );
};

export default BeasiswaApprovalPage;
