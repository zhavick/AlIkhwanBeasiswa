# Al-Ikhwan Beasiswa Management & Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Membangun aplikasi Sistem Informasi Manajemen Beasiswa & Portal Mandiri Al-Ikhwan berbasis ASP.NET Core 8 Web API, PostgreSQL, ReactJS (Vite + Tailwind CSS), dan orkestrasi Docker Compose.

**Architecture:** Arsitektur terpisah (*Decoupled Architecture*) dengan Clean Layered Architecture pada Backend ASP.NET Core (.NET 8 Web API: `Core`, `Infrastructure`, `Api`) yang terhubung ke PostgreSQL 16 melalui EF Core (Npgsql), serta Single Page Application ReactJS (Vite, TypeScript, Tailwind CSS) dengan pembagian area *Admin Backoffice* dan *Portal Mandiri*, seluruhnya dikemas dalam Docker Compose.

**Tech Stack:** 
- Backend: .NET 8.0 SDK, ASP.NET Core Web API, Entity Framework Core 8, Npgsql.EntityFrameworkCore.PostgreSQL, JWT Bearer, BCrypt.Net-Next.
- Database: PostgreSQL 16 (Alpine).
- Frontend: React 18/19, TypeScript, Vite, Tailwind CSS, Axios, Lucide React, React Router DOM v6.
- DevOps / Kontainerisasi: Docker & Docker Compose.

**Spec:** [docs/superpowers/specs/2026-10-06-alikhwan-beasiswa-management-portal-design.md](file:///c:/TEMP/VSCODE/AlIkhwanBeasiswa/docs/superpowers/specs/2026-10-06-alikhwan-beasiswa-management-portal-design.md)

## Global Constraints

- Backend harus menggunakan C# (.NET 8.0) dengan Clean Architecture terbagi minimal menjadi 3 project: `AlIkhwanBeasiswa.Core`, `AlIkhwanBeasiswa.Infrastructure`, dan `AlIkhwanBeasiswa.Api`.
- Database harus menggunakan PostgreSQL dengan penamaan tabel snake_case melalui konfigurasi Entity Framework Core.
- Autentikasi menggunakan JWT Bearer dengan otorisasi Policy-Based berbasis izin peran (*granular RBAC*).
- Frontend harus menggunakan ReactJS dengan Vite dan TypeScript dalam direktori `src/frontend`.
- Seluruh container (Database, API, Frontend) harus dapat dijalankan melalui satu perintah `docker compose up --build`.

---

## File Structure Map

```
AlIkhwanBeasiswa/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── docs/
│   └── superpowers/
│       ├── specs/2026-10-06-alikhwan-beasiswa-management-portal-design.md
│       └── plans/2026-10-06-alikhwan-beasiswa-management-portal.md
├── src/
│   ├── AlIkhwanBeasiswa.sln
│   ├── AlIkhwanBeasiswa.Core/
│   │   ├── AlIkhwanBeasiswa.Core.csproj
│   │   ├── Enums/
│   │   ├── Entities/
│   │   ├── DTOs/
│   │   └── Interfaces/
│   ├── AlIkhwanBeasiswa.Infrastructure/
│   │   ├── AlIkhwanBeasiswa.Infrastructure.csproj
│   │   ├── Data/AppDbContext.cs
│   │   ├── Data/DbSeeder.cs
│   │   └── Services/
│   ├── AlIkhwanBeasiswa.Api/
│   │   ├── AlIkhwanBeasiswa.Api.csproj
│   │   ├── Dockerfile
│   │   ├── appsettings.json
│   │   ├── Controllers/
│   │   ├── Middlewares/
│   │   └── Program.cs
│   └── frontend/
│       ├── package.json
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── src/
│       │   ├── App.tsx
│       │   ├── contexts/AuthContext.tsx
│       │   ├── services/api.ts
│       │   ├── layouts/
│       │   └── pages/
└── tests/
    └── AlIkhwanBeasiswa.Tests/
        ├── AlIkhwanBeasiswa.Tests.csproj
        └── UnitTests/
```

---

## Implementation Tasks

### Task 1: Scaffolding Solusi .NET 8, Frontend React Vite, dan Docker Compose

**Files:**
- Create: `src/AlIkhwanBeasiswa.sln`
- Create: `src/AlIkhwanBeasiswa.Core/AlIkhwanBeasiswa.Core.csproj`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj`
- Create: `src/AlIkhwanBeasiswa.Api/AlIkhwanBeasiswa.Api.csproj`
- Create: `src/AlIkhwanBeasiswa.Api/Dockerfile`
- Create: `src/frontend/package.json`
- Create: `src/frontend/Dockerfile`
- Create: `src/frontend/nginx.conf`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Produces: Lingkungan proyek terkompilasi (.NET Core library & Web API, Frontend React template) dan konfigurasi Docker Compose siap orkestrasi.

- [x] **Step 1: Inisialisasi Solusi dan Proyek .NET 8**
  Jalankan perintah .NET CLI di direktori `src`:
  ```powershell
  mkdir src/AlIkhwanBeasiswa.Core ; mkdir src/AlIkhwanBeasiswa.Infrastructure ; mkdir src/AlIkhwanBeasiswa.Api
  dotnet new sln -n AlIkhwanBeasiswa -o src
  dotnet new classlib -n AlIkhwanBeasiswa.Core -o src/AlIkhwanBeasiswa.Core -f net8.0
  dotnet new classlib -n AlIkhwanBeasiswa.Infrastructure -o src/AlIkhwanBeasiswa.Infrastructure -f net8.0
  dotnet new webapi -n AlIkhwanBeasiswa.Api -o src/AlIkhwanBeasiswa.Api -f net8.0 --use-controllers
  dotnet sln src/AlIkhwanBeasiswa.sln add src/AlIkhwanBeasiswa.Core/AlIkhwanBeasiswa.Core.csproj src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj src/AlIkhwanBeasiswa.Api/AlIkhwanBeasiswa.Api.csproj
  dotnet add src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj reference src/AlIkhwanBeasiswa.Core/AlIkhwanBeasiswa.Core.csproj
  dotnet add src/AlIkhwanBeasiswa.Api/AlIkhwanBeasiswa.Api.csproj reference src/AlIkhwanBeasiswa.Core/AlIkhwanBeasiswa.Core.csproj src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj
  ```

- [x] **Step 2: Tambahkan Dependencies NuGet**
  Tambahkan library EF Core, Npgsql, JWT Bearer, dan BCrypt:
  ```powershell
  dotnet add src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.4
  dotnet add src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj package Microsoft.EntityFrameworkCore.Design --version 8.0.8
  dotnet add src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj package BCrypt.Net-Next --version 4.0.3
  dotnet add src/AlIkhwanBeasiswa.Infrastructure/AlIkhwanBeasiswa.Infrastructure.csproj package System.IdentityModel.Tokens.Jwt --version 8.0.2
  dotnet add src/AlIkhwanBeasiswa.Api/AlIkhwanBeasiswa.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.8
  dotnet add src/AlIkhwanBeasiswa.Api/AlIkhwanBeasiswa.Api.csproj package Microsoft.EntityFrameworkCore.Design --version 8.0.8
  ```

- [x] **Step 3: Inisialisasi Frontend React Vite dengan TypeScript**
  Buat proyek Vite React di `src/frontend`:
  ```powershell
  npx -y create-vite@latest src/frontend --template react-ts
  cd src/frontend ; npm install ; npm install -D tailwindcss postcss autoprefixer ; npx tailwindcss init -p ; npm install lucide-react axios react-router-dom ; cd ../..
  ```

- [x] **Step 4: Konfigurasi Dockerfile dan docker-compose.yml**
  Buat file `docker-compose.yml` di root workspace yang mendefinisikan 3 service: `db` (Postgres 16), `api` (.NET 8), dan `frontend` (React Nginx).

- [x] **Step 5: Verifikasi Build Solusi dan Komit Git**
  Jalankan `dotnet build src/AlIkhwanBeasiswa.sln` dan commit:
  ```bash
  git add .
  git commit -m "chore: scaffold .NET 8 solution, React Vite frontend, and Docker orchestration"
  ```

---

### Task 2: Implementasi Domain Entities & Enums pada `AlIkhwanBeasiswa.Core`

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Enums/Enums.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/User.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/Pengurus.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/RbacEntities.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/OrangTua.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/Siswa.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/Mahasiswa.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/BeasiswaEntities.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/KaderisasiEntities.cs`
- Create: `src/AlIkhwanBeasiswa.Core/Entities/PortalCmsEntities.cs`

**Interfaces:**
- Produces: Seluruh POCO entities domain Al-Ikhwan Beasiswa yang merepresentasikan skema spesifikasi database PostgreSQL.

- [x] **Step 1: Buat Enums Domain**
  Definisikan enum `TipePenerima` (Siswa, Mahasiswa), `StatusPengajuan` (Draft, Diajukan, Verifikasi, Approved, Rejected, Selesai), `TingkatApproval` (Verifikator = 1, Koordinator = 2, Pimpinan = 3), `StatusKader`, `StatusPekerjaan`.

- [x] **Step 2: Buat Entitas Akun, Pengurus & RBAC**
  Implementasikan entitas `AppUser`, `AppPengurus`, `AppRole`, `AppPermission`, `AppRolePermission`, `AppUserRole`, dan `AppUserProfile`.

- [x] **Step 3: Buat Entitas Profil Siswa, Mahasiswa, Orang Tua, dan Akademik**
  Implementasikan entitas `IkhwanOrangTua`, `IkhwanSiswa`, `IkhwanPendidikan`, `IkhwanNilaiSekolah`, `IkhwanMahasiswa`, `IkhwanUniversitas`, dan `IkhwanNilaiUniv`.

- [x] **Step 4: Buat Entitas Beasiswa, Approval, dan Pencairan**
  Implementasikan entitas `PeriodeBeasiswa`, `PengajuanBeasiswa`, `ApprovalBeasiswa`, dan `PencairanBeasiswa`.

- [x] **Step 5: Buat Entitas Kaderisasi, Tracer Karir Alumni, dan Portal CMS**
  Implementasikan entitas `KaderisasiProfil`, `KaderisasiKegiatan`, `KaderisasiPresensi`, `AlumniTracerKarir`, `AlumniKontribusi`, `PortalPengumuman`, `PortalBanner`, `PortalSyaratDokumen`, `PortalDokumenPenerima`, dan `PortalHelpdeskTiket`.

- [x] **Step 6: Build & Commit**
  Jalankan `dotnet build src/AlIkhwanBeasiswa.Core` dan commit:
  ```bash
  git add src/AlIkhwanBeasiswa.Core/
  git commit -m "feat(core): implement all domain entities, enums, and relationships"
  ```

---

### Task 3: Setup `AlIkhwanBeasiswa.Infrastructure`, DbContext, Migrasi EF Core, & Seeder

**Files:**
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Data/AppDbContext.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Data/DbSeeder.cs`
- Modify: `src/AlIkhwanBeasiswa.Api/appsettings.json`
- Modify: `src/AlIkhwanBeasiswa.Api/Program.cs`
- Create: Migrations via EF Core CLI

**Interfaces:**
- Consumes: Entities dari `AlIkhwanBeasiswa.Core`
- Produces: `AppDbContext` dengan pemetaan Fluent API snake_case, initial database seeder (Default SuperAdmin, Master Roles, Permissions, Default Syarat Dokumen).

- [x] **Step 1: Implementasikan `AppDbContext`**
  Daftarkan seluruh `DbSet` entitas, konfigurasikan cascade deletes dan relasi foreign key, serta atur konvensi snake_case table and column mapping.

- [x] **Step 2: Implementasikan `DbSeeder`**
  Buat class seeder otomatis untuk:
  - Default Roles (`SuperAdmin`, `PimpinanYayasan`, `KoordinatorBeasiswa`, `Verifikator`, `Bendahara`, `PembinaKader`, `Mahasiswa`, `Siswa`, `Alumni`).
  - Default Permissions (`beasiswa.view`, `beasiswa.create`, `beasiswa.verify`, `beasiswa.approve_tahap1`, `beasiswa.approve_tahap2`, `beasiswa.approve_tahap3`, `pencairan.disburse`, `portal.manage`, `pengurus.manage`, `alumni.tracer`).
  - Default SuperAdmin user (`admin@alikhwan.id` dengan password ter-hash).
  - Syarat Dokumen standar (Scan KTP/KIA, KK, SKTM, Rapor/KHS).

- [x] **Step 3: Konfigurasi Connection String PostgreSQL di Api**
  Tambahkan connection string ke `appsettings.json`:
  `"ConnectionStrings": { "DefaultConnection": "Host=localhost;Port=5432;Database=alikhwan_beasiswa;Username=postgres;Password=secret" }`

- [x] **Step 4: Generate Initial Migration**
  Jalankan perintah pembuatan migrasi EF Core:
  ```powershell
  dotnet ef migrations add InitialCreate -p src/AlIkhwanBeasiswa.Infrastructure -s src/AlIkhwanBeasiswa.Api -o Data/Migrations
  ```

- [x] **Step 5: Verifikasi Build & Commit**
  Jalankan `dotnet build src/AlIkhwanBeasiswa.sln` dan commit:
  ```bash
  git add src/AlIkhwanBeasiswa.Infrastructure/ src/AlIkhwanBeasiswa.Api/
  git commit -m "feat(infra): setup AppDbContext, EF Core Npgsql migrations, and DbSeeder"
  ```

---

### Task 4: Layanan Autentikasi JWT, Password Hasher, dan Policy-Based RBAC

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Interfaces/IAuthService.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Services/AuthService.cs`
- Create: `src/AlIkhwanBeasiswa.Core/DTOs/AuthDtos.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/AuthController.cs`
- Modify: `src/AlIkhwanBeasiswa.Api/Program.cs`

**Interfaces:**
- Produces: Endpoint `POST /api/auth/login`, `POST /api/auth/register-penerima`, `GET /api/auth/me`, JWT Claims generation, RBAC policies handler.

- [x] **Step 1: Buat DTOs Autentikasi**
  Buat `LoginRequestDto`, `LoginResponseDto` (token, user profile, roles, permissions), `RegisterPenerimaDto`.

- [x] **Step 2: Implementasi `IAuthService` dan `AuthService`**
  Implementasikan logika login, verifikasi hash password menggunakan BCrypt, pembuatan token JWT dengan claims (`UserId`, `Email`, `Roles`, `Permissions`, `EntityId`).

- [x] **Step 3: Registrasi JWT Authentication & Authorization Policies di `Program.cs`**
  Konfigurasikan `AddAuthentication(JwtBearerDefaults.AuthenticationScheme)` dan daftarkan policy: `CanVerifyBeasiswa`, `CanApproveTahap1`, `CanApproveTahap2`, `CanApproveTahap3`, `CanDisburse`, `CanManagePortal`.

- [x] **Step 4: Implementasikan `AuthController`**
  Buat REST controller untuk login, refresh token, dan fetch profil diri (`/api/auth/me`).

- [x] **Step 5: Test Endpoint Login & Commit**
  Verifikasi via swagger atau unit test, lalu commit:
  ```bash
  git add .
  git commit -m "feat(auth): implement JWT authentication, BCrypt password hashing, and RBAC authorization policies"
  ```

---

### Task 5: Master Data Pengurus, RBAC, Orang Tua, Siswa, & Mahasiswa

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Interfaces/IPengurusService.cs` & `IPenerimaService.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Services/PengurusService.cs` & `PenerimaService.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/PengurusController.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/RbacController.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/SiswaController.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/MahasiswaController.cs`

**Interfaces:**
- Produces: CRUD Pengurus yayasan & jabatan, CRUD RBAC roles & permissions, CRUD Siswa + riwayat sekolah + nilai rapor, CRUD Mahasiswa + universitas + KHS nilai.

- [x] **Step 1: Implementasi Layanan Pengurus & RBAC**
  Layanan untuk mengelola data pengurus yayasan, jabatan, penugasan role kepada user, dan perolehan matriks permission.

- [x] **Step 2: Implementasi Layanan Siswa & Nilai Rapor**
  Layanan untuk menyimpan profil siswa, orang tua, sekolah (`IkhwanPendidikan`), dan daftar nilai rapor semester (`IkhwanNilaiSekolah`).

- [x] **Step 3: Implementasi Layanan Mahasiswa & KHS Univ**
  Layanan untuk menyimpan profil mahasiswa, universitas (`IkhwanUniversitas`), nilai mata kuliah (`IkhwanNilaiUniv`), dan perhitungan IPK/nilai rata-rata.

- [x] **Step 4: Implementasi Controllers**
  Buat `PengurusController`, `RbacController`, `SiswaController`, dan `MahasiswaController` dengan validasi input dan proteksi role/permission.

- [x] **Step 5: Verifikasi Build & Commit**
  ```bash
  git add .
  git commit -m "feat(api): implement management endpoints for Pengurus, RBAC, Siswa, and Mahasiswa"
  ```

---

### Task 6: Engine Beasiswa Terpadu, Approval 3-Tingkat, & Pencairan Dana (Disbursement)

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Interfaces/IBeasiswaService.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Services/BeasiswaService.cs`
- Create: `src/AlIkhwanBeasiswa.Core/DTOs/BeasiswaDtos.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/BeasiswaController.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/ApprovalController.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/PencairanController.cs`

**Interfaces:**
- Produces: Alur lengkap beasiswa (Buka periode, pengajuan siswa/mahasiswa, evaluasi kelayakan nilai rapor/IPK, persetujuan bertingkat Tahap 1/2/3, pencairan termin keuangan & upload bukti transfer).

- [x] **Step 1: Implementasi DTOs Beasiswa**
  Buat `PeriodeRequestDto`, `PengajuanBeasiswaDto`, `ApprovalRequestDto` (tingkat, status, catatan), `PencairanRequestDto` (termin, nominal, nomor referensi bank, bukti file).

- [x] **Step 2: Implementasi Layanan Pengajuan & Evaluasi Nilai**
  Logika validasi apakah siswa/mahasiswa memenuhi syarat minimal nilai, pembuatan record `pengajuan_beasiswa` dengan status awal `Diajukan`.

- [x] **Step 3: Implementasi Layanan Approval 3 Tingkat**
  Logika state-machine persetujuan berjenjang:
  - Tahap 1 (`Verifikator`): mengubah status ke `Verifikasi`.
  - Tahap 2 (`Koordinator Beasiswa`): menyetujui kuota & alokasi pagu.
  - Tahap 3 (`Pimpinan Yayasan`): final approval, status berubah menjadi `Disetujui` dan siap dicairkan.

- [x] **Step 4: Implementasi Layanan Pencairan Keuangan**
  Pencatatan termin pencairan dana, upload bukti transfer kwitansi, penghitungan sisa pagu tertanggung, dan update status `telah_dibayar_lunas`.

- [x] **Step 5: Implementasi Controllers**
  Buat endpoint `BeasiswaController`, `ApprovalController`, dan `PencairanController`.

- [x] **Step 6: Verifikasi & Commit**
  ```bash
  git add .
  git commit -m "feat(beasiswa): implement unified scholarship engine, 3-tier approval, and disbursement"
  ```

---

### Task 7: Kaderisasi, Tracer Karir Alumni, dan Transisi Kelulusan

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Interfaces/IKaderisasiAlumniService.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Services/KaderisasiAlumniService.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/KaderisasiController.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/AlumniController.cs`

**Interfaces:**
- Produces: Manajemen agenda pembinaan & presensi kader, transisi otomatis mahasiswa lulus ke alumni, formulir tracer karir pekerjaan, statistik daya serap lulusan, dan program kontribusi alumni.

- [x] **Step 1: Implementasi Layanan Kaderisasi**
  CRUD agenda kegiatan pembinaan yayasan, pencatatan presensi kehadiran mahasiswa, rekapitulasi poin keaktifan kader.

- [x] **Step 2: Implementasi Logika Transisi Alumni**
  Endpoint `POST /api/mahasiswa/{id}/luluskan` yang menandai mahasiswa lulus, menambahkan role `Alumni`, dan menginisialisasi catatan tracer study.

- [x] **Step 3: Implementasi Tracer Karir & Statistik**
  CRUD riwayat pekerjaan alumni (`alumni_tracer_karir`), pencatatan program kontribusi (*giving back*), dan agregasi statistik keselarasan jurusan serta penyerapan kerja.

- [x] **Step 4: Implementasi Controllers**
  Buat `KaderisasiController` dan `AlumniController`.

- [x] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "feat(alumni): implement cadre development tracking, graduation transition, and alumni tracer study"
  ```

---

### Task 8: Modul Manajemen Portal (Portal CMS di Admin Backoffice)

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Interfaces/IPortalCmsService.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Services/PortalCmsService.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/PortalCmsController.cs`

**Interfaces:**
- Produces: Endpoint pengelolaan konten portal (Pengumuman, Berita, Banner Beranda, Master Syarat Berkas yang Wajib Diunggah, Helpdesk Tiket, dan Kontrol Akun Penerima).

- [x] **Step 1: Implementasi Layanan CMS Portal**
  CRUD pengumuman beasiswa & kegiatan yayasan, pengelolaan urutan banner slider, CRUD master syarat berkas pendaftaran.

- [x] **Step 2: Implementasi Helpdesk & Upload Berkas Penerima**
  Penerimaan tiket pertanyaan dari siswa/mahasiswa, jawaban admin, dan endpoint verifikasi dokumen yang diunggah penerima.

- [x] **Step 3: Implementasi `PortalCmsController`**
  Ekspos endpoint ke frontend admin dan portal publik.

- [x] **Step 4: Commit**
  ```bash
  git add .
  git commit -m "feat(cms): implement portal management CMS endpoints for admin"
  ```

---

### Task 9: Setup Frontend React Vite, Tailwind CSS, Navigasi, & AuthContext

**Files:**
- Create: `src/frontend/src/services/api.ts`
- Create: `src/frontend/src/contexts/AuthContext.tsx`
- Create: `src/frontend/src/layouts/AdminLayout.tsx`
- Create: `src/frontend/src/layouts/PortalLayout.tsx`
- Create: `src/frontend/src/App.tsx`
- Modify: `src/frontend/src/index.css`

**Interfaces:**
- Produces: Fondasi UI React modern dengan Axios interceptor (JWT header & auto refresh), proteksi rute berbasis Role/Permission, dan layout terpisah antara Admin Backoffice dan Portal Mandiri.

- [x] **Step 1: Setup Axios Interceptor di `api.ts`**
  Konfigurasikan baseURL `/api`, request interceptor untuk menyematkan Bearer token, dan response interceptor penanganan error 401.

- [x] **Step 2: Implementasikan `AuthContext`**
  State management untuk `user`, `roles`, `permissions`, fungsi `login()`, `logout()`, dan helper `hasPermission(permCode)`.

- [x] **Step 3: Implementasikan Layout Admin & Portal**
  - `AdminLayout`: Sidebar bernuansa profesional (Dashboard, Master Data, Beasiswa & Approval, Kaderisasi, Alumni Tracer, Portal Management, Logout), Topbar info profil pengurus.
  - `PortalLayout`: Navbar ramah pengguna (Beranda, Info Beasiswa, Pengajuan Saya, Akademik, Kaderisasi, Alumni Karir, Bantuan).

- [x] **Step 4: Konfigurasi Router di `App.tsx`**
  Daftarkan route public (`/login`, `/pengumuman`), route portal (`/portal/*`), dan route admin (`/admin/*`) yang diproteksi `ProtectedRoute`.

- [x] **Step 5: Verifikasi Frontend Build & Commit**
  Jalankan `cd src/frontend ; npm run build ; cd ../..` dan commit:
  ```bash
  git add src/frontend/
  git commit -m "feat(frontend): setup React Vite SPA, Tailwind styles, AuthContext, and dual-layout architecture"
  ```

---

### Task 10: Antarmuka Admin Backoffice (Pengurus, Beasiswa, Tracer, & CMS)

**Files:**
- Create: `src/frontend/src/pages/admin/DashboardPage.tsx`
- Create: `src/frontend/src/pages/admin/PengurusPage.tsx`
- Create: `src/frontend/src/pages/admin/PenerimaPage.tsx`
- Create: `src/frontend/src/pages/admin/BeasiswaApprovalPage.tsx`
- Create: `src/frontend/src/pages/admin/PencairanPage.tsx`
- Create: `src/frontend/src/pages/admin/KaderisasiPage.tsx`
- Create: `src/frontend/src/pages/admin/AlumniTracerPage.tsx`
- Create: `src/frontend/src/pages/admin/PortalManagementPage.tsx`

**Interfaces:**
- Produces: Seluruh halaman antarmuka pengurus yayasan untuk mengelola beasiswa, approval 3 tingkat, tracer kerja alumni, dan manajemen konten portal.

- [x] **Step 1: Dashboard Analitik Admin**
  Statistik KPI: Total penerima aktif (siswa & mahasiswa), total pagu disetujui, serapan pencairan anggaran, persentase kelulusan & serapan kerja alumni.

- [x] **Step 2: Halaman Master Pengurus & RBAC**
  Tabel kelola pengurus yayasan, modal form tambah/edit jabatan, dan pengaturan role user.

- [x] **Step 3: Halaman Master Penerima & Akademik**
  Manajemen data siswa dan mahasiswa, tab riwayat pendidikan, serta pemantauan nilai rapor/KHS.

- [x] **Step 4: Halaman Alur Approval 3 Tingkat & Pencairan**
  Antrean pengajuan beasiswa dengan indikator tahapan (Verifikator, Koordinator, Pimpinan Yayasan), tombol aksi Approve/Reject/Revisi, dan modal pencairan dana + upload bukti transfer.

- [x] **Step 5: Halaman Kaderisasi & Tracer Karir Alumni**
  Jadwal agenda pembinaan, rekap kehadiran, dan dashboard statistik karir alumni penerima beasiswa.

- [x] **Step 6: Halaman Portal Management (CMS Admin)**
  Tab pengumuman beasiswa, pengelolaan banner beranda, konfigurasi syarat dokumen, dan helpdesk tanya jawab.

- [x] **Step 7: Verifikasi Build & Commit**
  ```bash
  git add src/frontend/
  git commit -m "feat(admin-ui): implement complete backoffice pages for scholarship management and portal CMS"
  ```

---

### Task 11: Antarmuka Portal Mandiri (Penerima & Alumni)

**Files:**
- Create: `src/frontend/src/pages/portal/LandingHomePage.tsx`
- Create: `src/frontend/src/pages/portal/PortalDashboardPage.tsx`
- Create: `src/frontend/src/pages/portal/FormPengajuanBeasiswaPage.tsx`
- Create: `src/frontend/src/pages/portal/StatusBeasiswaPage.tsx`
- Create: `src/frontend/src/pages/portal/PortalAkademikPage.tsx`
- Create: `src/frontend/src/pages/portal/PortalKaderisasiPage.tsx`
- Create: `src/frontend/src/pages/portal/PortalAlumniPage.tsx`
- Create: `src/frontend/src/pages/portal/PortalHelpdeskPage.tsx`

**Interfaces:**
- Produces: Portal mandiri responsif untuk siswa, mahasiswa, dan alumni.

- [x] **Step 1: Landing Page Publik & Pengumuman**
  Halaman depan menampilkan banner hero, informasi beasiswa terbuka, syarat pendaftaran, dan berita yayasan.

- [x] **Step 2: Dashboard Penerima & Form Pengajuan Beasiswa**
  Wizard formulir pendaftaran beasiswa, input nilai rapor/IPK, dan komponen drag-and-drop upload dokumen berkas wajib.

- [x] **Step 3: Halaman Tracking Status Beasiswa Real-time**
  Stepper visual yang menampilkan alur pengajuan: *Diajukan $\rightarrow$ Verifikasi Administrasi $\rightarrow$ Approval Koordinator $\rightarrow$ Approval Pimpinan $\rightarrow$ Pencairan Dana (lihat bukti transfer)*.

- [x] **Step 4: Portal Kaderisasi & Presensi**
  Melihat jadwal pembinaan kajian/pelatihan dan konfirmasi kehadiran.

- [x] **Step 5: Portal Alumni Tracer Karir**
  Formulir pembaruan data tempat kerja, jabatan, dan partisipasi program donasi / mentor adik asuh.

- [x] **Step 6: Verifikasi Build & Commit**
  ```bash
  git add src/frontend/
  git commit -m "feat(portal-ui): implement recipient self-service portal and alumni tracer interface"
  ```

---

### Task 12: Pengujian Integrasi End-to-End & Verifikasi Docker Compose

**Files:**
- Create: `tests/AlIkhwanBeasiswa.Tests/UnitTests/BeasiswaApprovalTests.cs`
- Create: `tests/AlIkhwanBeasiswa.Tests/UnitTests/AlumniTracerTests.cs`
- Modify: `docker-compose.yml`

**Interfaces:**
- Produces: Validasi sistem teruji secara otomatis dan seluruh container berjalan harmonis pada Docker Compose.

- [x] **Step 1: Tulis Unit Test Alur Approval & Evaluasi Kelayakan**
  Uji skenario persetujuan berjenjang: penolakan jika nilai di bawah standar, approval tahap 1-3, dan pencairan dana.

- [x] **Step 2: Tulis Unit Test Transisi Mahasiswa ke Alumni**
  Uji transisi otomatis role dan pembuatan profil tracer karir saat mahasiswa dinyatakan lulus.

- [x] **Step 3: Jalankan Test Suite**
  Jalankan `dotnet test tests/AlIkhwanBeasiswa.Tests` untuk memastikan seluruh pengujian lolos (*PASS*).

- [x] **Step 4: Uji Orkestrasi Docker Compose**
  Jalankan pengujian container:
  ```powershell
  docker compose build
  docker compose up -d
  ```
  Pastikan database PostgreSQL, API Backend, dan Nginx Frontend React berjalan sehat (*healthy*).

- [x] **Step 5: Commit & Dokumentasi Akhir**
  ```bash
  git add .
  git commit -m "test: add integration test suite and verify full docker compose orchestration"
  ```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-06-alikhwan-beasiswa-management-portal.md`.

Two execution options:
1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you prefer?
