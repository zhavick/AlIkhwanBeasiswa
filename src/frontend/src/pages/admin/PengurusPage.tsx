import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, UserPlus, Shield, CheckCircle2, XCircle, Search, Edit2, Trash2 } from 'lucide-react';

export const PengurusPage: React.FC = () => {
  const [pengurusList, setPengurusList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    namaLengkap: '',
    nip: '',
    jabatan: 'Koordinator Beasiswa',
    divisi: 'Divisi Pendidikan & Beasiswa',
    noTelp: '',
    roleNames: ['Pengurus'],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pengurusRes, rolesRes] = await Promise.all([
        api.get('/pengurus'),
        api.get('/rbac/roles'),
      ]);
      setPengurusList(pengurusRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    try {
      await api.post('/pengurus', formData);
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        namaLengkap: '',
        nip: '',
        jabatan: 'Koordinator Beasiswa',
        divisi: 'Divisi Pendidikan & Beasiswa',
        noTelp: '',
        roleNames: ['Pengurus'],
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan pengurus');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredPengurus = pengurusList.filter(
    (p) =>
      p.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
      p.nip?.toLowerCase().includes(search.toLowerCase()) ||
      p.jabatan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengurus & RBAC</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan akun staf yayasan, jabatan kepengurusan, dan hak akses otorisasi.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengurus Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Pengurus: <strong className="text-slate-800">{filteredPengurus.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama & NIP</th>
                <th className="py-3 px-4">Jabatan & Divisi</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Hak Akses / Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat data pengurus...
                  </td>
                </tr>
              ) : filteredPengurus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada data pengurus ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPengurus.map((p) => (
                  <tr key={p.pengurusId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.namaLengkap}</div>
                      <div className="text-[11px] text-slate-400">NIP: {p.nip || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{p.jabatan}</div>
                      <div className="text-[11px] text-slate-500">{p.divisi}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{p.email || p.user?.email || '-'}</div>
                      <div className="text-[11px] text-slate-400">{p.noTelp || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.user?.userRoles?.map((ur: any) => (
                          <span
                            key={ur.roleId}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {ur.role?.roleName}
                          </span>
                        )) || (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Pengurus
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Non-Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengurus */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah Pengurus & Akun Staf
              </h2>
              <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    placeholder="Ustadz H. Ahmad Dahlan, M.Pd"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="AI-2026-001"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.noTelp}
                    onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Divisi *</label>
                  <input
                    type="text"
                    required
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border rounded-lg"
                  />
                </div>
              </div>

              {/* Akun Login */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Akun Login Sistem
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="ahmad_dahlan"
                      className="w-full px-3 py-1.5 text-xs border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ahmad@alikhwan.id"
                      className="w-full px-3 py-1.5 text-xs border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Hak Akses / Role</label>
                <select
                  value={formData.roleNames[0]}
                  onChange={(e) => setFormData({ ...formData, roleNames: [e.target.value] })}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg"
                >
                  <option value="Pengurus">Pengurus Yayasan (Umum)</option>
                  <option value="Verifikator">Verifikator Berkas (Tahap 1)</option>
                  <option value="Koordinator">Koordinator Bidang (Tahap 2)</option>
                  <option value="PimpinanYayasan">Pimpinan Yayasan (Tahap 3 Approval)</option>
                  <option value="SuperAdmin">SuperAdmin (Full Akses)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {modalLoading ? 'Menyimpan...' : 'Simpan Pengurus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengurusPage;
