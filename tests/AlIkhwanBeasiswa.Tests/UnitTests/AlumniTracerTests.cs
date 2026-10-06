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

public class AlumniTracerTests
{
    private AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task UpdateTracer_ShouldCreateAndPersistCareerRecord()
    {
        // Arrange
        using var context = CreateDbContext(nameof(UpdateTracer_ShouldCreateAndPersistCareerRecord));
        var service = new KaderisasiAlumniService(context);

        var mhs = new IkhwanMahasiswa
        {
            MahasiswaId = 1,
            NamaMahasiswa = "Farhan Robbani",
            Email = "farhan@campus.ac.id",
            NoTelp = "081234567890",
            StatusAkademik = StatusAkademik.LulusAlumni
        };
        context.Mahasiswa.Add(mhs);
        await context.SaveChangesAsync();

        var request = new UpdateAlumniTracerDto
        {
            NamaPerusahaan = "PT. GoTo Gojek Tokopedia",
            BidangPekerjaan = "Teknologi Informasi & Software",
            Jabatan = "Software Engineer",
            StatusPekerjaan = StatusPekerjaan.KaryawanTetap,
            BulanBergabung = 3,
            TahunBergabung = 2026,
            MasihBekerja = true,
            RentangGaji = "Rp 10.000.000 - Rp 15.000.000",
            KeselarasanJurusan = "Sangat Selaras"
        };

        // Act
        var result = await service.UpdateTracerAsync(1, request);

        // Assert
        Assert.True(result);

        var tracer = await service.GetTracerByMahasiswaIdAsync(1);
        Assert.NotNull(tracer);
        Assert.Equal("PT. GoTo Gojek Tokopedia", tracer.NamaPerusahaan);
        Assert.Equal("Software Engineer", tracer.Jabatan);
        Assert.Equal(StatusPekerjaan.KaryawanTetap, tracer.StatusPekerjaan);
    }

    [Fact]
    public async Task AddKontribusi_ShouldPersistAlumniDonation()
    {
        // Arrange
        using var context = CreateDbContext(nameof(AddKontribusi_ShouldPersistAlumniDonation));
        var service = new KaderisasiAlumniService(context);

        var mhs = new IkhwanMahasiswa
        {
            MahasiswaId = 2,
            NamaMahasiswa = "Ahmad Lulusan UI",
            Email = "ahmad@alumni.ui.ac.id",
            NoTelp = "081987654321",
            StatusAkademik = StatusAkademik.LulusAlumni
        };
        context.Mahasiswa.Add(mhs);
        await context.SaveChangesAsync();

        var request = new CreateAlumniKontribusiDto
        {
            MahasiswaId = 2,
            TipeKontribusi = "Donasi Rutin Beasiswa",
            DeskripsiKontribusi = "Infaq bulanan untuk adik asuh jenjang SMA",
            NominalDonasi = 1500000
        };

        // Act
        var kontribusi = await service.AddKontribusiAsync(request);

        // Assert
        Assert.NotNull(kontribusi);
        Assert.Equal(1500000, kontribusi.NominalDonasi);
        Assert.Equal("Ahmad Lulusan UI", kontribusi.NamaAlumni);

        var list = await service.GetKontribusiListAsync();
        Assert.Single(list);
        Assert.Equal("Donasi Rutin Beasiswa", list[0].TipeKontribusi);
    }
}
