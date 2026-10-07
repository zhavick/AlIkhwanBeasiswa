using System.Security.Claims;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KaderisasiController : ControllerBase
{
    private readonly IKaderisasiAlumniService _kaderisasiService;

    public KaderisasiController(IKaderisasiAlumniService kaderisasiService)
    {
        _kaderisasiService = kaderisasiService;
    }

    [HttpGet("kader")]
    public async Task<IActionResult> GetKaderList()
    {
        var list = await _kaderisasiService.GetKaderListAsync();
        return Ok(list);
    }

    [HttpGet("my-profil")]
    public async Task<IActionResult> GetMyProfil()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var kader = await _kaderisasiService.GetKaderByUserIdAsync(userId);
        if (kader == null) return NotFound(new { message = "Profil kader untuk user ini belum terdaftar." });
        return Ok(kader);
    }

    [HttpGet("kader/{mahasiswaId}")]
    public async Task<IActionResult> GetKaderById(int mahasiswaId)
    {
        var kader = await _kaderisasiService.GetKaderByMahasiswaIdAsync(mahasiswaId);
        if (kader == null) return NotFound(new { message = "Profil kader tidak ditemukan." });
        return Ok(kader);
    }

    [HttpPut("kader/{mahasiswaId}")]
    public async Task<IActionResult> UpdateKaderProfil(int mahasiswaId, [FromBody] UpdateKaderisasiProfilDto request)
    {
        var success = await _kaderisasiService.UpdateKaderProfilAsync(mahasiswaId, request);
        if (!success) return NotFound(new { message = "Profil kader tidak ditemukan." });
        return Ok(new { message = "Profil kader berhasil diperbarui." });
    }

    [HttpGet("kegiatan")]
    public async Task<IActionResult> GetAllKegiatan()
    {
        var list = await _kaderisasiService.GetAllKegiatanAsync();
        return Ok(list);
    }

    [HttpGet("agenda")]
    public async Task<IActionResult> GetAllAgendaAlias()
    {
        return await GetAllKegiatan();
    }

    [HttpPost("kegiatan")]
    public async Task<IActionResult> CreateKegiatan([FromBody] CreateKegiatanDto request)
    {
        var created = await _kaderisasiService.CreateKegiatanAsync(request);
        return Ok(created);
    }

    [HttpPost("agenda")]
    public async Task<IActionResult> CreateAgendaAlias([FromBody] CreateKegiatanDto request)
    {
        return await CreateKegiatan(request);
    }

    [HttpPost("presensi")]
    public async Task<IActionResult> RecordPresensi([FromBody] InputPresensiDto request)
    {
        if (request.MahasiswaId == 0)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                var kader = await _kaderisasiService.GetKaderByUserIdAsync(userId);
                if (kader != null)
                {
                    request.MahasiswaId = kader.MahasiswaId;
                }
            }
        }

        var result = await _kaderisasiService.RecordPresensiAsync(request);
        return Ok(new { message = "Presensi kehadiran berhasil disimpan." });
    }

    [HttpGet("kegiatan/{kegiatanId}/presensi")]
    public async Task<IActionResult> GetPresensiKegiatan(int kegiatanId)
    {
        var list = await _kaderisasiService.GetPresensiKegiatanAsync(kegiatanId);
        return Ok(list);
    }
}
