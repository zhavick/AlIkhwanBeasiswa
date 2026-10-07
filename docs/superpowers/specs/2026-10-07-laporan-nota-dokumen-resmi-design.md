# Spesifikasi Desain: Modul Dokumen Resmi, Kwitansi/Nota Pencairan, dan Verifikasi QR Code

- **Tanggal Penyusunan**: 07 Oktober 2026
- **Status**: Disetujui
- **Tech Stack**: ASP.NET Core 8 Web API (C#) + PostgreSQL / SQLite + ReactJS (TypeScript, Tailwind CSS, Lucide React)
- **Modul**: Dokumen Resmi, Nota Pencairan Dana, dan Mesin Verifikasi Dokumen

---

## 1. Ringkasan & Tujuan Fitur

Fitur ini menyediakan kemampuan cetak dan penerbitan dokumen legal formal untuk operasional beasiswa Yayasan Al-Ikhwan, yang terdiri dari:
1. **Kwitansi / Nota Resmi Pencairan Dana Beasiswa**: Bukti pengeluaran kas resmi bagi Bendahara dan tanda terima sah bagi penerima beasiswa (siswa/mahasiswa).
2. **Surat Keputusan (SK) / Surat Keterangan Penerima Beasiswa**: Surat resmi penetapan penerima beasiswa ber-kop yayasan yang dapat digunakan siswa/mahasiswa untuk keperluan administrasi kampus/sekolah.
3. **Mesin Verifikasi Keaslian Dokumen (QR Code)**: Setiap dokumen memiliki kode hash unik dan QR code yang dapat dipindai publik via smartphone untuk memvalidasi keaslian dokumen secara *real-time*.
4. **Penyajian High-Fidelity Print Renderer**: Dukungan pratinjau dokumen interaktif di browser (*Print Preview*), siap cetak ke printer fisik atau disimpan sebagai PDF beresolusi tinggi (*pixel-perfect* format A4).

---

## 2. Arsitektur & Alur Kerja Sistem

```
+---------------------------------------------------------------------------------+
|                                FRONTEND REACT SPA                               |
|                                                                                 |
|   +--------------------------+  +-------------------------+  +--------------+   |
|   | KwitansiPrintModal.tsx   |  | SuratKeteranganModal.tsx|  | VerifikasiQR |   |
|   | (Kwitansi A4 + Cetak/PDF)|  | (SK Penerima A4)        |  | (Halaman Cek)|   |
|   +--------------------------+  +-------------------------+  +--------------+   |
+---------------------------------------------------------------------------------+
                          │                                           ▲
                          │ GET /api/dokumen/...                      │ Scan QR Code
                          ▼                                           │
+---------------------------------------------------------------------------------+
|                           BACKEND ASP.NET CORE 8 API                            |
|                                                                                 |
|   - DokumenController.cs                                                        |
|   - IDokumenService & DokumenService                                            |
|   - TerbilangHelper (Konversi nominal ke ejaan Rupiah resmi)                    |
|   - Hashing & Kode Verifikasi Generator                                         |
+---------------------------------------------------------------------------------+
                          │
                          ▼
+---------------------------------------------------------------------------------+
|                       DATABASE (AppDbContext & Entities)                        |
|   - PencairanBeasiswa & PengajuanBeasiswa                                       |
|   - IkhwanSiswa & IkhwanMahasiswa                                               |
|   - AppPengurus & AppUsers                                                      |
+---------------------------------------------------------------------------------+
```

---

## 3. Spesifikasi Backend API

### A. Data Transfer Objects (`AlIkhwanBeasiswa.Core/DTOs/DokumenDtos.cs`)

1. **`KwitansiPencairanDto`**:
   - `PencairanId` (int)
   - `NomorKwitansi` (string): Contoh `KWIT/2026/10/00042`
   - `NomorRegistrasi` (string): Contoh `REG-0001-0005`
   - `NamaPenerima` (string)
   - `TipePenerima` (string): "Siswa" atau "Mahasiswa"
   - `InstitusiPendidikan` (string): Asal Sekolah / Nama Universitas & Jurusan
   - `TerminKe` (int)
   - `TanggalPencairan` (DateTime)
   - `JumlahNominal` (decimal)
   - `Terbilang` (string): Contoh *"Dua Juta Lima Ratus Ribu Rupiah"*
   - `NomorReferensiBank` (string?)
   - `NamaBendahara` (string)
   - `JabatanBendahara` (string)
   - `KodeVerifikasi` (string): Contoh `V-KW-7A9B1C`
   - `QrUrl` (string): URL publik untuk pemindaian QR code

2. **`SuratKeteranganBeasiswaDto`**:
   - `PengajuanId` (int)
   - `NomorSurat` (string): Contoh `SK.AIK/BEASISWA/2026/0015`
   - `NamaPenerima` (string)
   - `NISN_NIM` (string)
   - `TempatTanggalLahir` (string)
   - `JenjangPendidikan` (string)
   - `InstitusiPendidikan` (string)
   - `NamaPeriode` (string)
   - `PaguTertanggung` (decimal)
   - `TanggalDitetapkan` (DateTime)
   - `NamaPimpinanYayasan` (string)
   - `JabatanPimpinan` (string)
   - `KodeVerifikasi` (string): Contoh `V-SK-8F2D4E`
   - `QrUrl` (string)
   - `StatusVerifikasi` (string)

3. **`VerifikasiDokumenResponseDto`**:
   - `IsValid` (bool)
   - `JenisDokumen` (string): "Kwitansi Pencairan Beasiswa" atau "Surat Keterangan Penerima Beasiswa"
   - `NomorDokumen` (string)
   - `NamaPenerima` (string)
   - `Institusi` (string)
   - `TanggalTerbit` (DateTime)
   - `Keterangan` (string)
   - `Penandatangan` (string)

### B. Service & Helper (`AlIkhwanBeasiswa.Infrastructure/Services/DokumenService.cs`)

- **`TerbilangHelper`**: Logika rekursif dalam C# yang mengonversi angka desimal/bulat ke format kata-kata bahasa Indonesia resmi:
  - Misal: `2500000` $\rightarrow$ `"Dua Juta Lima Ratus Ribu Rupiah"`.
- **`DokumenService`**:
  - Mengambil record relasi dari `AppDbContext` (`PencairanBeasiswa` $\rightarrow$ `PengajuanBeasiswa` $\rightarrow$ `Siswa/Mahasiswa` $\rightarrow$ `Sekolah/Universitas` $\rightarrow$ `Pengurus`).
  - Menghitung kode verifikasi alfanumerik berbasis hash deterministik dan URL verifikasi QR.
  - Mengimplementasikan `VerifikasiDokumenAsync(string kode)` untuk memeriksa validitas kode dokumen.

### C. Endpoints REST API (`AlIkhwanBeasiswa.Api/Controllers/DokumenController.cs`)

| Method | Endpoint | Auth Policy | Keterangan |
|---|---|---|---|
| GET | `/api/dokumen/kwitansi/{pencairanId}` | `[Authorize]` | Mengambil data nota/kwitansi pencairan |
| GET | `/api/dokumen/sk/{pengajuanId}` | `[Authorize]` | Mengambil data SK penerima beasiswa |
| GET | `/api/dokumen/verifikasi/{kodeVerifikasi}` | Publik (`AllowAnonymous`) | Memeriksa validitas dokumen dari pemindaian QR Code |

---

## 4. Spesifikasi Frontend

### A. Komponen Dokumen Cetak (`src/frontend/src/components/documents/`)

1. **`KwitansiPrintModal.tsx`**:
   - Pratinjau dokumen kwitansi standar profesional A4.
   - Kop resmi Yayasan Al-Ikhwan: Logo, Nama Lembaga, Alamat Lengkap, Kontak Resmi, Garis Ganda Pembatas Formal.
   - Kotak nominal nominal beraksen elegan (*emerald/slate*), teks terbilang Rupiah resmi.
   - Kolom tanda tangan Penerima dan Bendahara Yayasan lengkap dengan stempel digital.
   - QR Code verifikasi dokumen di pojok dokumen.
   - Tombol kontrol: *"Tutup"*, *"Cetak / Simpan PDF"* (`window.print()`).

2. **`SuratKeteranganPrintModal.tsx`**:
   - Pratinjau dokumen Surat Keputusan (SK) format formal surat keputusan organisasi nirlaba/pendidikan.
   - Konsiderans formal penetapan beasiswa Al-Ikhwan.
   - Tabel biodata penerima, sekolah/kampus, nominal bantuan tertanggung, dan periode aktif.
   - Tanda tangan digital Pimpinan Yayasan Al-Ikhwan beserta stempel resmi yayasan.
   - QR Code verifikasi dokumen dan petunjuk validasi online.

3. **CSS Print Rules (`index.css` & Modal Styles)**:
   - Penggunaan `@media print` rules:
     - Menyembunyikan seluruh sidebar, navbar, footer aplikasi, tombol modal, dan backdrop.
     - Mengatur orientasi kertas potret (portrait), ukuran A4 (`@page { size: A4 portrait; margin: 12mm; }`), dan background printing (`-webkit-print-color-adjust: exact`).

### B. Halaman Publik Verifikasi QR Code (`src/frontend/src/pages/portal/VerifikasiDokumenPage.tsx`)

- Rute: `/verifikasi-dokumen/:kode`
- Tampilan responsif publik:
  - Kartu verifikasi dengan lencana status hijau: *"Dokumen Sah & Terverifikasi"* (atau merah *"Dokumen Tidak Ditemukan"* jika kode tidak valid).
  - Rincian metadata dokumen yang sah langsung dari database yayasan.
  - Tautan kembali ke Beranda Portal Yayasan Al-Ikhwan.

### C. Integrasi Titik Akses Dokumen

1. **Admin Backoffice**:
   - `src/frontend/src/pages/admin/PencairanPage.tsx`: Tombol aksi *"Cetak Kwitansi"* pada setiap baris pencairan berstatus selesai.
   - `src/frontend/src/pages/admin/BeasiswaApprovalPage.tsx`: Tombol aksi *"Cetak SK"* pada pengajuan yang telah selesai/disetujui.
2. **Portal Mandiri Penerima**:
   - `src/frontend/src/pages/portal/StatusBeasiswaPage.tsx`:
     - Tombol *"Unduh / Cetak SK Beasiswa"* di kartu detail pengajuan aktif.
     - Tombol *"Cetak Kwitansi"* di riwayat pencairan dana penerima.

---

## 5. Rencana Pengujian

1. **Unit & Integration Test Backend (`tests/AlIkhwanBeasiswa.Tests`)**:
   - Menguji `TerbilangHelper` untuk berbagai variasi nominal angka (puluhan ribu, ratusan ribu, jutaan, hingga puluhan juta).
   - Menguji `DokumenService.GetKwitansiPencairanAsync` untuk memastikan format nomor kwitansi, nama penerima, dan kode verifikasi terisi valid.
   - Menguji `DokumenService.GetSuratKeteranganBeasiswaAsync` untuk pengajuan berstatus disetujui.
   - Menguji `DokumenService.VerifikasiDokumenAsync` untuk kode yang valid vs kode acak tidak valid.
2. **Build Verification**:
   - `dotnet test tests/AlIkhwanBeasiswa.Tests` lolos 100%.
   - `npm run build` di frontend React Vite tanpa error kompilasi TypeScript.
