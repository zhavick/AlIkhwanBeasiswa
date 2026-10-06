namespace AlIkhwanBeasiswa.Core.Entities;

public class AppRole
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }

    public ICollection<AppRolePermission> RolePermissions { get; set; } = new List<AppRolePermission>();
    public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
}

public class AppPermission
{
    public int PermissionId { get; set; }
    public string PermissionCode { get; set; } = string.Empty;
    public string Modul { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }

    public ICollection<AppRolePermission> RolePermissions { get; set; } = new List<AppRolePermission>();
}

public class AppRolePermission
{
    public int RoleId { get; set; }
    public AppRole? Role { get; set; }

    public int PermissionId { get; set; }
    public AppPermission? Permission { get; set; }
}

public class AppUserRole
{
    public int UserId { get; set; }
    public AppUser? User { get; set; }

    public int RoleId { get; set; }
    public AppRole? Role { get; set; }
}

public class AppUserProfile
{
    public int ProfileLinkId { get; set; }
    public int UserId { get; set; }
    public AppUser? User { get; set; }

    public int? SiswaId { get; set; }
    public IkhwanSiswa? Siswa { get; set; }

    public int? MahasiswaId { get; set; }
    public IkhwanMahasiswa? Mahasiswa { get; set; }
}
