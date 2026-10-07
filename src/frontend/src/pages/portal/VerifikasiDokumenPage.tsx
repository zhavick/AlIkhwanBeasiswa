import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, ShieldAlert, CheckCircle2, FileText, Calendar, User, School, ArrowLeft, Search } from 'lucide-react';

interface VerifikasiResult {
  isValid: boolean;
  jenisDokumen: string;
  nomorDokumen: string;
  namaPenerima: string;
  institusi: string;
  tanggalTerbit: string;
  keterangan: string;
  penandatangan: string;
  status: string;
}

export const VerifikasiDokumenPage: React.FC = () => {
  const { kode } = useParams<{ kode: string }>();
  const [searchKode, setSearchKode] = useState(kode || '');
  const [result, setResult] = useState<VerifikasiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVerifikasi = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/dokumen/verifikasi/${codeToVerify.trim()}`);
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setResult(null);
      setErrorMsg(err.response?.data?.keterangan || 'Dokumen tidak ditemukan dalam arsip resmi Yayasan Al-Ikhwan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kode) {
      setSearchKode(kode);
      fetchVerifikasi(kode);
    } else {
      setLoading(false);
    }
  }, [kode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKode.trim()) {
      fetchVerifikasi(searchKode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition">
              AI
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide block">Yayasan Al-Ikhwan</span>
              <span className="text-[11px] text-slate-400 block">Sistem Verifikasi Dokumen & QR Resmi</span>
            </div>
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        {/* Search Bar Input */}
        <div className="w-full max-w-xl mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={searchKode}
              onChange={(e) => setSearchKode(e.target.value)}
              placeholder="Masukkan atau tempel kode dokumen (cth: V-SK-001002)..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
            >
              Cek Kode
            </button>
          </form>
        </div>

        {/* Status Card */}
        {loading ? (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-10 text-center max-w-lg w-full">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-300 font-medium">Memeriksa keaslian dokumen pada basis data yayasan...</p>
          </div>
        ) : result && result.isValid ? (
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-emerald-400/30 overflow-hidden max-w-xl w-full animate-in fade-in zoom-in-95 duration-300">
            {/* Top Verified Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner border border-white/30">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-black tracking-tight">DOKUMEN ASLI & TERVERIFIKASI</h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Resmi Terdaftar di Database Yayasan Pendidikan & Sosial Al-Ikhwan
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-[11px] font-mono text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Kode Hash: {searchKode}</span>
              </div>
            </div>

            {/* Document Details Table */}
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Jenis & Nomor Dokumen</span>
                    <strong className="text-slate-900 text-sm block">{result.jenisDokumen}</strong>
                    <span className="font-mono text-slate-600 font-bold">{result.nomorDokumen}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Nama Penerima Manfaat</span>
                    <strong className="text-slate-900 text-sm">{result.namaPenerima}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <School className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Asal Sekolah / Kampus</span>
                    <span className="text-slate-800 font-semibold">{result.institusi}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Tanggal Penetapan / Penyaluran</span>
                    <span className="text-slate-800 font-semibold">
                      {new Date(result.tanggalTerbit).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keterangan & Pengesahan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Keterangan Resmi:
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">{result.keterangan}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Ditetapkan / Disahkan oleh:</span>
                  <strong className="text-slate-800">{result.penandatangan}</strong>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-400">
                  Sistem ini memastikan validitas surat/kwitansi dan mencegah pemalsuan dokumen beasiswa.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/80 border border-rose-500/40 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Dokumen Tidak Ditemukan</h3>
            <p className="text-xs text-rose-300 mb-6 leading-relaxed">
              {errorMsg || 'Kode dokumen yang Anda periksa tidak terdaftar dalam catatan resmi Yayasan Al-Ikhwan.'}
            </p>
            <p className="text-[11px] text-slate-400 mb-4">
              Mohon periksa kembali ejaan kode atau hubungi sekretariat yayasan untuk verifikasi manual.
            </p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} Yayasan Al-Ikhwan. Lembaga Pengelola Beasiswa & Kaderisasi Mandiri.
      </footer>
    </div>
  );
};

export default VerifikasiDokumenPage;
