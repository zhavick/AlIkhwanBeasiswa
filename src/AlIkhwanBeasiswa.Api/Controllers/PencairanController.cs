using System.Security.Claims;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PencairanController : ControllerBase
{
    private readonly IBeasiswaService _beasiswaService;

    public PencairanController(IBeasiswaService beasiswaService)
    {
        _beasiswaService = beasiswaService;
    }

    [HttpPost]
    [Authorize(Policy = "CanDisburse")]
    public async Task<IActionResult> ProcessPencairan([FromBody] PencairanRequestDto request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _beasiswaService.ProcessPencairanAsync(request, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("pengajuan/{pengajuanId}")]
    public async Task<IActionResult> GetRiwayat(int pengajuanId)
    {
        var list = await _beasiswaService.GetRiwayatPencairanAsync(pengajuanId);
        return Ok(list);
    }
}
