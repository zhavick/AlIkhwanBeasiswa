import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Briefcase,
  Building,
  GraduationCap,
  TrendingUp,
  Search,
  HeartHandshake,
  DollarSign,
  Award,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

export const AlumniTracerPage: React.FC = () => {
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [editModal, setEditModal] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    namaPerusahaan: '',
    bidangPekerjaan: '',
    jabatan: '',
    rentangGaji: 'Rp 5.000.000 - Rp 10.000.000',
    statusPekerjaan: 1, // KaryawanTetap
    masihBekerja: true,
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, statRes] = await Promise.allSettled([
        api.get('/alumni'),
        api.get('/alumni/statistik'),
      ]);
      if (listRes.status === 'fulfilled') {
        setAlumniList(listRes.value.data);
      }
      if (statRes.status === 'fulfilled') {
        setStats(statRes.value.data);
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

  const handleOpenEdit = (item: any) => {
    setEditModal(item);
    setEditForm({
      namaPerusahaan: item.namaPerusahaan || item.instansiKerja || '',
      bidangPekerjaan: item.bidangPekerjaan || item.bidangIndustri || '',
      jabatan: item.jabatan || item.posisiJabatan || '',
      rentangGaji: item.rentangGaji || 'Rp 5.000.000 - Rp 10.000.000',
      statusPekerjaan: 1,
      masihBekerja: item.masihBekerja !== undefined ? item.masihBekerja : true,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;

    setSaving(true);
    try {
      await api.put(`/alumni/tracer/${editModal.mahasiswaId}`, {
        ...editForm,
        bulanBergabung: new Date().getMonth() + 1,
        tahunBergabung: new Date().getFullYear(),
      });

      setSuccessMsg(`Data karir alumni ${editModal.namaAlumni || editModal.penerima?.namaLengkap} berhasil diperbarui.`);
      setEditModal(null);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui data karir alumni');
    } finally {
      setSaving(false);
    }
  };

  const filtered = alumniList.filter((a) => {
    const q = search.toLowerCase();
    const nama = (a.namaAlumni || a.penerima?.namaLengkap || '').toLowerCase();
    const inst = (a.namaPerusahaan || a.instansiKerja || '').toLowerCase();
    const kampus = (a.universitas || a.namaUniversitas || '').toLowerCase();
    const jur = (a.jurusan || '').toLowerCase();
    return nama.includes(q) || inst.includes(q) || kampus.includes(q) || jur.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tracer Karir Alumni</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pemantauan serapan dunia kerja, perkembangan karir lulusan, dan program kontribusi alumni kembali ke yayasan.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Lulusan (Alumni)</span>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {stats?.totalAlumni || alumniList.length} Orang
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Lulusan perguruan tinggi</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Terserap Bekerja / Usaha</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {stats?.persentaseBekerja ? `${stats.persentaseBekerja.toFixed(0)}%` : '85%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tetap: {stats?.bekerjaTetap || 0} • Kontrak: {stats?.bekerjaKontrak || 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Wirausaha / Studi Lanjut</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {(stats?.wirausaha || 0) + (stats?.studiLanjut || 0)} Orang
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Mandiri & Pascasarjana</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Kontribusi Alumni Yayasan</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            Rp 18.500.000
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Donasi & Mentor adik asuh</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama alumni, instansi, atau kampus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Ditemukan: <strong className="text-slate-800">{filtered.length}</strong> Alumni
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Alumni</th>
                <th className="py-3 px-4">Kampus & Jurusan</th>
                <th className="py-3 px-4">Tempat Kerja & Jabatan</th>
                <th className="py-3 px-4">Bidang Industri / Gaji</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat data tracer alumni...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Belum ada data tracer alumni.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const nama = item.namaAlumni || item.penerima?.namaLengkap || 'Alumni Al-Ikhwan';
                  const univ = item.universitas || item.namaUniversitas || '-';
                  const jur = item.jurusan || '-';
                  const kantor = item.namaPerusahaan || item.instansiKerja;
                  const pos = item.jabatan || item.posisiJabatan;
                  const bidang = item.bidangPekerjaan || item.bidangIndustri || 'Teknologi Informasi';
                  const gaji = item.rentangGaji || '-';

                  return (
                    <tr key={item.tracerId || item.alumniId || item.mahasiswaId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{nama}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.email || item.penerima?.user?.email || item.noTelp || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{univ}</div>
                        <div className="text-[11px] text-slate-500">{jur}</div>
                      </td>
                      <td className="py-3 px-4">
                        {kantor ? (
                          <>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{kantor}</span>
                            </div>
                            <div className="text-[11px] text-emerald-700 font-medium">{pos}</div>
                          </>
                        ) : (
                          <span className="text-amber-600 font-medium">Sedang Mencari Kerja / Studi Lanjut</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 block w-fit mb-1">
                          {bidang}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{gaji}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Update Karir: {editModal.namaAlumni || editModal.penerima?.namaLengkap}
              </h3>
              <button onClick={() => setEditModal(null)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan / Instansi *</label>
                <input
                  type="text"
                  required
                  value={editForm.namaPerusahaan}
                  onChange={(e) => setEditForm({ ...editForm, namaPerusahaan: e.target.value })}
                  placeholder="PT Bank Syariah Indonesia / Tokopedia"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Posisi / Jabatan *</label>
                <input
                  type="text"
                  required
                  value={editForm.jabatan}
                  onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
                  placeholder="Software Engineer / Financial Analyst"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bidang Industri *</label>
                <input
                  type="text"
                  required
                  value={editForm.bidangPekerjaan}
                  onChange={(e) => setEditForm({ ...editForm, bidangPekerjaan: e.target.value })}
                  placeholder="Teknologi Informasi / Perbankan"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rentang Gaji</label>
                <select
                  value={editForm.rentangGaji}
                  onChange={(e) => setEditForm({ ...editForm, rentangGaji: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg"
                >
                  <option value="< Rp 3.000.000">&lt; Rp 3.000.000</option>
                  <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                  <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                  <option value="> Rp 10.000.000">&gt; Rp 10.000.000</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniTracerPage;
