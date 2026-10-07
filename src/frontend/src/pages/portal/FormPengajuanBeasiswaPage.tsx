import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Banknote,
  ArrowRight,
  Clock,
  FileCheck,
} from 'lucide-react';

export const FormPengajuanBeasiswaPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [periodeList, setPeriodeList] = useState<any[]>([]);
  const [syaratList, setSyaratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSyaratId, setUploadingSyaratId] = useState<number | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<number, { fileUrl: string; namaFileAsli: string }>>({});
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    periodeId: 1,
    tipePenerima: user?.profileType === 'Siswa' ? 1 : 2,
    paguBeasiswa: 2500000,
    alasanPengajuan: '',
    semesterAtauKelas: 'Semester 5',
    nilaiTerakhir: 3.85,
  });

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [pRes, sRes] = await Promise.allSettled([
          api.get('/beasiswa/periode'),
          api.get('/portal-cms/syarat-dokumen'),
        ]);

        if (pRes.status === 'fulfilled' && pRes.value.data.length > 0) {
          const activeOrAll = pRes.value.data.filter((p: any) => p.statusAktif);
          const list = activeOrAll.length > 0 ? activeOrAll : pRes.value.data;
          setPeriodeList(list);
          if (list.length > 0) {
            setFormData((prev) => ({ ...prev, periodeId: list[0].periodeId }));
          }
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

  const handleFileUpload = async (syaratId: number, file: File) => {
    setUploadingSyaratId(syaratId);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/portal-cms/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedDocs((prev) => ({
        ...prev,
        [syaratId]: {
          fileUrl: res.data.fileUrl,
          namaFileAsli: res.data.originalName || file.name,
        },
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengunggah berkas. Pastikan ukuran file sesuai ketentuan.');
    } finally {
      setUploadingSyaratId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const isSiswa = formData.tipePenerima === 1 || user?.profileType === 'Siswa';
      const payload = {
        periodeId: formData.periodeId,
        tipePenerima: isSiswa ? 1 : 2,
        siswaId: isSiswa ? (user?.profileId || 1) : null,
        mahasiswaId: !isSiswa ? (user?.profileId || 1) : null,
        paguBeasiswa: formData.paguBeasiswa,
        catatanPengajuan: `[${formData.semesterAtauKelas} - IPK/Nilai: ${formData.nilaiTerakhir}] ${formData.alasanPengajuan}`,
      };

      const res = await api.post('/beasiswa/pengajuan', payload);
      const pengajuanId = res.data.pengajuanId;

      // Attach any uploaded files to this new application
      const docEntries = Object.entries(uploadedDocs);
      for (const [sId, doc] of docEntries) {
        try {
          await api.post(`/portal-cms/pengajuan/${pengajuanId}/dokumen`, {
            syaratId: parseInt(sId, 10),
            fileUrl: doc.fileUrl,
            namaFileAsli: doc.namaFileAsli,
          });
        } catch (docErr) {
          console.warn('Gagal melampirkan berkas ke pengajuan:', docErr);
        }
      }

      alert(`Alhamdulillah! Permohonan beasiswa Anda berhasil diajukan (ID Pengajuan #${pengajuanId}). Status permohonan dapat dipantau di halaman Status Beasiswa.`);
      navigate('/portal/status');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Gagal mengajukan beasiswa. Pastikan seluruh kolom terisi lengkap dan periode aktif.'
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
              Lengkapi data permohonan dana beasiswa pendidikan dan lampirkan berkas persyaratan
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

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Menyiapkan formulir...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
          {/* Section 1: Data Pengajuan */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Informasi Periode & Nominal Bantuan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Periode Beasiswa Aktif *
                </label>
                <select
                  value={formData.periodeId}
                  onChange={(e) => setFormData({ ...formData, periodeId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  required
                >
                  {periodeList.map((p) => (
                    <option key={p.periodeId} value={p.periodeId}>
                      {p.namaPeriode} {p.statusAktif ? '(Aktif)' : '(Ditutup)'}
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
                    min={100000}
                    step={50000}
                    value={formData.paguBeasiswa}
                    onChange={(e) => setFormData({ ...formData, paguBeasiswa: parseFloat(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg font-bold text-slate-800"
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
                  Jenjang Pendidikan Penerima *
                </label>
                <select
                  value={formData.tipePenerima}
                  onChange={(e) => setFormData({ ...formData, tipePenerima: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value={2}>Mahasiswa (D3 / S1 Perguruan Tinggi)</option>
                  <option value={1}>Siswa (SD / SMP / SMA Sederajat)</option>
                </select>
              </div>

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

              <div className="md:col-span-2">
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
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Unggah Berkas Persyaratan Pendaftaran
              </h2>
              <span className="text-[11px] text-slate-500">
                Format: PDF / JPG / PNG (Maks 2MB)
              </span>
            </div>

            <div className="space-y-2">
              {syaratList.map((s) => {
                const docName = s.namaDokumen || s.namaSyarat || 'Berkas Persyaratan';
                const isUploaded = !!uploadedDocs[s.syaratId];
                const isUploading = uploadingSyaratId === s.syaratId;

                return (
                  <div
                    key={s.syaratId}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {isUploaded ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{docName}</span>
                          {s.wajib && (
                            <span className="text-[9px] px-1.5 py-0.2 font-bold bg-rose-100 text-rose-700 rounded">
                              Wajib
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {s.deskripsi || 'Scan/foto dokumen asli yang jelas dan terbaca.'}
                        </span>
                        {isUploaded && (
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            {uploadedDocs[s.syaratId].namaFileAsli}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUploaded ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                          Terunggah
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          Belum Diunggah
                        </span>
                      )}

                      <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isUploading ? 'Mengunggah...' : isUploaded ? 'Ganti File' : 'Pilih File'}</span>
                        <input
                          type="file"
                          disabled={isUploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(s.syaratId, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-400">
              Dengan mengirim formulir ini, Anda menyatakan seluruh data akademik dan berkas yang dilampirkan adalah benar.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Mengirimkan Pengajuan...' : 'Kirim Pengajuan Beasiswa'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FormPengajuanBeasiswaPage;
