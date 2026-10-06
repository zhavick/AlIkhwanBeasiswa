import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Banknote,
  ArrowRight,
} from 'lucide-react';

export const FormPengajuanBeasiswaPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [periodeList, setPeriodeList] = useState<any[]>([]);
  const [syaratList, setSyaratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    periodeId: 1,
    nominalDiajukan: 2500000,
    alasanPengajuan: '',
    nilaiTerakhir: 3.85,
    semesterAtauKelas: 'Semester 5',
  });

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [pRes, sRes] = await Promise.allSettled([
          api.get('/beasiswa/periode-aktif'),
          api.get('/portal-cms/syarat-dokumen'),
        ]);

        if (pRes.status === 'fulfilled' && pRes.value.data.length > 0) {
          setPeriodeList(pRes.value.data);
          setFormData((prev) => ({ ...prev, periodeId: pRes.value.data[0].periodeId }));
        }
        if (sRes.status === 'fulfilled') {
          setSyaratList(sRes.value.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInit();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Backend expects AjukanBeasiswaDto
      const payload = {
        penerimaId: user?.profileId || 1,
        periodeId: formData.periodeId,
        nominalDiajukan: formData.nominalDiajukan,
        alasanPengajuan: formData.alasanPengajuan,
        nilaiTerakhir: formData.nilaiTerakhir,
        semesterAtauKelas: formData.semesterAtauKelas,
      };

      const res = await api.post('/beasiswa/ajukan', payload);
      alert(`Permohonan beasiswa Anda berhasil diajukan dengan Nomor: ${res.data.nomorPengajuan}`);
      navigate('/portal/status');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Gagal mengajukan beasiswa. Pastikan seluruh kolom terisi lengkap.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Formulir Pengajuan Beasiswa Al-Ikhwan</h1>
            <p className="text-xs text-emerald-100">
              Lengkapi data permohonan dana beasiswa pendidikan untuk periode aktif
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs">
        {/* Section 1: Periode & Nominal */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Pilihan Periode & Nominal Kebutuhan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Periode Beasiswa *</label>
              <select
                value={formData.periodeId}
                onChange={(e) => setFormData({ ...formData, periodeId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500"
              >
                {periodeList.map((p) => (
                  <option key={p.periodeId} value={p.periodeId}>
                    {p.namaPeriode} (Pagu: Rp {p.anggaranPagu?.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nominal Bantuan yang Diajukan (Rp) *
              </label>
              <div className="relative">
                <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  value={formData.nominalDiajukan}
                  onChange={(e) => setFormData({ ...formData, nominalDiajukan: parseFloat(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Nilai & Prestasi */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Capaian Akademik Terakhir
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tingkat Kelas atau Semester Aktif *
              </label>
              <input
                type="text"
                required
                value={formData.semesterAtauKelas}
                onChange={(e) => setFormData({ ...formData, semesterAtauKelas: e.target.value })}
                placeholder="Contoh: Kelas XII SMA / Semester 5"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nilai Rata-rata Rapor atau IPK Semester Lalu *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.nilaiTerakhir}
                onChange={(e) => setFormData({ ...formData, nilaiTerakhir: parseFloat(e.target.value) })}
                placeholder="Contoh: 88.5 (Rapor) atau 3.75 (IPK)"
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alasan & Rincian Pengajuan Bantuan Pendidikan *
              </label>
              <textarea
                rows={3}
                required
                value={formData.alasanPengajuan}
                onChange={(e) => setFormData({ ...formData, alasanPengajuan: e.target.value })}
                placeholder="Jelaskan kondisi ekonomi keluarga, tanggungan orang tua, dan tujuan alokasi dana beasiswa..."
                className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Berkas Persyaratan */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3. Verifikasi Kelengkapan Dokumen Berkas
          </h2>

          <div className="space-y-2">
            {syaratList.map((s) => (
              <div
                key={s.syaratId}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{s.namaSyarat}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({s.deskripsi || 'PDF/JPG max 2MB'})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Siap Diunggah
                  </span>
                  <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1 transition">
                    <Upload className="w-3 h-3" />
                    <span>Pilih File</span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Dengan mengajukan, Anda menyatakan data yang diisi adalah benar dan sah.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Mengirimkan...' : 'Kirim Pengajuan Beasiswa'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPengajuanBeasiswaPage;
