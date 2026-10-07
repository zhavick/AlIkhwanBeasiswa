using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class PengurusService : IPengurusService
{
    private readonly AppDbContext _context;

    public PengurusService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PengurusDto>> GetAllPengurusAsync()
    {
        return await _context.Pengurus
            .Include(p => p.User)
                .ThenInclude(u => u!.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .OrderByDescending(p => p.PengurusId)
            .Select(p => new PengurusDto
            {
                PengurusId = p.PengurusId,
                UserId = p.UserId,
                Username = p.User != null ? p.User.Username : string.Empty,
                Nip = p.Nip,
                NamaLengkap = p.NamaLengkap,
                Gelar = p.Gelar,
                Jabatan = p.Jabatan,
                Divisi = p.Divisi,
                NoTelp = p.NoTelp,
                Email = p.Email,
                AlamatLengkap = p.AlamatLengkap,
                TanggalMulaiMenjabat = p.TanggalMulaiMenjabat,
                TanggalAkhirMenjabat = p.TanggalAkhirMenjabat,
                StatusAktif = p.StatusAktif,
                FotoProfilUrl = p.FotoProfilUrl,
                Roles = p.User != null ? p.User.UserRoles.Select(ur => ur.Role!.RoleName).ToList() : new List<string>(),
                RoleIds = p.User != null ? p.User.UserRoles.Select(ur => ur.RoleId).ToList() : new List<int>()
            })
            .ToListAsync();
    }

    public async Task<PengurusDto?> GetPengurusByIdAsync(int id)
    {
        var p = await _context.Pengurus
            .Include(p => p.User)
                .ThenInclude(u => u!.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(x => x.PengurusId == id);

        if (p == null) return null;

        return new PengurusDto
        {
            PengurusId = p.PengurusId,
            UserId = p.UserId,
            Username = p.User != null ? p.User.Username : string.Empty,
            Nip = p.Nip,
            NamaLengkap = p.NamaLengkap,
            Gelar = p.Gelar,
            Jabatan = p.Jabatan,
            Divisi = p.Divisi,
            NoTelp = p.NoTelp,
            Email = p.Email,
            AlamatLengkap = p.AlamatLengkap,
            TanggalMulaiMenjabat = p.TanggalMulaiMenjabat,
            TanggalAkhirMenjabat = p.TanggalAkhirMenjabat,
            StatusAktif = p.StatusAktif,
            FotoProfilUrl = p.FotoProfilUrl,
            Roles = p.User != null ? p.User.UserRoles.Select(ur => ur.Role!.RoleName).ToList() : new List<string>(),
            RoleIds = p.User != null ? p.User.UserRoles.Select(ur => ur.RoleId).ToList() : new List<int>()
        };
    }

    public async Task<PengurusDto> CreatePengurusAsync(CreatePengurusRequestDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
        {
            throw new InvalidOperationException("Email sudah digunakan.");
        }

        // 1. Buat User Akun
        var user = new AppUser
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 2. Hubungkan Roles
        foreach (var roleId in request.RoleIds)
        {
            _context.UserRoles.Add(new AppUserRole
            {
                UserId = user.UserId,
                RoleId = roleId
            });
        }

        // 3. Buat Profil Pengurus
        var pengurus = new AppPengurus
        {
            UserId = user.UserId,
            Nip = request.Nip,
            NamaLengkap = request.NamaLengkap,
            Gelar = request.Gelar,
            Jabatan = request.Jabatan,
            Divisi = request.Divisi,
            NoTelp = request.NoTelp,
            Email = request.Email,
            AlamatLengkap = request.AlamatLengkap,
            TanggalMulaiMenjabat = request.TanggalMulaiMenjabat.ToUniversalTime(),
            StatusAktif = true
        };
        _context.Pengurus.Add(pengurus);
        await _context.SaveChangesAsync();

        var createdRoleNames = await _context.Roles
            .Where(r => request.RoleIds.Contains(r.RoleId))
            .Select(r => r.RoleName)
            .ToListAsync();

        return new PengurusDto
        {
            PengurusId = pengurus.PengurusId,
            UserId = user.UserId,
            Username = user.Username,
            Nip = pengurus.Nip,
            NamaLengkap = pengurus.NamaLengkap,
            Gelar = pengurus.Gelar,
            Jabatan = pengurus.Jabatan,
            Divisi = pengurus.Divisi,
            NoTelp = pengurus.NoTelp,
            Email = pengurus.Email,
            AlamatLengkap = pengurus.AlamatLengkap,
            TanggalMulaiMenjabat = pengurus.TanggalMulaiMenjabat,
            StatusAktif = pengurus.StatusAktif,
            Roles = createdRoleNames,
            RoleIds = request.RoleIds
        };
    }

    public async Task<PengurusDto?> UpdatePengurusAsync(int id, UpdatePengurusRequestDto request)
    {
        var pengurus = await _context.Pengurus
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PengurusId == id);

        if (pengurus == null) return null;

        pengurus.Nip = request.Nip;
        pengurus.NamaLengkap = request.NamaLengkap;
        pengurus.Gelar = request.Gelar;
        pengurus.Jabatan = request.Jabatan;
        pengurus.Divisi = request.Divisi;
        pengurus.NoTelp = request.NoTelp;
        pengurus.Email = request.Email;
        pengurus.AlamatLengkap = request.AlamatLengkap;
        pengurus.TanggalMulaiMenjabat = request.TanggalMulaiMenjabat.ToUniversalTime();
        pengurus.TanggalAkhirMenjabat = request.TanggalAkhirMenjabat?.ToUniversalTime();
        pengurus.StatusAktif = request.StatusAktif;

        if (request.RoleIds != null)
        {
            var existingRoles = await _context.UserRoles
                .Where(ur => ur.UserId == pengurus.UserId)
                .ToListAsync();
            _context.UserRoles.RemoveRange(existingRoles);

            foreach (var roleId in request.RoleIds)
            {
                _context.UserRoles.Add(new AppUserRole
                {
                    UserId = pengurus.UserId,
                    RoleId = roleId
                });
            }
        }

        await _context.SaveChangesAsync();

        var updatedRoles = await _context.UserRoles
            .Where(ur => ur.UserId == pengurus.UserId)
            .Include(ur => ur.Role)
            .ToListAsync();

        return new PengurusDto
        {
            PengurusId = pengurus.PengurusId,
            UserId = pengurus.UserId,
            Username = pengurus.User?.Username ?? string.Empty,
            Nip = pengurus.Nip,
            NamaLengkap = pengurus.NamaLengkap,
            Gelar = pengurus.Gelar,
            Jabatan = pengurus.Jabatan,
            Divisi = pengurus.Divisi,
            NoTelp = pengurus.NoTelp,
            Email = pengurus.Email,
            AlamatLengkap = pengurus.AlamatLengkap,
            TanggalMulaiMenjabat = pengurus.TanggalMulaiMenjabat,
            TanggalAkhirMenjabat = pengurus.TanggalAkhirMenjabat,
            StatusAktif = pengurus.StatusAktif,
            Roles = updatedRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.RoleName).ToList(),
            RoleIds = updatedRoles.Select(ur => ur.RoleId).ToList()
        };
    }

    public async Task<bool> DeletePengurusAsync(int id)
    {
        var pengurus = await _context.Pengurus.FindAsync(id);
        if (pengurus == null) return false;

        _context.Pengurus.Remove(pengurus);
        var user = await _context.Users.FindAsync(pengurus.UserId);
        if (user != null)
        {
            _context.Users.Remove(user);
        }
        await _context.SaveChangesAsync();
        return true;
    }
}
