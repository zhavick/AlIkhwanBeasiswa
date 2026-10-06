# Spesifikasi Desain: Sistem Informasi Manajemen Beasiswa & Portal Al-Ikhwan

- **Tanggal Penyusunan**: 06 Oktober 2026
- **Status**: Draft Disetujui (Menunggu Review Akhir Spec)
- **Tech Stack**: ASP.NET Core Web API (.NET 8/9, C#) + PostgreSQL + ReactJS (TypeScript, Vite, Tailwind CSS)
- **Dokumen Referensi Asal**: [Dokumen/BeasiswaIkhwanManagement.dbml](file:///c:/TEMP/VSCODE/AlIkhwanBeasiswa/Dokumen/BeasiswaIkhwanManagement.dbml), [Dokumen/BeasiswaIkhwanManagement.sql](file:///c:/TEMP/VSCODE/AlIkhwanBeasiswa/Dokumen/BeasiswaIkhwanManagement.sql)

---

## 1. Ringkasan Eksekutif & Tujuan Sistem

Sistem Informasi Manajemen Beasiswa Al-Ikhwan adalah platform terpadu yang memadukan **Backoffice Manajemen Yayasan** dengan **Portal Mandiri (Self-Service)** untuk siswa, mahasiswa, dan alumni penerima beasiswa.

Platform ini bertujuan untuk:
1. **Tata Kelola Beasiswa Transparan & Akuntabel**: Mengelola siklus penerimaan beasiswa mulai dari penetapan pagu kuota, seleksi evaluasi nilai (rapor/KHS), persetujuan berjenjang 3 tingkat (*Multi-tier Approval*), hingga pencairan bertahap (*disbursement*) dengan bukti transfer resmi.
2. **Dukungan Jenjang Pendidikan Menyeluruh**: Mendukung penerima di tingkat **Siswa Sekolah (SD/SMP/SMA)** dan **Mahasiswa Perguruan Tinggi (D3/S1)** beserta riwayat keluarga/orang tua.
3. **Pembinaan Kaderisasi Berkelanjutan**: Mengakomodasi monitoring pembinaan kader beasiswa, presensi kajian/pelatihan, dan evaluasi keaktifan.
4. **Ekosistem Karir & Alumni Terintegrasi**: Mengotomatisasi transisi mahasiswa yang telah lulus ke dalam status *Alumni*, melacak riwayat pekerjaan (*tracer study*), serta membuka peluang kontribusi balik (*giving back/mentorship*).
5. **Manajemen Portal Dinamis (CMS)**: Memungkinkan pengurus yayasan mengelola konten pengumuman, banner, timeline pendaftaran, master syarat berkas, dan helpdesk dari halaman admin tanpa menyentuh kode.

---

## 2. Arsitektur Tingkat Tinggi & Teknologi

Sistem dibangun menggunakan pendekatan **Decoupled Architecture**:

```
+----------------------------------------------------------------------------------+
|                              FRONTEND: REACT SPA                                 |
|                                                                                  |
|   +------------------------------------+   +---------------------------------+   |
|   |   Backoffice Admin & Pengurus      |   |   Portal Siswa, Mhs & Alumni    |   |
|   |   - Dashboard Analytics & Pagu     |   |   - Pengajuan Beasiswa          |   |
|   |   - Master Siswa/Mhs/Pengurus/RBAC |   |   - Upload Rapor / KHS          |   |
|   |   - Approval 3 Tingkat & Keuangan  |   |   - Tracking Status Approval    |   |
|   |   - Kaderisasi & Tracer Karir      |   |   - Presensi Pembinaan          |   |
|   |   - Portal Management (CMS)        |   |   - Form Tracer Karir Alumni    |   |
|   +------------------------------------+   +---------------------------------+   |
+----------------------------------------------------------------------------------+
                                         │  HTTPS / REST JSON (JWT Auth)
                                         ▼
+----------------------------------------------------------------------------------+
|                       BACKEND: ASP.NET CORE WEB API                              |
|                                                                                  |
|   +───────────────────+────────────────────+───────────────────+─────────────+   |
|   │ Controllers &     │ Application &      │ Domain Entities   │ Security &  │   |
|   │ Middleware (API)  │ Services (Core)    │ & Value Objects   │ RBAC Engine │   |
|   +───────────────────+────────────────────+───────────────────+─────────────+   |
+----------------------------------------------------------------------------------+
                                         │  Entity Framework Core (Npgsql)
                                         ▼
+----------------------------------------------------------------------------------+
|                             DATABASE: POSTGRESQL                                 |
|                                                                                  |
|   - Skema Pengurus & RBAC (Roles, Permissions)                                   |
|   - Skema Profil (OrangTua, Siswa, Mahasiswa, Akademik)                          |
|   - Skema Transaksi Beasiswa (Periode, Pengajuan, Approval 3 Tahap, Pencairan)   |
|   - Skema Kaderisasi & Alumni Tracer (Profil Kader, Kehadiran, Riwayat Karir)    |
|   - Skema Portal CMS (Pengumuman, Banner, Syarat Dokumen, Helpdesk)              |
+----------------------------------------------------------------------------------+
```

### Tech Stack Pilihan:
* **Backend**: ASP.NET Core Web API (.NET 8/9, C#)
* **ORM & Database**: Entity Framework Core + PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`)
* **Kontainerisasi & DevOps**: Docker & Docker Compose (Multi-stage build untuk API & React Nginx, persistent volume PostgreSQL)
* **Keamanan**: JWT Authentication (Access + Refresh Token) + Granular Policy-Based RBAC
* **Frontend**: ReactJS (TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6)
* **Penyimpanan Berkas**: Local File System terisolasi / Volume Docker untuk kwitansi, bukti transfer, scan rapor/KHS, dan dokumen syarat.

---

## 3. Desain Skema Database Terpadu (PostgreSQL)

### A. Modul Akun Pengguna, Pengurus, & RBAC

```sql
-- 1. Pengguna Sistem
CREATE TABLE app_users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2. Detail Profil Pengurus Yayasan
CREATE TABLE app_pengurus (
    pengurus_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
    nip VARCHAR(50) UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    gelar VARCHAR(50),
    jabatan VARCHAR(100) NOT NULL, -- Dewan Pembina, Ketua Yayasan, Verifikator, Bendahara, Koordinator Beasiswa
    divisi VARCHAR(100) NOT NULL, -- Pendidikan, Keuangan, Kaderisasi, Humas
    no_telp VARCHAR(50),
    email VARCHAR(255),
    alamat_lengkap TEXT,
    tanggal_mulai_menjabat DATE NOT NULL,
    tanggal_akhir_menjabat DATE,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    foto_profil_url VARCHAR(500),
    tanda_tangan_digital_url VARCHAR(500)
);

-- 3. RBAC (Roles & Permissions)
CREATE TABLE app_roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL, -- SuperAdmin, PimpinanYayasan, Verifikator, Bendahara, PembinaKader, Mahasiswa, Siswa, Alumni
    deskripsi TEXT
);

CREATE TABLE app_permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_code VARCHAR(100) UNIQUE NOT NULL, -- beasiswa.verify, beasiswa.approve_tahap1, beasiswa.approve_tahap2, beasiswa.approve_tahap3, pencairan.disburse, portal.manage, dll
    modul VARCHAR(50) NOT NULL,
    deskripsi TEXT
);

CREATE TABLE app_role_permissions (
    role_id INT NOT NULL REFERENCES app_roles(role_id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES app_permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE app_user_roles (
    user_id INT NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES app_roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE app_user_profiles (
    profile_link_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
    siswa_id INT, -- Relasi nullable jika user adalah siswa
    mahasiswa_id INT -- Relasi nullable jika user adalah mahasiswa/alumni
);
```

---

### B. Modul Profil Keluarga, Siswa, & Mahasiswa (Pengembangan Skema DBML)

```sql
-- 1. Orang Tua / Wali
CREATE TABLE ikhwan_orang_tua (
    orang_tua_id SERIAL PRIMARY KEY,
    nama_ayah VARCHAR(255) NOT NULL,
    nama_ibu VARCHAR(255) NOT NULL,
    pekerjaan_ayah VARCHAR(255),
    pekerjaan_ibu VARCHAR(255),
    telah_meninggal_ayah BOOLEAN DEFAULT FALSE,
    telah_meninggal_ibu BOOLEAN DEFAULT FALSE,
    no_telp_ayah VARCHAR(50),
    no_telp_ibu VARCHAR(50),
    email_ayah VARCHAR(255),
    email_ibu VARCHAR(255),
    informasi_tambahan TEXT
);

-- 2. Siswa (Tingkat Sekolah)
CREATE TABLE ikhwan_siswa (
    siswa_id SERIAL PRIMARY KEY,
    orang_tua_id INT NOT NULL REFERENCES ikhwan_orang_tua(orang_tua_id) ON DELETE RESTRICT,
    nama_siswa VARCHAR(255) NOT NULL,
    nama_panggilan VARCHAR(100),
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    no_telp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    informasi_tambahan TEXT
);

CREATE TABLE ikhwan_pendidikan (
    pendidikan_id SERIAL PRIMARY KEY,
    siswa_id INT NOT NULL REFERENCES ikhwan_siswa(siswa_id) ON DELETE CASCADE,
    nama_sekolah VARCHAR(255) NOT NULL,
    alamat_sekolah TEXT NOT NULL,
    jenjang VARCHAR(50) NOT NULL, -- SD, SMP, SMA, SMK
    tanggal_masuk DATE NOT NULL,
    masih_dalam_pendidikan BOOLEAN DEFAULT TRUE,
    tanggal_keluar DATE,
    no_telp_sekolah VARCHAR(50),
    email_sekolah VARCHAR(255)
);

CREATE TABLE ikhwan_nilai_sekolah (
    nilai_sekolah_id SERIAL PRIMARY KEY,
    pendidikan_id INT NOT NULL REFERENCES ikhwan_pendidikan(pendidikan_id) ON DELETE CASCADE,
    siswa_id INT NOT NULL REFERENCES ikhwan_siswa(siswa_id) ON DELETE CASCADE,
    nama_pelajaran VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    nilai_uts NUMERIC(5,2),
    nilai_uas NUMERIC(5,2),
    nilai_rata NUMERIC(5,2) NOT NULL,
    informasi_tambahan TEXT
);

-- 3. Mahasiswa (Tingkat Perguruan Tinggi)
CREATE TABLE ikhwan_mahasiswa (
    mahasiswa_id SERIAL PRIMARY KEY,
    orang_tua_id INT NOT NULL REFERENCES ikhwan_orang_tua(orang_tua_id) ON DELETE RESTRICT,
    nama_mahasiswa VARCHAR(255) NOT NULL,
    nama_panggilan VARCHAR(100),
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    no_telp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    calon_kaderisasi BOOLEAN DEFAULT TRUE,
    status_akademik VARCHAR(50) DEFAULT 'Aktif', -- Aktif, Cuti, Lulus (Alumni), DropOut
    informasi_tambahan TEXT
);

CREATE TABLE ikhwan_universitas (
    univ_id SERIAL PRIMARY KEY,
    mahasiswa_id INT NOT NULL REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    nama_universitas VARCHAR(255) NOT NULL,
    alamat_universitas TEXT,
    no_telp_universitas VARCHAR(50),
    email_universitas VARCHAR(255),
    tanggal_masuk DATE NOT NULL,
    masih_berjalan BOOLEAN DEFAULT TRUE,
    jenjang VARCHAR(50) NOT NULL, -- D3, D4, S1
    jurusan VARCHAR(255) NOT NULL,
    tanggal_lulus DATE,
    jumlah_tahun INT NOT NULL DEFAULT 4,
    jumlah_semester INT NOT NULL DEFAULT 8,
    informasi_tambahan TEXT
);

CREATE TABLE ikhwan_nilai_univ (
    nilai_id SERIAL PRIMARY KEY,
    univ_id INT NOT NULL REFERENCES ikhwan_universitas(univ_id) ON DELETE CASCADE,
    mahasiswa_id INT NOT NULL REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    mata_kuliah VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    nilai_uts NUMERIC(5,2),
    nilai_uas NUMERIC(5,2),
    nilai_rata NUMERIC(5,2) NOT NULL,
    sks INT DEFAULT 3,
    informasi_tambahan TEXT
);
```

---

### C. Modul Siklus Beasiswa Terpadu & Pencairan (Disbursement)

```sql
-- 1. Periode Beasiswa
CREATE TABLE periode_beasiswa (
    periode_id SERIAL PRIMARY KEY,
    nama_periode VARCHAR(255) NOT NULL, -- Contoh: "Ganjil 2026/2027"
    tanggal_mulai_daftar DATE NOT NULL,
    tanggal_selesai_daftar DATE NOT NULL,
    total_anggaran_pagu NUMERIC(15,2) NOT NULL,
    kuota_siswa INT DEFAULT 50,
    kuota_mahasiswa INT DEFAULT 50,
    status_aktif BOOLEAN DEFAULT TRUE
);

-- 2. Transaksi Pengajuan Beasiswa (Unified)
CREATE TABLE pengajuan_beasiswa (
    pengajuan_id SERIAL PRIMARY KEY,
    periode_id INT NOT NULL REFERENCES periode_beasiswa(periode_id) ON DELETE RESTRICT,
    tipe_penerima VARCHAR(20) NOT NULL, -- 'Siswa' atau 'Mahasiswa'
    siswa_id INT REFERENCES ikhwan_siswa(siswa_id) ON DELETE CASCADE,
    mahasiswa_id INT REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    nilai_rata_rata NUMERIC(5,2) NOT NULL, -- Nilai Rapor atau IPK
    pagu_beasiswa NUMERIC(15,2) NOT NULL,
    pagu_tertanggung NUMERIC(15,2) NOT NULL,
    telah_dibayar_lunas BOOLEAN DEFAULT FALSE,
    tanggal_pengajuan DATE NOT NULL DEFAULT CURRENT_DATE,
    status_pengajuan VARCHAR(50) NOT NULL DEFAULT 'Diajukan', -- Draft, Diajukan, Verifikasi, Approved, Rejected, Selesai
    catatan_pengajuan TEXT,
    CONSTRAINT chk_penerima CHECK (
        (tipe_penerima = 'Siswa' AND siswa_id IS NOT NULL AND mahasiswa_id IS NULL) OR
        (tipe_penerima = 'Mahasiswa' AND mahasiswa_id IS NOT NULL AND siswa_id IS NULL)
    )
);

-- 3. Alur Approval 3 Tingkat
CREATE TABLE approval_beasiswa (
    approval_id SERIAL PRIMARY KEY,
    pengajuan_id INT NOT NULL REFERENCES pengajuan_beasiswa(pengajuan_id) ON DELETE CASCADE,
    tingkat_approval INT NOT NULL, -- 1: Verifikator, 2: Koordinator/Ketua Program, 3: Pimpinan/Yayasan
    approver_user_id INT NOT NULL REFERENCES app_users(user_id),
    status_approval VARCHAR(30) NOT NULL, -- 'Approved', 'Rejected', 'Revisi'
    catatan_approval TEXT,
    tanggal_approval TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_approval_tingkat UNIQUE (pengajuan_id, tingkat_approval)
);

-- 4. Pencairan Dana (Disbursement)
CREATE TABLE pencairan_beasiswa (
    pencairan_id SERIAL PRIMARY KEY,
    pengajuan_id INT NOT NULL REFERENCES pengajuan_beasiswa(pengajuan_id) ON DELETE CASCADE,
    termin_ke INT NOT NULL DEFAULT 1,
    tanggal_pembayaran DATE NOT NULL,
    biaya NUMERIC(15,2) NOT NULL,
    bukti_pembayaran VARCHAR(500) NOT NULL,
    nomor_referensi_bank VARCHAR(100),
    status_pencairan VARCHAR(30) DEFAULT 'Selesai', -- Pending, Selesai, Dibatalkan
    dicairkan_oleh_user_id INT REFERENCES app_users(user_id),
    informasi_tambahan TEXT
);
```

---

### D. Modul Perluasan Kaderisasi & Tracer Karir Alumni

```sql
-- 1. Profil Kaderisasi Mahasiswa
CREATE TABLE kaderisasi_profil (
    kader_id SERIAL PRIMARY KEY,
    mahasiswa_id INT UNIQUE NOT NULL REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    status_kader VARCHAR(50) NOT NULL DEFAULT 'Kader Aktif', -- Calon, Kader Aktif, Kader Mandiri, Alumni Penggerak, Demisioner
    kelompok_halaqah VARCHAR(100),
    nama_murabbi VARCHAR(255),
    tingkat_pembinaan VARCHAR(50) DEFAULT 'Dasar', -- Dasar, Menengah, Lanjut
    catatan_perkembangan TEXT,
    tanggal_bergabung DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE kaderisasi_kegiatan (
    kegiatan_id SERIAL PRIMARY KEY,
    nama_kegiatan VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal_kegiatan DATE NOT NULL,
    tempat VARCHAR(255) NOT NULL,
    tipe_kegiatan VARCHAR(100) NOT NULL, -- Kajian Bulanan, Pelatihan Leadership, Bakti Sosial
    wajib_hadir BOOLEAN DEFAULT TRUE
);

CREATE TABLE kaderisasi_presensi (
    presensi_id SERIAL PRIMARY KEY,
    kegiatan_id INT NOT NULL REFERENCES kaderisasi_kegiatan(kegiatan_id) ON DELETE CASCADE,
    mahasiswa_id INT NOT NULL REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    status_kehadiran VARCHAR(30) NOT NULL, -- Hadir, Izin, Sakit, Alpa
    waktu_presensi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    keterangan TEXT,
    CONSTRAINT uq_presensi_kegiatan UNIQUE (kegiatan_id, mahasiswa_id)
);

-- 2. Tracer Karir Alumni (Pengembangan IkhwanPekerjaan)
CREATE TABLE alumni_tracer_karir (
    tracer_id SERIAL PRIMARY KEY,
    mahasiswa_id INT NOT NULL REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    nama_perusahaan VARCHAR(255) NOT NULL,
    bidang_pekerjaan VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255) NOT NULL,
    status_pekerjaan VARCHAR(50) NOT NULL, -- Karyawan Tetap, Kontrak, Freelance, Wirausaha, Studi Lanjut
    bulan_bergabung INT NOT NULL,
    tahun_bergabung INT NOT NULL,
    masih_bekerja BOOLEAN DEFAULT TRUE,
    bulan_selesai INT,
    tahun_selesai INT,
    rentang_gaji VARCHAR(50), -- < 3 Jt, 3-5 Jt, 5-10 Jt, > 10 Jt (Opsional)
    keselarasan_jurusan VARCHAR(50), -- Selaras, Cukup Selaras, Tidak Selaras
    informasi_tambahan TEXT
);

-- 3. Kontribusi Alumni (Giving Back)
CREATE TABLE alumni_kontribusi (
    kontribusi_id SERIAL PRIMARY KEY,
    mahasiswa_id INT NOT NULL REFERENCES ikhwan_mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    tipe_kontribusi VARCHAR(100) NOT NULL, -- Donasi Rutin, Orang Tua Asuh, Mentor Karir, Pemateri
    deskripsi_kontribusi TEXT,
    tanggal_kontribusi DATE NOT NULL DEFAULT CURRENT_DATE,
    nominal_donasi NUMERIC(15,2),
    status_aktif BOOLEAN DEFAULT TRUE
);
```

---

### E. Modul Manajemen Portal (CMS & Konfigurasi di Admin)

```sql
-- 1. Pengumuman & Berita Portal
CREATE TABLE portal_pengumuman (
    pengumuman_id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    ringkasan TEXT,
    isi_konten TEXT NOT NULL,
    gambar_cover_url VARCHAR(500),
    kategori VARCHAR(50) NOT NULL, -- Info Beasiswa, Kegiatan Kaderisasi, Berita Yayasan, Pengumuman Kelulusan
    is_published BOOLEAN DEFAULT TRUE,
    tanggal_terbit DATE NOT NULL DEFAULT CURRENT_DATE,
    penulis_user_id INT REFERENCES app_users(user_id)
);

-- 2. Banner Slider Beranda Portal
CREATE TABLE portal_banner (
    banner_id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    subjudul VARCHAR(255),
    gambar_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    urutan INT DEFAULT 0,
    status_aktif BOOLEAN DEFAULT TRUE
);

-- 3. Master Syarat Berkas Beasiswa
CREATE TABLE portal_syarat_dokumen (
    syarat_id SERIAL PRIMARY KEY,
    nama_dokumen VARCHAR(255) NOT NULL, -- Scan KTP/KIA, Kartu Keluarga, SKTM, Scan Rapor, KHS Terakhir
    deskripsi TEXT,
    wajib BOOLEAN DEFAULT TRUE,
    tipe_penerima VARCHAR(20) DEFAULT 'Semua', -- Siswa, Mahasiswa, Semua
    format_file_diizinkan VARCHAR(100) DEFAULT 'pdf,jpg,png',
    max_size_mb INT DEFAULT 2
);

-- 4. Dokumen yang Diunggah oleh Penerima Beasiswa
CREATE TABLE portal_dokumen_penerima (
    dokumen_id SERIAL PRIMARY KEY,
    pengajuan_id INT NOT NULL REFERENCES pengajuan_beasiswa(pengajuan_id) ON DELETE CASCADE,
    syarat_id INT NOT NULL REFERENCES portal_syarat_dokumen(syarat_id) ON DELETE RESTRICT,
    file_url VARCHAR(500) NOT NULL,
    nama_file_asli VARCHAR(255) NOT NULL,
    tanggal_unggah TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status_verifikasi VARCHAR(30) DEFAULT 'Pending', -- Pending, Valid, Ditolak
    catatan_revisi TEXT
);

-- 5. Layanan Helpdesk / Tiket Tanya Jawab
CREATE TABLE portal_helpdesk_tiket (
    tiket_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
    nomor_tiket VARCHAR(50) UNIQUE NOT NULL,
    subjek VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    kategori VARCHAR(50) NOT NULL, -- Kendala Pengajuan, Verifikasi Berkas, Pencairan, Teknis Akun
    status_tiket VARCHAR(30) DEFAULT 'Menunggu', -- Menunggu, Dijawab, Selesai, Ditutup
    jawaban_admin TEXT,
    dijawab_oleh_user_id INT REFERENCES app_users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

---

## 4. Arsitektur Backend API (ASP.NET Core)

### A. Struktur Proyek (Clean Architecture)

```
AlIkhwanBeasiswa.sln
│
├── src/AlIkhwanBeasiswa.Core/             # Pure Domain & Business Contract
│   ├── Entities/                          # Siswa, Mahasiswa, Pengurus, Beasiswa, Kaderisasi, dll
│   ├── Enums/                             # StatusPengajuan, TingkatApproval, TipePenerima, StatusKader
│   ├── Interfaces/
│   │   ├── Repositories/                  # IGenericRepository, IBeasiswaRepository
│   │   └── Services/                      # IAuthService, IBeasiswaService, IApprovalService,
│   │                                      # IPengurusService, IKaderisasiService, IPortalCmsService
│   └── DTOs/                              # Request/Response Data Transfer Objects
│
├── src/AlIkhwanBeasiswa.Infrastructure/   # Implementasi Teknis & Data
│   ├── Data/
│   │   ├── AppDbContext.cs                # EF Core DbContext mapping ke PostgreSQL
│   │   └── EntityConfigurations/          # Fluent API configurations
│   ├── Migrations/                        # Npgsql EF Core Migrations
│   ├── Repositories/                      # Implementasi Repository EF Core
│   ├── Services/                          # Implementasi FileStorage, EmailNotification, TokenGenerator
│   └── Security/                          # BCrypt PasswordHasher, Custom Claims Transformer
│
└── src/AlIkhwanBeasiswa.Api/              # Entry Point Web API
    ├── Controllers/
    │   ├── AuthController.cs              # Login, Refresh, Profile, ForgotPassword
    │   ├── PengurusController.cs          # Manajemen Pengurus & Jabatan
    │   ├── RbacController.cs              # Role, Permission, User Role Assignment
    │   ├── SiswaController.cs             # Profil Siswa, Pendidikan, Rapor Nilai
    │   ├── MahasiswaController.cs         # Profil Mahasiswa, Kampus, KHS, Luluskan ke Alumni
    │   ├── BeasiswaController.cs          # Periode, Pengajuan, Evaluasi Kelayakan
    │   ├── ApprovalController.cs          # Alur Approval 3 Tingkat
    │   ├── PencairanController.cs         # Disbursement, Upload Bukti Transfer
    │   ├── KaderisasiController.cs        # Profil Kader, Kegiatan, Presensi
    │   ├── AlumniController.cs            # Tracer Karir, Statistik Serapan Kerja, Kontribusi
    │   └── PortalCmsController.cs         # Pengumuman, Banner, Syarat Dokumen, Helpdesk
    ├── Middlewares/                       # GlobalExceptionHandler, JwtBearerHandling
    ├── Policies/                          # Authorization Policy Handlers
    └── Program.cs                         # IoC Container & Startup Configuration
```

### B. Mekanisme Keamanan & Authorization Policy
Token JWT ditandatangani dengan rahasia HMAC-SHA256 yang memuat claims:
- `sub`: User ID
- `email`: User Email
- `role`: Roles (misal: `SuperAdmin`, `Verifikator`, `PimpinanYayasan`, `Mahasiswa`)
- `permissions`: Daftar kode permission (misal: `["beasiswa.approve_tahap1", "beasiswa.verify"]`)
- `pengurus_id` / `mahasiswa_id` / `siswa_id`: ID relasi profil yang bersangkutan

Contoh Registrasi Policy di `Program.cs`:
```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanVerifyBeasiswa", policy => policy.RequireClaim("permission", "beasiswa.verify"));
    options.AddPolicy("CanApproveTahap1", policy => policy.RequireClaim("permission", "beasiswa.approve_tahap1"));
    options.AddPolicy("CanApproveTahap2", policy => policy.RequireClaim("permission", "beasiswa.approve_tahap2"));
    options.AddPolicy("CanApproveTahap3", policy => policy.RequireClaim("permission", "beasiswa.approve_tahap3"));
    options.AddPolicy("CanDisburse", policy => policy.RequireClaim("permission", "pencairan.disburse"));
    options.AddPolicy("CanManagePortal", policy => policy.RequireClaim("permission", "portal.manage"));
});
```

---

## 5. Arsitektur Frontend (ReactJS SPA)

### A. Pembagian Layout & Routing

```
/ (Landing Page Publik)
├── /pengumuman               # Info Beasiswa & Kegiatan Yayasan
├── /login                    # Login Sistem (Siswa, Mahasiswa, Alumni, Pengurus)
│
├── /portal                   # [AREA PORTAL MANDIRI]
│   ├── /dashboard            # Ringkasan Pengajuan & Notifikasi
│   ├── /pengajuan-baru       # Formulir Pendaftaran Beasiswa & Upload Dokumen
│   ├── /riwayat-beasiswa     # Timeline Status Approval 3-Tahap & Pencairan
│   ├── /akademik             # Update Nilai Rapor / KHS Semester Baru
│   ├── /kaderisasi           # Jadwal Kajian & Presensi Mandiri
│   ├── /alumni/tracer        # Form Pengisian Karir (Jika Mahasiswa Sudah Lulus)
│   └── /helpdesk             # Kirim Pertanyaan / Tiket Kendala
│
└── /admin                    # [AREA BACKOFFICE PENGURUS] (Guarded by RBAC)
    ├── /dashboard            # KPI Beasiswa, Total Pagu, Realisasi, Grafik Penyerapan
    ├── /pengurus             # Master Data Pengurus Yayasan & Jabatan
    ├── /rbac                 # Hak Akses Role & Permission Matrix
    ├── /penerima/siswa       # Master Data Siswa, Orang Tua, & Nilai Rapor
    ├── /penerima/mahasiswa   # Master Data Mahasiswa, Kampus, KHS & Status Lulus
    ├── /beasiswa/periode     # Buka / Tutup Periode & Alokasi Anggaran Pagu
    ├── /beasiswa/pengajuan   # Seleksi Administrasi & Verifikasi Dokumen
    ├── /beasiswa/approval    # Antrean Approval 3 Tingkat (Verifikator, Ketua, Pimpinan)
    ├── /beasiswa/pencairan   # Keuangan: Pencairan Dana & Upload Bukti Transfer
    ├── /kaderisasi           # Monitoring Pembinaan, Kegiatan & Rekap Kehadiran
    ├── /alumni/tracer        # Rekap Tracer Karir Alumni & Statistik Lapangan Kerja
    └── /portal-management    # [CMS PORTAL]
        ├── /pengumuman       # CRUD Pengumuman & Berita
        ├── /banner           # Slider Banner Beranda
        ├── /syarat-dokumen   # Kelola Syarat Berkas yang Wajib Diunggah
        ├── /helpdesk         # Jawab Tiket Tanya Jawab Siswa/Mhs
        └── /akun-portal      # Kontrol Akun Siswa/Mhs (Aktivasi & Reset Password)
```

---

## 6. Alur Bisnis Utama (Core Workflows)

### Alur 1: Siklus Pengajuan & Approval Beasiswa 3 Tingkat
1. **Admin** membuka periode beasiswa baru melalui modul *Portal Management* beserta syarat berkas dan pagu anggarannya.
2. **Siswa/Mahasiswa** login ke portal, melengkapi formulir pengajuan, mengunggah scan rapor/KHS dan berkas wajib.
3. **Verifikator (Tahap 1)**: Memeriksa kelengkapan administrasi dan ambang batas nilai rapor/IPK di menu *Verifikasi Beasiswa*. Jika valid, meneruskan ke Tahap 2.
4. **Koordinator / Ketua Program (Tahap 2)**: Menilai prioritas kelayakan sosial-ekonomi (kondisi yatim/dhuafa) dan kuota pagu. Jika disetujui, meneruskan ke Tahap 3.
5. **Pimpinan / Dewan Pembina Yayasan (Tahap 3)**: Melakukan *Final Approval* pengesahan pagu tertanggung penerima.
6. **Bendahara / Keuangan**: Menerima daftar beasiswa yang telah disetujui, mengeksekusi pencairan bertahap (*disbursement*), dan mengunggah bukti transfer bank. Status di portal penerima otomatis berubah menjadi "Telah Dicairkan".

### Alur 2: Transisi Mahasiswa Menjadi Alumni & Tracer Study
1. Mahasiswa menyelesaikan studi dan memperoleh ijazah/yudisium.
2. Admin (atau mahasiswa via portal) menginput tanggal lulus dan surat kelulusan di profil akademik.
3. Status akademik mahasiswa otomatis berubah menjadi **Lulus (Alumni)**, dan user role diberikan akses menu *Alumni Tracer*.
4. Alumni mengisi form berkala mengenai nama perusahaan, jabatan, bidang industri, dan keselarasan studi.
5. Admin dapat memantau *Dashboard Tracer Karir* untuk melihat persentase serapan kerja alumni beasiswa Al-Ikhwan serta memetakan alumni yang siap menjadi mentor/donatur kembali (*giving back*).

---

## 7. Arsitektur Kontainerisasi & Docker Compose

Sistem dikemas ke dalam lingkungan kontainer yang portabel dan siap dideploy di lingkungan pengembangan maupun produksi:

```
AlIkhwanBeasiswa/
├── docker-compose.yml                 # Orkestrasi Database, API Backend, & Frontend
├── docker-compose.override.yml        # Konfigurasi dev / port mapping lokal
├── .env.example                       # Contoh environment variables (DB credentials, JWT Secret)
├── src/
│   ├── AlIkhwanBeasiswa.Api/
│   │   └── Dockerfile                 # Multi-stage build .NET 8/9 SDK -> Runtime Alpine/Debian
│   └── frontend/
│       ├── Dockerfile                 # Multi-stage build Node.js (Vite build) -> Nginx Alpine
│       └── nginx.conf                 # Konfigurasi reverse proxy / routing SPA
```

### Konfigurasi Service di `docker-compose.yml`:
1. **`db` (PostgreSQL 16)**:
   * Image: `postgres:16-alpine`
   * Persistent Volume: `postgres_data:/var/lib/postgresql/data`
   * Environment: `POSTGRES_DB=alikhwan_beasiswa`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=secret`
   * Healthcheck untuk memastikan database siap menerima koneksi sebelum API start.
2. **`api` (ASP.NET Core Web API)**:
   * Build: `./src/AlIkhwanBeasiswa.Api`
   * Depends_on: `db` (condition: `service_healthy`)
   * Environment: Connection string ke PostgreSQL, JWT Secret, File Upload directory.
   * Persistent Volume: `uploads_data:/app/uploads` (Menyimpan berkas KHS, bukti transfer, foto).
3. **`frontend` (ReactJS SPA via Nginx)**:
   * Build: `./src/frontend`
   * Depends_on: `api`
   * Ports: `80:80` (Melayani static assets dan mem-proxy `/api` ke container `api`).

---

## 8. Rencana Tahapan Eksekusi (Milestones)

1. **Milestone 1 - Kontainerisasi, Inisialisasi Proyek & Database**:
   * Setup Dockerfile (.NET API & React), `docker-compose.yml`, dan inisialisasi solusi kode sumber.
   * Pembuatan migrasi PostgreSQL EF Core untuk seluruh skema tabel di atas dan initial seeder (SuperAdmin, Master Roles, Default Permissions).
2. **Milestone 2 - Core Backend API & RBAC**:
   * Implementasi JWT Authentication, AuthService, PengurusService, dan RbacService.
   * Implementasi CRUD Master Profil (Orang Tua, Siswa, Mahasiswa, Universitas, Sekolah, Nilai).
3. **Milestone 3 - Engine Beasiswa, Approval 3 Tingkat & Pencairan**:
   * Implementasi Periode, Pengajuan Beasiswa terpadu, Alur Approval berjenjang, dan Disbursement.
4. **Milestone 4 - Kaderisasi, Alumni Tracer & Portal Management CMS**:
   * Implementasi modul kaderisasi, presensi, tracer karir, serta CMS pengumuman, banner, dan helpdesk tiket.
5. **Milestone 5 - Frontend React: Backoffice Admin & Portal Penerima**:
   * Pembangunan UI Admin Backoffice lengkap dengan dashboard analitik dan CMS portal.
   * Pembangunan UI Portal Mandiri untuk siswa, mahasiswa, dan alumni.
6. **Milestone 6 - Integrasi, Validasi, & Pengujian**:
   * Pengujian end-to-end flow pengajuan, verifikasi, approval, pencairan, dan update karir alumni di dalam kontainer Docker.
