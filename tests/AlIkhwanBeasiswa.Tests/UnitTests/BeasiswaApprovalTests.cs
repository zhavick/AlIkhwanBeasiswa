using System;
using System.Threading.Tasks;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Infrastructure.Data;
using AlIkhwanBeasiswa.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AlIkhwanBeasiswa.Tests.UnitTests;

public class BeasiswaApprovalTests
{
    private AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task SubmitPengajuan_WhenPeriodeInactive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        using var context = CreateDbContext(nameof(SubmitPengajuan_WhenPeriodeInactive_ShouldThrowInvalidOperationException));
        var service = new BeasiswaService(context);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 1,
            NamaPeriode = "Semester Ganjil 2026/2027",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-10),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(30),
            StatusAktif = false, // Periode ditutup
            TotalAnggaranPagu = 100000000
        };
        context.PeriodeBeasiswa.Add(periode);
        await context.SaveChangesAsync();

        var request = new SubmitPengajuanBeasiswaDto
        {
            PeriodeId = 1,
            TipePenerima = TipePenerima.Mahasiswa,
            MahasiswaId = 1,
            PaguBeasiswa = 3000000,
            CatatanPengajuan = "Biaya UKT Semester 5"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => service.SubmitPengajuanAsync(request));
        Assert.Contains("ditutup", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Approval3Tier_HappyPath_ShouldTransitionToVerifikasiAndApproved()
    {
        // Arrange
        using var context = CreateDbContext(nameof(Approval3Tier_HappyPath_ShouldTransitionToVerifikasiAndApproved));
        var service = new BeasiswaService(context);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 1,
            NamaPeriode = "Semester Ganjil 2026/2027",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-10),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(30),
            StatusAktif = true,
            TotalAnggaranPagu = 100000000
        };
        var mhs = new IkhwanMahasiswa
        {
            MahasiswaId = 1,
            NamaMahasiswa = "Fajar Hidayat",
            Email = "fajar@kampus.ac.id",
            NoTelp = "08123456789",
            StatusAkademik = StatusAkademik.Aktif
        };

        context.PeriodeBeasiswa.Add(periode);
        context.Mahasiswa.Add(mhs);
        await context.SaveChangesAsync();

        // Submit Pengajuan
        var pengajuan = await service.SubmitPengajuanAsync(new SubmitPengajuanBeasiswaDto
        {
            PeriodeId = 1,
            TipePenerima = TipePenerima.Mahasiswa,
            MahasiswaId = 1,
            PaguBeasiswa = 2500000,
            CatatanPengajuan = "Bantuan riset skripsi"
        });

        Assert.Equal(StatusPengajuan.Diajukan, pengajuan.StatusPengajuan);

        // Tahap 1: Verifikator Administrasi
        var res1 = await service.ProcessApprovalAsync(pengajuan.PengajuanId, new ApprovalRequestDto
        {
            TingkatApproval = TingkatApproval.VerifikatorAdministrasi,
            StatusApproval = StatusApproval.Approved,
            CatatanApproval = "Berkas KTP, KTM, dan transkrip sah"
        }, 101);
        Assert.True(res1);

        var check1 = await service.GetPengajuanByIdAsync(pengajuan.PengajuanId);
        Assert.Equal(StatusPengajuan.Verifikasi, check1!.StatusPengajuan);

        // Tahap 2: Koordinator Beasiswa
        var res2 = await service.ProcessApprovalAsync(pengajuan.PengajuanId, new ApprovalRequestDto
        {
            TingkatApproval = TingkatApproval.KoordinatorBeasiswa,
            StatusApproval = StatusApproval.Approved,
            CatatanApproval = "Kelayakan dhuafa dan akademik memenuhi kualifikasi",
            PaguTertanggungDisetujui = 2500000
        }, 102);
        Assert.True(res2);

        var check2 = await service.GetPengajuanByIdAsync(pengajuan.PengajuanId);
        Assert.Equal(StatusPengajuan.Verifikasi, check2!.StatusPengajuan);

        // Tahap 3: Pimpinan Yayasan (Final Approval)
        var res3 = await service.ProcessApprovalAsync(pengajuan.PengajuanId, new ApprovalRequestDto
        {
            TingkatApproval = TingkatApproval.PimpinanYayasan,
            StatusApproval = StatusApproval.Approved,
            CatatanApproval = "Disahkan oleh Ketua Yayasan Al-Ikhwan"
        }, 103);
        Assert.True(res3);

        var finalCheck = await service.GetPengajuanByIdAsync(pengajuan.PengajuanId);
        Assert.Equal(StatusPengajuan.Disetujui, finalCheck!.StatusPengajuan);
        Assert.Equal(2500000, finalCheck.PaguTertanggung);
        Assert.Equal(3, finalCheck.RiwayatApproval.Count);
    }

    [Fact]
    public async Task ProcessApproval_WhenRejected_ShouldSetStatusToDitolak()
    {
        // Arrange
        using var context = CreateDbContext(nameof(ProcessApproval_WhenRejected_ShouldSetStatusToDitolak));
        var service = new BeasiswaService(context);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 1,
            NamaPeriode = "TA 2026/2027",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-10),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(30),
            StatusAktif = true
        };
        var siswa = new IkhwanSiswa
        {
            SiswaId = 2,
            NamaSiswa = "Budi Santoso",
            Email = "budi@sekolah.sch.id",
            NoTelp = "08123456789"
        };

        context.PeriodeBeasiswa.Add(periode);
        context.Siswa.Add(siswa);
        await context.SaveChangesAsync();

        var pengajuan = await service.SubmitPengajuanAsync(new SubmitPengajuanBeasiswaDto
        {
            PeriodeId = 1,
            TipePenerima = TipePenerima.Siswa,
            SiswaId = 2,
            PaguBeasiswa = 1500000,
            CatatanPengajuan = "SPP Siswa SMA"
        });

        // Verifikator menolak
        var rejectedResult = await service.ProcessApprovalAsync(pengajuan.PengajuanId, new ApprovalRequestDto
        {
            TingkatApproval = TingkatApproval.VerifikatorAdministrasi,
            StatusApproval = StatusApproval.Rejected,
            CatatanApproval = "Dokumen tidak memenuhi persyaratan minimum."
        }, 101);

        Assert.True(rejectedResult);

        var check = await service.GetPengajuanByIdAsync(pengajuan.PengajuanId);
        Assert.Equal(StatusPengajuan.Ditolak, check!.StatusPengajuan);
    }
}
