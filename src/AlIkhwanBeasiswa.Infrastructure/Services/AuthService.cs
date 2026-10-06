using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var identifier = request.UsernameOrEmail.Trim().ToLower();

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.PengurusProfile)
            .Include(u => u.RecipientProfile)
                .ThenInclude(rp => rp!.Siswa)
            .Include(u => u.RecipientProfile)
                .ThenInclude(rp => rp!.Mahasiswa)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == identifier || u.Email.ToLower() == identifier);

        if (user == null || !user.IsActive)
        {
            return null;
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return null;
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.RoleName)
            .ToList();

        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();

        var permissions = await _context.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Include(rp => rp.Permission)
            .Where(rp => rp.Permission != null)
            .Select(rp => rp.Permission!.PermissionCode)
            .Distinct()
            .ToListAsync();

        string? profileType = null;
        int? profileId = null;
        string namaLengkap = user.Username;

        if (user.PengurusProfile != null)
        {
            profileType = "Pengurus";
            profileId = user.PengurusProfile.PengurusId;
            namaLengkap = user.PengurusProfile.NamaLengkap;
        }
        else if (user.RecipientProfile?.Mahasiswa != null)
        {
            profileType = "Mahasiswa";
            profileId = user.RecipientProfile.MahasiswaId;
            namaLengkap = user.RecipientProfile.Mahasiswa.NamaMahasiswa;
        }
        else if (user.RecipientProfile?.Siswa != null)
        {
            profileType = "Siswa";
            profileId = user.RecipientProfile.SiswaId;
            namaLengkap = user.RecipientProfile.Siswa.NamaSiswa;
        }

        var token = GenerateJwtToken(user, roles, permissions, profileType, profileId);

        return new LoginResponseDto
        {
            Token = token,
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            NamaLengkap = namaLengkap,
            Roles = roles,
            Permissions = permissions,
            ProfileType = profileType,
            ProfileId = profileId
        };
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.PengurusProfile)
            .Include(u => u.RecipientProfile)
                .ThenInclude(rp => rp!.Siswa)
            .Include(u => u.RecipientProfile)
                .ThenInclude(rp => rp!.Mahasiswa)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return null;

        var roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.RoleName)
            .ToList();

        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();

        var permissions = await _context.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Include(rp => rp.Permission)
            .Where(rp => rp.Permission != null)
            .Select(rp => rp.Permission!.PermissionCode)
            .Distinct()
            .ToListAsync();

        string? profileType = null;
        int? profileId = null;
        string namaLengkap = user.Username;

        if (user.PengurusProfile != null)
        {
            profileType = "Pengurus";
            profileId = user.PengurusProfile.PengurusId;
            namaLengkap = user.PengurusProfile.NamaLengkap;
        }
        else if (user.RecipientProfile?.Mahasiswa != null)
        {
            profileType = "Mahasiswa";
            profileId = user.RecipientProfile.MahasiswaId;
            namaLengkap = user.RecipientProfile.Mahasiswa.NamaMahasiswa;
        }
        else if (user.RecipientProfile?.Siswa != null)
        {
            profileType = "Siswa";
            profileId = user.RecipientProfile.SiswaId;
            namaLengkap = user.RecipientProfile.Siswa.NamaSiswa;
        }

        return new UserProfileDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            NamaLengkap = namaLengkap,
            Roles = roles,
            Permissions = permissions,
            ProfileType = profileType,
            ProfileId = profileId
        };
    }

    public async Task<LoginResponseDto> RegisterPenerimaAsync(RegisterPenerimaDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
        {
            throw new InvalidOperationException("Email sudah terdaftar.");
        }

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower()))
        {
            throw new InvalidOperationException("Username sudah digunakan.");
        }

        // 1. Simpan Data Orang Tua
        var orangTua = new IkhwanOrangTua
        {
            NamaAyah = request.NamaAyah,
            NamaIbu = request.NamaIbu,
            PekerjaanAyah = request.PekerjaanAyah,
            PekerjaanIbu = request.PekerjaanIbu,
            TelahMeninggalAyah = request.TelahMeninggalAyah,
            TelahMeninggalIbu = request.TelahMeninggalIbu,
            NoTelpAyah = request.NoTelp,
            EmailAyah = request.Email
        };
        _context.OrangTua.Add(orangTua);
        await _context.SaveChangesAsync();

        // 2. Simpan Data User
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

        // 3. Simpan Entitas Siswa atau Mahasiswa
        int? siswaId = null;
        int? mahasiswaId = null;
        string roleToAssign = request.TipePenerima == TipePenerima.Siswa ? "Siswa" : "Mahasiswa";

        if (request.TipePenerima == TipePenerima.Siswa)
        {
            var siswa = new IkhwanSiswa
            {
                OrangTuaId = orangTua.OrangTuaId,
                NamaSiswa = request.NamaLengkap,
                TempatLahir = request.TempatLahir,
                TanggalLahir = request.TanggalLahir.ToUniversalTime(),
                AlamatLengkap = request.AlamatLengkap,
                NoTelp = request.NoTelp,
                Email = request.Email
            };
            _context.Siswa.Add(siswa);
            await _context.SaveChangesAsync();
            siswaId = siswa.SiswaId;

            // Tambahkan Riwayat Sekolah Awal
            _context.PendidikanSekolah.Add(new IkhwanPendidikan
            {
                SiswaId = siswa.SiswaId,
                NamaSekolah = request.InstitusiPendidikan,
                AlamatSekolah = request.AlamatLengkap,
                Jenjang = request.Jenjang,
                TanggalMasuk = DateTime.UtcNow,
                MasihDalamPendidikan = true
            });
            await _context.SaveChangesAsync();
        }
        else
        {
            var mahasiswa = new IkhwanMahasiswa
            {
                OrangTuaId = orangTua.OrangTuaId,
                NamaMahasiswa = request.NamaLengkap,
                TempatLahir = request.TempatLahir,
                TanggalLahir = request.TanggalLahir.ToUniversalTime(),
                AlamatLengkap = request.AlamatLengkap,
                NoTelp = request.NoTelp,
                Email = request.Email,
                CalonKaderisasi = true,
                StatusAkademik = StatusAkademik.Aktif
            };
            _context.Mahasiswa.Add(mahasiswa);
            await _context.SaveChangesAsync();
            mahasiswaId = mahasiswa.MahasiswaId;

            // Tambahkan Riwayat Universitas Awal
            _context.Universitas.Add(new IkhwanUniversitas
            {
                MahasiswaId = mahasiswa.MahasiswaId,
                NamaUniversitas = request.InstitusiPendidikan,
                Jenjang = request.Jenjang,
                Jurusan = request.Jurusan ?? "Umum",
                TanggalMasuk = DateTime.UtcNow,
                MasihBerjalan = true
            });

            // Tambahkan Profil Kaderisasi
            _context.KaderisasiProfil.Add(new KaderisasiProfil
            {
                MahasiswaId = mahasiswa.MahasiswaId,
                StatusKader = StatusKader.Calon,
                TingkatPembinaan = "Dasar",
                TanggalBergabung = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        // 4. Hubungkan User Profile Link
        _context.UserProfiles.Add(new AppUserProfile
        {
            UserId = user.UserId,
            SiswaId = siswaId,
            MahasiswaId = mahasiswaId
        });

        // 5. Hubungkan Role
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleToAssign);
        if (role != null)
        {
            _context.UserRoles.Add(new AppUserRole
            {
                UserId = user.UserId,
                RoleId = role.RoleId
            });
        }
        await _context.SaveChangesAsync();

        var roles = new List<string> { roleToAssign };
        var permissions = role != null 
            ? await _context.RolePermissions
                .Where(rp => rp.RoleId == role.RoleId)
                .Include(rp => rp.Permission)
                .Where(rp => rp.Permission != null)
                .Select(rp => rp.Permission!.PermissionCode)
                .ToListAsync()
            : new List<string>();

        string profileType = request.TipePenerima == TipePenerima.Siswa ? "Siswa" : "Mahasiswa";
        int? profileId = request.TipePenerima == TipePenerima.Siswa ? siswaId : mahasiswaId;

        var token = GenerateJwtToken(user, roles, permissions, profileType, profileId);

        return new LoginResponseDto
        {
            Token = token,
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            NamaLengkap = request.NamaLengkap,
            Roles = roles,
            Permissions = permissions,
            ProfileType = profileType,
            ProfileId = profileId
        };
    }

    private string GenerateJwtToken(AppUser user, List<string> roles, List<string> permissions, string? profileType, int? profileId)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "AlIkhwanSuperSecretKeyForJwtAuthentication2026!@#";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Name, user.Username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var perm in permissions)
        {
            claims.Add(new Claim("permission", perm));
        }

        if (!string.IsNullOrEmpty(profileType))
        {
            claims.Add(new Claim("profile_type", profileType));
        }

        if (profileId.HasValue)
        {
            claims.Add(new Claim("profile_id", profileId.Value.ToString()));
        }

        var expiresMinutes = double.TryParse(_configuration["Jwt:DurationInMinutes"], out var m) ? m : 1440;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiresMinutes),
            Issuer = _configuration["Jwt:Issuer"] ?? "AlIkhwanBeasiswa",
            Audience = _configuration["Jwt:Audience"] ?? "AlIkhwanPortal",
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
