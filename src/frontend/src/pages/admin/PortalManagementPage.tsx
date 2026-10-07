import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Sliders,
  Bell,
  Image,
  FileCheck,
  HelpCircle,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  Trash2,
} from 'lucide-react';

export const PortalManagementPage: React.FC = () => {
  const [tab, setTab] = useState<'pengumuman' | 'banners' | 'syarat' | 'helpdesk'>('pengumuman');
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);
  const [bannerList, setBannerList] = useState<any[]>([]);
  const [syaratList, setSyaratList] = useState<any[]>([]);
  const [tiketList, setTiketList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPengumumanModal, setShowPengumumanModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showSyaratModal, setShowSyaratModal] = useState(false);
  const [jawabTiketModal, setJawabTiketModal] = useState<any | null>(null);
  const [jawabanText, setJawabanText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPengumuman, setUploadingPengumuman] = useState(false);

  // Forms state
  const [pengumumanForm, setPengumumanForm] = useState({
    judul: '',
    isiKonten: '',
    ringkasan: '',
    kategori: 'Info Beasiswa',
    gambarCoverUrl: '',
    isPublished: true,
  });

  const [bannerForm, setBannerForm] = useState({
    judul: '',
    subjudul: '',
    gambarUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/portal/pengajuan',
    urutan: 1,
    statusAktif: true,
  });

  const [syaratForm, setSyaratForm] = useState({
    namaDokumen: '',
    deskripsi: 'File scan asli PDF atau JPG (maks. 2MB)',
    wajib: true,
    tipePenerima: 'Semua',
    formatFileDiizinkan: 'pdf,jpg,png',
    maxSizeMb: 2,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, sRes, tRes] = await Promise.allSettled([
        api.get('/portal-cms/pengumuman'),
        api.get('/portal-cms/banners'),
        api.get('/portal-cms/syarat-dokumen'),
        api.get('/portal-cms/helpdesk/semua'),
      ]);

      if (pRes.status === 'fulfilled') setPengumumanList(pRes.value.data);
      if (bRes.status === 'fulfilled') setBannerList(bRes.value.data);
      if (sRes.status === 'fulfilled') setSyaratList(sRes.value.data);
      if (tRes.status === 'fulfilled') setTiketList(tRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadBannerImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/portal-cms/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBannerForm((prev) => ({ ...prev, gambarUrl: res.data.fileUrl }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah gambar banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUploadPengumumanImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPengumuman(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/portal-cms/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPengumumanForm((prev) => ({ ...prev, gambarCoverUrl: res.data.fileUrl }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah cover pengumuman');
    } finally {
      setUploadingPengumuman(false);
    }
  };

  const handleCreatePengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/portal-cms/pengumuman', pengumumanForm);
      setShowPengumumanModal(false);
      setPengumumanForm({
        judul: '',
        isiKonten: '',
        ringkasan: '',
        kategori: 'Info Beasiswa',
        gambarCoverUrl: '',
        isPublished: true,
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengumuman');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/portal-cms/banners', bannerForm);
      setShowBannerModal(false);
      setBannerForm({
        judul: '',
        subjudul: '',
        gambarUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        linkUrl: '/portal/pengajuan',
        urutan: 1,
        statusAktif: true,
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan banner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSyarat = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/portal-cms/syarat-dokumen', syaratForm);
      setShowSyaratModal(false);
      setSyaratForm({
        namaDokumen: '',
        deskripsi: 'File scan asli PDF atau JPG (maks. 2MB)',
        wajib: true,
        tipePenerima: 'Semua',
        formatFileDiizinkan: 'pdf,jpg,png',
        maxSizeMb: 2,
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan syarat dokumen');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJawabTiket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jawabTiketModal) return;
    setActionLoading(true);
    try {
      await api.post(`/portal-cms/helpdesk/${jawabTiketModal.tiketId}/jawab`, {
        jawaban: jawabanText,
      });
      setJawabTiketModal(null);
      setJawabanText('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim jawaban tiket');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Konten Portal (CMS)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan informasi publik, banner beranda, syarat berkas pendaftaran, dan respon tiket helpdesk.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('pengumuman')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'pengumuman'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Pengumuman & Berita ({pengumumanList.length})</span>
        </button>
        <button
          onClick={() => setTab('banners')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'banners'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>Banner Beranda ({bannerList.length})</span>
        </button>
        <button
          onClick={() => setTab('syarat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'syarat'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Syarat Berkas ({syaratList.length})</span>
        </button>
        <button
          onClick={() => setTab('helpdesk')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'helpdesk'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Helpdesk & Tanya Jawab ({tiketList.length})</span>
        </button>
      </div>

      {/* Tab 1: Pengumuman */}
      {tab === 'pengumuman' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPengumumanModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pengumumanList.map((item) => {
              const tgl = item.tanggalTerbit || item.tanggalDibuat;
              return (
                <div key={item.pengumumanId} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.kategori}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {tgl ? new Date(tgl).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                      </span>
                    </div>
                    {item.gambarCoverUrl && (
                      <img
                        src={item.gambarCoverUrl}
                        alt={item.judul}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{item.judul}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-3">{item.ringkasan || item.isiKonten}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t pt-2 mt-2">
                    <span>Penulis: {item.penulisName || 'Staf Humas'}</span>
                    <span className="text-emerald-600 font-semibold">
                      {item.isPublished ? 'Tayang di Portal' : 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Banner Slider */}
      {tab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowBannerModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Banner Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bannerList.map((b) => (
              <div key={b.bannerId} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-32 bg-slate-100 relative overflow-hidden">
                    <img
                      src={b.gambarUrl || b.imageUrl}
                      alt={b.judul}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                      Urutan: {b.urutan}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{b.judul}</h4>
                    <p className="text-xs text-slate-500 mb-2">{b.subjudul || b.subJudul}</p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-600 font-medium truncate flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{b.linkUrl}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    (b.statusAktif ?? b.isActive) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {(b.statusAktif ?? b.isActive) ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Syarat Dokumen */}
      {tab === 'syarat' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSyaratModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Syarat Dokumen</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Daftar Master Berkas Persyaratan Pendaftaran
              </h3>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Nama Syarat Dokumen</th>
                  <th className="py-3 px-4">Deskripsi / Format</th>
                  <th className="py-3 px-4">Berlaku Untuk</th>
                  <th className="py-3 px-4">Sifat Wajib</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syaratList.map((s) => (
                  <tr key={s.syaratId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.namaDokumen || s.namaSyarat}</td>
                    <td className="py-3 px-4 text-slate-500">{s.deskripsi || 'File PDF / JPG maksimum 2MB'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                        {s.tipePenerima || s.berlakuUntuk || 'Semua'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {(s.wajib || s.isWajib) ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Wajib Diunggah
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          Opsional
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Helpdesk */}
      {tab === 'helpdesk' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {tiketList.map((tiket) => (
              <div key={tiket.tiketId} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      #{tiket.tiketId}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{tiket.namaPengirim}</span>
                    <span className="text-[11px] text-slate-400">({tiket.emailPengirim})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tiket.status === 'Dijawab'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tiket.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 mb-1">{tiket.subjek}</h4>
                <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {tiket.pesan}
                </p>

                {tiket.jawabanAdmin ? (
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-lg text-xs text-emerald-950">
                    <span className="font-bold text-emerald-800 block mb-0.5">Jawaban Admin / Humas:</span>
                    <p>{tiket.jawabanAdmin}</p>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setJawabTiketModal(tiket)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Balas Pertanyaan</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tambah Pengumuman */}
      {showPengumumanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Publikasikan Pengumuman Baru</h3>
              <button onClick={() => setShowPengumumanModal(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleCreatePengumuman} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={pengumumanForm.judul}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, judul: e.target.value })}
                  placeholder="Pembukaan Seleksi Beasiswa Mahasiswa 2026"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={pengumumanForm.kategori}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, kategori: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg"
                >
                  <option value="Info Beasiswa">Info Beasiswa</option>
                  <option value="Kaderisasi">Kaderisasi</option>
                  <option value="Kegiatan Yayasan">Kegiatan Yayasan</option>
                  <option value="Karir Alumni">Karir Alumni</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gambar Cover (Opsional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="URL cover gambar..."
                    value={pengumumanForm.gambarCoverUrl}
                    onChange={(e) => setPengumumanForm({ ...pengumumanForm, gambarCoverUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPengumuman ? 'Upload...' : 'Unggah'}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleUploadPengumumanImg}
                      className="hidden"
                      disabled={uploadingPengumuman}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan Singkat</label>
                <input
                  type="text"
                  value={pengumumanForm.ringkasan}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, ringkasan: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu depan..."
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Konten Pengumuman *</label>
                <textarea
                  rows={4}
                  required
                  value={pengumumanForm.isiKonten}
                  onChange={(e) => setPengumumanForm({ ...pengumumanForm, isiKonten: e.target.value })}
                  placeholder="Tuliskan detail pengumuman secara lengkap..."
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPengumumanModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Banner */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Banner Slider Beranda</h3>
              <button onClick={() => setShowBannerModal(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleCreateBanner} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Banner *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.judul}
                  onChange={(e) => setBannerForm({ ...bannerForm, judul: e.target.value })}
                  placeholder="Penerimaan Beasiswa Pendidikan Al-Ikhwan"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subjudul / Deskripsi Banner</label>
                <input
                  type="text"
                  value={bannerForm.subjudul}
                  onChange={(e) => setBannerForm({ ...bannerForm, subjudul: e.target.value })}
                  placeholder="Wujudkan impian generasi muda berdaya saing dan berakhlak mulia"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gambar Banner *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.gambarUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, gambarUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingBanner ? 'Upload...' : 'Unggah'}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleUploadBannerImg}
                      className="hidden"
                      disabled={uploadingBanner}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tautan Aksi (Link)</label>
                  <input
                    type="text"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    placeholder="/portal/pengajuan"
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Urutan</label>
                  <input
                    type="number"
                    min={1}
                    value={bannerForm.urutan}
                    onChange={(e) => setBannerForm({ ...bannerForm, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="statusAktif"
                  checked={bannerForm.statusAktif}
                  onChange={(e) => setBannerForm({ ...bannerForm, statusAktif: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="statusAktif" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Aktifkan tayang langsung di Beranda Portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Syarat Dokumen */}
      {showSyaratModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Syarat Berkas Pendaftaran</h3>
              <button onClick={() => setShowSyaratModal(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSyarat} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Dokumen *</label>
                <input
                  type="text"
                  required
                  value={syaratForm.namaDokumen}
                  onChange={(e) => setSyaratForm({ ...syaratForm, namaDokumen: e.target.value })}
                  placeholder="Surat Keterangan Penghasilan Orang Tua"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Format Berkas</label>
                <input
                  type="text"
                  value={syaratForm.deskripsi}
                  onChange={(e) => setSyaratForm({ ...syaratForm, deskripsi: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Berlaku Untuk</label>
                  <select
                    value={syaratForm.tipePenerima}
                    onChange={(e) => setSyaratForm({ ...syaratForm, tipePenerima: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  >
                    <option value="Semua">Semua Penerima</option>
                    <option value="Siswa">Siswa Saja</option>
                    <option value="Mahasiswa">Mahasiswa Saja</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maks. Ukuran (MB)</label>
                  <input
                    type="number"
                    min={1}
                    value={syaratForm.maxSizeMb}
                    onChange={(e) => setSyaratForm({ ...syaratForm, maxSizeMb: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syaratWajib"
                  checked={syaratForm.wajib}
                  onChange={(e) => setSyaratForm({ ...syaratForm, wajib: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="syaratWajib" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Wajib dilampirkan oleh pemohon beasiswa
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSyaratModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Simpan Syarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Jawab Tiket Helpdesk */}
      {jawabTiketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Respon Tiket #{jawabTiketModal.tiketId}</h3>
              <button onClick={() => setJawabTiketModal(null)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleJawabTiket} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Pertanyaan Pemohon:</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border">
                  {jawabTiketModal.pesan}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jawaban Staf Humas / Admin *</label>
                <textarea
                  rows={4}
                  required
                  value={jawabanText}
                  onChange={(e) => setJawabanText(e.target.value)}
                  placeholder="Tuliskan jawaban yang jelas dan solutif..."
                  className="w-full px-3 py-1.5 border rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setJawabTiketModal(null)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Jawaban</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalManagementPage;
