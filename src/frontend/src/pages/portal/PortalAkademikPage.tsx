import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Award,
  Upload,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Building,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';

export const PortalAkademikPage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inputNilai, setInputNilai] = useState({
    semester: 5,
    mataKuliah: 'Kajian Keislaman & Kepemimpinan',
    nilaiRata: 3.85,
    sks: 3,
    catatan: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const isSiswa = user?.profileType === 'Siswa';
      const profileId = user?.profileId || 1;
      const endpoint = isSiswa ? `/siswa/${profileId}` : `/mahasiswa/${profileId}`;
      const res = await api.get(endpoint);
      setProfileData(res.data);
    } catch (err) {
      console.error('Gagal mengambil data akademik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const isSiswa = user?.profileType === 'Siswa';
      const profileId = user?.profileId || 1;

      if (isSiswa) {
        const pendId = profileData?.riwayatPendidikan?.[0]?.pendidikanId || 1;
        await api.post('/siswa/nilai', {
          siswaId: profileId,
          pendidikanId: pendId,
          semester: inputNilai.semester,
          nilaiRataRata: inputNilai.nilaiRata,
          catatan: inputNilai.catatan || inputNilai.mataKuliah,
        });
      } else {
        const univId = profileData?.riwayatUniversitas?.[0]?.univId || 1;
        await api.post('/mahasiswa/nilai', {
          mahasiswaId: profileId,
          univId: univId,
          mataKuliah: inputNilai.mataKuliah,
          semester: inputNilai.semester,
          nilaiRata: inputNilai.nilaiRata,
          sks: inputNilai.sks,
          informasiTambahan: inputNilai.catatan,
        });
      }

      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan nilai studi.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSiswa = user?.profileType === 'Siswa';
  const listNilai = isSiswa
    ? (profileData?.daftarNilai || [])
    : (profileData?.daftarNilai || []);

  const avgScore = listNilai.length > 0
    ? (listNilai.reduce((acc: number, cur: any) => acc + (cur.nilaiRata || cur.nilaiRataRata || 0), 0) / listNilai.length).toFixed(2)
    : '3.75';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rapor & Capaian Akademik</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau konsistensi evaluasi nilai studi dan laporkan KHS/Rapor semesteran sebagai syarat beasiswa.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nilai capaian studi berhasil disimpan ke pangkalan data beasiswa Al-Ikhwan.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">
            {isSiswa ? 'Nilai Rata-rata Rapor' : 'IPK Rata-rata'}
          </span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{avgScore}</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Memenuhi standar kriteria yayasan (Min {isSiswa ? '75.0' : '3.00'})</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Institusi Pendidikan Terdaftar</span>
          <div className="text-base font-bold text-slate-800 mt-1 line-clamp-1">
            {isSiswa
              ? (profileData?.riwayatPendidikan?.[0]?.namaSekolah || 'Sekolah Terdaftar')
              : (profileData?.riwayatUniversitas?.[0]?.namaUniversitas || 'Universitas Terdaftar')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Jurusan / Jenjang: {isSiswa ? 'SMA / Sederajat' : (profileData?.riwayatUniversitas?.[0]?.jurusan || 'S1')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Status Kelayakan Beasiswa</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Memenuhi Syarat Berkelanjutan</span>
          </div>
        </div>
      </div>

      {/* Riwayat & Form Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Riwayat Nilai */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Rekapitulasi Capaian Mata Pelajaran / Kuliah
            </h3>
            <span className="text-[11px] text-slate-400">Total: {listNilai.length} Catatan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">{isSiswa ? 'Mata Pelajaran' : 'Mata Kuliah / Beban'}</th>
                  <th className="py-3 px-4">Nilai</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listNilai.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      Belum ada nilai akademik yang tercatat di sistem. Silakan isi form di samping.
                    </td>
                  </tr>
                ) : (
                  listNilai.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">Semester {item.semester}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.mataKuliah || item.catatan || 'Mata Pelajaran Wajib'}
                        {!isSiswa && item.sks ? ` (${item.sks} SKS)` : ''}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {(item.nilaiRata || item.nilaiRataRata)?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          Terverifikasi
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Tambah Nilai Baru */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-800">Lapor Nilai Semester Baru</h3>
          </div>

          <form onSubmit={handleSimpan} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Studi *</label>
              <select
                value={inputNilai.semester}
                onChange={(e) => setInputNilai({ ...inputNilai, semester: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isSiswa ? 'Mata Pelajaran / Bidang Studi *' : 'Nama Mata Kuliah *'}
              </label>
              <input
                type="text"
                required
                value={inputNilai.mataKuliah}
                onChange={(e) => setInputNilai({ ...inputNilai, mataKuliah: e.target.value })}
                placeholder="Contoh: Metodologi Penelitian"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isSiswa ? 'Nilai Rata-rata' : 'Nilai Angka / IPK'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={inputNilai.nilaiRata}
                  onChange={(e) => setInputNilai({ ...inputNilai, nilaiRata: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Beban SKS</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={inputNilai.sks}
                  onChange={(e) => setInputNilai({ ...inputNilai, sks: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={inputNilai.catatan}
                onChange={(e) => setInputNilai({ ...inputNilai, catatan: e.target.value })}
                placeholder="Prestasi atau keterangan nilai"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{submitting ? 'Menyimpan...' : 'Kirim Nilai Akademik'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortalAkademikPage;
