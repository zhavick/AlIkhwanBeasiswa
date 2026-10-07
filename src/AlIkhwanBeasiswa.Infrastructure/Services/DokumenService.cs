using System;
using System.Linq;
using System.Threading.Tasks;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using AlIkhwanBeasiswa.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class DokumenService : IDokumenService
{
    private readonly AppDbContext _context;

    public DokumenService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<KwitansiPencairanDto?> GetKwitansiPencairanAsync(int pencairanId)
    {
        var pencairan = await _context.PencairanBeasiswa
            .Include(p => p.Pengajuan)
                .ThenInclude(pj => pj!.Periode)
            .Include(p => p.Pengajuan)
                .ThenInclude(pj => pj!.Mahasiswa)
                    .ThenInclude(m => m!.RiwayatUniversitas)
            .Include(p => p.Pengajuan)
                .ThenInclude(pj => pj!.Siswa)
                    .ThenInclude(s => s!.RiwayatPendidikan)
            .Include(p => p.DicairkanOlehUser)
            .FirstOrDefaultAsync(p => p.PencairanId == pencairanId);

        if (pencairan == null || pencairan.Pengajuan == null)
            return null;

        var pengajuan = pencairan.Pengajuan;
        string namaPenerima = "";
        string tipePenerima = pengajuan.TipePenerima.ToString();
        string institusi = "";

        if (pengajuan.TipePenerima == TipePenerima.Mahasiswa && pengajuan.Mahasiswa != null)
        {
            namaPenerima = pengajuan.Mahasiswa.NamaMahasiswa;
            var activeUniv = pengajuan.Mahasiswa.RiwayatUniversitas?.FirstOrDefault(u => u.MasihBerjalan) 
                ?? pengajuan.Mahasiswa.RiwayatUniversitas?.FirstOrDefault();
            institusi = activeUniv != null ? $"{activeUniv.NamaUniversitas} - {activeUniv.Jurusan}" : "Perguruan Tinggi";
        }
        else if (pengajuan.Siswa != null)
        {
            namaPenerima = pengajuan.Siswa.NamaSiswa;
            var activeSekolah = pengajuan.Siswa.RiwayatPendidikan?.FirstOrDefault(s => s.MasihDalamPendidikan) 
                ?? pengajuan.Siswa.RiwayatPendidikan?.FirstOrDefault();
            institusi = activeSekolah != null ? $"{activeSekolah.NamaSekolah} ({activeSekolah.Jenjang})" : "Sekolah";
        }

        string noKwitansi = $"KWIT/{pencairan.TanggalPembayaran:yyyy}/{pencairan.TanggalPembayaran:MM}/{pencairan.PencairanId:D5}";
        string noRegistrasi = $"REG-{pengajuan.PeriodeId:D4}-{pengajuan.PengajuanId:D4}";
        string kodeVerifikasi = $"V-KW-{pencairan.PencairanId:D4}{pengajuan.PengajuanId:D4}";

        return new KwitansiPencairanDto
        {
            PencairanId = pencairan.PencairanId,
            PengajuanId = pengajuan.PengajuanId,
            NomorKwitansi = noKwitansi,
            NomorRegistrasi = noRegistrasi,
            NamaPenerima = namaPenerima,
            TipePenerima = tipePenerima,
            InstitusiPendidikan = institusi,
            TerminKe = pencairan.TerminKe,
            TanggalPencairan = pencairan.TanggalPembayaran,
            JumlahNominal = pencairan.Biaya,
            Terbilang = TerbilangHelper.ToTerbilang(pencairan.Biaya),
            NomorReferensiBank = pencairan.NomorReferensiBank,
            NamaBendahara = "Bendahara Yayasan Al-Ikhwan",
            JabatanBendahara = "Staf Administrasi Keuangan",
            KodeVerifikasi = kodeVerifikasi,
            QrUrl = $"/verifikasi-dokumen/{kodeVerifikasi}",
            CatatanPencairan = pencairan.InformasiTambahan
        };
    }

    public async Task<SuratKeteranganBeasiswaDto?> GetSuratKeteranganBeasiswaAsync(int pengajuanId)
    {
        var pengajuan = await _context.PengajuanBeasiswa
            .Include(pj => pj.Periode)
            .Include(pj => pj.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .Include(pj => pj.Siswa)
                .ThenInclude(s => s!.RiwayatPendidikan)
            .Include(pj => pj.DaftarApproval)
            .FirstOrDefaultAsync(pj => pj.PengajuanId == pengajuanId);

        if (pengajuan == null)
            return null;

        string namaPenerima = "";
        string tipePenerima = pengajuan.TipePenerima.ToString();
        string nisnNim = "";
        string ttl = "";
        string jenjang = "";
        string institusi = "";

        if (pengajuan.TipePenerima == TipePenerima.Mahasiswa && pengajuan.Mahasiswa != null)
        {
            var m = pengajuan.Mahasiswa;
            namaPenerima = m.NamaMahasiswa;
            ttl = $"{m.TempatLahir}, {m.TanggalLahir:dd MMMM yyyy}";
            var activeUniv = m.RiwayatUniversitas?.FirstOrDefault(u => u.MasihBerjalan) ?? m.RiwayatUniversitas?.FirstOrDefault();
            jenjang = activeUniv?.Jenjang ?? "S1";
            institusi = activeUniv != null ? $"{activeUniv.NamaUniversitas} - {activeUniv.Jurusan}" : "Perguruan Tinggi";
            nisnNim = "MHS-" + m.MahasiswaId.ToString("D5");
        }
        else if (pengajuan.Siswa != null)
        {
            var s = pengajuan.Siswa;
            namaPenerima = s.NamaSiswa;
            ttl = $"{s.TempatLahir}, {s.TanggalLahir:dd MMMM yyyy}";
            var activeSekolah = s.RiwayatPendidikan?.FirstOrDefault(sc => sc.MasihDalamPendidikan) ?? s.RiwayatPendidikan?.FirstOrDefault();
            jenjang = activeSekolah?.Jenjang ?? "Sekolah Menengah";
            institusi = activeSekolah != null ? $"{activeSekolah.NamaSekolah} ({activeSekolah.Jenjang})" : "Sekolah";
            nisnNim = "SIS-" + s.SiswaId.ToString("D5");
        }

        var approvalPimpinan = pengajuan.DaftarApproval?
            .Where(a => a.TingkatApproval == TingkatApproval.PimpinanYayasan && a.StatusApproval == StatusApproval.Approved)
            .OrderByDescending(a => a.TanggalApproval)
            .FirstOrDefault();

        DateTime tglDitetapkan = approvalPimpinan?.TanggalApproval ?? pengajuan.TanggalPengajuan;
        string noSurat = $"SK.AIK/BEASISWA/{pengajuan.TanggalPengajuan:yyyy}/{pengajuan.PengajuanId:D4}";
        string kodeVerifikasi = $"V-SK-{pengajuan.PengajuanId:D4}{(int)pengajuan.TipePenerima:D2}";

        return new SuratKeteranganBeasiswaDto
        {
            PengajuanId = pengajuan.PengajuanId,
            NomorSurat = noSurat,
            NamaPenerima = namaPenerima,
            TipePenerima = tipePenerima,
            NISN_NIM = nisnNim,
            TempatTanggalLahir = ttl,
            JenjangPendidikan = jenjang,
            InstitusiPendidikan = institusi,
            NamaPeriode = pengajuan.Periode?.NamaPeriode ?? "Periode Berjalan",
            PaguTertanggung = pengajuan.PaguTertanggung > 0 ? pengajuan.PaguTertanggung : pengajuan.PaguBeasiswa,
            TanggalDitetapkan = tglDitetapkan,
            NamaPimpinanYayasan = "H. Ahmad Fauzi, M.Pd.",
            JabatanPimpinan = "Ketua Dewan Pengurus Yayasan Al-Ikhwan",
            KodeVerifikasi = kodeVerifikasi,
            QrUrl = $"/verifikasi-dokumen/{kodeVerifikasi}",
            StatusVerifikasi = "Sah & Aktif Terdaftar"
        };
    }

    public async Task<VerifikasiDokumenResponseDto> VerifikasiDokumenAsync(string kodeVerifikasi)
    {
        if (string.IsNullOrWhiteSpace(kodeVerifikasi))
        {
            return new VerifikasiDokumenResponseDto
            {
                IsValid = false,
                Status = "Tidak Valid",
                Keterangan = "Kode verifikasi dokumen kosong atau tidak valid."
            };
        }

        string code = kodeVerifikasi.Trim().ToUpperInvariant();

        if (code.StartsWith("V-KW-") && code.Length >= 9)
        {
            string pencairanIdStr = code.Substring(5, 4);
            if (int.TryParse(pencairanIdStr, out int pencairanId))
            {
                var kwitansi = await GetKwitansiPencairanAsync(pencairanId);
                if (kwitansi != null && kwitansi.KodeVerifikasi.Equals(code, StringComparison.OrdinalIgnoreCase))
                {
                    return new VerifikasiDokumenResponseDto
                    {
                        IsValid = true,
                        JenisDokumen = "Kwitansi / Bukti Pencairan Beasiswa",
                        NomorDokumen = kwitansi.NomorKwitansi,
                        NamaPenerima = kwitansi.NamaPenerima,
                        Institusi = kwitansi.InstitusiPendidikan,
                        TanggalTerbit = kwitansi.TanggalPencairan,
                        Keterangan = $"Dana beasiswa termin {kwitansi.TerminKe} senilai {kwitansi.JumlahNominal:C0} ({kwitansi.Terbilang}) telah resmi disalurkan oleh Bendahara Yayasan Al-Ikhwan.",
                        Penandatangan = kwitansi.NamaBendahara,
                        Status = "Sah & Terverifikasi"
                    };
                }
            }
        }
        else if (code.StartsWith("V-SK-") && code.Length >= 9)
        {
            string pengajuanIdStr = code.Substring(5, 4);
            if (int.TryParse(pengajuanIdStr, out int pengajuanId))
            {
                var sk = await GetSuratKeteranganBeasiswaAsync(pengajuanId);
                if (sk != null && sk.KodeVerifikasi.Equals(code, StringComparison.OrdinalIgnoreCase))
                {
                    return new VerifikasiDokumenResponseDto
                    {
                        IsValid = true,
                        JenisDokumen = "Surat Keputusan (SK) Penerima Beasiswa",
                        NomorDokumen = sk.NomorSurat,
                        NamaPenerima = sk.NamaPenerima,
                        Institusi = sk.InstitusiPendidikan,
                        TanggalTerbit = sk.TanggalDitetapkan,
                        Keterangan = $"Penerima sah beasiswa Yayasan Al-Ikhwan periode {sk.NamaPeriode} dengan bantuan pagu disetujui {sk.PaguTertanggung:C0}.",
                        Penandatangan = sk.NamaPimpinanYayasan,
                        Status = "Sah & Terverifikasi"
                    };
                }
            }
        }

        return new VerifikasiDokumenResponseDto
        {
            IsValid = false,
            Status = "Tidak Ditemukan",
            Keterangan = "Dokumen tidak ditemukan dalam arsip resmi Yayasan Al-Ikhwan. Pastikan kode verifikasi sesuai atau hubungi sekretariat yayasan."
        };
    }
}
