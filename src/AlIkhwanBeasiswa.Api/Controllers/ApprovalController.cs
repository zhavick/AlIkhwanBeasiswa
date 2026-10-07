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

    [HttpGet("queue")]
    public async Task<IActionResult> GetApprovalQueue()
    {
        var all = await _beasiswaService.GetAllPengajuanAsync();
        var pending = all
            .Where(p => p.StatusPengajuan == StatusPengajuan.Diajukan || p.StatusPengajuan == StatusPengajuan.Verifikasi)
            .Select(p => new
            {
                pengajuanId = p.PengajuanId,
                nomorPengajuan = $"REG-{p.PeriodeId:D4}-{p.PengajuanId:D4}",
                namaPenerima = p.NamaPenerima,
                institusi = p.InstitusiPendidikan,
                namaPeriode = p.NamaPeriode,
                tipePenerima = (int)p.TipePenerima,
                nominalDiajukan = p.PaguBeasiswa,
                nominalTertanggung = p.PaguTertanggung,
                currentApprovalStage = Math.Min(3, p.CurrentApprovalLevel + 1),
                nextApproverRole = (p.CurrentApprovalLevel + 1) switch
                {
                    1 => "Verifikator Administrasi",
                    2 => "Koordinator Beasiswa",
                    _ => "Pimpinan Yayasan"
                },
                statusPengajuan = p.StatusPengajuan.ToString()
            })
            .ToList();

        return Ok(pending);
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessApproval([FromBody] ApprovalProcessGenericDto request)
    {
        var detail = await _beasiswaService.GetPengajuanByIdAsync(request.PengajuanId);
        if (detail == null) return NotFound(new { message = "Pengajuan beasiswa tidak ditemukan." });

        int stage = request.Tahap.HasValue && request.Tahap.Value >= 1 && request.Tahap.Value <= 3
            ? request.Tahap.Value
            : Math.Min(3, detail.RiwayatApproval.Count(a => a.StatusApproval == StatusApproval.Approved) + 1);

        var tingkat = stage switch
        {
            1 => TingkatApproval.VerifikatorAdministrasi,
            2 => TingkatApproval.KoordinatorBeasiswa,
            _ => TingkatApproval.PimpinanYayasan
        };

        var status = request.Decision?.Trim().ToLowerInvariant() switch
        {
            "reject" or "ditolak" => StatusApproval.Rejected,
            "requestrevision" or "revisi" => StatusApproval.Revisi,
            _ => StatusApproval.Approved
        };

        var approvalRequest = new ApprovalRequestDto
        {
            TingkatApproval = tingkat,
            StatusApproval = status,
            CatatanApproval = request.Catatan,
            PaguTertanggungDisetujui = request.PaguTertanggungDisetujui
        };

        return await ExecuteApproval(request.PengajuanId, approvalRequest);
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
