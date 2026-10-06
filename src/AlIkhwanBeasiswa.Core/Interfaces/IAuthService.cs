using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    Task<UserProfileDto?> GetUserProfileAsync(int userId);
    Task<LoginResponseDto> RegisterPenerimaAsync(RegisterPenerimaDto request);
}
