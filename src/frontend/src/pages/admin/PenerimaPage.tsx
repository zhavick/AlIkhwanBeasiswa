import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  GraduationCap,
  BookOpen,
  Search,
  Award,
  ChevronRight,
  UserCheck,
  CheckCircle,
  ExternalLink,
  Download,
} from 'lucide-react';

export const PenerimaPage: React.FC = () => {
  const [tab, setTab] = useState<'siswa' | 'mahasiswa'>('siswa');
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPenerima, setSelectedPenerima] = useState<any | null>(null);
  const [lulusModal, setLulusModal] = useState<any | null>(null);
  const [lulusData, setLulusData] = useState({
    tahunLulus: new Date().getFullYear(),
    ipkAkhir: 3.75,
    judulSkripsi: '',
    instansiKerja: '',
    posisiJabatan: '',
    bidangIndustri: 'Teknologi Informasi',
    gajiKisaran: 'Rp 6.000.000 - Rp 10.000.000',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [siswaRes, mhsRes] = await Promise.all([
        api.get('/siswa'),
        api.get('/mahasiswa'),
      ]);
      setSiswaList(siswaRes.data);
      setMahasiswaList(mhsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLuluskan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lulusModal) return;
    setActionLoading(true);
    try {
      await api.post('/alumni/luluskan-mahasiswa', {
        mahasiswaId: lulusModal.mahasiswaId,
        ...lulusData,
      });
      setSuccessMsg(`Selamat! Mahasiswa ${lulusModal.penerima?.namaLengkap} berhasil diluluskan dan beralih ke direktori Alumni.`);
      setLulusModal(null);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal meluluskan mahasiswa');
    } finally {
      setActionLoading(false);
    }
  };

  const currentList = tab === 'siswa' ? siswaList : mahasiswaList;
  const filteredList = currentList.filter((item) => {
    const q = search.toLowerCase();
    const nama = item.penerima?.namaLengkap?.toLowerCase() || '';
    const inst = (tab === 'siswa' ? item.namaSekolah : item.namaUniversitas)?.toLowerCase() || '';
    return nama.includes(q) || inst.includes(q);
  });

  const handleExportCSV = () => {
    if (tab === 'siswa') {
      if (siswaList.length === 0) return;
      const headers = ['Nama Siswa', 'NISN', 'Tingkat', 'Sekolah', 'Kelas', 'Nilai Rata-rata', 'No Telp', 'Status'];
      const rows = siswaList.map((s) => [
        `"${s.namaSiswa || '-'}"`,
        `"${s.nisn || '-'}"`,
        `"${s.tingkatSekolah || '-'}"`,
        `"${s.namaSekolah || '-'}"`,
        `"${s.kelas || '-'}"`,
        s.nilaiRataRataRapor || 0,
        `"${s.noTelp || '-'}"`,
        s.statusAktif ? 'Aktif' : 'Non-Aktif',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rekap_siswa_alikhwan_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (mahasiswaList.length === 0) return;
      const headers = ['Nama Mahasiswa', 'NIM', 'Universitas', 'Fakultas', 'Jurusan', 'Semester', 'IPK Terakhir', 'Status Akademik', 'No Telp'];
      const rows = mahasiswaList.map((m) => [
        `"${m.namaMahasiswa || '-'}"`,
        `"${m.nim || '-'}"`,
        `"${m.namaUniversitas || '-'}"`,
        `"${m.fakultas || '-'}"`,
        `"${m.jurusan || '-'}"`,
        m.semester || 1,
        m.ipkTerakhir || 0,
        m.statusAkademik === 3 ? 'Lulus (Alumni)' : m.statusAkademik === 2 ? 'Cuti' : 'Aktif',
        `"${m.noTelp || '-'}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rekap_mahasiswa_alikhwan_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Database Penerima Beasiswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data terpadu profil siswa dan mahasiswa, riwayat akademik, dan transisi kelulusan.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 self-start"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV {tab === 'siswa' ? 'Siswa' : 'Mahasiswa'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('siswa')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              tab === 'siswa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tingkat Siswa ({siswaList.length})</span>
          </button>
          <button
            onClick={() => setTab('mahasiswa')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              tab === 'mahasiswa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tingkat Mahasiswa ({mahasiswaList.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari penerima atau institusi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Penerima</th>
                <th className="py-3 px-4">
                  {tab === 'siswa' ? 'Sekolah & Kelas' : 'Universitas & Prodi'}
                </th>
                <th className="py-3 px-4">
                  {tab === 'siswa' ? 'Rata-rata Rapor' : 'Semester & IPK'}
                </th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data penerima...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const p = item.penerima;
                  return (
                    <tr key={tab === 'siswa' ? item.siswaId : item.mahasiswaId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p?.namaLengkap}</div>
                        <div className="text-[11px] text-slate-400">{p?.user?.email || p?.noTelp}</div>
                      </td>
                      <td className="py-3 px-4">
                        {tab === 'siswa' ? (
                          <>
                            <div className="font-semibold text-slate-800">{item.namaSekolah}</div>
                            <div className="text-[11px] text-slate-500">{item.tingkatKelas} • NISN: {item.nisn || '-'}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-slate-800">{item.namaUniversitas}</div>
                            <div className="text-[11px] text-slate-500">{item.programStudi} • NIM: {item.nim || '-'}</div>
                          </>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {tab === 'siswa' ? (
                          <div className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                            {item.nilaiRaporTerakhir ? item.nilaiRaporTerakhir.toFixed(1) : '-'}
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                              IPK {item.ipkTerakhir ? item.ipkTerakhir.toFixed(2) : '-'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Sem {item.semesterAktif || 1}</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{p?.orangTua?.namaAyah} / {p?.orangTua?.namaIbu}</div>
                        <div className="text-[10px] text-slate-400">{p?.orangTua?.pekerjaanAyah || 'Wiraswasta'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Aktif Menerima
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPenerima(item)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] transition"
                          >
                            Detail
                          </button>
                          {tab === 'mahasiswa' && (
                            <button
                              onClick={() => setLulusModal(item)}
                              title="Tandai lulus & pindahkan ke direktori Alumni"
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded text-[11px] transition flex items-center gap-1 shadow-xs"
                            >
                              <Award className="w-3 h-3" />
                              <span>Luluskan</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Penerima */}
      {selectedPenerima && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Detail Profil Penerima</h3>
              <button onClick={() => setSelectedPenerima(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
                  {selectedPenerima.penerima?.namaLengkap?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedPenerima.penerima?.namaLengkap}</h4>
                  <p className="text-slate-500">{selectedPenerima.penerima?.user?.email} • {selectedPenerima.penerima?.noTelp}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Tempat, Tgl Lahir:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPenerima.penerima?.tempatLahir},{' '}
                    {new Date(selectedPenerima.penerima?.tanggalLahir).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Alamat:</span>
                  <span className="font-semibold text-slate-800">{selectedPenerima.penerima?.alamatLengkap}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Orang Tua / Wali:</span>
                  <span className="font-semibold text-slate-800">
                    Ayah: {selectedPenerima.penerima?.orangTua?.namaAyah}<br />
                    Ibu: {selectedPenerima.penerima?.orangTua?.namaIbu}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Pendidikan:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPenerima.namaSekolah || selectedPenerima.namaUniversitas}<br />
                    {selectedPenerima.tingkatKelas || selectedPenerima.programStudi}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end">
                <button
                  onClick={() => setSelectedPenerima(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Luluskan Mahasiswa */}
      {lulusModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-purple-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Award className="w-4 h-4" />
                Luluskan Mahasiswa & Beralih ke Alumni
              </h3>
              <button onClick={() => setLulusModal(null)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleLuluskan} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Mahasiswa <strong>{lulusModal.penerima?.namaLengkap}</strong> ({lulusModal.namaUniversitas}) akan diubah statusnya menjadi Alumni dan dibuatkan rekam tracer karir pertamanya.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Kelulusan *</label>
                  <input
                    type="number"
                    required
                    value={lulusData.tahunLulus}
                    onChange={(e) => setLulusData({ ...lulusData, tahunLulus: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IPK Akhir *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={lulusData.ipkAkhir}
                    onChange={(e) => setLulusData({ ...lulusData, ipkAkhir: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Judul Tugas Akhir / Skripsi</label>
                  <input
                    type="text"
                    value={lulusData.judulSkripsi}
                    onChange={(e) => setLulusData({ ...lulusData, judulSkripsi: e.target.value })}
                    placeholder="Implementasi Deep Learning untuk..."
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              {/* Data Pekerjaan Awal Alumni */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-2 text-[10px]">
                  Informasi Tempat Kerja Saat Ini (Jika Ada)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan / Instansi</label>
                    <input
                      type="text"
                      value={lulusData.instansiKerja}
                      onChange={(e) => setLulusData({ ...lulusData, instansiKerja: e.target.value })}
                      placeholder="PT. Telkom Indonesia"
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Posisi / Jabatan</label>
                    <input
                      type="text"
                      value={lulusData.posisiJabatan}
                      onChange={(e) => setLulusData({ ...lulusData, posisiJabatan: e.target.value })}
                      placeholder="Software Engineer"
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLulusModal(null)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Konfirmasi Kelulusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenerimaPage;
