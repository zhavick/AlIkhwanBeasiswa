using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SiswaController : ControllerBase
{
    private readonly IPenerimaService _penerimaService;

    public SiswaController(IPenerimaService penerimaService)
    {
        _penerimaService = penerimaService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _penerimaService.GetAllSiswaAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var siswa = await _penerimaService.GetSiswaByIdAsync(id);
        if (siswa == null) return NotFound(new { message = "Data siswa tidak ditemukan." });
        return Ok(siswa);
    }

    [HttpPost("nilai")]
    public async Task<IActionResult> InputNilai([FromBody] InputNilaiSekolahDto request)
    {
        var result = await _penerimaService.InputNilaiSekolahAsync(request);
        return Ok(result);
    }
}
