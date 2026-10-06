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
} from 'lucide-react';

export const PencairanPage: React.FC = () => {
  const [pencairanList, setPencairanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pengajuanId: 1,
    jumlahPencairan: 2500000,
    bankTujuan: 'Bank Syariah Indonesia (BSI)',
    nomorRekening: '7123456789',
    atasNamaRekening: 'Fajar Hidayat',
    nomorReferensiBank: 'TRX-BSI-202610-001',
    catatan: 'Pencairan Beasiswa Prestasi Semester Ganjil TA 2026/2027',
  });

  const fetchPencairan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pencairan');
      setPencairanList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPencairan();
  }, []);

  const handleProses = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    try {
      await api.post('/pencairan/proses', formData);
      setSuccess('Pencairan dana beasiswa berhasil diproses dan dicatat.');
      setShowModal(false);
      fetchPencairan();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memproses pencairan');
    } finally {
      setModalLoading(false);
    }
  };

  const totalNominal = pencairanList.reduce((acc, curr) => acc + (curr.jumlahPencairan || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pencairan Dana Beasiswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Eksekusi transfer dana beasiswa yang telah disetujui Pimpinan Yayasan serta rekonsiliasi perbankan.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
        >
          <CreditCard className="w-4 h-4" />
          <span>Proses Pencairan Baru</span>
        </button>
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
          <span className="text-xs text-slate-500 font-semibold">Bank Rekanan Utama</span>
          <div className="text-sm font-bold text-slate-800 mt-1">
            Bank Syariah Indonesia (BSI)
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
            onClick={fetchPencairan}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Segarkan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Pengajuan</th>
                <th className="py-3 px-4">Rekening Tujuan & Pemilik</th>
                <th className="py-3 px-4">Nominal Cair</th>
                <th className="py-3 px-4">No. Ref Bank / Tanggal</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat riwayat pencairan...
                  </td>
                </tr>
              ) : pencairanList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Belum ada riwayat pencairan dana.
                  </td>
                </tr>
              ) : (
                pencairanList.map((item) => (
                  <tr key={item.pencairanId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {item.pengajuan?.nomorPengajuan || `Pengajuan #${item.pengajuanId}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Penerima: {item.pengajuan?.penerima?.namaLengkap || item.atasNamaRekening}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.atasNamaRekening}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.bankTujuan} • {item.nomorRekening}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      Rp {item.jumlahPencairan?.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700">{item.nomorReferensiBank || '-'}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.tanggalPencairan).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Berhasil Disalurkan
                      </span>
                    </td>
                  </tr>
                ))
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Pengajuan Beasiswa *</label>
                  <input
                    type="number"
                    required
                    value={formData.pengajuanId}
                    onChange={(e) => setFormData({ ...formData, pengajuanId: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nominal Pencairan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.jumlahPencairan}
                    onChange={(e) => setFormData({ ...formData, jumlahPencairan: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Tujuan *</label>
                  <input
                    type="text"
                    required
                    value={formData.bankTujuan}
                    onChange={(e) => setFormData({ ...formData, bankTujuan: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorRekening}
                    onChange={(e) => setFormData({ ...formData, nomorRekening: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik Rekening *</label>
                  <input
                    type="text"
                    required
                    value={formData.atasNamaRekening}
                    onChange={(e) => setFormData({ ...formData, atasNamaRekening: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">No. Referensi / Bukti Transfer</label>
                  <input
                    type="text"
                    value={formData.nomorReferensiBank}
                    onChange={(e) => setFormData({ ...formData, nomorReferensiBank: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
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
                  disabled={modalLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {modalLoading ? 'Memproses...' : 'Simpan Pencairan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PencairanPage;
