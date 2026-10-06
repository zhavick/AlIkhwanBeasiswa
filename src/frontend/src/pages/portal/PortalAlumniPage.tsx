import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  Building,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

export const PortalAlumniPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'karir' | 'kontribusi'>('karir');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [karirData, setKarirData] = useState({
    alumniId: 1,
    instansiKerja: 'PT. Bank Syariah Indonesia Tbk',
    posisiJabatan: 'Product Specialist',
    bidangIndustri: 'Perbankan & Keuangan Syariah',
    gajiKisaran: 'Rp 8.000.000 - Rp 12.000.000',
    lamaTungguBulan: 2,
    alamatKantor: 'Jakarta Selatan',
  });

  const [kontribusiData, setKontribusiData] = useState({
    alumniId: 1,
    jenisKontribusi: 'Mentor Adik Asuh & Donasi Rutin',
    nominalRupiah: 500000,
    keterangan: 'Bantuan uang saku bulanan untuk 1 orang adik asuh jenjang SMA.',
  });

  const handleUpdateKarir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/alumni/update-karir', karirData);
      setSuccessMsg('Data karir & pekerjaan Anda berhasil diperbarui di sistem tracer!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui data karir');
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanKontribusi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/alumni/kontribusi', kontribusiData);
      setSuccessMsg('Jazakumullah Khairan Katsiran! Komitmen kontribusi alumni Anda telah dicatat.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan komitmen kontribusi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Portal Jejaring & Tracer Karir Alumni</h1>
            <p className="text-xs text-purple-200">
              Wadah silaturahmi, pembaruan jejak profesional, dan kontribusi balik bagi alumni penerima beasiswa Al-Ikhwan.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('karir')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'karir'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Pembaruan Data Pekerjaan Saat Ini</span>
        </button>

        <button
          onClick={() => setActiveTab('kontribusi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'kontribusi'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Komitmen Donasi & Mentor Adik Asuh</span>
        </button>
      </div>

      {/* Tab Karir */}
      {activeTab === 'karir' && (
        <form onSubmit={handleUpdateKarir} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h2 className="font-bold text-slate-800 text-sm">Form Tracer Studi Tempat Bekerja</h2>
          <p className="text-slate-500 text-xs">
            Data ini membantu yayasan mengevaluasi dampak bantuan beasiswa terhadap serapan dunia kerja alumni.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan / Lembaga *</label>
              <input
                type="text"
                required
                value={karirData.instansiKerja}
                onChange={(e) => setKarirData({ ...karirData, instansiKerja: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Posisi / Jabatan Pekerjaan *</label>
              <input
                type="text"
                required
                value={karirData.posisiJabatan}
                onChange={(e) => setKarirData({ ...karirData, posisiJabatan: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bidang / Sektor Industri *</label>
              <select
                value={karirData.bidangIndustri}
                onChange={(e) => setKarirData({ ...karirData, bidangIndustri: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Teknologi Informasi & Digital">Teknologi Informasi & Digital</option>
                <option value="Perbankan & Keuangan Syariah">Perbankan & Keuangan Syariah</option>
                <option value="Pendidikan & Riset">Pendidikan & Riset</option>
                <option value="Kesehatan & Farmasi">Kesehatan & Farmasi</option>
                <option value="Pemerintahan / BUMN">Pemerintahan / BUMN</option>
                <option value="Wirausaha / Bisnis Mandiri">Wirausaha / Bisnis Mandiri</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Masa Tunggu Setelah Wisuda</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={karirData.lamaTungguBulan}
                  onChange={(e) => setKarirData({ ...karirData, lamaTungguBulan: parseInt(e.target.value) })}
                  className="w-24 px-3 py-2 border rounded-lg font-bold"
                />
                <span className="text-slate-500">Bulan hingga diterima kerja</span>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Rentang Penghasilan / Gaji</label>
              <select
                value={karirData.gajiKisaran}
                onChange={(e) => setKarirData({ ...karirData, gajiKisaran: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Di bawah Rp 4.000.000">Di bawah Rp 4.000.000</option>
                <option value="Rp 4.000.000 - Rp 8.000.000">Rp 4.000.000 - Rp 8.000.000</option>
                <option value="Rp 8.000.000 - Rp 15.000.000">Rp 8.000.000 - Rp 15.000.000</option>
                <option value="Di atas Rp 15.000.000">Di atas Rp 15.000.000</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition"
            >
              {loading ? 'Menyimpan...' : 'Perbarui Data Karir'}
            </button>
          </div>
        </form>
      )}

      {/* Tab Kontribusi */}
      {activeTab === 'kontribusi' && (
        <form onSubmit={handleSimpanKontribusi} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <HeartHandshake className="w-5 h-5" />
            <h2 className="text-slate-800 text-sm">Program Alumni Peduli: Menjadi Donatur & Kakak Asuh</h2>
          </div>
          <p className="text-slate-500 text-xs">
            Alumni yang telah mandiri berkesempatan melanjutkan mata rantai kebaikan dengan menjadi mentor atau donatur bagi adik-adik penerima beasiswa baru.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bentuk Partisipasi Kontribusi *</label>
              <select
                value={kontribusiData.jenisKontribusi}
                onChange={(e) => setKontribusiData({ ...kontribusiData, jenisKontribusi: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Mentor Karir & Kakak Asuh">Mentor Karir & Kakak Asuh (Berbagi Pengalaman)</option>
                <option value="Donasi Rutin Beasiswa">Donasi Rutin Bulanan</option>
                <option value="Pemateri Kajian / Workshop">Pemateri Kajian / Workshop Softskill</option>
                <option value="Penyedia Informasi Lowongan Magang/Kerja">Penyedia Info Magang & Karir</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal Donasi Rutin (Opsional)</label>
              <input
                type="number"
                value={kontribusiData.nominalRupiah}
                onChange={(e) => setKontribusiData({ ...kontribusiData, nominalRupiah: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pesan & Harapan untuk Adik Asuh</label>
              <textarea
                rows={3}
                value={kontribusiData.keterangan}
                onChange={(e) => setKontribusiData({ ...kontribusiData, keterangan: e.target.value })}
                placeholder="Semangat menuntut ilmu, semoga kelak bisa bermanfaat luas untuk ummat..."
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
            >
              {loading ? 'Menyimpan...' : 'Kirim Komitmen Kontribusi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PortalAlumniPage;
