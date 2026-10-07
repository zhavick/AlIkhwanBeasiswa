using System.Security.Claims;
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
    private readonly IPenerimaService _penerimaService;

    public AlumniController(IKaderisasiAlumniService alumniService, IPenerimaService penerimaService)
    {
        _alumniService = alumniService;
        _penerimaService = penerimaService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAlumniAlias()
    {
        var list = await _alumniService.GetTracerListAsync();
        return Ok(list);
    }

    [HttpGet("tracer")]
    public async Task<IActionResult> GetTracerList()
    {
        var list = await _alumniService.GetTracerListAsync();
        return Ok(list);
    }

    [HttpGet("my-tracer")]
    public async Task<IActionResult> GetMyTracer()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var item = await _alumniService.GetTracerByUserIdAsync(userId);
        if (item == null) return NotFound(new { message = "Data tracer untuk akun alumni ini belum terdaftar." });
        return Ok(item);
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

    [HttpPost("update-karir")]
    public async Task<IActionResult> UpdateKarirAlias([FromBody] UpdateKarirRequestDto request)
    {
        int mhsId = request.MahasiswaId;
        if (mhsId == 0)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                var myTracer = await _alumniService.GetTracerByUserIdAsync(userId);
                if (myTracer != null) mhsId = myTracer.MahasiswaId;
            }
        }

        var updateDto = new UpdateAlumniTracerDto
        {
            NamaPerusahaan = request.InstansiKerja ?? request.NamaPerusahaan ?? string.Empty,
            BidangPekerjaan = request.BidangIndustri ?? request.BidangPekerjaan ?? string.Empty,
            Jabatan = request.PosisiJabatan ?? request.Jabatan ?? string.Empty,
            RentangGaji = request.GajiKisaran ?? request.RentangGaji,
            StatusPekerjaan = Core.Enums.StatusPekerjaan.KaryawanTetap,
            BulanBergabung = DateTime.UtcNow.Month,
            TahunBergabung = DateTime.UtcNow.Year,
            MasihBekerja = true
        };

        var success = await _alumniService.UpdateTracerAsync(mhsId, updateDto);
        return Ok(new { message = "Data karir & pekerjaan Anda berhasil diperbarui di sistem tracer!" });
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
        if (request.MahasiswaId == 0)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                var myTracer = await _alumniService.GetTracerByUserIdAsync(userId);
                if (myTracer != null) request.MahasiswaId = myTracer.MahasiswaId;
            }
        }

        var created = await _alumniService.AddKontribusiAsync(request);
        return Ok(created);
    }

    [HttpPost("luluskan-mahasiswa")]
    [Authorize(Policy = "CanManagePengurus")]
    public async Task<IActionResult> LuluskanMahasiswaAlias([FromBody] LuluskanMahasiswaActionDto request)
    {
        var success = await _penerimaService.LuluskanMahasiswaAsync(request.MahasiswaId, request.TanggalLulus);
        if (!success) return NotFound(new { message = "Mahasiswa tidak ditemukan." });
        return Ok(new { message = "Status mahasiswa berhasil diperbarui menjadi Lulus (Alumni) dan masuk ke database Tracer Karir." });
    }
}

public class UpdateKarirRequestDto : UpdateAlumniTracerDto
{
    public int MahasiswaId { get; set; }
    public string? InstansiKerja { get; set; }
    public string? PosisiJabatan { get; set; }
    public string? BidangIndustri { get; set; }
    public string? GajiKisaran { get; set; }
}

public class LuluskanMahasiswaActionDto
{
    public int MahasiswaId { get; set; }
    public DateTime TanggalLulus { get; set; } = DateTime.UtcNow;
}
