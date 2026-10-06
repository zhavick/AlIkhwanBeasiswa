using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class PortalCmsService : IPortalCmsService
{
    private readonly AppDbContext _context;

    public PortalCmsService(AppDbContext context)
    {
        _context = context;
    }

    // --- PENGUMUMAN ---
    public async Task<List<PengumumanDto>> GetPengumumanListAsync(bool onlyPublished = true)
    {
        var query = _context.PortalPengumuman
            .Include(p => p.PenulisUser)
                .ThenInclude(u => u!.PengurusProfile)
            .AsQueryable();

        if (onlyPublished)
        {
            query = query.Where(p => p.IsPublished);
        }

        return await query
            .OrderByDescending(p => p.TanggalTerbit)
            .Select(p => new PengumumanDto
            {
                PengumumanId = p.PengumumanId,
                Judul = p.Judul,
                Slug = p.Slug,
                Ringkasan = p.Ringkasan,
                IsiKonten = p.IsiKonten,
                GambarCoverUrl = p.GambarCoverUrl,
                Kategori = p.Kategori,
                IsPublished = p.IsPublished,
                TanggalTerbit = p.TanggalTerbit,
                PenulisName = p.PenulisUser != null ? (p.PenulisUser.PengurusProfile != null ? p.PenulisUser.PengurusProfile.NamaLengkap : p.PenulisUser.Username) : "Admin"
            })
            .ToListAsync();
    }

    public async Task<PengumumanDto?> GetPengumumanBySlugAsync(string slug)
    {
        var p = await _context.PortalPengumuman
            .Include(x => x.PenulisUser)
                .ThenInclude(u => u!.PengurusProfile)
            .FirstOrDefaultAsync(x => x.Slug.ToLower() == slug.ToLower());

        if (p == null) return null;

        return new PengumumanDto
        {
            PengumumanId = p.PengumumanId,
            Judul = p.Judul,
            Slug = p.Slug,
            Ringkasan = p.Ringkasan,
            IsiKonten = p.IsiKonten,
            GambarCoverUrl = p.GambarCoverUrl,
            Kategori = p.Kategori,
            IsPublished = p.IsPublished,
            TanggalTerbit = p.TanggalTerbit,
            PenulisName = p.PenulisUser?.PengurusProfile?.NamaLengkap ?? p.PenulisUser?.Username ?? "Admin"
        };
    }

    public async Task<PengumumanDto> CreatePengumumanAsync(CreatePengumumanDto request, int userId)
    {
        var slug = GenerateSlug(request.Judul);
        int counter = 1;
        while (await _context.PortalPengumuman.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{GenerateSlug(request.Judul)}-{counter++}";
        }

        var p = new PortalPengumuman
        {
            Judul = request.Judul,
            Slug = slug,
            Ringkasan = request.Ringkasan,
            IsiKonten = request.IsiKonten,
            GambarCoverUrl = request.GambarCoverUrl,
            Kategori = request.Kategori,
            IsPublished = request.IsPublished,
            TanggalTerbit = DateTime.UtcNow,
            PenulisUserId = userId
        };

        _context.PortalPengumuman.Add(p);
        await _context.SaveChangesAsync();

        return (await GetPengumumanBySlugAsync(slug))!;
    }

    public async Task<PengumumanDto?> UpdatePengumumanAsync(int id, UpdatePengumumanDto request)
    {
        var p = await _context.PortalPengumuman.FindAsync(id);
        if (p == null) return null;

        p.Judul = request.Judul;
        p.Ringkasan = request.Ringkasan;
        p.IsiKonten = request.IsiKonten;
        p.GambarCoverUrl = request.GambarCoverUrl;
        p.Kategori = request.Kategori;
        p.IsPublished = request.IsPublished;

        await _context.SaveChangesAsync();
        return await GetPengumumanBySlugAsync(p.Slug);
    }

    public async Task<bool> DeletePengumumanAsync(int id)
    {
        var p = await _context.PortalPengumuman.FindAsync(id);
        if (p == null) return false;

        _context.PortalPengumuman.Remove(p);
        await _context.SaveChangesAsync();
        return true;
    }

    // --- BANNER ---
    public async Task<List<BannerDto>> GetBannerListAsync(bool onlyActive = true)
    {
        var query = _context.PortalBanner.AsQueryable();
        if (onlyActive)
        {
            query = query.Where(b => b.StatusAktif);
        }

        return await query
            .OrderBy(b => b.Urutan)
            .Select(b => new BannerDto
            {
                BannerId = b.BannerId,
                Judul = b.Judul,
                Subjudul = b.Subjudul,
                GambarUrl = b.GambarUrl,
                LinkUrl = b.LinkUrl,
                Urutan = b.Urutan,
                StatusAktif = b.StatusAktif
            })
            .ToListAsync();
    }

    public async Task<BannerDto> CreateBannerAsync(CreateBannerDto request)
    {
        var banner = new PortalBanner
        {
            Judul = request.Judul,
            Subjudul = request.Subjudul,
            GambarUrl = request.GambarUrl,
            LinkUrl = request.LinkUrl,
            Urutan = request.Urutan,
            StatusAktif = request.StatusAktif
        };

        _context.PortalBanner.Add(banner);
        await _context.SaveChangesAsync();

        return new BannerDto
        {
            BannerId = banner.BannerId,
            Judul = banner.Judul,
            Subjudul = banner.Subjudul,
            GambarUrl = banner.GambarUrl,
            LinkUrl = banner.LinkUrl,
            Urutan = banner.Urutan,
            StatusAktif = banner.StatusAktif
        };
    }

    public async Task<bool> DeleteBannerAsync(int id)
    {
        var b = await _context.PortalBanner.FindAsync(id);
        if (b == null) return false;

        _context.PortalBanner.Remove(b);
        await _context.SaveChangesAsync();
        return true;
    }

    // --- SYARAT DOKUMEN ---
    public async Task<List<SyaratDokumenDto>> GetSyaratDokumenListAsync(string? tipePenerima = null)
    {
        var query = _context.PortalSyaratDokumen.AsQueryable();
        if (!string.IsNullOrEmpty(tipePenerima) && tipePenerima != "Semua")
        {
            query = query.Where(s => s.TipePenerima == "Semua" || s.TipePenerima == tipePenerima);
        }

        return await query
            .OrderBy(s => s.SyaratId)
            .Select(s => new SyaratDokumenDto
            {
                SyaratId = s.SyaratId,
                NamaDokumen = s.NamaDokumen,
                Deskripsi = s.Deskripsi,
                Wajib = s.Wajib,
                TipePenerima = s.TipePenerima,
                FormatFileDiizinkan = s.FormatFileDiizinkan,
                MaxSizeMb = s.MaxSizeMb
            })
            .ToListAsync();
    }

    public async Task<SyaratDokumenDto> CreateSyaratDokumenAsync(CreateSyaratDokumenDto request)
    {
        var syarat = new PortalSyaratDokumen
        {
            NamaDokumen = request.NamaDokumen,
            Deskripsi = request.Deskripsi,
            Wajib = request.Wajib,
            TipePenerima = request.TipePenerima,
            FormatFileDiizinkan = request.FormatFileDiizinkan,
            MaxSizeMb = request.MaxSizeMb
        };

        _context.PortalSyaratDokumen.Add(syarat);
        await _context.SaveChangesAsync();

        return new SyaratDokumenDto
        {
            SyaratId = syarat.SyaratId,
            NamaDokumen = syarat.NamaDokumen,
            Deskripsi = syarat.Deskripsi,
            Wajib = syarat.Wajib,
            TipePenerima = syarat.TipePenerima,
            FormatFileDiizinkan = syarat.FormatFileDiizinkan,
            MaxSizeMb = syarat.MaxSizeMb
        };
    }

    public async Task<bool> DeleteSyaratDokumenAsync(int id)
    {
        var s = await _context.PortalSyaratDokumen.FindAsync(id);
        if (s == null) return false;

        _context.PortalSyaratDokumen.Remove(s);
        await _context.SaveChangesAsync();
        return true;
    }

    // --- DOKUMEN PENERIMA ---
    public async Task<List<DokumenPenerimaDto>> GetDokumenByPengajuanIdAsync(int pengajuanId)
    {
        return await _context.PortalDokumenPenerima
            .Include(d => d.Syarat)
            .Where(d => d.PengajuanId == pengajuanId)
            .Select(d => new DokumenPenerimaDto
            {
                DokumenId = d.DokumenId,
                PengajuanId = d.PengajuanId,
                SyaratId = d.SyaratId,
                NamaSyarat = d.Syarat != null ? d.Syarat.NamaDokumen : "-",
                FileUrl = d.FileUrl,
                NamaFileAsli = d.NamaFileAsli,
                TanggalUnggah = d.TanggalUnggah,
                StatusVerifikasi = d.StatusVerifikasi,
                CatatanRevisi = d.CatatanRevisi
            })
            .ToListAsync();
    }

    public async Task<DokumenPenerimaDto> SaveDokumenPenerimaAsync(int pengajuanId, int syaratId, string fileUrl, string namaFileAsli)
    {
        var existing = await _context.PortalDokumenPenerima
            .FirstOrDefaultAsync(d => d.PengajuanId == pengajuanId && d.SyaratId == syaratId);

        if (existing == null)
        {
            existing = new PortalDokumenPenerima
            {
                PengajuanId = pengajuanId,
                SyaratId = syaratId,
                FileUrl = fileUrl,
                NamaFileAsli = namaFileAsli,
                TanggalUnggah = DateTime.UtcNow,
                StatusVerifikasi = "Pending"
            };
            _context.PortalDokumenPenerima.Add(existing);
        }
        else
        {
            existing.FileUrl = fileUrl;
            existing.NamaFileAsli = namaFileAsli;
            existing.TanggalUnggah = DateTime.UtcNow;
            existing.StatusVerifikasi = "Pending";
        }

        await _context.SaveChangesAsync();

        var syarat = await _context.PortalSyaratDokumen.FindAsync(syaratId);

        return new DokumenPenerimaDto
        {
            DokumenId = existing.DokumenId,
            PengajuanId = existing.PengajuanId,
            SyaratId = existing.SyaratId,
            NamaSyarat = syarat?.NamaDokumen ?? "-",
            FileUrl = existing.FileUrl,
            NamaFileAsli = existing.NamaFileAsli,
            TanggalUnggah = existing.TanggalUnggah,
            StatusVerifikasi = existing.StatusVerifikasi
        };
    }

    public async Task<bool> VerifikasiDokumenAsync(VerifikasiDokumenDto request)
    {
        var doc = await _context.PortalDokumenPenerima.FindAsync(request.DokumenId);
        if (doc == null) return false;

        doc.StatusVerifikasi = request.StatusVerifikasi;
        doc.CatatanRevisi = request.CatatanRevisi;

        await _context.SaveChangesAsync();
        return true;
    }

    // --- HELPDESK TIKET ---
    public async Task<List<HelpdeskTiketDto>> GetAllTiketAsync()
    {
        return await _context.PortalHelpdeskTiket
            .Include(t => t.User)
            .Include(t => t.DijawabOlehUser)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new HelpdeskTiketDto
            {
                TiketId = t.TiketId,
                UserId = t.UserId,
                PengirimName = t.User != null ? t.User.Username : "-",
                PengirimEmail = t.User != null ? t.User.Email : "-",
                NomorTiket = t.NomorTiket,
                Subjek = t.Subjek,
                Pesan = t.Pesan,
                Kategori = t.Kategori,
                StatusTiket = t.StatusTiket,
                JawabanAdmin = t.JawabanAdmin,
                DijawabOleh = t.DijawabOlehUser != null ? t.DijawabOlehUser.Username : null,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<HelpdeskTiketDto>> GetTiketByUserIdAsync(int userId)
    {
        return await _context.PortalHelpdeskTiket
            .Include(t => t.User)
            .Include(t => t.DijawabOlehUser)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new HelpdeskTiketDto
            {
                TiketId = t.TiketId,
                UserId = t.UserId,
                PengirimName = t.User != null ? t.User.Username : "-",
                PengirimEmail = t.User != null ? t.User.Email : "-",
                NomorTiket = t.NomorTiket,
                Subjek = t.Subjek,
                Pesan = t.Pesan,
                Kategori = t.Kategori,
                StatusTiket = t.StatusTiket,
                JawabanAdmin = t.JawabanAdmin,
                DijawabOleh = t.DijawabOlehUser != null ? t.DijawabOlehUser.Username : null,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<HelpdeskTiketDto> CreateTiketAsync(CreateHelpdeskTiketDto request, int userId)
    {
        var nomorTiket = $"TKT-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

        var tiket = new PortalHelpdeskTiket
        {
            UserId = userId,
            NomorTiket = nomorTiket,
            Subjek = request.Subjek,
            Pesan = request.Pesan,
            Kategori = request.Kategori,
            StatusTiket = StatusTiket.Menunggu,
            CreatedAt = DateTime.UtcNow
        };

        _context.PortalHelpdeskTiket.Add(tiket);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return new HelpdeskTiketDto
        {
            TiketId = tiket.TiketId,
            UserId = tiket.UserId,
            PengirimName = user?.Username ?? "-",
            PengirimEmail = user?.Email ?? "-",
            NomorTiket = tiket.NomorTiket,
            Subjek = tiket.Subjek,
            Pesan = tiket.Pesan,
            Kategori = tiket.Kategori,
            StatusTiket = tiket.StatusTiket,
            CreatedAt = tiket.CreatedAt
        };
    }

    public async Task<bool> JawabTiketAsync(int tiketId, JawabHelpdeskTiketDto request, int adminUserId)
    {
        var tiket = await _context.PortalHelpdeskTiket.FindAsync(tiketId);
        if (tiket == null) return false;

        tiket.JawabanAdmin = request.JawabanAdmin;
        tiket.StatusTiket = request.StatusTiket;
        tiket.DijawabOlehUserId = adminUserId;
        tiket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static string GenerateSlug(string text)
    {
        var str = text.ToLowerInvariant();
        str = System.Text.RegularExpressions.Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = System.Text.RegularExpressions.Regex.Replace(str, @"\s+", " ").Trim();
        str = str.Substring(0, str.Length <= 60 ? str.Length : 60).Trim();
        str = System.Text.RegularExpressions.Regex.Replace(str, @"\s", "-");
        return str;
    }
}
