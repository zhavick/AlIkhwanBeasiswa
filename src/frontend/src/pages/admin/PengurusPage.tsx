import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Edit2,
  KeyRound,
  Download,
  Save,
  Check,
  AlertCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const PengurusPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pengurus' | 'rbac'>('pengurus');
  const [pengurusList, setPengurusList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Tambah Pengurus
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Assign Role
  const [assignRoleModal, setAssignRoleModal] = useState<{
    open: boolean;
    pengurus: any | null;
    selectedRoleIds: number[];
  }>({
    open: false,
    pengurus: null,
    selectedRoleIds: [],
  });
  const [assignLoading, setAssignLoading] = useState(false);

  // RBAC Matrix State
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRolePermIds, setSelectedRolePermIds] = useState<number[]>([]);
  const [savingRbac, setSavingRbac] = useState(false);
  const [rbacMsg, setRbacMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Tambah Pengurus
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    namaLengkap: '',
    nip: '',
    jabatan: 'Koordinator Beasiswa',
    divisi: 'Divisi Pendidikan & Beasiswa',
    noTelp: '',
    roleId: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pengurusRes, rolesRes, permsRes] = await Promise.allSettled([
        api.get('/pengurus'),
        api.get('/rbac/roles'),
        api.get('/rbac/permissions'),
      ]);

      if (pengurusRes.status === 'fulfilled') {
        setPengurusList(pengurusRes.value.data);
      }
      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.data);
        if (rolesRes.value.data.length > 0 && selectedRoleId === null) {
          const firstRole = rolesRes.value.data[0];
          setSelectedRoleId(firstRole.roleId);
          setSelectedRolePermIds(firstRole.permissions?.map((p: any) => p.permissionId) || []);
        }
      }
      if (permsRes.status === 'fulfilled') {
        setAllPermissions(permsRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching pengurus & rbac:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update selected role permissions when switching role tab in RBAC
  const handleSelectRole = (role: any) => {
    setSelectedRoleId(role.roleId);
    setSelectedRolePermIds(role.permissions?.map((p: any) => p.permissionId) || []);
    setRbacMsg(null);
  };

  const handleTogglePermission = (permId: number) => {
    setSelectedRolePermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleToggleModule = (modulePermIds: number[]) => {
    const allSelected = modulePermIds.every((id) => selectedRolePermIds.includes(id));
    if (allSelected) {
      setSelectedRolePermIds((prev) => prev.filter((id) => !modulePermIds.includes(id)));
    } else {
      setSelectedRolePermIds((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingRbac(true);
    setRbacMsg(null);

    try {
      await api.put('/rbac/role-permissions', {
        roleId: selectedRoleId,
        permissionIds: selectedRolePermIds,
      });

      setRbacMsg({
        text: 'Konfigurasi hak akses permission role berhasil disimpan!',
        type: 'success',
      });

      // Refresh roles to update permissions in local state
      const rolesRes = await api.get('/rbac/roles');
      setRoles(rolesRes.data);
    } catch (err: any) {
      setRbacMsg({
        text: err.response?.data?.message || 'Gagal menyimpan perubahan permission.',
        type: 'error',
      });
    } finally {
      setSavingRbac(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    try {
      const chosenRole = formData.roleId || roles[0]?.roleId;
      await api.post('/pengurus', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        namaLengkap: formData.namaLengkap,
        nip: formData.nip,
        jabatan: formData.jabatan,
        divisi: formData.divisi,
        noTelp: formData.noTelp,
        tanggalMulaiMenjabat: new Date().toISOString(),
        roleIds: chosenRole ? [chosenRole] : [],
      });

      setShowModal(false);
      setSuccessMsg(`Pengurus "${formData.namaLengkap}" berhasil ditambahkan.`);
      setFormData({
        username: '',
        email: '',
        password: '',
        namaLengkap: '',
        nip: '',
        jabatan: 'Koordinator Beasiswa',
        divisi: 'Divisi Pendidikan & Beasiswa',
        noTelp: '',
        roleId: 0,
      });
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan pengurus');
    } finally {
      setModalLoading(false);
    }
  };

  const openAssignModal = (p: any) => {
    setAssignRoleModal({
      open: true,
      pengurus: p,
      selectedRoleIds: p.roleIds || (p.roles && roles.filter((r) => p.roles.includes(r.roleName)).map((r) => r.roleId)) || [],
    });
  };

  const handleSaveAssignRole = async () => {
    if (!assignRoleModal.pengurus) return;
    setAssignLoading(true);

    try {
      await api.post('/rbac/assign-role', {
        userId: assignRoleModal.pengurus.userId,
        roleIds: assignRoleModal.selectedRoleIds,
      });

      setAssignRoleModal({ open: false, pengurus: null, selectedRoleIds: [] });
      setSuccessMsg(`Role untuk "${assignRoleModal.pengurus.namaLengkap}" berhasil diperbarui.`);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui role pengurus.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (pengurusList.length === 0) return;

    const headers = ['NIP', 'Nama Lengkap', 'Jabatan', 'Divisi', 'Email', 'No Telp', 'Role', 'Status'];
    const rows = pengurusList.map((p) => [
      p.nip || '-',
      `"${p.namaLengkap}"`,
      `"${p.jabatan}"`,
      `"${p.divisi}"`,
      p.email || p.username || '-',
      p.noTelp || '-',
      `"${p.roles?.join(', ') || 'Pengurus'}"`,
      p.statusAktif ? 'Aktif' : 'Non-Aktif',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_pengurus_alikhwan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPengurus = pengurusList.filter(
    (p) =>
      p.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
      p.nip?.toLowerCase().includes(search.toLowerCase()) ||
      p.jabatan?.toLowerCase().includes(search.toLowerCase()) ||
      p.divisi?.toLowerCase().includes(search.toLowerCase())
  );

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc: Record<string, any[]>, perm) => {
    const mod = perm.modul || 'Umum';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const currentRole = roles.find((r) => r.roleId === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengurus & RBAC</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan akun staf yayasan, jabatan kepengurusan, dan matriks hak akses otorisasi (Role-Based Access Control).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'pengurus' && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Pengurus Baru</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pengurus')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'pengurus'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pengurus Yayasan ({pengurusList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'rbac'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriks Role & Hak Akses ({roles.length} Role)</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR PENGURUS */}
      {activeTab === 'pengurus' && (
        <div className="space-y-4">
          {/* Search and Stats */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, NIP, divisi, atau jabatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{filteredPengurus.length}</strong> pengurus
            </div>
          </div>

          {/* Table Pengurus */}
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
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Memuat data pengurus...
                      </td>
                    </tr>
                  ) : filteredPengurus.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
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
                          <div className="text-slate-800">{p.email || p.username || '-'}</div>
                          <div className="text-[11px] text-slate-400">{p.noTelp || '-'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.roles && p.roles.length > 0 ? (
                              p.roles.map((rName: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                                >
                                  {rName}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Pengurus
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {p.statusAktif ? (
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
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openAssignModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition"
                            title="Atur Hak Akses Role"
                          >
                            <KeyRound className="w-3 h-3 text-slate-500" />
                            <span>Atur Role</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Role Sistem</h3>
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = r.roleId === selectedRoleId;
                return (
                  <div
                    key={r.roleId}
                    onClick={() => handleSelectRole(r)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{r.roleName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{r.deskripsi || 'Tidak ada deskripsi'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {r.permissions?.length || 0} Izin
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix Detail */}
          <div className="lg:col-span-8 space-y-4">
            {currentRole ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      Konfigurasi Izin Role
                    </span>
                    <h2 className="text-lg font-black text-slate-900">{currentRole.roleName}</h2>
                    <p className="text-xs text-slate-500">{currentRole.deskripsi || 'Kelola hak akses untuk role ini.'}</p>
                  </div>

                  <button
                    onClick={handleSaveRolePermissions}
                    disabled={savingRbac}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start disabled:opacity-50"
                  >
                    {savingRbac ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>

                {/* Status Message */}
                {rbacMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      rbacMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {rbacMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{rbacMsg.text}</span>
                  </div>
                )}

                {/* Permissions Grouped by Module */}
                <div className="space-y-6">
                  {Object.entries(permissionsByModule).map(([modulName, perms]) => {
                    const modulePermIds = perms.map((p) => p.permissionId);
                    const allSelected = modulePermIds.every((id) => selectedRolePermIds.includes(id));
                    const someSelected = modulePermIds.some((id) => selectedRolePermIds.includes(id));

                    return (
                      <div key={modulName} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            <span>Modul: {modulName}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleModule(modulePermIds)}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            {allSelected ? 'Hapus Semua' : 'Pilih Semua'}
                          </button>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                          {perms.map((p) => {
                            const isChecked = selectedRolePermIds.includes(p.permissionId);
                            return (
                              <label
                                key={p.permissionId}
                                className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition ${
                                  isChecked
                                    ? 'bg-emerald-50/40 border-emerald-300'
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(p.permissionId)}
                                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                  <div className="font-bold text-xs text-slate-800">{p.permissionCode}</div>
                                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                    {p.deskripsi || '-'}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Silakan pilih salah satu role di sebelah kiri untuk melihat hak akses.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ASSIGN ROLE UNTUK PENGURUS */}
      {assignRoleModal.open && assignRoleModal.pengurus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Atur Hak Akses Role Pengurus</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{assignRoleModal.pengurus.namaLengkap}</p>
              </div>
              <button
                onClick={() => setAssignRoleModal({ open: false, pengurus: null, selectedRoleIds: [] })}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Pilih satu atau lebih role untuk akun <strong>{assignRoleModal.pengurus.email || assignRoleModal.pengurus.username}</strong>:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {roles.map((r) => {
                  const isChecked = assignRoleModal.selectedRoleIds.includes(r.roleId);
                  return (
                    <label
                      key={r.roleId}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked ? 'bg-emerald-50 border-emerald-400' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setAssignRoleModal((prev) => ({
                              ...prev,
                              selectedRoleIds: isChecked
                                ? prev.selectedRoleIds.filter((id) => id !== r.roleId)
                                : [...prev.selectedRoleIds, r.roleId],
                            }));
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800">{r.roleName}</span>
                          <span className="block text-[11px] text-slate-400">{r.deskripsi}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{r.permissions?.length || 0} Izin</span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignRoleModal({ open: false, pengurus: null, selectedRoleIds: [] })}
                  className="px-3.5 py-2 text-xs border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignRole}
                  disabled={assignLoading}
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  {assignLoading ? 'Menyimpan...' : 'Simpan Hak Akses'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PENGURUS BARU */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-700 p-5 text-white flex items-center justify-between">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Hak Akses / Role Awal</label>
                <select
                  value={formData.roleId || (roles[0]?.roleId || 0)}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-emerald-500"
                >
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.roleName} - {r.deskripsi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50"
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
