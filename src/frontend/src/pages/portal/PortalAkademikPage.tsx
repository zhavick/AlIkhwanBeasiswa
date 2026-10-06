import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Award,
  Upload,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const PortalAkademikPage: React.FC = () => {
  const { user } = useAuth();

  const [riwayatNilai, setRiwayatNilai] = useState([
    { semester: 'Semester 1', ipk: 3.65, sks: 20, status: 'Memenuhi Standar', catatan: 'Prestasi sangat baik' },
    { semester: 'Semester 2', ipk: 3.72, sks: 22, status: 'Memenuhi Standar', catatan: 'Peningkatan konsisten' },
    { semester: 'Semester 3', ipk: 3.80, sks: 24, status: 'Memenuhi Standar', catatan: 'Juara 2 Lomba Karya Tulis' },
    { semester: 'Semester 4', ipk: 3.88, sks: 22, status: 'Memenuhi Standar', catatan: 'KHS Terverifikasi Admin' },
  ]);

  const [inputNilai, setInputNilai] = useState({
    semester: 'Semester 5',
    ipk: 3.90,
    sks: 20,
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setRiwayatNilai([
      ...riwayatNilai,
      {
        semester: inputNilai.semester,
        ipk: inputNilai.ipk,
        sks: inputNilai.sks,
        status: 'Menunggu Verifikasi',
        catatan: 'Baru saja diunggah',
      },
    ]);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rapor & Capaian Akademik</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau konsistensi evaluasi nilai studi sebagai syarat keberlanjutan beasiswa per semester.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nilai semester berhasil dikirim dan masuk antrean verifikasi tim beasiswa.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">IPK Kumulatif Saat Ini</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">3.76</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Di atas batas minimum (3.00)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total SKS / Beban Selesai</span>
          <div className="text-3xl font-black text-slate-800 mt-1">88 SKS</div>
          <div className="text-[11px] text-slate-400 mt-1">Selesai 4 Semester Aktif</div>
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
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Rekap Nilai Perkuliahan / Rapor Per Semester
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">IPK / Rata-rata</th>
                  <th className="py-3 px-4">Beban Studi</th>
                  <th className="py-3 px-4">Status & Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayatNilai.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.semester}</td>
                    <td className="py-3 px-4">
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        {item.ipk.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.sks} SKS</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{item.status}</span>
                      <span className="text-[10px] text-slate-400">{item.catatan}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Upload Nilai Semester Baru */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Upload KHS Semester Baru</h3>
          <p className="text-xs text-slate-500 mb-4">
            Laporkan hasil studi semester berjalan untuk pencairan beasiswa periode berikutnya.
          </p>

          <form onSubmit={handleSimpan} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Yang Dilaporkan *</label>
              <input
                type="text"
                required
                value={inputNilai.semester}
                onChange={(e) => setInputNilai({ ...inputNilai, semester: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IPK / Rata-rata Rapor *</label>
              <input
                type="number"
                step="0.01"
                required
                value={inputNilai.ipk}
                onChange={(e) => setInputNilai({ ...inputNilai, ipk: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 border rounded-lg font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Beban SKS Semester Ini</label>
              <input
                type="number"
                required
                value={inputNilai.sks}
                onChange={(e) => setInputNilai({ ...inputNilai, sks: parseInt(e.target.value) })}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scan Dokumen KHS / Rapor (PDF)</label>
              <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 block transition">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-emerald-700 font-bold block">Pilih Berkas KHS</span>
                <span className="text-[10px] text-slate-400">PDF atau Gambar (Maks 3MB)</span>
                <input type="file" className="hidden" />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-xs"
            >
              Kirim Nilai Akademik
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortalAkademikPage;
