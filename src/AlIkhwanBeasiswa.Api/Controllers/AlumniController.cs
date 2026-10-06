using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlumniController : ControllerBase
{
    private readonly IKaderisasiAlumniService _alumniService;

    public AlumniController(IKaderisasiAlumniService alumniService)
    {
        _alumniService = alumniService;
    }

    [HttpGet("tracer")]
    public async Task<IActionResult> GetTracerList()
    {
        var list = await _alumniService.GetTracerListAsync();
        return Ok(list);
    }

    [HttpGet("tracer/{mahasiswaId}")]
    public async Task<IActionResult> GetTracerByMahasiswaId(int mahasiswaId)
    {
        var item = await _alumniService.GetTracerByMahasiswaIdAsync(mahasiswaId);
        if (item == null) return NotFound(new { message = "Data tracer alumni tidak ditemukan." });
        return Ok(item);
    }

    [HttpPut("tracer/{mahasiswaId}")]
    public async Task<IActionResult> UpdateTracer(int mahasiswaId, [FromBody] UpdateAlumniTracerDto request)
    {
        var success = await _alumniService.UpdateTracerAsync(mahasiswaId, request);
        return Ok(new { message = "Riwayat karir pekerjaan alumni berhasil diperbarui." });
    }

    [HttpGet("statistik")]
    public async Task<IActionResult> GetStatistik()
    {
        var stats = await _alumniService.GetStatistikAlumniAsync();
        return Ok(stats);
    }

    [HttpGet("kontribusi")]
    public async Task<IActionResult> GetKontribusiList()
    {
        var list = await _alumniService.GetKontribusiListAsync();
        return Ok(list);
    }

    [HttpPost("kontribusi")]
    public async Task<IActionResult> AddKontribusi([FromBody] CreateAlumniKontribusiDto request)
    {
        var created = await _alumniService.AddKontribusiAsync(request);
        return Ok(created);
    }
}
