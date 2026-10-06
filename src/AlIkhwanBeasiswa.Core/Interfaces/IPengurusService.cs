using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IPengurusService
{
    Task<List<PengurusDto>> GetAllPengurusAsync();
    Task<PengurusDto?> GetPengurusByIdAsync(int id);
    Task<PengurusDto> CreatePengurusAsync(CreatePengurusRequestDto request);
    Task<PengurusDto?> UpdatePengurusAsync(int id, UpdatePengurusRequestDto request);
    Task<bool> DeletePengurusAsync(int id);
}
