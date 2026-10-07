using System;
using System.Threading.Tasks;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Infrastructure.Data;
using AlIkhwanBeasiswa.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AlIkhwanBeasiswa.Tests.UnitTests;

public class DokumenServiceTests
{
    private AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetKwitansiPencairanAsync_ShouldReturnCompleteReceiptData()
    {
        using var context = CreateDbContext(nameof(GetKwitansiPencairanAsync_ShouldReturnCompleteReceiptData));
        var service = new DokumenService(context);

        var orangTua = new IkhwanOrangTua
        {
            OrangTuaId = 1,
            NamaAyah = "Ahmad",
            NamaIbu = "Siti"
        };
        context.OrangTua.Add(orangTua);

        var mahasiswa = new IkhwanMahasiswa
        {
            MahasiswaId = 1,
            OrangTuaId = 1,
            NamaMahasiswa = "Rizky Ramadhan",
            TempatLahir = "Jakarta",
            TanggalLahir = new DateTime(2003, 1, 1),
            AlamatLengkap = "Jakarta Selatan",
            NoTelp = "0812345678",
            Email = "rizky@kampus.id"
        };
        context.Mahasiswa.Add(mahasiswa);

        var univ = new IkhwanUniversitas
        {
            UnivId = 1,
            MahasiswaId = 1,
            NamaUniversitas = "Universitas Indonesia",
            Jurusan = "Teknik Informatika",
            TanggalMasuk = new DateTime(2021, 9, 1)
        };
        context.Universitas.Add(univ);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 1,
            NamaPeriode = "Ganjil 2026/2027",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-10),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(10),
            TotalAnggaranPagu = 100000000
        };
        context.PeriodeBeasiswa.Add(periode);

        var pengajuan = new PengajuanBeasiswa
        {
            PengajuanId = 10,
            PeriodeId = 1,
            TipePenerima = TipePenerima.Mahasiswa,
            MahasiswaId = 1,
            NilaiRataRata = 3.85m,
            PaguBeasiswa = 5000000,
            PaguTertanggung = 5000000,
            StatusPengajuan = StatusPengajuan.Disetujui
        };
        context.PengajuanBeasiswa.Add(pengajuan);

        var pencairan = new PencairanBeasiswa
        {
            PencairanId = 5,
            PengajuanId = 10,
            TerminKe = 1,
            TanggalPembayaran = new DateTime(2026, 10, 7),
            Biaya = 2500000,
            BuktiPembayaran = "bukti.jpg",
            NomorReferensiBank = "TRX-BSI-998822",
            StatusPencairan = StatusPencairan.Selesai,
            InformasiTambahan = "Termin 1 SPP Kuliah"
        };
        context.PencairanBeasiswa.Add(pencairan);
        await context.SaveChangesAsync();

        var result = await service.GetKwitansiPencairanAsync(5);

        Assert.NotNull(result);
        Assert.Equal(5, result.PencairanId);
        Assert.Equal(2500000, result.JumlahNominal);
        Assert.Equal("Dua Juta Lima Ratus Ribu Rupiah", result.Terbilang);
        Assert.Equal("Rizky Ramadhan", result.NamaPenerima);
        Assert.Equal("Universitas Indonesia - Teknik Informatika", result.InstitusiPendidikan);
        Assert.StartsWith("KWIT/2026/", result.NomorKwitansi);
        Assert.False(string.IsNullOrWhiteSpace(result.KodeVerifikasi));
    }

    [Fact]
    public async Task GetSuratKeteranganBeasiswaAsync_ShouldReturnValidCertificateData()
    {
        using var context = CreateDbContext(nameof(GetSuratKeteranganBeasiswaAsync_ShouldReturnValidCertificateData));
        var service = new DokumenService(context);

        var orangTua = new IkhwanOrangTua { OrangTuaId = 2, NamaAyah = "Budi", NamaIbu = "Dewi" };
        context.OrangTua.Add(orangTua);

        var siswa = new IkhwanSiswa
        {
            SiswaId = 2,
            OrangTuaId = 2,
            NamaSiswa = "Aisyah Zahra",
            TempatLahir = "Bandung",
            TanggalLahir = new DateTime(2008, 4, 15),
            AlamatLengkap = "Bandung",
            NoTelp = "0898765432",
            Email = "aisyah@sekolah.id"
        };
        context.Siswa.Add(siswa);

        var sekolah = new IkhwanPendidikan
        {
            PendidikanId = 2,
            SiswaId = 2,
            NamaSekolah = "SMA Negeri 1 Bandung",
            Jenjang = "SMA",
            AlamatSekolah = "Bandung",
            TanggalMasuk = new DateTime(2023, 7, 1)
        };
        context.PendidikanSekolah.Add(sekolah);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 2,
            NamaPeriode = "Tahun Ajaran 2026/2027",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-5),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(5),
            TotalAnggaranPagu = 50000000
        };
        context.PeriodeBeasiswa.Add(periode);

        var pengajuan = new PengajuanBeasiswa
        {
            PengajuanId = 20,
            PeriodeId = 2,
            TipePenerima = TipePenerima.Siswa,
            SiswaId = 2,
            NilaiRataRata = 92.5m,
            PaguBeasiswa = 3000000,
            PaguTertanggung = 3000000,
            StatusPengajuan = StatusPengajuan.Disetujui
        };
        context.PengajuanBeasiswa.Add(pengajuan);
        await context.SaveChangesAsync();

        var result = await service.GetSuratKeteranganBeasiswaAsync(20);

        Assert.NotNull(result);
        Assert.Equal(20, result.PengajuanId);
        Assert.Equal("Aisyah Zahra", result.NamaPenerima);
        Assert.Equal("SMA Negeri 1 Bandung (SMA)", result.InstitusiPendidikan);
        Assert.StartsWith("SK.AIK/BEASISWA/2026/", result.NomorSurat);
        Assert.False(string.IsNullOrWhiteSpace(result.KodeVerifikasi));
    }

    [Fact]
    public async Task VerifikasiDokumenAsync_ShouldValidateCorrectAndIncorrectCodes()
    {
        using var context = CreateDbContext(nameof(VerifikasiDokumenAsync_ShouldValidateCorrectAndIncorrectCodes));
        var service = new DokumenService(context);

        var orangTua = new IkhwanOrangTua { OrangTuaId = 3, NamaAyah = "Hasan", NamaIbu = "Nur" };
        context.OrangTua.Add(orangTua);

        var mahasiswa = new IkhwanMahasiswa
        {
            MahasiswaId = 3,
            OrangTuaId = 3,
            NamaMahasiswa = "Fikri Maulana",
            TempatLahir = "Surabaya",
            TanggalLahir = new DateTime(2002, 11, 20),
            AlamatLengkap = "Surabaya",
            NoTelp = "0812334455",
            Email = "fikri@kampus.id"
        };
        context.Mahasiswa.Add(mahasiswa);

        var periode = new PeriodeBeasiswa
        {
            PeriodeId = 3,
            NamaPeriode = "Periode Tes 2026",
            TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-10),
            TanggalSelesaiDaftar = DateTime.UtcNow.AddDays(10),
            TotalAnggaranPagu = 50000000
        };
        context.PeriodeBeasiswa.Add(periode);

        var pengajuan = new PengajuanBeasiswa
        {
            PengajuanId = 30,
            PeriodeId = 3,
            Periode = periode,
            TipePenerima = TipePenerima.Mahasiswa,
            MahasiswaId = 3,
            Mahasiswa = mahasiswa,
            NilaiRataRata = 3.9m,
            PaguBeasiswa = 4000000,
            PaguTertanggung = 4000000,
            StatusPengajuan = StatusPengajuan.Disetujui
        };
        context.PengajuanBeasiswa.Add(pengajuan);

        var pencairan = new PencairanBeasiswa
        {
            PencairanId = 300,
            PengajuanId = 30,
            Pengajuan = pengajuan,
            TerminKe = 1,
            TanggalPembayaran = DateTime.UtcNow,
            Biaya = 4000000,
            BuktiPembayaran = "bukti.png",
            StatusPencairan = StatusPencairan.Selesai
        };
        context.PencairanBeasiswa.Add(pencairan);
        await context.SaveChangesAsync();

        var kwitansi = await service.GetKwitansiPencairanAsync(300);
        Assert.NotNull(kwitansi);

        // Verify valid code
        var checkValid = await service.VerifikasiDokumenAsync(kwitansi.KodeVerifikasi);
        Assert.True(checkValid.IsValid);
        Assert.Equal("Fikri Maulana", checkValid.NamaPenerima);

        // Verify invalid code
        var checkInvalid = await service.VerifikasiDokumenAsync("UNKNOWN-CODE-999");
        Assert.False(checkInvalid.IsValid);
    }
}
