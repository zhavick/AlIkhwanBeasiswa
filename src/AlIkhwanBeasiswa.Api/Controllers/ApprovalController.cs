using System.Security.Claims;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApprovalController : ControllerBase
{
    private readonly IBeasiswaService _beasiswaService;

    public ApprovalController(IBeasiswaService beasiswaService)
    {
        _beasiswaService = beasiswaService;
    }

    [HttpPost("pengajuan/{pengajuanId}/tahap-1")]
    [Authorize(Policy = "CanApproveTahap1")]
    public async Task<IActionResult> ApproveTahap1(int pengajuanId, [FromBody] ApprovalRequestDto request)
    {
        request.TingkatApproval = TingkatApproval.VerifikatorAdministrasi;
        return await ExecuteApproval(pengajuanId, request);
    }

    [HttpPost("pengajuan/{pengajuanId}/tahap-2")]
    [Authorize(Policy = "CanApproveTahap2")]
    public async Task<IActionResult> ApproveTahap2(int pengajuanId, [FromBody] ApprovalRequestDto request)
    {
        request.TingkatApproval = TingkatApproval.KoordinatorBeasiswa;
        return await ExecuteApproval(pengajuanId, request);
    }

    [HttpPost("pengajuan/{pengajuanId}/tahap-3")]
    [Authorize(Policy = "CanApproveTahap3")]
    public async Task<IActionResult> ApproveTahap3(int pengajuanId, [FromBody] ApprovalRequestDto request)
    {
        request.TingkatApproval = TingkatApproval.PimpinanYayasan;
        return await ExecuteApproval(pengajuanId, request);
    }

    private async Task<IActionResult> ExecuteApproval(int pengajuanId, ApprovalRequestDto request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var result = await _beasiswaService.ProcessApprovalAsync(pengajuanId, request, userId);
        if (!result) return NotFound(new { message = "Pengajuan beasiswa tidak ditemukan." });

        return Ok(new { message = $"Approval {request.TingkatApproval} berhasil diproses dengan status {request.StatusApproval}." });
    }
}
