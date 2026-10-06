using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class PenerimaService : IPenerimaService
{
    private readonly AppDbContext _context;

    public PenerimaService(AppDbContext context)
    {
        _context = context;
    }

    // --- SISWA ---
    public async Task<List<SiswaListDto>> GetAllSiswaAsync()
    {
        return await _context.Siswa
            .Include(s => s.OrangTua)
            .Include(s => s.RiwayatPendidikan)
            .Include(s => s.DaftarNilai)
            .OrderByDescending(s => s.SiswaId)
            .Select(s => new SiswaListDto
            {
                SiswaId = s.SiswaId,
                NamaSiswa = s.NamaSiswa,
                NamaPanggilan = s.NamaPanggilan,
                Jenjang = s.RiwayatPendidikan.OrderByDescending(p => p.PendidikanId).Select(p => p.Jenjang).FirstOrDefault() ?? "SMA",
                NamaSekolah = s.RiwayatPendidikan.OrderByDescending(p => p.PendidikanId).Select(p => p.NamaSekolah).FirstOrDefault() ?? "-",
                NoTelp = s.NoTelp,
                Email = s.Email,
                NilaiRataRataTerakhir = s.DaftarNilai.Any() ? s.DaftarNilai.Average(n => n.NilaiRata) : 0,
                IsYatimPiatu = s.OrangTua != null && (s.OrangTua.TelahMeninggalAyah || s.OrangTua.TelahMeninggalIbu)
            })
            .ToListAsync();
    }

    public async Task<SiswaDetailDto?> GetSiswaByIdAsync(int siswaId)
    {
        var s = await _context.Siswa
            .Include(x => x.OrangTua)
            .Include(x => x.RiwayatPendidikan)
            .Include(x => x.DaftarNilai)
            .FirstOrDefaultAsync(x => x.SiswaId == siswaId);

        if (s == null) return null;

        return new SiswaDetailDto
        {
            SiswaId = s.SiswaId,
            NamaSiswa = s.NamaSiswa,
            NamaPanggilan = s.NamaPanggilan,
            TempatLahir = s.TempatLahir,
            TanggalLahir = s.TanggalLahir,
            AlamatLengkap = s.AlamatLengkap,
            NoTelp = s.NoTelp,
            Email = s.Email,
            InformasiTambahan = s.InformasiTambahan,
            OrangTuaId = s.OrangTuaId,
            NamaAyah = s.OrangTua?.NamaAyah ?? "-",
            NamaIbu = s.OrangTua?.NamaIbu ?? "-",
            PekerjaanAyah = s.OrangTua?.PekerjaanAyah,
            PekerjaanIbu = s.OrangTua?.PekerjaanIbu,
            TelahMeninggalAyah = s.OrangTua?.TelahMeninggalAyah ?? false,
            TelahMeninggalIbu = s.OrangTua?.TelahMeninggalIbu ?? false,
            RiwayatPendidikan = s.RiwayatPendidikan.Select(p => new PendidikanSekolahDto
            {
                PendidikanId = p.PendidikanId,
                NamaSekolah = p.NamaSekolah,
                AlamatSekolah = p.AlamatSekolah,
                Jenjang = p.Jenjang,
                TanggalMasuk = p.TanggalMasuk,
                MasihDalamPendidikan = p.MasihDalamPendidikan
            }).ToList(),
            DaftarNilai = s.DaftarNilai.Select(n => new NilaiSekolahDto
            {
                NilaiSekolahId = n.NilaiSekolahId,
                PendidikanId = n.PendidikanId,
                NamaPelajaran = n.NamaPelajaran,
                Semester = n.Semester,
                NilaiUTS = n.NilaiUTS,
                NilaiUAS = n.NilaiUAS,
                NilaiRata = n.NilaiRata
            }).ToList()
        };
    }

    public async Task<NilaiSekolahDto> InputNilaiSekolahAsync(InputNilaiSekolahDto request)
    {
        var nilai = new IkhwanNilaiSekolah
        {
            SiswaId = request.SiswaId,
            PendidikanId = request.PendidikanId,
            NamaPelajaran = request.NamaPelajaran,
            Semester = request.Semester,
            NilaiUTS = request.NilaiUTS,
            NilaiUAS = request.NilaiUAS,
            NilaiRata = request.NilaiRata,
            InformasiTambahan = request.InformasiTambahan
        };

        _context.NilaiSekolah.Add(nilai);
        await _context.SaveChangesAsync();

        return new NilaiSekolahDto
        {
            NilaiSekolahId = nilai.NilaiSekolahId,
            PendidikanId = nilai.PendidikanId,
            NamaPelajaran = nilai.NamaPelajaran,
            Semester = nilai.Semester,
            NilaiUTS = nilai.NilaiUTS,
            NilaiUAS = nilai.NilaiUAS,
            NilaiRata = nilai.NilaiRata
        };
    }

    // --- MAHASISWA ---
    public async Task<List<MahasiswaListDto>> GetAllMahasiswaAsync()
    {
        return await _context.Mahasiswa
            .Include(m => m.OrangTua)
            .Include(m => m.RiwayatUniversitas)
            .Include(m => m.DaftarNilai)
            .OrderByDescending(m => m.MahasiswaId)
            .Select(m => new MahasiswaListDto
            {
                MahasiswaId = m.MahasiswaId,
                NamaMahasiswa = m.NamaMahasiswa,
                NamaPanggilan = m.NamaPanggilan,
                NamaUniversitas = m.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-",
                Jurusan = m.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.Jurusan).FirstOrDefault() ?? "-",
                Jenjang = m.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.Jenjang).FirstOrDefault() ?? "S1",
                StatusAkademik = m.StatusAkademik,
                IPK = m.DaftarNilai.Any() ? m.DaftarNilai.Average(n => n.NilaiRata) : 0,
                CalonKaderisasi = m.CalonKaderisasi,
                IsYatimPiatu = m.OrangTua != null && (m.OrangTua.TelahMeninggalAyah || m.OrangTua.TelahMeninggalIbu)
            })
            .ToListAsync();
    }

    public async Task<MahasiswaDetailDto?> GetMahasiswaByIdAsync(int mahasiswaId)
    {
        var m = await _context.Mahasiswa
            .Include(x => x.OrangTua)
            .Include(x => x.RiwayatUniversitas)
            .Include(x => x.DaftarNilai)
            .FirstOrDefaultAsync(x => x.MahasiswaId == mahasiswaId);

        if (m == null) return null;

        return new MahasiswaDetailDto
        {
            MahasiswaId = m.MahasiswaId,
            NamaMahasiswa = m.NamaMahasiswa,
            NamaPanggilan = m.NamaPanggilan,
            TempatLahir = m.TempatLahir,
            TanggalLahir = m.TanggalLahir,
            AlamatLengkap = m.AlamatLengkap,
            NoTelp = m.NoTelp,
            Email = m.Email,
            CalonKaderisasi = m.CalonKaderisasi,
            StatusAkademik = m.StatusAkademik,
            InformasiTambahan = m.InformasiTambahan,
            OrangTuaId = m.OrangTuaId,
            NamaAyah = m.OrangTua?.NamaAyah ?? "-",
            NamaIbu = m.OrangTua?.NamaIbu ?? "-",
            PekerjaanAyah = m.OrangTua?.PekerjaanAyah,
            PekerjaanIbu = m.OrangTua?.PekerjaanIbu,
            TelahMeninggalAyah = m.OrangTua?.TelahMeninggalAyah ?? false,
            TelahMeninggalIbu = m.OrangTua?.TelahMeninggalIbu ?? false,
            RiwayatUniversitas = m.RiwayatUniversitas.Select(u => new UniversitasDto
            {
                UnivId = u.UnivId,
                NamaUniversitas = u.NamaUniversitas,
                Jenjang = u.Jenjang,
                Jurusan = u.Jurusan,
                TanggalMasuk = u.TanggalMasuk,
                MasihBerjalan = u.MasihBerjalan,
                TanggalLulus = u.TanggalLulus
            }).ToList(),
            DaftarNilai = m.DaftarNilai.Select(n => new NilaiUnivDto
            {
                NilaiId = n.NilaiId,
                UnivId = n.UnivId,
                MataKuliah = n.MataKuliah,
                Semester = n.Semester,
                NilaiUTS = n.NilaiUTS,
                NilaiUAS = n.NilaiUAS,
                NilaiRata = n.NilaiRata,
                Sks = n.Sks
            }).ToList()
        };
    }

    public async Task<NilaiUnivDto> InputNilaiUnivAsync(InputNilaiUnivDto request)
    {
        var nilai = new IkhwanNilaiUniv
        {
            MahasiswaId = request.MahasiswaId,
            UnivId = request.UnivId,
            MataKuliah = request.MataKuliah,
            Semester = request.Semester,
            NilaiUTS = request.NilaiUTS,
            NilaiUAS = request.NilaiUAS,
            NilaiRata = request.NilaiRata,
            Sks = request.Sks,
            InformasiTambahan = request.InformasiTambahan
        };

        _context.NilaiUniv.Add(nilai);
        await _context.SaveChangesAsync();

        return new NilaiUnivDto
        {
            NilaiId = nilai.NilaiId,
            UnivId = nilai.UnivId,
            MataKuliah = nilai.MataKuliah,
            Semester = nilai.Semester,
            NilaiUTS = nilai.NilaiUTS,
            NilaiUAS = nilai.NilaiUAS,
            NilaiRata = nilai.NilaiRata,
            Sks = nilai.Sks
        };
    }

    public async Task<bool> LuluskanMahasiswaAsync(int mahasiswaId, DateTime tanggalLulus)
    {
        var mahasiswa = await _context.Mahasiswa
            .Include(m => m.RiwayatUniversitas)
            .FirstOrDefaultAsync(m => m.MahasiswaId == mahasiswaId);

        if (mahasiswa == null) return false;

        mahasiswa.StatusAkademik = StatusAkademik.LulusAlumni;

        var univAktif = mahasiswa.RiwayatUniversitas.FirstOrDefault(u => u.MasihBerjalan);
        if (univAktif != null)
        {
            univAktif.MasihBerjalan = false;
            univAktif.TanggalLulus = tanggalLulus.ToUniversalTime();
        }

        // Cari user yang terhubung dan tambahkan Role Alumni
        var userProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(up => up.MahasiswaId == mahasiswaId);

        if (userProfile != null)
        {
            var alumniRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Alumni");
            if (alumniRole != null && !await _context.UserRoles.AnyAsync(ur => ur.UserId == userProfile.UserId && ur.RoleId == alumniRole.RoleId))
            {
                _context.UserRoles.Add(new AppUserRole
                {
                    UserId = userProfile.UserId,
                    RoleId = alumniRole.RoleId
                });
            }
        }

        // Inisialisasi catatan tracer jika belum ada
        if (!await _context.AlumniTracerKarir.AnyAsync(t => t.MahasiswaId == mahasiswaId))
        {
            _context.AlumniTracerKarir.Add(new AlumniTracerKarir
            {
                MahasiswaId = mahasiswaId,
                NamaPerusahaan = "-",
                BidangPekerjaan = "-",
                Jabatan = "-",
                StatusPekerjaan = StatusPekerjaan.Freelance,
                BulanBergabung = DateTime.UtcNow.Month,
                TahunBergabung = DateTime.UtcNow.Year,
                MasihBekerja = false,
                InformasiTambahan = "Menunggu pembaruan tracer study dari alumni"
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
