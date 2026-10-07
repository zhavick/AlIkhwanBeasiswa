# Modul Dokumen Resmi, Kwitansi/Nota Pencairan, dan Verifikasi QR Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul dokumen resmi yang memfasilitasi cetak Kwitansi/Nota Pencairan Dana, Surat Keputusan (SK) Penerima Beasiswa formal dengan kop Yayasan Al-Ikhwan, dan verifikasi keaslian dokumen berbasis QR Code publik.

**Architecture:** Arsitektur terintegrasi mencakup backend ASP.NET Core 8 (.NET 8 Web API, C#) yang menghasilkan data dokumen terstruktur beserta hash verifikasi dan helper konversi terbilang Rupiah, serta frontend React SPA (TypeScript, Tailwind CSS) dengan komponen modal cetak format A4 presisi (`@media print`) dan halaman publik verifikasi QR code.

**Tech Stack:**
- Backend: .NET 8.0 SDK, C#, ASP.NET Core Web API, Entity Framework Core 8, xUnit.
- Frontend: React 18/19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router DOM v6.
- Database: PostgreSQL 16 & SQLite dev fallback.

**Spec:** [docs/superpowers/specs/2026-10-07-laporan-nota-dokumen-resmi-design.md](file:///c:/TEMP/VSCODE/AlIkhwanBeasiswa/docs/superpowers/specs/2026-10-07-laporan-nota-dokumen-resmi-design.md)

## Global Constraints

- Backend harus menggunakan C# .NET 8 dengan struktur Clean Architecture (`AlIkhwanBeasiswa.Core`, `AlIkhwanBeasiswa.Infrastructure`, `AlIkhwanBeasiswa.Api`).
- DTO dan Interface harus diletakkan pada `AlIkhwanBeasiswa.Core`.
- Endpoint publik verifikasi QR code `/api/dokumen/verifikasi/{kodeVerifikasi}` harus dapat diakses tanpa token otentikasi (`AllowAnonymous`).
- Cetak dokumen di frontend harus mendukung layout potret A4 standar (`@media print`) tanpa merusak tata letak web dan tanpa memunculkan elemen navigasi/tombol saat dicetak.
- Seluruh tes unit backend (`dotnet test`) dan frontend build (`npm run build`) harus lolos tanpa error.

---

## File Structure Map

```
AlIkhwanBeasiswa/
├── src/
│   ├── AlIkhwanBeasiswa.Core/
│   │   ├── DTOs/DokumenDtos.cs
│   │   └── Interfaces/IDokumenService.cs
│   ├── AlIkhwanBeasiswa.Infrastructure/
│   │   ├── Helpers/TerbilangHelper.cs
│   │   └── Services/DokumenService.cs
│   ├── AlIkhwanBeasiswa.Api/
│   │   ├── Controllers/DokumenController.cs
│   │   └── Program.cs
│   └── frontend/
│       ├── src/
│       │   ├── index.css
│       │   ├── App.tsx
│       │   ├── components/documents/
│       │   │   ├── KwitansiPrintModal.tsx
│       │   │   └── SuratKeteranganPrintModal.tsx
│       │   ├── pages/portal/
│       │   │   ├── VerifikasiDokumenPage.tsx
│       │   │   └── StatusBeasiswaPage.tsx
│       │   └── pages/admin/
│       │       ├── PencairanPage.tsx
│       │       └── BeasiswaApprovalPage.tsx
└── tests/
    └── AlIkhwanBeasiswa.Tests/
        └── UnitTests/
            ├── TerbilangHelperTests.cs
            └── DokumenServiceTests.cs
```

---

## Implementation Tasks

### Task 1: DTO Dokumen Legal & TerbilangHelper (Backend C#)

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/DTOs/DokumenDtos.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Helpers/TerbilangHelper.cs`
- Test: `tests/AlIkhwanBeasiswa.Tests/UnitTests/TerbilangHelperTests.cs`

**Interfaces:**
- Produces: `KwitansiPencairanDto`, `SuratKeteranganBeasiswaDto`, `VerifikasiDokumenResponseDto`, dan fungsi statis `TerbilangHelper.ToTerbilang(decimal nominal)`.

- [x] **Step 1: Tulis unit test untuk TerbilangHelper**
  Buat pengujian `tests/AlIkhwanBeasiswa.Tests/UnitTests/TerbilangHelperTests.cs`:
  ```csharp
  using AlIkhwanBeasiswa.Infrastructure.Helpers;
  using Xunit;

  namespace AlIkhwanBeasiswa.Tests.UnitTests;

  public class TerbilangHelperTests
  {
      [Theory]
      [InlineData(0, "Nol Rupiah")]
      [InlineData(1, "Satu Rupiah")]
      [InlineData(12, "Dua Belas Rupiah")]
      [InlineData(105, "Seratus Lima Rupiah")]
      [InlineData(1000, "Seribu Rupiah")]
      [InlineData(2500000, "Dua Juta Lima Ratus Ribu Rupiah")]
      [InlineData(15750000, "Lima Belas Juta Tujuh Ratus Lima Puluh Ribu Rupiah")]
      public void ToTerbilang_ShouldConvertNominalCorrectly(decimal nominal, string expected)
      {
          var result = TerbilangHelper.ToTerbilang(nominal);
          Assert.Equal(expected, result);
      }
  }
  ```

- [x] **Step 2: Jalankan test untuk memverifikasi kegagalan (Red)**
  Jalankan `dotnet test tests/AlIkhwanBeasiswa.Tests --filter FullyQualifiedName~TerbilangHelperTests`
  Ekspektasi: Gagal karena `TerbilangHelper` belum dibuat.

- [x] **Step 3: Implementasikan DTOs di AlIkhwanBeasiswa.Core**
  Buat `src/AlIkhwanBeasiswa.Core/DTOs/DokumenDtos.cs` yang memuat definisi `KwitansiPencairanDto`, `SuratKeteranganBeasiswaDto`, dan `VerifikasiDokumenResponseDto`.

- [x] **Step 4: Implementasikan TerbilangHelper di AlIkhwanBeasiswa.Infrastructure**
  Buat `src/AlIkhwanBeasiswa.Infrastructure/Helpers/TerbilangHelper.cs` dengan logika konversi angka desimal ke ejaan Rupiah resmi.

- [x] **Step 5: Jalankan test untuk memverifikasi keberhasilan (Green)**
  Jalankan `dotnet test tests/AlIkhwanBeasiswa.Tests --filter FullyQualifiedName~TerbilangHelperTests`
  Ekspektasi: Seluruh pengujian lolos (PASS).

- [x] **Step 6: Commit Task 1**
  ```bash
  git add src/AlIkhwanBeasiswa.Core/DTOs/DokumenDtos.cs src/AlIkhwanBeasiswa.Infrastructure/Helpers/TerbilangHelper.cs tests/AlIkhwanBeasiswa.Tests/UnitTests/TerbilangHelperTests.cs
  git commit -m "feat(backend): add document DTOs and Indonesian Terbilang currency helper with tests"
  ```

---

### Task 2: Service & REST Endpoints Dokumen Resmi & Verifikasi QR Code

**Files:**
- Create: `src/AlIkhwanBeasiswa.Core/Interfaces/IDokumenService.cs`
- Create: `src/AlIkhwanBeasiswa.Infrastructure/Services/DokumenService.cs`
- Create: `src/AlIkhwanBeasiswa.Api/Controllers/DokumenController.cs`
- Modify: `src/AlIkhwanBeasiswa.Api/Program.cs`
- Test: `tests/AlIkhwanBeasiswa.Tests/UnitTests/DokumenServiceTests.cs`

**Interfaces:**
- Consumes: `AppDbContext`, `TerbilangHelper`, `DokumenDtos`.
- Produces: `IDokumenService` dengan method:
  - `Task<KwitansiPencairanDto?> GetKwitansiPencairanAsync(int pencairanId)`
  - `Task<SuratKeteranganBeasiswaDto?> GetSuratKeteranganBeasiswaAsync(int pengajuanId)`
  - `Task<VerifikasiDokumenResponseDto> VerifikasiDokumenAsync(string kodeVerifikasi)`
- Endpoints:
  - `GET /api/dokumen/kwitansi/{pencairanId}`
  - `GET /api/dokumen/sk/{pengajuanId}`
  - `GET /api/dokumen/verifikasi/{kodeVerifikasi}`

- [x] **Step 1: Tulis unit test untuk DokumenService**
  Buat `tests/AlIkhwanBeasiswa.Tests/UnitTests/DokumenServiceTests.cs` untuk menguji:
  1. `GetKwitansiPencairanAsync` menghasilkan nomor kwitansi, nominal terbilang, dan kode verifikasi yang valid.
  2. `GetSuratKeteranganBeasiswaAsync` menghasilkan SK resmi untuk pengajuan berstatus approved.
  3. `VerifikasiDokumenAsync` mengembalikan `IsValid = true` untuk kode yang valid dan `IsValid = false` untuk kode acak.

- [x] **Step 2: Jalankan test untuk memverifikasi kegagalan (Red)**
  Jalankan `dotnet test tests/AlIkhwanBeasiswa.Tests --filter FullyQualifiedName~DokumenServiceTests`
  Ekspektasi: Gagal karena interface dan service belum ada.

- [x] **Step 3: Implementasikan IDokumenService dan DokumenService**
  - Buat interface di `src/AlIkhwanBeasiswa.Core/Interfaces/IDokumenService.cs`.
  - Buat implementasi di `src/AlIkhwanBeasiswa.Infrastructure/Services/DokumenService.cs`.

- [x] **Step 4: Implementasikan DokumenController & Registrasi di Program.cs**
  - Buat `src/AlIkhwanBeasiswa.Api/Controllers/DokumenController.cs`.
  - Daftarkan `builder.Services.AddScoped<IDokumenService, DokumenService>();` di `Program.cs`.

- [x] **Step 5: Jalankan test suite untuk memverifikasi kelulusan (Green)**
  Jalankan `dotnet test tests/AlIkhwanBeasiswa.Tests`
  Ekspektasi: Semua unit test (lama dan baru) lolos (PASS).

- [x] **Step 6: Commit Task 2**
  ```bash
  git add src/AlIkhwanBeasiswa.Core/Interfaces/IDokumenService.cs src/AlIkhwanBeasiswa.Infrastructure/Services/DokumenService.cs src/AlIkhwanBeasiswa.Api/Controllers/DokumenController.cs src/AlIkhwanBeasiswa.Api/Program.cs tests/AlIkhwanBeasiswa.Tests/UnitTests/DokumenServiceTests.cs
  git commit -m "feat(api): implement DokumenService, QR hash verification, and DokumenController"
  ```

---

### Task 3: Komponen Cetak Kwitansi & SK Format A4 (Frontend)

**Files:**
- Create: `src/frontend/src/components/documents/KwitansiPrintModal.tsx`
- Create: `src/frontend/src/components/documents/SuratKeteranganPrintModal.tsx`
- Modify: `src/frontend/src/index.css`

**Interfaces:**
- Produces: Komponen modal cetak interaktif A4 potret dengan kop resmi, format terbilang, stempel digital, QR code verifikasi, dan fungsi 1-klik cetak langsung (`window.print()`).

- [x] **Step 1: Konfigurasi Aturan CSS Cetak (@media print) di index.css**
  Tambahkan aturan CSS `@media print` dan `@page` pada `src/frontend/src/index.css`:
  - Ukuran `@page { size: A4 portrait; margin: 10mm; }`
  - Sembunyikan elemen non-cetak: `.no-print { display: none !important; }`
  - Mode cetak dokumen: `.print-only { display: block !important; }`

- [x] **Step 2: Buat Komponen KwitansiPrintModal.tsx**
  Implementasikan `src/frontend/src/components/documents/KwitansiPrintModal.tsx`:
  - Mengambil data dari `GET /api/dokumen/kwitansi/{pencairanId}`.
  - Menampilkan kop resmi Yayasan Al-Ikhwan, nomor kwitansi resmi, rincian pembayaran, nominal berbingkai aksen, teks terbilang, kolom tanda tangan penerima & bendahara dengan stempel digital, dan gambar QR Code.
  - Tombol modal: "Tutup" dan "Cetak / Simpan PDF".

- [x] **Step 3: Buat Komponen SuratKeteranganPrintModal.tsx**
  Implementasikan `src/frontend/src/components/documents/SuratKeteranganPrintModal.tsx`:
  - Mengambil data dari `GET /api/dokumen/sk/{pengajuanId}`.
  - Menampilkan format formal Surat Keputusan Beasiswa, nomor SK, konsiderans penetapan, tabel identitas penerima dan perguruan tinggi/sekolah, besaran bantuan pagu, tanda tangan digital Pimpinan Yayasan, dan QR Code verifikasi.

- [x] **Step 4: Uji Build Frontend**
  Jalankan `npm.cmd run build` di direktori `src/frontend`.
  Ekspektasi: Build berhasil tanpa error TypeScript.

- [x] **Step 5: Commit Task 3**
  ```bash
  git add src/frontend/src/components/documents/ src/frontend/src/index.css
  git commit -m "feat(frontend): implement KwitansiPrintModal and SuratKeteranganPrintModal with A4 print CSS"
  ```

---

### Task 4: Halaman Publik Verifikasi QR Code Dokumen

**Files:**
- Create: `src/frontend/src/pages/portal/VerifikasiDokumenPage.tsx`
- Modify: `src/frontend/src/App.tsx`

**Interfaces:**
- Consumes: `GET /api/dokumen/verifikasi/{kodeVerifikasi}`
- Produces: Halaman publik `/verifikasi-dokumen/:kode` yang menampilkan validasi keaslian dokumen ketika QR code dipindai oleh kamera HP siapa pun.

- [x] **Step 1: Buat Halaman VerifikasiDokumenPage.tsx**
  Implementasikan `src/frontend/src/pages/portal/VerifikasiDokumenPage.tsx`:
  - Membaca parameter `:kode` dari URL.
  - Memanggil endpoint publik `api.get('/dokumen/verifikasi/' + kode)`.
  - Jika valid: Menampilkan kartu sukses berdesain premium dengan ikon perisai centang hijau ("Dokumen Sah & Resmi Terdaftar di Yayasan Al-Ikhwan"), nomor dokumen, nama penerima, institusi, dan tanggal penerbitan.
  - Jika tidak valid: Menampilkan peringatan merah ("Dokumen Tidak Ditemukan / Tidak Valid").

- [x] **Step 2: Daftarkan Rute Publik di App.tsx**
  Tambahkan rute `<Route path="/verifikasi-dokumen/:kode" element={<VerifikasiDokumenPage />} />` pada `src/frontend/src/App.tsx`.

- [x] **Step 3: Uji Build Frontend**
  Jalankan `npm.cmd run build` di `src/frontend`.
  Ekspektasi: Build sukses.

- [x] **Step 4: Commit Task 4**
  ```bash
  git add src/frontend/src/pages/portal/VerifikasiDokumenPage.tsx src/frontend/src/App.tsx
  git commit -m "feat(frontend): implement public QR verification page at /verifikasi-dokumen/:kode"
  ```

---

### Task 5: Integrasi Tombol Aksi Dokumen di Backoffice & Portal Mandiri

**Files:**
- Modify: `src/frontend/src/pages/admin/PencairanPage.tsx`
- Modify: `src/frontend/src/pages/admin/BeasiswaApprovalPage.tsx`
- Modify: `src/frontend/src/pages/portal/StatusBeasiswaPage.tsx`

**Interfaces:**
- Consumes: `KwitansiPrintModal`, `SuratKeteranganPrintModal`.
- Produces: Tombol cetak kwitansi di Backoffice Pencairan, tombol cetak SK di Backoffice Approval, dan tombol cetak SK/Kwitansi di Portal Mandiri Penerima.

- [x] **Step 1: Integrasi di Admin PencairanPage.tsx**
  - Tambahkan tombol aksi "Cetak Kwitansi" (ikon Printer/FileText) pada baris pencairan dana yang telah selesai.
  - Membuka `KwitansiPrintModal` saat diklik.

- [x] **Step 2: Integrasi di Admin BeasiswaApprovalPage.tsx**
  - Tambahkan tombol "Cetak SK" pada baris pengajuan beasiswa yang telah disetujui (Tahap 3).
  - Membuka `SuratKeteranganPrintModal` saat diklik.

- [x] **Step 3: Integrasi di Portal Mandiri StatusBeasiswaPage.tsx**
  - Pada kartu pengajuan yang telah disetujui, tambahkan tombol "Unduh / Cetak SK Beasiswa".
  - Pada daftar riwayat pencairan penerima, tambahkan tombol "Cetak Kwitansi".

- [x] **Step 4: Jalankan Pengujian Menyeluruh (Full Verification)**
  1. Jalankan `dotnet test tests/AlIkhwanBeasiswa.Tests` untuk memastikan semua pengujian backend lolos.
  2. Jalankan `npm.cmd run build` di `src/frontend` untuk memastikan tidak ada kesalahan kompilasi frontend.

- [x] **Step 5: Commit Task 5**
  ```bash
  git add src/frontend/src/pages/admin/PencairanPage.tsx src/frontend/src/pages/admin/BeasiswaApprovalPage.tsx src/frontend/src/pages/portal/StatusBeasiswaPage.tsx
  git commit -m "feat: integrate print receipt and certificate actions across backoffice and recipient portal"
  ```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-07-laporan-nota-dokumen-resmi.md`.

Two execution options:
1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you prefer?
