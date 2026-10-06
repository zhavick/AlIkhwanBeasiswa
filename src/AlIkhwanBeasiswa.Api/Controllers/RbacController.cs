using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RbacController : ControllerBase
{
    private readonly IRbacService _rbacService;

    public RbacController(IRbacService rbacService)
    {
        _rbacService = rbacService;
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _rbacService.GetRolesAsync();
        return Ok(roles);
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> GetPermissions()
    {
        var permissions = await _rbacService.GetPermissionsAsync();
        return Ok(permissions);
    }

    [HttpPost("assign-role")]
    [Authorize(Policy = "CanManageRbac")]
    public async Task<IActionResult> AssignRole([FromBody] AssignUserRoleDto request)
    {
        var result = await _rbacService.AssignRolesToUserAsync(request);
        if (!result) return NotFound(new { message = "User tidak ditemukan." });
        return Ok(new { message = "Role berhasil diperbarui." });
    }

    [HttpPut("role-permissions")]
    [Authorize(Policy = "CanManageRbac")]
    public async Task<IActionResult> UpdateRolePermissions([FromBody] UpdateRolePermissionsDto request)
    {
        var result = await _rbacService.UpdateRolePermissionsAsync(request);
        if (!result) return NotFound(new { message = "Role tidak ditemukan." });
        return Ok(new { message = "Hak akses permission berhasil disimpan." });
    }
}
