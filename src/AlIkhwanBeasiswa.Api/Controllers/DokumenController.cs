using System.Threading.Tasks;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DokumenController : ControllerBase
{
    private readonly IDokumenService _dokumenService;

    public DokumenController(IDokumenService dokumenService)
    {
        _dokumenService = dokumenService;
    }

    [HttpGet("kwitansi/{pencairanId}")]
    [Authorize]
    public async Task<IActionResult> GetKwitansi(int pencairanId)
    {
        var kwitansi = await _dokumenService.GetKwitansiPencairanAsync(pencairanId);
        if (kwitansi == null)
            return NotFound(new { message = "Data pencairan dana beasiswa tidak ditemukan." });

        return Ok(kwitansi);
    }

    [HttpGet("sk/{pengajuanId}")]
    [Authorize]
    public async Task<IActionResult> GetSuratKeterangan(int pengajuanId)
    {
        var sk = await _dokumenService.GetSuratKeteranganBeasiswaAsync(pengajuanId);
        if (sk == null)
            return NotFound(new { message = "Data penetapan SK beasiswa tidak ditemukan." });

        return Ok(sk);
    }

    [HttpGet("verifikasi/{kodeVerifikasi}")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifikasiDokumen(string kodeVerifikasi)
    {
        var result = await _dokumenService.VerifikasiDokumenAsync(kodeVerifikasi);
        if (!result.IsValid)
            return NotFound(result);

        return Ok(result);
    }
}
