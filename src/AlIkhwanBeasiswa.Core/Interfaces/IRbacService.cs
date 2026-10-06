using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IRbacService
{
    Task<List<RoleDetailDto>> GetRolesAsync();
    Task<List<PermissionDto>> GetPermissionsAsync();
    Task<bool> AssignRolesToUserAsync(AssignUserRoleDto request);
    Task<bool> UpdateRolePermissionsAsync(UpdateRolePermissionsDto request);
}
