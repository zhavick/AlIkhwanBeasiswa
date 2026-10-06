using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IPortalCmsService
{
    // Pengumuman
    Task<List<PengumumanDto>> GetPengumumanListAsync(bool onlyPublished = true);
    Task<PengumumanDto?> GetPengumumanBySlugAsync(string slug);
    Task<PengumumanDto> CreatePengumumanAsync(CreatePengumumanDto request, int userId);
    Task<PengumumanDto?> UpdatePengumumanAsync(int id, UpdatePengumumanDto request);
    Task<bool> DeletePengumumanAsync(int id);

    // Banner
    Task<List<BannerDto>> GetBannerListAsync(bool onlyActive = true);
    Task<BannerDto> CreateBannerAsync(CreateBannerDto request);
    Task<bool> DeleteBannerAsync(int id);

    // Syarat Dokumen
    Task<List<SyaratDokumenDto>> GetSyaratDokumenListAsync(string? tipePenerima = null);
    Task<SyaratDokumenDto> CreateSyaratDokumenAsync(CreateSyaratDokumenDto request);
    Task<bool> DeleteSyaratDokumenAsync(int id);

    // Dokumen Penerima Upload & Verifikasi
    Task<List<DokumenPenerimaDto>> GetDokumenByPengajuanIdAsync(int pengajuanId);
    Task<DokumenPenerimaDto> SaveDokumenPenerimaAsync(int pengajuanId, int syaratId, string fileUrl, string namaFileAsli);
    Task<bool> VerifikasiDokumenAsync(VerifikasiDokumenDto request);

    // Helpdesk
    Task<List<HelpdeskTiketDto>> GetAllTiketAsync();
    Task<List<HelpdeskTiketDto>> GetTiketByUserIdAsync(int userId);
    Task<HelpdeskTiketDto> CreateTiketAsync(CreateHelpdeskTiketDto request, int userId);
    Task<bool> JawabTiketAsync(int tiketId, JawabHelpdeskTiketDto request, int adminUserId);
}
