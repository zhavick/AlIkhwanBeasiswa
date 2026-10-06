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
} from 'lucide-react';

export const PortalKaderisasiPage: React.FC = () => {
  const { user } = useAuth();
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [presensiSuccess, setPresensiSuccess] = useState<number | null>(null);

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const res = await api.get('/kaderisasi/agenda');
        setAgendas(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendas();
  }, []);

  const handlePresensi = async (agendaId: number) => {
    try {
      await api.post('/kaderisasi/presensi', {
        agendaId,
        penerimaId: user?.profileId || 1,
        statusKehadiran: 'Hadir',
        catatan: 'Hadir tepat waktu dan menyimak materi.',
      });
      setPresensiSuccess(agendaId);
      setTimeout(() => setPresensiSuccess(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim presensi.');
    }
  };

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
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Skor Keaktifan Kader</span>
            <span className="text-sm font-black text-emerald-800">85 / 100 Poin (Predikat Sangat Aktif)</span>
          </div>
        </div>
      </div>

      {presensiSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Kehadiran Anda berhasil tercatat! Poin keaktifan bertambah secara otomatis.</span>
        </div>
      )}

      {/* Agenda Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Jadwal Pembinaan Mendatang
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat agenda pembinaan...</div>
        ) : agendas.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs">
            Belum ada jadwal pembinaan terbit saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendas.map((item) => (
              <div
                key={item.agendaId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.jenisAgenda}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      +{item.poinKehadiran} Poin
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-1">{item.namaKegiatan}</h3>
                  <p className="text-xs text-slate-500 mb-4">{item.deskripsi}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.lokasi || 'Online via Zoom Meeting'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pemateri: {item.pemateri || 'Ustadz Pembina'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Presensi dibuka hari H</span>
                  <button
                    onClick={() => handlePresensi(item.agendaId)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi Hadir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalKaderisasiPage;
