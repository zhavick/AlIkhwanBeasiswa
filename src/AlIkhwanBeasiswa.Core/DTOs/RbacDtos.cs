namespace AlIkhwanBeasiswa.Core.DTOs;

public class RoleDetailDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class PermissionDto
{
    public int PermissionId { get; set; }
    public string PermissionCode { get; set; } = string.Empty;
    public string Modul { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
}

public class AssignUserRoleDto
{
    public int UserId { get; set; }
    public List<int> RoleIds { get; set; } = new();
}

public class UpdateRolePermissionsDto
{
    public int RoleId { get; set; }
    public List<int> PermissionIds { get; set; } = new();
}
