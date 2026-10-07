import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Sparkles,
  BookOpen,
  UserCheck,
} from 'lucide-react';

export const PortalKaderisasiPage: React.FC = () => {
  const { user } = useAuth();
  const [agendas, setAgendas] = useState<any[]>([]);
  const [kaderProfil, setKaderProfil] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [presensiSuccess, setPresensiSuccess] = useState<number | null>(null);
  const [presensiLoading, setPresensiLoading] = useState<number | null>(null);

  const fetchKaderData = async () => {
    setLoading(true);
    try {
      const [kegRes, profRes] = await Promise.allSettled([
        api.get('/kaderisasi/kegiatan'),
        api.get('/kaderisasi/my-profil'),
      ]);

      if (kegRes.status === 'fulfilled') setAgendas(kegRes.value.data);
      if (profRes.status === 'fulfilled') setKaderProfil(profRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaderData();
  }, [user]);

  const handlePresensi = async (kegiatanId: number) => {
    setPresensiLoading(kegiatanId);
    try {
      await api.post('/kaderisasi/presensi', {
        kegiatanId,
        mahasiswaId: user?.profileId || 0,
        statusKehadiran: 1, // Hadir
        keterangan: 'Konfirmasi kehadiran mandiri via Portal Penerima Beasiswa',
      });
      setPresensiSuccess(kegiatanId);
      setTimeout(() => setPresensiSuccess(null), 4000);
      fetchKaderData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim presensi kehadiran.');
    } finally {
      setPresensiLoading(null);
    }
  };

  const totalHadir = kaderProfil?.totalKegiatanDiikuti || 0;
  const statusKader = kaderProfil?.statusKader || 'KaderAktif';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kaderisasi & Pembinaan Karakter</h1>
          <p className="text-xs text-slate-500 mt-1">
            Program wajib kajian adab, mentoring kepemimpinan, dan kegiatan sosial bagi seluruh penerima beasiswa Al-Ikhwan.
          </p>
        </div>

        {/* Keaktifan Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kehadiran Pembinaan</span>
            <span className="text-sm font-black text-emerald-800">
              {totalHadir} Pertemuan Diikuti ({statusKader})
            </span>
          </div>
        </div>
      </div>

      {/* Profil Halaqah Card */}
      {kaderProfil && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Kelompok Halaqah / Pembina:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {kaderProfil.kelompokHalaqah || 'Halaqah Reguler'}
            </span>
            <span className="text-[11px] text-slate-500">Murabbi: {kaderProfil.namaMurabbi || 'Ust. Pembina'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Jenjang Pembinaan:</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
              {kaderProfil.tingkatPembinaan || 'Dasar'}
            </span>
            <span className="text-[11px] text-slate-500">Status: {kaderProfil.statusKader}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Catatan Perkembangan:</span>
            <p className="text-[11px] text-slate-600 italic mt-0.5">
              "{kaderProfil.catatanPerkembangan || 'Aktif menyimak materi dan menjaga kehadiran.'}"
            </p>
          </div>
        </div>
      )}

      {presensiSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Kehadiran Anda berhasil tercatat! Poin keaktifan bertambah secara otomatis.</span>
        </div>
      )}

      {/* Agenda Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Jadwal Pembinaan & Kajian Mendatang
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat agenda pembinaan...</div>
        ) : agendas.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs">
            Belum ada jadwal pembinaan terbit saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendas.map((item) => {
              const id = item.kegiatanId || item.agendaId;
              const isSubmitted = presensiSuccess === id;
              const isSubmitting = presensiLoading === id;

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.tipeKegiatan || item.jenisAgenda || 'Kajian Rutin'}
                      </span>
                      {item.wajibHadir && (
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Wajib Hadir</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">{item.namaKegiatan}</h3>
                    <p className="text-xs text-slate-500 mb-4">{item.deskripsi || 'Kajian pembinaan adab dan karakter penerima beasiswa.'}</p>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(item.tanggalKegiatan || item.tanggal || Date.now()).toLocaleDateString('id-ID', {
                            dateStyle: 'full',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.tempat || item.lokasi || 'Masjid Al-Ikhwan / Zoom'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Peserta Terdaftar Hadir: {item.totalPesertaHadir || 0} Orang</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isSubmitted ? 'Presensi Tercatat' : 'Konfirmasi Hari Ini'}
                    </span>
                    <button
                      onClick={() => handlePresensi(id)}
                      disabled={isSubmitting || isSubmitted}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Mencatat...' : isSubmitted ? 'Telah Hadir' : 'Konfirmasi Hadir'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalKaderisasiPage;
