using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class KaderisasiAlumniService : IKaderisasiAlumniService
{
    private readonly AppDbContext _context;

    public KaderisasiAlumniService(AppDbContext context)
    {
        _context = context;
    }

    // --- KADERISASI ---
    public async Task<List<KaderisasiProfilDto>> GetKaderListAsync()
    {
        return await _context.KaderisasiProfil
            .Include(kp => kp.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .OrderByDescending(kp => kp.KaderId)
            .Select(kp => new KaderisasiProfilDto
            {
                KaderId = kp.KaderId,
                MahasiswaId = kp.MahasiswaId,
                NamaMahasiswa = kp.Mahasiswa != null ? kp.Mahasiswa.NamaMahasiswa : string.Empty,
                NamaUniversitas = kp.Mahasiswa != null 
                    ? (kp.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-")
                    : "-",
                Jurusan = kp.Mahasiswa != null
                    ? (kp.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.Jurusan).FirstOrDefault() ?? "-")
                    : "-",
                StatusKader = kp.StatusKader,
                KelompokHalaqah = kp.KelompokHalaqah,
                NamaMurabbi = kp.NamaMurabbi,
                TingkatPembinaan = kp.TingkatPembinaan,
                CatatanPerkembangan = kp.CatatanPerkembangan,
                TanggalBergabung = kp.TanggalBergabung,
                TotalKegiatanDiikuti = _context.KaderisasiPresensi.Count(p => p.MahasiswaId == kp.MahasiswaId && p.StatusKehadiran == StatusKehadiran.Hadir)
            })
            .ToListAsync();
    }

    public async Task<KaderisasiProfilDto?> GetKaderByMahasiswaIdAsync(int mahasiswaId)
    {
        var kp = await _context.KaderisasiProfil
            .Include(x => x.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .FirstOrDefaultAsync(x => x.MahasiswaId == mahasiswaId);

        if (kp == null) return null;

        return new KaderisasiProfilDto
        {
            KaderId = kp.KaderId,
            MahasiswaId = kp.MahasiswaId,
            NamaMahasiswa = kp.Mahasiswa?.NamaMahasiswa ?? "-",
            NamaUniversitas = kp.Mahasiswa?.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-",
            Jurusan = kp.Mahasiswa?.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.Jurusan).FirstOrDefault() ?? "-",
            StatusKader = kp.StatusKader,
            KelompokHalaqah = kp.KelompokHalaqah,
            NamaMurabbi = kp.NamaMurabbi,
            TingkatPembinaan = kp.TingkatPembinaan,
            CatatanPerkembangan = kp.CatatanPerkembangan,
            TanggalBergabung = kp.TanggalBergabung,
            TotalKegiatanDiikuti = await _context.KaderisasiPresensi.CountAsync(p => p.MahasiswaId == kp.MahasiswaId && p.StatusKehadiran == StatusKehadiran.Hadir)
        };
    }

    public async Task<bool> UpdateKaderProfilAsync(int mahasiswaId, UpdateKaderisasiProfilDto request)
    {
        var kp = await _context.KaderisasiProfil.FirstOrDefaultAsync(x => x.MahasiswaId == mahasiswaId);
        if (kp == null) return false;

        kp.StatusKader = request.StatusKader;
        kp.KelompokHalaqah = request.KelompokHalaqah;
        kp.NamaMurabbi = request.NamaMurabbi;
        kp.TingkatPembinaan = request.TingkatPembinaan;
        kp.CatatanPerkembangan = request.CatatanPerkembangan;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<KaderisasiKegiatanDto>> GetAllKegiatanAsync()
    {
        return await _context.KaderisasiKegiatan
            .Include(k => k.DaftarPresensi)
            .OrderByDescending(k => k.TanggalKegiatan)
            .Select(k => new KaderisasiKegiatanDto
            {
                KegiatanId = k.KegiatanId,
                NamaKegiatan = k.NamaKegiatan,
                Deskripsi = k.Deskripsi,
                TanggalKegiatan = k.TanggalKegiatan,
                Tempat = k.Tempat,
                TipeKegiatan = k.TipeKegiatan,
                WajibHadir = k.WajibHadir,
                TotalPesertaHadir = k.DaftarPresensi.Count(p => p.StatusKehadiran == StatusKehadiran.Hadir)
            })
            .ToListAsync();
    }

    public async Task<KaderisasiKegiatanDto> CreateKegiatanAsync(CreateKegiatanDto request)
    {
        var kegiatan = new KaderisasiKegiatan
        {
            NamaKegiatan = request.NamaKegiatan,
            Deskripsi = request.Deskripsi,
            TanggalKegiatan = request.TanggalKegiatan.ToUniversalTime(),
            Tempat = request.Tempat,
            TipeKegiatan = request.TipeKegiatan,
            WajibHadir = request.WajibHadir
        };

        _context.KaderisasiKegiatan.Add(kegiatan);
        await _context.SaveChangesAsync();

        return new KaderisasiKegiatanDto
        {
            KegiatanId = kegiatan.KegiatanId,
            NamaKegiatan = kegiatan.NamaKegiatan,
            Deskripsi = kegiatan.Deskripsi,
            TanggalKegiatan = kegiatan.TanggalKegiatan,
            Tempat = kegiatan.Tempat,
            TipeKegiatan = kegiatan.TipeKegiatan,
            WajibHadir = kegiatan.WajibHadir,
            TotalPesertaHadir = 0
        };
    }

    public async Task<bool> RecordPresensiAsync(InputPresensiDto request)
    {
        var existing = await _context.KaderisasiPresensi
            .FirstOrDefaultAsync(p => p.KegiatanId == request.KegiatanId && p.MahasiswaId == request.MahasiswaId);

        if (existing == null)
        {
            _context.KaderisasiPresensi.Add(new KaderisasiPresensi
            {
                KegiatanId = request.KegiatanId,
                MahasiswaId = request.MahasiswaId,
                StatusKehadiran = request.StatusKehadiran,
                Keterangan = request.Keterangan,
                WaktuPresensi = DateTime.UtcNow
            });
        }
        else
        {
            existing.StatusKehadiran = request.StatusKehadiran;
            existing.Keterangan = request.Keterangan;
            existing.WaktuPresensi = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<PresensiPesertaDto>> GetPresensiKegiatanAsync(int kegiatanId)
    {
        return await _context.KaderisasiPresensi
            .Include(p => p.Mahasiswa)
            .Where(p => p.KegiatanId == kegiatanId)
            .Select(p => new PresensiPesertaDto
            {
                PresensiId = p.PresensiId,
                MahasiswaId = p.MahasiswaId,
                NamaMahasiswa = p.Mahasiswa != null ? p.Mahasiswa.NamaMahasiswa : "-",
                StatusKehadiran = p.StatusKehadiran,
                WaktuPresensi = p.WaktuPresensi,
                Keterangan = p.Keterangan
            })
            .ToListAsync();
    }

    // --- ALUMNI TRACER ---
    public async Task<List<AlumniTracerDto>> GetTracerListAsync()
    {
        return await _context.AlumniTracerKarir
            .Include(t => t.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .OrderByDescending(t => t.TracerId)
            .Select(t => new AlumniTracerDto
            {
                TracerId = t.TracerId,
                MahasiswaId = t.MahasiswaId,
                NamaAlumni = t.Mahasiswa != null ? t.Mahasiswa.NamaMahasiswa : "-",
                NoTelp = t.Mahasiswa != null ? t.Mahasiswa.NoTelp : "-",
                Email = t.Mahasiswa != null ? t.Mahasiswa.Email : "-",
                Universitas = t.Mahasiswa != null
                    ? (t.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-")
                    : "-",
                Jurusan = t.Mahasiswa != null
                    ? (t.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.Jurusan).FirstOrDefault() ?? "-")
                    : "-",
                NamaPerusahaan = t.NamaPerusahaan,
                BidangPekerjaan = t.BidangPekerjaan,
                Jabatan = t.Jabatan,
                StatusPekerjaan = t.StatusPekerjaan,
                BulanBergabung = t.BulanBergabung,
                TahunBergabung = t.TahunBergabung,
                MasihBekerja = t.MasihBekerja,
                RentangGaji = t.RentangGaji,
                KeselarasanJurusan = t.KeselarasanJurusan,
                InformasiTambahan = t.InformasiTambahan
            })
            .ToListAsync();
    }

    public async Task<AlumniTracerDto?> GetTracerByMahasiswaIdAsync(int mahasiswaId)
    {
        var t = await _context.AlumniTracerKarir
            .Include(x => x.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .FirstOrDefaultAsync(x => x.MahasiswaId == mahasiswaId);

        if (t == null) return null;

        return new AlumniTracerDto
        {
            TracerId = t.TracerId,
            MahasiswaId = t.MahasiswaId,
            NamaAlumni = t.Mahasiswa?.NamaMahasiswa ?? "-",
            NoTelp = t.Mahasiswa?.NoTelp ?? "-",
            Email = t.Mahasiswa?.Email ?? "-",
            Universitas = t.Mahasiswa?.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-",
            Jurusan = t.Mahasiswa?.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.Jurusan).FirstOrDefault() ?? "-",
            NamaPerusahaan = t.NamaPerusahaan,
            BidangPekerjaan = t.BidangPekerjaan,
            Jabatan = t.Jabatan,
            StatusPekerjaan = t.StatusPekerjaan,
            BulanBergabung = t.BulanBergabung,
            TahunBergabung = t.TahunBergabung,
            MasihBekerja = t.MasihBekerja,
            RentangGaji = t.RentangGaji,
            KeselarasanJurusan = t.KeselarasanJurusan,
            InformasiTambahan = t.InformasiTambahan
        };
    }

    public async Task<bool> UpdateTracerAsync(int mahasiswaId, UpdateAlumniTracerDto request)
    {
        var t = await _context.AlumniTracerKarir.FirstOrDefaultAsync(x => x.MahasiswaId == mahasiswaId);
        if (t == null)
        {
            t = new AlumniTracerKarir
            {
                MahasiswaId = mahasiswaId,
                NamaPerusahaan = request.NamaPerusahaan,
                BidangPekerjaan = request.BidangPekerjaan,
                Jabatan = request.Jabatan,
                StatusPekerjaan = request.StatusPekerjaan,
                BulanBergabung = request.BulanBergabung,
                TahunBergabung = request.TahunBergabung,
                MasihBekerja = request.MasihBekerja,
                BulanSelesai = request.BulanSelesai,
                TahunSelesai = request.TahunSelesai,
                RentangGaji = request.RentangGaji,
                KeselarasanJurusan = request.KeselarasanJurusan,
                InformasiTambahan = request.InformasiTambahan
            };
            _context.AlumniTracerKarir.Add(t);
        }
        else
        {
            t.NamaPerusahaan = request.NamaPerusahaan;
            t.BidangPekerjaan = request.BidangPekerjaan;
            t.Jabatan = request.Jabatan;
            t.StatusPekerjaan = request.StatusPekerjaan;
            t.BulanBergabung = request.BulanBergabung;
            t.TahunBergabung = request.TahunBergabung;
            t.MasihBekerja = request.MasihBekerja;
            t.BulanSelesai = request.BulanSelesai;
            t.TahunSelesai = request.TahunSelesai;
            t.RentangGaji = request.RentangGaji;
            t.KeselarasanJurusan = request.KeselarasanJurusan;
            t.InformasiTambahan = request.InformasiTambahan;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<AlumniStatistikDto> GetStatistikAlumniAsync()
    {
        var total = await _context.Mahasiswa.CountAsync(m => m.StatusAkademik == StatusAkademik.LulusAlumni);
        var tracer = await _context.AlumniTracerKarir.ToListAsync();

        var tetap = tracer.Count(t => t.StatusPekerjaan == StatusPekerjaan.KaryawanTetap && t.MasihBekerja);
        var kontrak = tracer.Count(t => t.StatusPekerjaan == StatusPekerjaan.Kontrak && t.MasihBekerja);
        var wirausaha = tracer.Count(t => t.StatusPekerjaan == StatusPekerjaan.Wirausaha && t.MasihBekerja);
        var studi = tracer.Count(t => t.StatusPekerjaan == StatusPekerjaan.StudiLanjut);
        var totalBekerja = tetap + kontrak + wirausaha;
        var belumBekerja = Math.Max(0, total - (totalBekerja + studi));

        decimal persentase = total > 0 ? Math.Round(((decimal)totalBekerja / total) * 100, 1) : 0;

        return new AlumniStatistikDto
        {
            TotalAlumni = total,
            BekerjaTetap = tetap,
            BekerjaKontrak = kontrak,
            Wirausaha = wirausaha,
            StudiLanjut = studi,
            BelumBekerja = belumBekerja,
            PersentaseBekerja = persentase
        };
    }

    // --- ALUMNI KONTRIBUSI ---
    public async Task<List<AlumniKontribusiDto>> GetKontribusiListAsync()
    {
        return await _context.AlumniKontribusi
            .Include(ak => ak.Mahasiswa)
            .OrderByDescending(ak => ak.KontribusiId)
            .Select(ak => new AlumniKontribusiDto
            {
                KontribusiId = ak.KontribusiId,
                MahasiswaId = ak.MahasiswaId,
                NamaAlumni = ak.Mahasiswa != null ? ak.Mahasiswa.NamaMahasiswa : "-",
                TipeKontribusi = ak.TipeKontribusi,
                DeskripsiKontribusi = ak.DeskripsiKontribusi,
                TanggalKontribusi = ak.TanggalKontribusi,
                NominalDonasi = ak.NominalDonasi,
                StatusAktif = ak.StatusAktif
            })
            .ToListAsync();
    }

    public async Task<AlumniKontribusiDto> AddKontribusiAsync(CreateAlumniKontribusiDto request)
    {
        var item = new AlumniKontribusi
        {
            MahasiswaId = request.MahasiswaId,
            TipeKontribusi = request.TipeKontribusi,
            DeskripsiKontribusi = request.DeskripsiKontribusi,
            NominalDonasi = request.NominalDonasi,
            TanggalKontribusi = DateTime.UtcNow,
            StatusAktif = true
        };

        _context.AlumniKontribusi.Add(item);
        await _context.SaveChangesAsync();

        var mhs = await _context.Mahasiswa.FindAsync(request.MahasiswaId);

        return new AlumniKontribusiDto
        {
            KontribusiId = item.KontribusiId,
            MahasiswaId = item.MahasiswaId,
            NamaAlumni = mhs?.NamaMahasiswa ?? "-",
            TipeKontribusi = item.TipeKontribusi,
            DeskripsiKontribusi = item.DeskripsiKontribusi,
            TanggalKontribusi = item.TanggalKontribusi,
            NominalDonasi = item.NominalDonasi,
            StatusAktif = item.StatusAktif
        };
    }
}
