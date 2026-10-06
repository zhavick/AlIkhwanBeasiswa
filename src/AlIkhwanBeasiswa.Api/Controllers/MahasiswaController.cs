using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MahasiswaController : ControllerBase
{
    private readonly IPenerimaService _penerimaService;

    public MahasiswaController(IPenerimaService penerimaService)
    {
        _penerimaService = penerimaService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _penerimaService.GetAllMahasiswaAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var mhs = await _penerimaService.GetMahasiswaByIdAsync(id);
        if (mhs == null) return NotFound(new { message = "Data mahasiswa tidak ditemukan." });
        return Ok(mhs);
    }

    [HttpPost("nilai")]
    public async Task<IActionResult> InputNilai([FromBody] InputNilaiUnivDto request)
    {
        var result = await _penerimaService.InputNilaiUnivAsync(request);
        return Ok(result);
    }

    [HttpPost("{id}/luluskan")]
    [Authorize(Policy = "CanManagePengurus")]
    public async Task<IActionResult> LuluskanMahasiswa(int id, [FromBody] LuluskanRequestDto request)
    {
        var success = await _penerimaService.LuluskanMahasiswaAsync(id, request.TanggalLulus);
        if (!success) return NotFound(new { message = "Mahasiswa tidak ditemukan." });
        return Ok(new { message = "Status mahasiswa berhasil diperbarui menjadi Lulus (Alumni) dan masuk ke database Tracer Karir." });
    }
}

public class LuluskanRequestDto
{
    public DateTime TanggalLulus { get; set; } = DateTime.UtcNow;
}
