import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface KwitansiData {
  pencairanId: number;
  pengajuanId: number;
  nomorKwitansi: string;
  nomorRegistrasi: string;
  namaPenerima: string;
  tipePenerima: string;
  institusiPendidikan: string;
  terminKe: number;
  tanggalPencairan: string;
  jumlahNominal: number;
  terbilang: string;
  nomorReferensiBank?: string;
  namaBendahara: string;
  jabatanBendahara: string;
  kodeVerifikasi: string;
  qrUrl: string;
  catatanPencairan?: string;
}

interface KwitansiPrintModalProps {
  pencairanId: number;
  onClose: () => void;
}

export const KwitansiPrintModal: React.FC<KwitansiPrintModalProps> = ({ pencairanId, onClose }) => {
  const [data, setData] = useState<KwitansiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKwitansi = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dokumen/kwitansi/${pencairanId}`);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat data kwitansi pencairan.');
      } finally {
        setLoading(false);
      }
    };
    fetchKwitansi();
  }, [pencairanId]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = data
    ? new Date(data.tanggalPencairan).toLocaleDateString('id-ID', {
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
      {/* Container Box */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Pratinjau Dokumen Kwitansi Resmi</span>
            <span className="text-xs text-slate-400">| Siap Cetak A4 / PDF</span>
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
        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto printable-document bg-white text-slate-800">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Memuat data kwitansi resmi...</p>
            </div>
          ) : error || !data ? (
            <div className="py-16 text-center text-rose-600 text-sm font-semibold">
              {error || 'Data tidak ditemukan'}
            </div>
          ) : (
            <div className="space-y-6">
              {/* KOP SURAT RESMI */}
              <div className="border-b-4 border-double border-slate-900 pb-3 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0 border border-emerald-900">
                  AI
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-lg sm:text-xl font-black tracking-wider text-slate-900 uppercase">
                    YAYASAN PENDIDIKAN & SOSIAL AL-IKHWAN
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700 tracking-wide">
                    LEMBAGA PENGELOLA BEASISWA & PENGEMBANGAN GENERASI MANDIRI
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Sekretariat: Jl. Raya Masjid Al-Ikhwan No. 45, Jakarta | Telp: (021) 7890-1234 | Email: info@alikhwan.id
                  </p>
                </div>
              </div>

              {/* JUDUL DOKUMEN & NOMOR */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    KWITANSI PENCAIRAN BEASISWA
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Nomor: <span className="font-bold text-slate-800 font-mono">{data.nomorKwitansi}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-500">Tanggal:</span>{' '}
                  <span className="font-bold text-slate-800">{formattedDate}</span>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Ref: {data.nomorRegistrasi}
                  </div>
                </div>
              </div>

              {/* TABEL RINCIAN PEMBAYARAN */}
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100">
                  <span className="col-span-3 text-slate-500 font-medium">Telah Diterima Dari</span>
                  <span className="col-span-9 font-bold text-slate-800">Yayasan Al-Ikhwan</span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100">
                  <span className="col-span-3 text-slate-500 font-medium">Kepada Penerima</span>
                  <div className="col-span-9">
                    <span className="font-bold text-slate-900 text-sm">{data.namaPenerima}</span>
                    <span className="ml-2 px-2 py-0.5 text-[10px] bg-slate-100 font-semibold rounded-md text-slate-600">
                      {data.tipePenerima}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100">
                  <span className="col-span-3 text-slate-500 font-medium">Institusi Pendidikan</span>
                  <span className="col-span-9 font-semibold text-slate-800">{data.institusiPendidikan}</span>
                </div>

                {/* KOTAK NOMINAL BESAR & TERBILANG */}
                <div className="my-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Uang Sejumlah
                      </span>
                      <span className="text-2xl font-black text-emerald-950 font-mono">
                        Rp {data.jumlahNominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="sm:text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Status: Telah Disalurkan Lunas
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60 text-xs italic text-emerald-900 font-medium">
                    # {data.terbilang} #
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100">
                  <span className="col-span-3 text-slate-500 font-medium">Peruntukan Dana</span>
                  <span className="col-span-9 text-slate-800 font-medium">
                    Pencairan Dana Bantuan Pendidikan Beasiswa Al-Ikhwan - <strong>Termin ke-{data.terminKe}</strong>
                    {data.catatanPencairan ? ` (${data.catatanPencairan})` : ''}
                  </span>
                </div>

                {data.nomorReferensiBank && (
                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100">
                    <span className="col-span-3 text-slate-500 font-medium">Metode & Referensi</span>
                    <span className="col-span-9 font-mono text-slate-700">
                      Transfer Bank / No. Ref: <strong className="text-slate-900">{data.nomorReferensiBank}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* BAGIAN TANDA TANGAN & QR CODE VERIFIKASI */}
              <div className="pt-6 grid grid-cols-12 gap-4 items-end">
                {/* QR Code Verifikasi */}
                <div className="col-span-4 flex items-center gap-3">
                  <img
                    src={qrImageUrl}
                    alt="QR Verifikasi"
                    className="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white shadow-xs"
                  />
                  <div className="text-[10px] space-y-0.5">
                    <span className="font-bold text-slate-800 block">Verifikasi Keaslian</span>
                    <span className="text-slate-500 block leading-tight">
                      Pindai QR untuk validasi online keaslian kwitansi ini.
                    </span>
                    <span className="font-mono text-[9px] text-emerald-700 font-bold block">
                      {data.kodeVerifikasi}
                    </span>
                  </div>
                </div>

                {/* Kolom Tanda Tangan Penerima */}
                <div className="col-span-4 text-center">
                  <p className="text-[11px] text-slate-500 mb-12">Tanda Tangan Penerima,</p>
                  <div className="border-b border-slate-300 w-32 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 mt-1">{data.namaPenerima}</p>
                </div>

                {/* Kolom Tanda Tangan Bendahara + Stempel */}
                <div className="col-span-4 text-center relative">
                  <p className="text-[11px] text-slate-500">Jakarta, {formattedDate}</p>
                  <p className="text-[11px] text-slate-600 mb-2">{data.jabatanBendahara},</p>

                  {/* Stempel Digital Representation */}
                  <div className="my-1 flex justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-600 text-emerald-700 flex flex-col items-center justify-center text-[7px] font-black uppercase rotate-[-8deg] p-1 shadow-xs opacity-90">
                      <span>Yayasan</span>
                      <span className="text-[9px] font-black">Al-Ikhwan</span>
                      <span>Keuangan</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-300 w-36 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 mt-1">{data.namaBendahara}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KwitansiPrintModal;
