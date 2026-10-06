using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class RbacService : IRbacService
{
    private readonly AppDbContext _context;

    public RbacService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<RoleDetailDto>> GetRolesAsync()
    {
        return await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Select(r => new RoleDetailDto
            {
                RoleId = r.RoleId,
                RoleName = r.RoleName,
                Deskripsi = r.Deskripsi,
                Permissions = r.RolePermissions
                    .Where(rp => rp.Permission != null)
                    .Select(rp => new PermissionDto
                    {
                        PermissionId = rp.PermissionId,
                        PermissionCode = rp.Permission!.PermissionCode,
                        Modul = rp.Permission.Modul,
                        Deskripsi = rp.Permission.Deskripsi
                    }).ToList()
            })
            .ToListAsync();
    }

    public async Task<List<PermissionDto>> GetPermissionsAsync()
    {
        return await _context.Permissions
            .OrderBy(p => p.Modul)
            .ThenBy(p => p.PermissionCode)
            .Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionCode = p.PermissionCode,
                Modul = p.Modul,
                Deskripsi = p.Deskripsi
            })
            .ToListAsync();
    }

    public async Task<bool> AssignRolesToUserAsync(AssignUserRoleDto request)
    {
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null) return false;

        var existingRoles = await _context.UserRoles
            .Where(ur => ur.UserId == request.UserId)
            .ToListAsync();
        _context.UserRoles.RemoveRange(existingRoles);

        foreach (var roleId in request.RoleIds)
        {
            _context.UserRoles.Add(new AppUserRole
            {
                UserId = request.UserId,
                RoleId = roleId
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateRolePermissionsAsync(UpdateRolePermissionsDto request)
    {
        var role = await _context.Roles.FindAsync(request.RoleId);
        if (role == null) return false;

        var existingPermissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == request.RoleId)
            .ToListAsync();
        _context.RolePermissions.RemoveRange(existingPermissions);

        foreach (var permId in request.PermissionIds)
        {
            _context.RolePermissions.Add(new AppRolePermission
            {
                RoleId = request.RoleId,
                PermissionId = permId
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
