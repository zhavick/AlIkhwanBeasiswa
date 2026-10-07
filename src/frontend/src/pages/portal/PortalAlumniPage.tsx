import React, { useEffect, useState } from 'react';
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
  TrendingUp,
} from 'lucide-react';

export const PortalAlumniPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'karir' | 'kontribusi'>('karir');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kontribusiList, setKontribusiList] = useState<any[]>([]);

  const [karirData, setKarirData] = useState({
    mahasiswaId: user?.profileId || 0,
    instansiKerja: 'PT. Bank Syariah Indonesia Tbk',
    posisiJabatan: 'Product Specialist',
    bidangIndustri: 'Perbankan & Keuangan Syariah',
    gajiKisaran: 'Rp 8.000.000 - Rp 12.000.000',
    lamaTungguBulan: 2,
    alamatKantor: 'Jakarta Selatan',
  });

  const [kontribusiData, setKontribusiData] = useState({
    jenisKontribusi: 'Mentor Adik Asuh & Donasi Rutin',
    nominalRupiah: 500000,
    keterangan: 'Bantuan uang saku bulanan untuk 1 orang adik asuh jenjang SMA.',
  });

  useEffect(() => {
    const fetchAlumniInfo = async () => {
      try {
        const [trRes, koRes] = await Promise.allSettled([
          api.get('/alumni/my-tracer'),
          api.get('/alumni/kontribusi'),
        ]);

        if (trRes.status === 'fulfilled' && trRes.value.data) {
          const t = trRes.value.data;
          setKarirData((prev) => ({
            ...prev,
            mahasiswaId: t.mahasiswaId || prev.mahasiswaId,
            instansiKerja: t.namaPerusahaan || prev.instansiKerja,
            posisiJabatan: t.jabatan || prev.posisiJabatan,
            bidangIndustri: t.bidangPekerjaan || prev.bidangIndustri,
            gajiKisaran: t.rentangGaji || prev.gajiKisaran,
          }));
        }

        if (koRes.status === 'fulfilled') {
          setKontribusiList(koRes.value.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAlumniInfo();
  }, [user]);

  const handleUpdateKarir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/alumni/update-karir', {
        ...karirData,
        mahasiswaId: user?.profileId || karirData.mahasiswaId,
      });
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
      await api.post('/alumni/kontribusi', {
        mahasiswaId: user?.profileId || 0,
        tipeKontribusi: kontribusiData.jenisKontribusi,
        deskripsiKontribusi: kontribusiData.keterangan,
        nominalDonasi: kontribusiData.nominalRupiah,
      });
      setSuccessMsg('Jazakumullah Khairan Katsiran! Komitmen kontribusi alumni Anda telah dicatat.');
      setTimeout(() => setSuccessMsg(null), 4000);

      // Refresh list
      const koRes = await api.get('/alumni/kontribusi');
      setKontribusiList(koRes.data);
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
          <span>Tracer Jejak Karir</span>
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
          <span>Giving Back & Kontribusi</span>
        </button>
      </div>

      {/* Tab 1: Form Tracer Karir */}
      {activeTab === 'karir' && (
        <form onSubmit={handleUpdateKarir} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Pembaruan Riwayat Pekerjaan</h2>
              <p className="text-[11px] text-slate-400">
                Data ini membantu yayasan mengukur keselarasan studi dan daya serap lulusan penerima beasiswa.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
              Status: Bekerja
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Perusahaan / Tempat Bekerja *
              </label>
              <input
                type="text"
                required
                value={karirData.instansiKerja}
                onChange={(e) => setKarirData({ ...karirData, instansiKerja: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Posisi / Jabatan Pekerjaan *
              </label>
              <input
                type="text"
                required
                value={karirData.posisiJabatan}
                onChange={(e) => setKarirData({ ...karirData, posisiJabatan: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sektor / Bidang Industri *
              </label>
              <input
                type="text"
                required
                value={karirData.bidangIndustri}
                onChange={(e) => setKarirData({ ...karirData, bidangIndustri: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rentang Gaji / Pendapatan Bulanan
              </label>
              <select
                value={karirData.gajiKisaran}
                onChange={(e) => setKarirData({ ...karirData, gajiKisaran: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Rp 4.000.000 - Rp 7.000.000">Rp 4.000.000 - Rp 7.000.000</option>
                <option value="Rp 8.000.000 - Rp 12.000.000">Rp 8.000.000 - Rp 12.000.000</option>
                <option value="Rp 13.000.000 - Rp 20.000.000">Rp 13.000.000 - Rp 20.000.000</option>
                <option value="> Rp 20.000.000">&gt; Rp 20.000.000</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Perbarui Data Karir'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Komitmen Kontribusi */}
      {activeTab === 'kontribusi' && (
        <div className="space-y-6">
          <form onSubmit={handleSimpanKontribusi} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
            <div className="border-b pb-3">
              <h2 className="font-bold text-sm text-slate-800">Program Berbagi & Mentoring Adik Asuh</h2>
              <p className="text-[11px] text-slate-400">
                Peluang memberikan dampak nyata bagi generasi penerus beasiswa Al-Ikhwan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bentuk Kontribusi yang Dipilih *
                </label>
                <select
                  value={kontribusiData.jenisKontribusi}
                  onChange={(e) => setKontribusiData({ ...kontribusiData, jenisKontribusi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Mentor Adik Asuh & Donasi Rutin">Mentor Adik Asuh & Donasi Rutin</option>
                  <option value="Mentor Karir / Pemateri Kajian">Mentor Karir / Pemateri Kajian</option>
                  <option value="Donasi Beasiswa Bulanan">Donasi Beasiswa Bulanan</option>
                  <option value="Penyedia Peluang Magang/Kerja">Penyedia Peluang Magang/Kerja</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Komitmen Nominal Donasi (Rp / Bulan)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={kontribusiData.nominalRupiah}
                  onChange={(e) => setKontribusiData({ ...kontribusiData, nominalRupiah: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Kesiapan / Bidang Pendampingan
                </label>
                <textarea
                  rows={2}
                  value={kontribusiData.keterangan}
                  onChange={(e) => setKontribusiData({ ...kontribusiData, keterangan: e.target.value })}
                  placeholder="Keahlian yang dapat dibagikan kepada adik asuh..."
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Komitmen Kontribusi'}
              </button>
            </div>
          </form>

          {/* List Kontribusi Terdaftar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-slate-800">Daftar Komitmen Kontribusi Alumni Terdaftar</h3>
            {kontribusiList.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">Belum ada catatan kontribusi alumni.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {kontribusiList.map((k) => (
                  <div key={k.kontribusiId} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{k.namaAlumni}</span>
                      <span className="text-[11px] text-purple-700 font-semibold">{k.tipeKontribusi}</span>
                      {k.deskripsiKontribusi && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{k.deskripsiKontribusi}</p>
                      )}
                    </div>
                    {k.nominalDonasi > 0 && (
                      <span className="font-bold text-emerald-700 text-xs">
                        Rp {k.nominalDonasi?.toLocaleString('id-ID')} / bln
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalAlumniPage;
