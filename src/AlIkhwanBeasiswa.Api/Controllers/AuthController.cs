using System.Security.Claims;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
        {
            return Unauthorized(new { message = "Username, email, atau password salah." });
        }
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var profile = await _authService.GetUserProfileAsync(userId);
        if (profile == null)
        {
            return NotFound(new { message = "Data pengguna tidak ditemukan." });
        }

        return Ok(profile);
    }

    [HttpPost("register-penerima")]
    public async Task<IActionResult> RegisterPenerima([FromBody] RegisterPenerimaDto request)
    {
        try
        {
            var result = await _authService.RegisterPenerimaAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Terjadi kesalahan pada server.", detail = ex.Message });
        }
    }
}
