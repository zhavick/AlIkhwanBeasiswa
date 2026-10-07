import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
  Calendar,
  Search,
  Upload,
  ExternalLink,
  Printer,
} from 'lucide-react';
import KwitansiPrintModal from '../../components/documents/KwitansiPrintModal';

export const PencairanPage: React.FC = () => {
  const [pencairanList, setPencairanList] = useState<any[]>([]);
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPencairanIdForPrint, setSelectedPencairanIdForPrint] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    pengajuanId: 0,
    terminKe: 1,
    biaya: 2500000,
    nomorReferensiBank: '',
    buktiPembayaran: '',
    informasiTambahan: 'Pencairan beasiswa semester aktif',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pencairanRes, pengajuanRes] = await Promise.allSettled([
        api.get('/pencairan'),
        api.get('/beasiswa/pengajuan'),
      ]);

      if (pencairanRes.status === 'fulfilled') {
        setPencairanList(pencairanRes.value.data);
      }
      if (pengajuanRes.status === 'fulfilled') {
        setPengajuanList(pengajuanRes.value.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approvedPengajuan = pengajuanList.filter(
    (p) => p.statusPengajuan === 'Disetujui' || p.statusPengajuan === 4 || p.statusPengajuan === 'Selesai' || p.statusPengajuan === 6
  );

  const handleSelectPengajuan = (pengajuanId: number) => {
    const selected = pengajuanList.find((p) => p.pengajuanId === pengajuanId);
    setFormData((prev) => ({
      ...prev,
      pengajuanId,
      biaya: selected?.paguTertanggung || selected?.paguBeasiswa || prev.biaya,
      informasiTambahan: selected ? `Pencairan beasiswa an. ${selected.namaPenerima} (${selected.namaPeriode})` : prev.informasiTambahan,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/portal-cms/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, buktiPembayaran: res.data.fileUrl }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah bukti transfer');
    } finally {
      setUploading(false);
    }
  };

  const handleProses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pengajuanId) {
      setError('Silakan pilih pengajuan beasiswa yang akan dicairkan.');
      return;
    }

    setModalLoading(true);
    setError(null);
    try {
      await api.post('/pencairan', {
        pengajuanId: formData.pengajuanId,
        terminKe: formData.terminKe,
        tanggalPembayaran: new Date().toISOString(),
        biaya: formData.biaya,
        jumlahPencairan: formData.biaya,
        buktiPembayaran: formData.buktiPembayaran || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        nomorReferensiBank: formData.nomorReferensiBank || `TRX-BSI-${Date.now().toString().slice(-6)}`,
        informasiTambahan: formData.informasiTambahan,
      });

      setSuccess('Pencairan dana beasiswa berhasil diproses dan dibukukan!');
      setShowModal(false);
      setFormData({
        pengajuanId: 0,
        terminKe: 1,
        biaya: 2500000,
        nomorReferensiBank: '',
        buktiPembayaran: '',
        informasiTambahan: 'Pencairan beasiswa semester aktif',
      });
      fetchData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memproses pencairan');
    } finally {
      setModalLoading(false);
    }
  };

  const totalNominal = pencairanList.reduce((acc, curr) => acc + (curr.biaya || curr.jumlahPencairan || 0), 0);

  // Helper map
  const pengajuanMap = new Map<number, any>();
  pengajuanList.forEach((p) => pengajuanMap.set(p.pengajuanId, p));

  const handleExportCSV = () => {
    if (pencairanList.length === 0) return;

    const headers = ['Nomor Referensi', 'Nama Penerima', 'Tipe', 'Termin Ke', 'Nominal (Rp)', 'Tanggal Pembayaran', 'Status', 'Catatan'];
    const rows = pencairanList.map((c) => {
      const app = pengajuanMap.get(c.pengajuanId);
      const nominal = c.biaya || c.jumlahPencairan || 0;
      const tanggal = new Date(c.tanggalPembayaran || c.tanggalPencairan || Date.now()).toLocaleDateString('id-ID');
      return [
        `"${c.nomorReferensiBank || '-'}"`,
        `"${app?.namaPenerima || 'Penerima Beasiswa'}"`,
        `"${app?.tipePenerima || '-'}"`,
        c.terminKe || 1,
        nominal,
        `"${tanggal}"`,
        `"${c.statusPencairan || 'Selesai'}"`,
        `"${(c.informasiTambahan || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_pencairan_beasiswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pencairan Dana Beasiswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Eksekusi transfer dana beasiswa yang telah disetujui Pimpinan Yayasan serta pencatatan bukti transfer bank.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-slate-400 rotate-180" />
            <span>Export Rekap CSV</span>
          </button>
          <button
            onClick={() => {
              if (approvedPengajuan.length > 0 && formData.pengajuanId === 0) {
                handleSelectPengajuan(approvedPengajuan[0].pengajuanId);
              }
              setShowModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
          >
            <CreditCard className="w-4 h-4" />
            <span>Proses Pencairan Baru</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Summary Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Dana Tersalurkan</span>
          <div className="text-xl font-black text-slate-800 mt-1">
            Rp {totalNominal.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Transaksi Selesai</span>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {pencairanList.length} Transaksi
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Siap Dicairkan (Approved)</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {approvedPengajuan.length} Permohonan
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Riwayat Penyaluran Dana
          </h2>
          <button
            onClick={fetchData}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Segarkan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Pengajuan & Penerima</th>
                <th className="py-3 px-4">Termin & Nominal</th>
                <th className="py-3 px-4">Referensi Bank & Tanggal</th>
                <th className="py-3 px-4">Bukti Transfer</th>
                <th className="py-3 px-4">Status & Verifikator</th>
                <th className="py-3 px-4 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat riwayat pencairan...
                  </td>
                </tr>
              ) : pencairanList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Belum ada riwayat pencairan dana.
                  </td>
                </tr>
              ) : (
                pencairanList.map((item) => {
                  const pData = pengajuanMap.get(item.pengajuanId);
                  const nominal = item.biaya || item.jumlahPencairan || 0;
                  const tgl = item.tanggalPembayaran || item.tanggalPencairan;
                  return (
                    <tr key={item.pencairanId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {pData ? `REG-${pData.periodeId.toString().padStart(4, '0')}-${pData.pengajuanId.toString().padStart(4, '0')}` : `Pengajuan #${item.pengajuanId}`}
                        </div>
                        <div className="text-slate-700 font-semibold">
                          {pData?.namaPenerima || `ID #${item.pengajuanId}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pData?.institusiPendidikan || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-emerald-700 text-sm">
                          Rp {nominal.toLocaleString('id-ID')}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                          Termin ke-{item.terminKe}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-bold">{item.nomorReferensiBank || '-'}</div>
                        <div className="text-[10px] text-slate-400">
                          {tgl ? new Date(tgl).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.buktiPembayaran ? (
                          <a
                            href={item.buktiPembayaran}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat Bukti</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-block mb-0.5">
                          Berhasil Disalurkan
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Oleh: {item.dicairkanOleh || 'Bendahara'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPencairanIdForPrint(item.pencairanId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition shadow-xs"
                          title="Cetak Kwitansi / Bukti Pencairan Resmi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Kwitansi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pencairan */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Input Pencairan Dana Beasiswa
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProses} className="p-5 space-y-4 text-xs">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Pengajuan Beasiswa Disetujui *
                </label>
                {approvedPengajuan.length === 0 ? (
                  <p className="text-amber-600 text-[11px] bg-amber-50 p-2 rounded border border-amber-200">
                    Belum ada pengajuan dengan status Disetujui (Approved) untuk dicairkan.
                  </p>
                ) : (
                  <select
                    value={formData.pengajuanId}
                    onChange={(e) => handleSelectPengajuan(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value={0}>-- Pilih Pengajuan Beasiswa --</option>
                    {approvedPengajuan.map((app) => (
                      <option key={app.pengajuanId} value={app.pengajuanId}>
                        REG-{app.periodeId.toString().padStart(4, '0')}-{app.pengajuanId.toString().padStart(4, '0')} : {app.namaPenerima} ({app.institusiPendidikan}) - Rp {app.paguTertanggung.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Termin Pembayaran *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.terminKe}
                    onChange={(e) => setFormData({ ...formData, terminKe: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nominal Pencairan (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.biaya}
                    onChange={(e) => setFormData({ ...formData, biaya: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Referensi Bank / No. Bukti Transfer</label>
                <input
                  type="text"
                  placeholder="Contoh: TRX-BSI-202610-8899"
                  value={formData.nomorReferensiBank}
                  onChange={(e) => setFormData({ ...formData, nomorReferensiBank: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unggah Bukti Transfer / Kwitansi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="URL Bukti Transfer..."
                    value={formData.buktiPembayaran}
                    onChange={(e) => setFormData({ ...formData, buktiPembayaran: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer shrink-0 flex items-center gap-1 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Upload...' : 'Unggah'}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Informasi / Catatan Penyaluran</label>
                <input
                  type="text"
                  value={formData.informasiTambahan}
                  onChange={(e) => setFormData({ ...formData, informasiTambahan: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || approvedPengajuan.length === 0}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {modalLoading ? 'Memproses...' : 'Simpan & Bukukan Pencairan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Kwitansi */}
      {selectedPencairanIdForPrint && (
        <KwitansiPrintModal
          pencairanId={selectedPencairanIdForPrint}
          onClose={() => setSelectedPencairanIdForPrint(null)}
        />
      )}
    </div>
  );
};

export default PencairanPage;
