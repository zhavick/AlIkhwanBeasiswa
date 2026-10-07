using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Infrastructure.Data;
using AlIkhwanBeasiswa.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AlIkhwanBeasiswa.Tests.UnitTests;

public class PortalEndToEndIntegrationTests
{
    private AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetPengajuanByUserId_ShouldReturnOnlyUserApplications()
    {
        // Arrange
        using var context = CreateDbContext(nameof(GetPengajuanByUserId_ShouldReturnOnlyUserApplications));
        var service = new BeasiswaService(context);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 1,
            NamaPeriode = "Periode Tes 2026",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-5),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(10),
            StatusAktif = true,
            TotalAnggaranPagu = 50000000
        };
        context.PeriodeBeasiswa.Add(periode);

        var userMhs = new AppUser
        {
            UserId = 10,
            Username = "mhs_fajar",
            Email = "fajar@kampus.id",
            PasswordHash = "hash"
        };
        context.Users.Add(userMhs);

        var mhs = new IkhwanMahasiswa
        {
            MahasiswaId = 5,
            NamaMahasiswa = "Fajar Pratama",
            TempatLahir = "Jakarta",
            TanggalLahir = new DateTime(2003, 5, 10),
            AlamatLengkap = "Jakarta",
            NoTelp = "08123456789",
            Email = "fajar@kampus.id"
        };
        context.Mahasiswa.Add(mhs);

        var profile = new AppUserProfile
        {
            ProfileLinkId = 1,
            UserId = 10,
            MahasiswaId = 5
        };
        context.UserProfiles.Add(profile);

        // Add 2 applications: one for mhs 5, one for mhs 99
        var app1 = new PengajuanBeasiswa
        {
            PengajuanId = 101,
            PeriodeId = 1,
            TipePenerima = TipePenerima.Mahasiswa,
            MahasiswaId = 5,
            PaguBeasiswa = 4000000,
            StatusPengajuan = StatusPengajuan.Diajukan,
            TanggalPengajuan = DateTime.UtcNow
        };
        var app2 = new PengajuanBeasiswa
        {
            PengajuanId = 102,
            PeriodeId = 1,
            TipePenerima = TipePenerima.Mahasiswa,
            MahasiswaId = 99,
            PaguBeasiswa = 3000000,
            StatusPengajuan = StatusPengajuan.Diajukan,
            TanggalPengajuan = DateTime.UtcNow
        };
        context.PengajuanBeasiswa.AddRange(app1, app2);
        await context.SaveChangesAsync();

        // Act
        var userApps = await service.GetPengajuanByUserIdAsync(10);

        // Assert
        Assert.Single(userApps);
        Assert.Equal(101, userApps[0].PengajuanId);
        Assert.Equal("Fajar Pratama", userApps[0].NamaPenerima);
    }

    [Fact]
    public async Task GetAllPencairan_ShouldReturnAllDisbursements()
    {
        // Arrange
        using var context = CreateDbContext(nameof(GetAllPencairan_ShouldReturnAllDisbursements));
        var service = new BeasiswaService(context);

        var pencairan1 = new PencairanBeasiswa
        {
            PencairanId = 1,
            PengajuanId = 101,
            TerminKe = 1,
            TanggalPembayaran = DateTime.UtcNow,
            Biaya = 2500000,
            BuktiPembayaran = "/uploads/tr1.pdf",
            NomorReferensiBank = "REF-001",
            StatusPencairan = StatusPencairan.Selesai
        };
        var pencairan2 = new PencairanBeasiswa
        {
            PencairanId = 2,
            PengajuanId = 102,
            TerminKe = 1,
            TanggalPembayaran = DateTime.UtcNow,
            Biaya = 3000000,
            BuktiPembayaran = "/uploads/tr2.pdf",
            NomorReferensiBank = "REF-002",
            StatusPencairan = StatusPencairan.Selesai
        };
        context.PencairanBeasiswa.AddRange(pencairan1, pencairan2);
        await context.SaveChangesAsync();

        // Act
        var list = await service.GetAllPencairanAsync();

        // Assert
        Assert.Equal(2, list.Count);
        Assert.Contains(list, p => p.NomorReferensiBank == "REF-001");
        Assert.Contains(list, p => p.NomorReferensiBank == "REF-002");
    }

    [Fact]
    public async Task GetKaderAndTracerByUserId_ShouldReturnCorrectData()
    {
        // Arrange
        using var context = CreateDbContext(nameof(GetKaderAndTracerByUserId_ShouldReturnCorrectData));
        var kaderAlumniService = new KaderisasiAlumniService(context);

        var user = new AppUser
        {
            UserId = 20,
            Username = "alumni_user",
            Email = "alumni@ikhwan.org",
            PasswordHash = "hash"
        };
        context.Users.Add(user);

        var mhs = new IkhwanMahasiswa
        {
            MahasiswaId = 7,
            NamaMahasiswa = "Ahmad Yusuf",
            TempatLahir = "Bandung",
            TanggalLahir = new DateTime(2001, 3, 1),
            AlamatLengkap = "Bandung",
            NoTelp = "081299998888",
            Email = "alumni@ikhwan.org"
        };
        context.Mahasiswa.Add(mhs);

        var profile = new AppUserProfile
        {
            ProfileLinkId = 2,
            UserId = 20,
            MahasiswaId = 7
        };
        context.UserProfiles.Add(profile);

        var kader = new KaderisasiProfil
        {
            KaderId = 1,
            MahasiswaId = 7,
            StatusKader = StatusKader.KaderAktif,
            KelompokHalaqah = "Halaqah Salman Al-Farisi",
            NamaMurabbi = "Ust. Syarif",
            TingkatPembinaan = "Lanjutan",
            TanggalBergabung = DateTime.UtcNow
        };
        context.KaderisasiProfil.Add(kader);

        var tracer = new AlumniTracerKarir
        {
            TracerId = 1,
            MahasiswaId = 7,
            NamaPerusahaan = "Bank Syariah Indonesia",
            BidangPekerjaan = "Keuangan",
            Jabatan = "Relationship Manager",
            StatusPekerjaan = StatusPekerjaan.KaryawanTetap,
            BulanBergabung = 6,
            TahunBergabung = 2025,
            MasihBekerja = true
        };
        context.AlumniTracerKarir.Add(tracer);
        await context.SaveChangesAsync();

        // Act
        var kaderDto = await kaderAlumniService.GetKaderByUserIdAsync(20);
        var tracerDto = await kaderAlumniService.GetTracerByUserIdAsync(20);

        // Assert
        Assert.NotNull(kaderDto);
        Assert.Equal("Ahmad Yusuf", kaderDto!.NamaMahasiswa);
        Assert.Equal("Halaqah Salman Al-Farisi", kaderDto.KelompokHalaqah);

        Assert.NotNull(tracerDto);
        Assert.Equal("Ahmad Yusuf", tracerDto!.NamaAlumni);
        Assert.Equal("Bank Syariah Indonesia", tracerDto.NamaPerusahaan);
    }
}
