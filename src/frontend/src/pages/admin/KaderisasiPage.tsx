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
} from 'lucide-react';

export const KaderisasiPage: React.FC = () => {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    namaKegiatan: '',
    jenisAgenda: 'Kajian Rutin',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: 'Masjid Al-Ikhwan / Zoom Meeting',
    pemateri: 'Ustadz DR. H. Fulan, Lc., MA',
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
        ...formData,
        tanggal: new Date(formData.tanggal).toISOString(),
      });
      setShowModal(false);
      setFormData({
        namaKegiatan: '',
        jenisAgenda: 'Kajian Rutin',
        deskripsi: '',
        tanggal: new Date().toISOString().split('T')[0],
        lokasi: 'Masjid Al-Ikhwan / Zoom Meeting',
        pemateri: 'Ustadz DR. H. Fulan, Lc., MA',
        poinKehadiran: 10,
        wajibSemua: true,
      });
      fetchAgendas();
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
          {agendas.map((item) => (
            <div
              key={item.agendaId}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.jenisAgenda}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" />
                    +{item.poinKehadiran} Poin
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-2">{item.namaKegiatan}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{item.deskripsi}</p>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(item.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.lokasi || 'Online via Zoom'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Pemateri: {item.pemateri || 'Ustadz Pembina'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Status: <strong className="text-emerald-700">Terbuka Presensi</strong>
                </span>
                <span className="text-xs text-emerald-600 font-bold">Wajib Hadir</span>
              </div>
            </div>
          ))}
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi / Tempat</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Poin Kehadiran</label>
                  <input
                    type="number"
                    value={formData.poinKehadiran}
                    onChange={(e) => setFormData({ ...formData, poinKehadiran: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Pemateri / Narasumber</label>
                  <input
                    type="text"
                    value={formData.pemateri}
                    onChange={(e) => setFormData({ ...formData, pemateri: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi Kegiatan</label>
                  <textarea
                    rows={2}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Materi mengenai adab penuntut ilmu dan kontribusi sosial..."
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
                  {modalLoading ? 'Menyimpan...' : 'Jadwalkan Agenda'}
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
