using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IBeasiswaService
{
    // Periode
    Task<List<PeriodeBeasiswaDto>> GetAllPeriodeAsync();
    Task<PeriodeBeasiswaDto?> GetPeriodeAktifAsync();
    Task<PeriodeBeasiswaDto> CreatePeriodeAsync(CreatePeriodeDto request);
    Task<bool> TogglePeriodeStatusAsync(int periodeId);

    // Pengajuan
    Task<List<PengajuanBeasiswaListDto>> GetAllPengajuanAsync(int? periodeId = null, StatusPengajuan? status = null);
    Task<PengajuanBeasiswaDetailDto?> GetPengajuanByIdAsync(int id);
    Task<PengajuanBeasiswaDetailDto> SubmitPengajuanAsync(SubmitPengajuanBeasiswaDto request);

    // Approval
    Task<bool> ProcessApprovalAsync(int pengajuanId, ApprovalRequestDto request, int approverUserId);

    // Pencairan
    Task<PencairanDto> ProcessPencairanAsync(PencairanRequestDto request, int userId);
    Task<List<PencairanDto>> GetRiwayatPencairanAsync(int pengajuanId);
}
