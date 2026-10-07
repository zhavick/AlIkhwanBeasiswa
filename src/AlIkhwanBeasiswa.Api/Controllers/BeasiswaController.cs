using System.Security.Claims;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BeasiswaController : ControllerBase
{
    private readonly IBeasiswaService _beasiswaService;

    public BeasiswaController(IBeasiswaService beasiswaService)
    {
        _beasiswaService = beasiswaService;
    }

    // --- PERIODE ENDPOINTS ---
    [HttpGet("periode")]
    public async Task<IActionResult> GetAllPeriode()
    {
        var list = await _beasiswaService.GetAllPeriodeAsync();
        return Ok(list);
    }

    [HttpGet("periode/aktif")]
    public async Task<IActionResult> GetPeriodeAktif()
    {
        var aktif = await _beasiswaService.GetPeriodeAktifAsync();
        if (aktif == null) return NotFound(new { message = "Tidak ada periode beasiswa yang aktif saat ini." });
        return Ok(aktif);
    }

    [HttpGet("periode-aktif")]
    public async Task<IActionResult> GetPeriodeAktifList()
    {
        var aktif = await _beasiswaService.GetPeriodeAktifAsync();
        if (aktif == null) return Ok(new List<PeriodeBeasiswaDto>());
        return Ok(new List<PeriodeBeasiswaDto> { aktif });
    }

    [HttpPost("periode")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> CreatePeriode([FromBody] CreatePeriodeDto request)
    {
        var created = await _beasiswaService.CreatePeriodeAsync(request);
        return Ok(created);
    }

    [HttpPatch("periode/{id}/toggle-status")]
    [Authorize(Policy = "CanManagePortal")]
    public async Task<IActionResult> TogglePeriodeStatus(int id)
    {
        var success = await _beasiswaService.TogglePeriodeStatusAsync(id);
        if (!success) return NotFound(new { message = "Periode beasiswa tidak ditemukan." });
        return Ok(new { message = "Status periode berhasil diperbarui." });
    }

    // --- PENGAJUAN ENDPOINTS ---
    [HttpGet("pengajuan")]
    [Authorize]
    public async Task<IActionResult> GetAllPengajuan([FromQuery] int? periodeId, [FromQuery] StatusPengajuan? status)
    {
        var list = await _beasiswaService.GetAllPengajuanAsync(periodeId, status);
        return Ok(list);
    }

    [HttpGet("my-pengajuan")]
    [Authorize]
    public async Task<IActionResult> GetMyPengajuan()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var list = await _beasiswaService.GetPengajuanByUserIdAsync(userId);
        return Ok(list);
    }

    [HttpGet("penerima/{penerimaId}")]
    [Authorize]
    public async Task<IActionResult> GetPengajuanByPenerimaId(int penerimaId)
    {
        var list = await _beasiswaService.GetPengajuanByPenerimaAsync(penerimaId, penerimaId);
        return Ok(list);
    }

    [HttpGet("pengajuan/{id}")]
    [Authorize]
    public async Task<IActionResult> GetPengajuanById(int id)
    {
        var item = await _beasiswaService.GetPengajuanByIdAsync(id);
        if (item == null) return NotFound(new { message = "Pengajuan beasiswa tidak ditemukan." });
        return Ok(item);
    }

    [HttpPost("pengajuan")]
    [Authorize]
    public async Task<IActionResult> SubmitPengajuan([FromBody] SubmitPengajuanBeasiswaDto request)
    {
        try
        {
            var created = await _beasiswaService.SubmitPengajuanAsync(request);
            return Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("ajukan")]
    [Authorize]
    public async Task<IActionResult> AjukanAlias([FromBody] SubmitPengajuanBeasiswaDto request)
    {
        return await SubmitPengajuan(request);
    }
}
