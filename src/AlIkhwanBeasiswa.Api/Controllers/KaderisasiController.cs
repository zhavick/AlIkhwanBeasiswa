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

    [HttpPost("kegiatan")]
    public async Task<IActionResult> CreateKegiatan([FromBody] CreateKegiatanDto request)
    {
        var created = await _kaderisasiService.CreateKegiatanAsync(request);
        return Ok(created);
    }

    [HttpPost("presensi")]
    public async Task<IActionResult> RecordPresensi([FromBody] InputPresensiDto request)
    {
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
