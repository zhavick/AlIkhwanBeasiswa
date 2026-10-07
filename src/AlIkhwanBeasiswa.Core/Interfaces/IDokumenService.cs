using System.Threading.Tasks;
using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IDokumenService
{
    Task<KwitansiPencairanDto?> GetKwitansiPencairanAsync(int pencairanId);
    Task<SuratKeteranganBeasiswaDto?> GetSuratKeteranganBeasiswaAsync(int pengajuanId);
    Task<VerifikasiDokumenResponseDto> VerifikasiDokumenAsync(string kodeVerifikasi);
}
