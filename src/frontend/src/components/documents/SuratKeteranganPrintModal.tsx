import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Printer, X, Award, CheckCircle } from 'lucide-react';

interface SuratKeteranganData {
  pengajuanId: number;
  nomorSurat: string;
  namaPenerima: string;
  tipePenerima: string;
  nisn_NIM?: string;
  tempatTanggalLahir: string;
  jenjangPendidikan: string;
  institusiPendidikan: string;
  namaPeriode: string;
  paguTertanggung: number;
  tanggalDitetapkan: string;
  namaPimpinanYayasan: string;
  jabatanPimpinan: string;
  kodeVerifikasi: string;
  qrUrl: string;
  statusVerifikasi: string;
}

interface SuratKeteranganPrintModalProps {
  pengajuanId: number;
  onClose: () => void;
}

export const SuratKeteranganPrintModal: React.FC<SuratKeteranganPrintModalProps> = ({
  pengajuanId,
  onClose,
}) => {
  const [data, setData] = useState<SuratKeteranganData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSK = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dokumen/sk/${pengajuanId}`);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat data Surat Keterangan Beasiswa.');
      } finally {
        setLoading(false);
      }
    };
    fetchSK();
  }, [pengajuanId]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = data
    ? new Date(data.tanggalDitetapkan).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const qrImageUrl = data
    ? `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
        window.location.origin + data.qrUrl
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 printable-document-container">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Pratinjau Surat Keputusan / Keterangan Beasiswa</span>
            <span className="text-xs text-slate-400">| Format A4 Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="p-6 sm:p-12 max-h-[85vh] overflow-y-auto printable-document bg-white text-slate-800">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Memuat data dokumen resmi...</p>
            </div>
          ) : error || !data ? (
            <div className="py-16 text-center text-rose-600 text-sm font-semibold">
              {error || 'Data tidak ditemukan'}
            </div>
          ) : (
            <div className="space-y-6 text-sm leading-relaxed">
              {/* KOP SURAT FORMAL */}
              <div className="border-b-4 border-double border-slate-900 pb-3 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0 border border-emerald-900">
                  AI
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-lg sm:text-xl font-black tracking-wider text-slate-900 uppercase">
                    YAYASAN PENDIDIKAN & SOSIAL AL-IKHWAN
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700 tracking-wide uppercase">
                    DEWAN PENGURUS PUSAT PENGELOLA BEASISWA
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Sekretariat: Jl. Raya Masjid Al-Ikhwan No. 45, Jakarta | Telp: (021) 7890-1234 | Email: info@alikhwan.id
                  </p>
                </div>
              </div>

              {/* JUDUL SURAT & NOMOR */}
              <div className="text-center pt-2">
                <h2 className="text-base font-black text-slate-900 underline tracking-wide uppercase">
                  SURAT KETERANGAN PENERIMA BEASISWA
                </h2>
                <p className="text-xs text-slate-600 font-medium font-mono mt-0.5">
                  Nomor: {data.nomorSurat}
                </p>
              </div>

              {/* PARAGRAF PEMBUKA */}
              <p className="text-xs text-slate-700 text-justify">
                Yang bertanda tangan di bawah ini, Pimpinan Dewan Pengurus Yayasan Pendidikan & Sosial Al-Ikhwan, dengan ini menerangkan dan menetapkan bahwa:
              </p>

              {/* TABEL BIODATA PENERIMA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 text-slate-500 font-medium">Nama Lengkap</span>
                  <span className="col-span-8 font-bold text-slate-900">: {data.namaPenerima}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 text-slate-500 font-medium">Nomor Induk ({data.tipePenerima === 'Mahasiswa' ? 'NIM' : 'NISN'})</span>
                  <span className="col-span-8 font-mono text-slate-800">: {data.nisn_NIM || '-'}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 text-slate-500 font-medium">Tempat, Tanggal Lahir</span>
                  <span className="col-span-8 text-slate-800">: {data.tempatTanggalLahir}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 text-slate-500 font-medium">Jenjang Pendidikan</span>
                  <span className="col-span-8 text-slate-800">: {data.jenjangPendidikan} ({data.tipePenerima})</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 text-slate-500 font-medium">Institusi Pendidikan</span>
                  <span className="col-span-8 font-semibold text-slate-900">: {data.institusiPendidikan}</span>
                </div>
              </div>

              {/* KETETAPAN BEASISWA */}
              <div className="text-xs text-slate-700 space-y-2 text-justify">
                <p>
                  Adalah benar dan sah sebagai <strong>PENERIMA BANTUAN BEASISWA YAYASAN AL-IKHWAN</strong> pada <strong>{data.namaPeriode}</strong>, dengan alokasi pagu pendanaan yang disetujui sebesar:
                </p>
                <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Besaran Beasiswa Disetujui:</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    Rp {data.paguTertanggung.toLocaleString('id-ID')}
                  </span>
                </div>
                <p>
                  Bantuan ini diberikan guna mendukung kelancaran studi akademik yang bersangkutan serta pembinaan karakter, akhlak, dan kepemimpinan dalam program kaderisasi yayasan.
                </p>
                <p>
                  Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya bagi keperluan akademik maupun administrasi institusi terkait.
                </p>
              </div>

              {/* TANDA TANGAN & QR CODE LEGALITAS */}
              <div className="pt-8 grid grid-cols-12 gap-4 items-end">
                {/* QR Code Verifikasi */}
                <div className="col-span-6 flex items-center gap-3">
                  <img
                    src={qrImageUrl}
                    alt="QR Verifikasi"
                    className="w-22 h-22 border border-slate-200 rounded-lg p-1 bg-white shadow-xs"
                  />
                  <div className="text-[10px] space-y-1">
                    <span className="font-bold text-slate-800 block flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Dokumen Sah Terverifikasi
                    </span>
                    <span className="text-slate-500 block leading-tight">
                      Pindai QR ini dengan kamera HP untuk memeriksa keaslian arsip resmi di sistem yayasan.
                    </span>
                    <span className="font-mono text-[9px] text-emerald-700 font-bold block">
                      Kode: {data.kodeVerifikasi}
                    </span>
                  </div>
                </div>

                {/* Kolom Tanda Tangan Pimpinan */}
                <div className="col-span-6 text-center relative">
                  <p className="text-xs text-slate-500">Ditetapkan di Jakarta,</p>
                  <p className="text-xs text-slate-600 font-medium">Pada tanggal: {formattedDate}</p>
                  <p className="text-xs text-slate-700 font-bold mt-1 mb-2">{data.jabatanPimpinan},</p>

                  {/* Stempel Digital Representation */}
                  <div className="my-1 flex justify-center">
                    <div className="w-18 h-18 rounded-full border-2 border-emerald-700 text-emerald-800 flex flex-col items-center justify-center text-[7px] font-black uppercase rotate-[-6deg] p-1 shadow-xs opacity-90">
                      <span>Yayasan</span>
                      <span className="text-[10px] font-black">Al-Ikhwan</span>
                      <span>Pimpinan</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-400 w-48 mx-auto" />
                  <p className="text-xs font-black text-slate-900 mt-1">{data.namaPimpinanYayasan}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuratKeteranganPrintModal;
