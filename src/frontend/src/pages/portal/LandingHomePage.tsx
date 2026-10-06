import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Bell,
  FileText,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const LandingHomePage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [pengumuman, setPengumuman] = useState<any[]>([]);
  const [syaratList, setSyaratList] = useState<any[]>([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [bRes, pRes, sRes] = await Promise.allSettled([
          api.get('/portal-cms/banners'),
          api.get('/portal-cms/pengumuman'),
          api.get('/portal-cms/syarat-dokumen'),
        ]);

        if (bRes.status === 'fulfilled') setBanners(bRes.value.data);
        if (pRes.status === 'fulfilled') setPengumuman(pRes.value.data);
        if (sRes.status === 'fulfilled') setSyaratList(sRes.value.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPublicData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Penerimaan Beasiswa Al-Ikhwan TA 2026/2027</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Membina Generasi Unggul Melalui{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Beasiswa Terpadu & Kaderisasi Robbani
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Yayasan Al-Ikhwan berkomitmen memberikan bantuan pendidikan bagi pelajar dhuafa dan berprestasi tingkat SD, SMP, SMA serta mahasiswa D3/S1, didukung pembinaan akhlak berkesinambungan hingga pengawalan karir alumni.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <span>Daftar Beasiswa Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portal/pengajuan"
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/10 transition flex items-center gap-2"
                >
                  <span>Ajukan Pembaruan Semester</span>
                </Link>
                <Link
                  to="/portal/bantuan"
                  className="px-4 py-3 text-slate-300 hover:text-white text-xs sm:text-sm transition"
                >
                  Pusat Bantuan & Syarat
                </Link>
              </div>

              {/* Fast Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-white">500+</div>
                  <div className="text-[11px] text-slate-400">Penerima Terbantu</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-400">Penyaluran Tepat</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">85%</div>
                  <div className="text-[11px] text-slate-400">Alumni Terserap Kerja</div>
                </div>
              </div>
            </div>

            {/* Visual Hero Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl relative">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-800">
                  <img
                    src={
                      banners[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
                    }
                    alt="Beasiswa Al-Ikhwan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                    <span>Program Unggulan Yayasan</span>
                    <span>3-Tier Transparent Approval</span>
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {banners[0]?.judul || 'Beasiswa Pendidikan & Pembinaan Karakter'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {banners[0]?.subJudul ||
                      'Bantuan biaya SPP/UKT, uang saku bulanan, kajian pekanan, serta pendampingan tugas akhir bagi mahasiswa.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilar Program */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Ekosistem Pendidikan Berkelanjutan
          </h2>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            Empat Pilar Pembinaan Al-Ikhwan
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Dari bangku sekolah, perkuliahan, pembentukan adab, hingga kemandirian dunia profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Tingkat Siswa (SD-SMA)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bantuan biaya SPP, seragam, perlengkapan belajar, serta pemantauan konsistensi nilai rapor dan hafalan Al-Qur'an.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Tingkat Mahasiswa (D3/S1)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dukungan UKT kuliah, subsidi riset tugas akhir / skripsi, serta pembimbingan akademik berstandar IPK tinggi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Kaderisasi & Akhlak</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kajian keislaman intensif, pelatihan kepemimpinan, public speaking, dan kegiatan bakti sosial kemasyarakatan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Tracer Karir Alumni</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Penyaluran informasi lowongan kerja, jejaring relasi alumni di berbagai industri, dan wadah donatur adik asuh.
            </p>
          </div>
        </div>
      </section>

      {/* Pengumuman & Berita Terkini */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Info & Warta</h2>
            <h3 className="text-xl font-black text-slate-900">Pengumuman Terkini Yayasan</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pengumuman.slice(0, 3).map((item) => (
            <div
              key={item.pengumumanId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                    {item.kategori}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.tanggalDibuat).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">{item.judul}</h4>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{item.isiKonten}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/portal/bantuan"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dokumen Persyaratan Pendaftaran */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Persyaratan Berkas
            </span>
            <h3 className="text-2xl font-black">Dokumen Wajib yang Perlu Disiapkan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pastikan berkas-berkas berikut telah dipindai (scan) dalam format PDF atau JPG jelas sebelum mengisi formulir pengajuan online.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition inline-flex items-center gap-2"
              >
                <span>Daftar Akun Penerima</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {syaratList.map((s) => (
              <div
                key={s.syaratId}
                className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">{s.namaSyarat}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.deskripsi || 'Format PDF / JPG max 2MB'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingHomePage;
