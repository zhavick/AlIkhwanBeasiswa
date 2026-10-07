import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, BookOpen, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerPenerima } = useAuth();
  const navigate = useNavigate();

  const [tipePenerima, setTipePenerima] = useState<number>(2); // 1 = Siswa, 2 = Mahasiswa
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    namaLengkap: '',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2005-01-01',
    alamatLengkap: '',
    noTelp: '',
    namaAyah: '',
    namaIbu: '',
    pekerjaanAyah: 'Buruh Harian',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    telahMeninggalAyah: false,
    telahMeninggalIbu: false,
    institusiPendidikan: '',
    jenjang: 'S1',
    jurusan: 'Teknik Informatika',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerPenerima({
        ...formData,
        tipePenerima: tipePenerima,
        tanggalLahir: new Date(formData.tanggalLahir).toISOString(),
      });
      navigate('/portal', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Registrasi gagal. Pastikan seluruh kolom terisi dengan benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Pendaftaran Mandiri Penerima Beasiswa</h1>
            <p className="text-xs text-emerald-100 mt-1">
              Buat akun Anda untuk mengajukan beasiswa Yayasan Al-Ikhwan
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipe Penerima Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Jenjang Beasiswa</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipePenerima(1);
                  setFormData((prev) => ({ ...prev, jenjang: 'SMA', jurusan: 'IPA' }));
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                  tipePenerima === 1
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-sm">Tingkat Siswa</div>
                  <div className="text-[11px] text-slate-500 font-normal">SD / SMP / SMA Sederajat</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipePenerima(2);
                  setFormData((prev) => ({ ...prev, jenjang: 'S1', jurusan: 'Teknik Informatika' }));
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                  tipePenerima === 2
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-sm">Tingkat Mahasiswa</div>
                  <div className="text-[11px] text-slate-500 font-normal">Diploma / Sarjana (D3 / S1)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section: Akun Login */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Informasi Akun</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="fajar_ikhwan"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="fajar@gmail.com"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Biodata Pribadi */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Biodata Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  name="namaLengkap"
                  value={formData.namaLengkap}
                  onChange={handleChange}
                  placeholder="Fajar Hidayat"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP *</label>
                <input
                  type="tel"
                  required
                  name="noTelp"
                  value={formData.noTelp}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir *</label>
                <input
                  type="text"
                  required
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  required
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  name="alamatLengkap"
                  value={formData.alamatLengkap}
                  onChange={handleChange}
                  placeholder="Jl. Kebahagiaan No. 12, RT 02/05, Jakarta Selatan"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section: Institusi Pendidikan */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Data Pendidikan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tipePenerima === 1 ? 'Nama Sekolah *' : 'Nama Universitas / Politeknik *'}
                </label>
                <input
                  type="text"
                  required
                  name="institusiPendidikan"
                  value={formData.institusiPendidikan}
                  onChange={handleChange}
                  placeholder={tipePenerima === 1 ? 'SMAN 1 Jakarta' : 'Universitas Indonesia'}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang *</label>
                <select
                  name="jenjang"
                  value={formData.jenjang}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                >
                  {tipePenerima === 1 ? (
                    <>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="SMK">SMK</option>
                    </>
                  ) : (
                    <>
                      <option value="D3">Diploma 3 (D3)</option>
                      <option value="S1">Sarjana (S1)</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jurusan / Program Studi</label>
                <input
                  type="text"
                  name="jurusan"
                  value={formData.jurusan || ''}
                  onChange={handleChange}
                  placeholder="Teknik Informatika"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section: Orang Tua */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Informasi Orang Tua / Wali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ayah *</label>
                <input
                  type="text"
                  required
                  name="namaAyah"
                  value={formData.namaAyah}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
                <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    name="telahMeninggalAyah"
                    checked={formData.telahMeninggalAyah}
                    onChange={handleChange}
                  />
                  <span>Telah meninggal (Alm)</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ibu *</label>
                <input
                  type="text"
                  required
                  name="namaIbu"
                  value={formData.namaIbu}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                />
                <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    name="telahMeninggalIbu"
                    checked={formData.telahMeninggalIbu}
                    onChange={handleChange}
                  />
                  <span>Telah meninggal (Almh)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link to="/portal?login=true" className="text-xs text-slate-600 hover:text-emerald-700">
              Sudah memiliki akun? Masuk
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
