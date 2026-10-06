using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlIkhwanBeasiswa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PengurusController : ControllerBase
{
    private readonly IPengurusService _pengurusService;

    public PengurusController(IPengurusService pengurusService)
    {
        _pengurusService = pengurusService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _pengurusService.GetAllPengurusAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _pengurusService.GetPengurusByIdAsync(id);
        if (item == null) return NotFound(new { message = "Data pengurus tidak ditemukan." });
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Policy = "CanManagePengurus")]
    public async Task<IActionResult> Create([FromBody] CreatePengurusRequestDto request)
    {
        try
        {
            var created = await _pengurusService.CreatePengurusAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.PengurusId }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "CanManagePengurus")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePengurusRequestDto request)
    {
        var updated = await _pengurusService.UpdatePengurusAsync(id, request);
        if (updated == null) return NotFound(new { message = "Data pengurus tidak ditemukan." });
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "CanManagePengurus")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _pengurusService.DeletePengurusAsync(id);
        if (!success) return NotFound(new { message = "Data pengurus tidak ditemukan." });
        return Ok(new { message = "Pengurus berhasil dihapus." });
    }
}
