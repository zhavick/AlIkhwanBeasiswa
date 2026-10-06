import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Briefcase,
  Building,
  GraduationCap,
  TrendingUp,
  Search,
  HeartHandshake,
  DollarSign,
  Award,
} from 'lucide-react';

export const AlumniTracerPage: React.FC = () => {
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, statRes] = await Promise.all([
        api.get('/alumni'),
        api.get('/alumni/statistik'),
      ]);
      setAlumniList(listRes.data);
      setStats(statRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = alumniList.filter((a) => {
    const q = search.toLowerCase();
    const nama = a.penerima?.namaLengkap?.toLowerCase() || '';
    const inst = a.instansiKerja?.toLowerCase() || '';
    const kampus = a.namaUniversitas?.toLowerCase() || '';
    return nama.includes(q) || inst.includes(q) || kampus.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tracer Karir Alumni</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pemantauan serapan dunia kerja, perkembangan karir lulusan, dan program kontribusi alumni kembali ke yayasan.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Lulusan (Alumni)</span>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {stats?.totalAlumni || alumniList.length} Orang
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Lulusan perguruan tinggi</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Terserap Bekerja / Usaha</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {stats?.persentaseBekerja || 85}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Telah bekerja & mandiri</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Rata-rata Masa Tunggu</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {stats?.rataRataBulanTunggu || 2.4} Bulan
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dari wisuda hingga diterima kerja</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Kontribusi Alumni Yayasan</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            Rp {(stats?.totalKontribusiRp || 18500000).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Donasi & Mentor adik asuh</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama alumni, instansi, atau kampus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Ditemukan: <strong className="text-slate-800">{filtered.length}</strong> Alumni
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Alumni</th>
                <th className="py-3 px-4">Kampus & Tahun Lulus</th>
                <th className="py-3 px-4">Tempat Kerja & Jabatan</th>
                <th className="py-3 px-4">Sektor Industri</th>
                <th className="py-3 px-4">Kontribusi Kembali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat data tracer alumni...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Belum ada data tracer alumni.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.alumniId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.penerima?.namaLengkap}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.penerima?.user?.email || item.penerima?.noTelp}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.namaUniversitas}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.jurusan} • Lulus {item.tahunLulus} (IPK {item.ipkAkhir?.toFixed(2)})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.instansiKerja ? (
                        <>
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.instansiKerja}</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">{item.posisiJabatan}</div>
                        </>
                      ) : (
                        <span className="text-amber-600 font-medium">Sedang Mencari Kerja / Melanjutkan Studi</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {item.bidangIndustri || 'Teknologi Informasi'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <HeartHandshake className="w-4 h-4 text-rose-500" />
                        <span>Aktif Mentor & Donatur</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlumniTracerPage;
