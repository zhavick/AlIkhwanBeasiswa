import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  FileQuestion,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const PortalHelpdeskPage: React.FC = () => {
  const { user } = useAuth();
  const [subjek, setSubjek] = useState('');
  const [pesan, setPesan] = useState('');
  const [kategori, setKategori] = useState('Kendala Pengajuan');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);

  const faqs = [
    {
      q: 'Bagaimana cara mengajukan beasiswa untuk pertama kali?',
      a: 'Lakukan registrasi mandiri di menu "Daftar Beasiswa", lengkapi data profil siswa/mahasiswa dan orang tua, lalu masuk ke menu "Pengajuan Beasiswa" untuk memilih periode aktif serta mengunggah berkas yang dipersyaratkan.',
    },
    {
      q: 'Kapan jadwal pengumuman hasil seleksi beasiswa?',
      a: 'Hasil verifikasi administrasi dan persetujuan bertahap diumumkan secara berkala melalui menu "Status Beasiswa" setelah periode pendaftaran ditutup.',
    },
    {
      q: 'Apakah penerima beasiswa wajib mengikuti kegiatan kaderisasi?',
      a: 'Ya, program kaderisasi dan kajian adab merupakan kurikulum inti Al-Ikhwan guna mencetak generasi berkarakter Robbani. Kehadiran akan dievaluasi untuk kelayakan perpanjangan beasiswa di semester berikutnya.',
    },
    {
      q: 'Bagaimana proses pencairan dana beasiswa dilakukan?',
      a: 'Pencairan dana disalurkan langsung via transfer perbankan ke nomor rekening yang telah diverifikasi setelah disetujui oleh Pimpinan Yayasan.',
    },
  ];

  const fetchMyTickets = async () => {
    try {
      const res = await api.get('/portal-cms/helpdesk/my');
      setMyTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/portal-cms/helpdesk', {
        subjek,
        pesan,
        kategori,
      });
      setSuccess(true);
      setSubjek('');
      setPesan('');
      setTimeout(() => setSuccess(false), 4000);
      fetchMyTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim tiket pertanyaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pusat Bantuan & Helpdesk</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pertanyaan seputar persyaratan pendaftaran, kendala upload berkas, jadwal pencairan dana, dan kaderisasi.
        </p>
      </div>

      {/* Grid: FAQ & Form Tiket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: FAQ List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-emerald-600" />
            <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs">
                <h3 className="font-bold text-slate-900 mb-1.5">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block">Kontak WhatsApp Sekretariat:</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Hotline Beasiswa: +62 812-3456-7890 (Senin - Jumat, 08.00 - 16.00 WIB)
              </p>
            </div>
          </div>

          {/* Riwayat Tiket Saya */}
          {myTickets.length > 0 && (
            <div className="pt-4 space-y-3">
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Riwayat Tiket Pertanyaan Saya ({myTickets.length})</span>
              </h3>
              <div className="space-y-2">
                {myTickets.map((t) => (
                  <div key={t.tiketId} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{t.subjek}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.statusTiket === 2 || t.statusTiket === 'Dijawab'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.statusTiket === 2 || t.statusTiket === 'Dijawab' ? 'Dijawab Admin' : 'Menunggu Respons'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{t.pesan}</p>
                    {t.jawabanAdmin && (
                      <div className="mt-2 p-2.5 bg-slate-50 border-l-2 border-emerald-500 rounded text-[11px] text-slate-700">
                        <span className="font-semibold block text-emerald-800">Jawaban Staf Yayasan ({t.dijawabOleh || 'Admin'}):</span>
                        <p className="mt-0.5">{t.jawabanAdmin}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Kirim Tiket */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between h-fit">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Kirim Tiket Pertanyaan</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Tim sekretariat yayasan akan merespons pertanyaan Anda maksimal 1x24 jam kerja.
            </p>

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tiket Anda telah terkirim! Staf yayasan akan segera menjawabnya.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Pertanyaan *</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Kendala Pengajuan">Kendala Pengajuan & Berkas</option>
                  <option value="Pencairan Dana">Pencairan Dana Beasiswa</option>
                  <option value="Kaderisasi">Kegiatan Kaderisasi & Presensi</option>
                  <option value="Lainnya">Pertanyaan Umum Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subjek / Topik *</label>
                <input
                  type="text"
                  required
                  value={subjek}
                  onChange={(e) => setSubjek(e.target.value)}
                  placeholder="Kendala pengunggahan berkas KHS semester..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pertanyaan / Pesan *</label>
                <textarea
                  rows={4}
                  required
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Jelaskan kendala atau pertanyaan yang ingin Anda sampaikan secara rinci..."
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Mengirimkan...' : 'Kirim Tiket Sekarang'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalHelpdeskPage;
