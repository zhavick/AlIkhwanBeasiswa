import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  CalendarCheck,
  CalendarPlus,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Award,
  Search,
  UserCheck,
} from 'lucide-react';

export const KaderisasiPage: React.FC = () => {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    namaKegiatan: '',
    jenisAgenda: 'Kajian Rutin',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: 'Masjid Al-Ikhwan / Zoom Meeting',
    pemateri: 'Ustadz Pembina Yayasan Al-Ikhwan',
    poinKehadiran: 10,
    wajibSemua: true,
  });

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kaderisasi/agenda');
      setAgendas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    try {
      await api.post('/kaderisasi/agenda', {
        namaKegiatan: formData.namaKegiatan,
        deskripsi: formData.deskripsi,
        tanggalKegiatan: new Date(formData.tanggal).toISOString(),
        tempat: formData.lokasi,
        tipeKegiatan: formData.jenisAgenda,
        wajibHadir: formData.wajibSemua,
      });

      setSuccess('Agenda kaderisasi baru berhasil dijadwalkan!');
      setShowModal(false);
      setFormData({
        namaKegiatan: '',
        jenisAgenda: 'Kajian Rutin',
        deskripsi: '',
        tanggal: new Date().toISOString().split('T')[0],
        lokasi: 'Masjid Al-Ikhwan / Zoom Meeting',
        pemateri: 'Ustadz Pembina Yayasan Al-Ikhwan',
        poinKehadiran: 10,
        wajibSemua: true,
      });
      fetchAgendas();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat agenda kaderisasi');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kaderisasi & Pembinaan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan agenda pembinaan karakter, kajian keislaman, pelatihan kepemimpinan, dan monitoring keaktifan kader.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Jadwalkan Agenda Baru</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid List Agenda */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Memuat jadwal agenda pembinaan...</div>
      ) : agendas.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Belum Ada Agenda Pembinaan</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Klik tombol di atas untuk menjadwalkan program kaderisasi bagi penerima beasiswa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agendas.map((item) => {
            const id = item.kegiatanId || item.agendaId;
            const tanggal = item.tanggalKegiatan || item.tanggal;
            const tempat = item.tempat || item.lokasi || 'Online via Zoom';
            const tipe = item.tipeKegiatan || item.jenisAgenda || 'Kajian Rutin';
            const wajib = item.wajibHadir !== undefined ? item.wajibHadir : true;
            const peserta = item.totalPesertaHadir || 0;

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tipe}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {peserta} Hadir
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-2">{item.namaKegiatan}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {item.deskripsi || 'Kegiatan pembinaan rutin untuk seluruh kader penerima beasiswa Al-Ikhwan.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{tempat}</span>
                    </div>
                    {item.pemateri && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Pemateri: {item.pemateri}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Sifat: <strong className={wajib ? 'text-emerald-700' : 'text-slate-600'}>{wajib ? 'Wajib Hadir' : 'Opsional'}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Terbuka Presensi
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Agenda */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CalendarPlus className="w-4 h-4" />
                Jadwalkan Agenda Kaderisasi Baru
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={formData.namaKegiatan}
                  onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value })}
                  placeholder="Kajian Bulanan & Pembekalan Kepemimpinan Islam"
                  className="w-full px-3 py-1.5 border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kegiatan</label>
                  <select
                    value={formData.jenisAgenda}
                    onChange={(e) => setFormData({ ...formData, jenisAgenda: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  >
                    <option value="Kajian Rutin">Kajian Rutin</option>
                    <option value="Pelatihan Softskill">Pelatihan Softskill</option>
                    <option value="Bakti Sosial">Bakti Sosial</option>
                    <option value="Leadership Camp">Leadership Camp</option>
                    <option value="Mentoring Halaqah">Mentoring Halaqah</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi / Tautan Kegiatan</label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Masjid Raya Al-Ikhwan / Zoom Meeting"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Pokok Bahasan</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Materi akidah, akhlak, dan manajemen waktu bagi kader..."
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wajibSemua"
                  checked={formData.wajibSemua}
                  onChange={(e) => setFormData({ ...formData, wajibSemua: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="wajibSemua" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Wajib dihadiri seluruh penerima beasiswa
                </label>
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
                  {modalLoading ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KaderisasiPage;
