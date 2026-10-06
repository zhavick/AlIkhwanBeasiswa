using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.DTOs;

public class LoginRequestDto
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NamaLengkap { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public string? ProfileType { get; set; } // Pengurus, Mahasiswa, Siswa
    public int? ProfileId { get; set; }
}

public class UserProfileDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NamaLengkap { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public string? ProfileType { get; set; }
    public int? ProfileId { get; set; }
}

public class RegisterPenerimaDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public TipePenerima TipePenerima { get; set; }
    public string NamaLengkap { get; set; } = string.Empty;
    public string TempatLahir { get; set; } = string.Empty;
    public DateTime TanggalLahir { get; set; }
    public string AlamatLengkap { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;

    // Data Orang Tua
    public string NamaAyah { get; set; } = string.Empty;
    public string NamaIbu { get; set; } = string.Empty;
    public string? PekerjaanAyah { get; set; }
    public string? PekerjaanIbu { get; set; }
    public bool TelahMeninggalAyah { get; set; } = false;
    public bool TelahMeninggalIbu { get; set; } = false;

    // Data Pendidikan (Sekolah atau Kampus)
    public string InstitusiPendidikan { get; set; } = string.Empty;
    public string Jenjang { get; set; } = "SMA"; // SD, SMP, SMA, S1
    public string? Jurusan { get; set; }
}
