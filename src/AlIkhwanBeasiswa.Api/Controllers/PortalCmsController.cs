using System.Security.Claims;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/portal-cms")]
[Route("api/[controller]")]
public class PortalCmsController : ControllerBase
{
    private readonly IPortalCmsService _cmsService;
    private readonly IWebHostEnvironment _env;

    public PortalCmsController(IPortalCmsService cmsService, IWebHostEnvironment env)
    {
        _cmsService = cmsService;
        _env = env;
    }

    // --- PENGUMUMAN ---
    [HttpGet("pengumuman")]
    public async Task<IActionResult> GetPengumuman([FromQuery] bool all = false)
    {
        var list = await _cmsService.GetPengumumanListAsync(!all);
        return Ok(list);
    }

    [HttpGet("pengumuman/{slug}")]
    public async Task<IActionResult> GetPengumumanBySlug(string slug)
    {
        var item = await _cmsService.GetPengumumanBySlugAsync(slug);
        if (item == null) return NotFound(new { message = "Pengumuman tidak ditemukan." });
        return Ok(item);
    }

    [HttpPost("pengumuman")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> CreatePengumuman([FromBody] CreatePengumumanDto request)
    {
        var userId = GetCurrentUserId();
        var item = await _cmsService.CreatePengumumanAsync(request, userId);
        return Ok(item);
    }

    [HttpPut("pengumuman/{id}")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> UpdatePengumuman(int id, [FromBody] UpdatePengumumanDto request)
    {
        var item = await _cmsService.UpdatePengumumanAsync(id, request);
        if (item == null) return NotFound(new { message = "Pengumuman tidak ditemukan." });
        return Ok(item);
    }

    [HttpDelete("pengumuman/{id}")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> DeletePengumuman(int id)
    {
        var success = await _cmsService.DeletePengumumanAsync(id);
        if (!success) return NotFound(new { message = "Pengumuman tidak ditemukan." });
        return Ok(new { message = "Pengumuman berhasil dihapus." });
    }

    // --- BANNER ---
    [HttpGet("banner")]
    public async Task<IActionResult> GetBanner([FromQuery] bool all = false)
    {
        var list = await _cmsService.GetBannerListAsync(!all);
        return Ok(list);
    }

    [HttpGet("banners")]
    public async Task<IActionResult> GetBannersAlias([FromQuery] bool all = false)
    {
        return await GetBanner(all);
    }

    [HttpPost("banner")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> CreateBanner([FromBody] CreateBannerDto request)
    {
        var created = await _cmsService.CreateBannerAsync(request);
        return Ok(created);
    }

    [HttpDelete("banner/{id}")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> DeleteBanner(int id)
    {
        var success = await _cmsService.DeleteBannerAsync(id);
        if (!success) return NotFound(new { message = "Banner tidak ditemukan." });
        return Ok(new { message = "Banner berhasil dihapus." });
    }

    // --- SYARAT DOKUMEN ---
    [HttpGet("syarat-dokumen")]
    public async Task<IActionResult> GetSyaratDokumen([FromQuery] string? tipePenerima)
    {
        var list = await _cmsService.GetSyaratDokumenListAsync(tipePenerima);
        return Ok(list);
    }

    [HttpPost("syarat-dokumen")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> CreateSyaratDokumen([FromBody] CreateSyaratDokumenDto request)
    {
        var created = await _cmsService.CreateSyaratDokumenAsync(request);
        return Ok(created);
    }

    [HttpDelete("syarat-dokumen/{id}")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> DeleteSyaratDokumen(int id)
    {
        var success = await _cmsService.DeleteSyaratDokumenAsync(id);
        if (!success) return NotFound(new { message = "Syarat dokumen tidak ditemukan." });
        return Ok(new { message = "Syarat dokumen berhasil dihapus." });
    }

    // --- FILE UPLOAD & DOKUMEN PENERIMA ---
    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "File tidak boleh kosong." });
        }

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/{fileName}";
        return Ok(new { fileUrl, originalName = file.FileName });
    }

    [HttpPost("pengajuan/{pengajuanId}/dokumen")]
    [Authorize]
    public async Task<IActionResult> SaveDokumenPenerima(int pengajuanId, [FromBody] SaveDokumenRequestDto request)
    {
        var doc = await _cmsService.SaveDokumenPenerimaAsync(pengajuanId, request.SyaratId, request.FileUrl, request.NamaFileAsli);
        return Ok(doc);
    }

    [HttpGet("pengajuan/{pengajuanId}/dokumen")]
    [Authorize]
    public async Task<IActionResult> GetDokumenPengajuan(int pengajuanId)
    {
        var list = await _cmsService.GetDokumenByPengajuanIdAsync(pengajuanId);
        return Ok(list);
    }

    [HttpPost("dokumen/verifikasi")]
    [Authorize(Policy = "CanVerifyBeasiswa")]
    public async Task<IActionResult> VerifikasiDokumen([FromBody] VerifikasiDokumenDto request)
    {
        var success = await _cmsService.VerifikasiDokumenAsync(request);
        if (!success) return NotFound(new { message = "Dokumen tidak ditemukan." });
        return Ok(new { message = $"Status dokumen diperbarui menjadi {request.StatusVerifikasi}." });
    }

    // --- HELPDESK TIKET ---
    [HttpGet("helpdesk")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> GetAllHelpdesk()
    {
        var list = await _cmsService.GetAllTiketAsync();
        return Ok(list);
    }

    [HttpGet("helpdesk/semua")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> GetAllHelpdeskAlias()
    {
        return await GetAllHelpdesk();
    }

    [HttpGet("helpdesk/my")]
    [Authorize]
    public async Task<IActionResult> GetMyHelpdesk()
    {
        var userId = GetCurrentUserId();
        var list = await _cmsService.GetTiketByUserIdAsync(userId);
        return Ok(list);
    }

    [HttpPost("helpdesk")]
    [Authorize]
    public async Task<IActionResult> CreateHelpdesk([FromBody] CreateHelpdeskTiketDto request)
    {
        var userId = GetCurrentUserId();
        var tiket = await _cmsService.CreateTiketAsync(request, userId);
        return Ok(tiket);
    }

    [HttpPost("helpdesk/tiket")]
    [Authorize]
    public async Task<IActionResult> CreateHelpdeskAlias([FromBody] CreateHelpdeskTiketDto request)
    {
        return await CreateHelpdesk(request);
    }

    [HttpPost("helpdesk/{id}/jawab")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> JawabHelpdesk(int id, [FromBody] JawabHelpdeskTiketDto request)
    {
        var adminUserId = GetCurrentUserId();
        var success = await _cmsService.JawabTiketAsync(id, request, adminUserId);
        if (!success) return NotFound(new { message = "Tiket helpdesk tidak ditemukan." });
        return Ok(new { message = "Jawaban berhasil dikirim ke penerima." });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return int.TryParse(userIdClaim, out var id) ? id : 0;
    }
}

public class SaveDokumenRequestDto
{
    public int SyaratId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string NamaFileAsli { get; set; } = string.Empty;
}
