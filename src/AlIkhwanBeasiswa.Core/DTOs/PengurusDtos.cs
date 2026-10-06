namespace AlIkhwanBeasiswa.Core.DTOs;

public class PengurusDto
{
    public int PengurusId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Nip { get; set; }
    public string NamaLengkap { get; set; } = string.Empty;
    public string? Gelar { get; set; }
    public string Jabatan { get; set; } = string.Empty;
    public string Divisi { get; set; } = string.Empty;
    public string? NoTelp { get; set; }
    public string? Email { get; set; }
    public string? AlamatLengkap { get; set; }
    public DateTime TanggalMulaiMenjabat { get; set; }
    public DateTime? TanggalAkhirMenjabat { get; set; }
    public bool StatusAktif { get; set; }
    public string? FotoProfilUrl { get; set; }
}

public class CreatePengurusRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Nip { get; set; }
    public string NamaLengkap { get; set; } = string.Empty;
    public string? Gelar { get; set; }
    public string Jabatan { get; set; } = string.Empty;
    public string Divisi { get; set; } = string.Empty;
    public string? NoTelp { get; set; }
    public string? AlamatLengkap { get; set; }
    public DateTime TanggalMulaiMenjabat { get; set; }
    public List<int> RoleIds { get; set; } = new();
}

public class UpdatePengurusRequestDto
{
    public string? Nip { get; set; }
    public string NamaLengkap { get; set; } = string.Empty;
    public string? Gelar { get; set; }
    public string Jabatan { get; set; } = string.Empty;
    public string Divisi { get; set; } = string.Empty;
    public string? NoTelp { get; set; }
    public string? Email { get; set; }
    public string? AlamatLengkap { get; set; }
    public DateTime TanggalMulaiMenjabat { get; set; }
    public DateTime? TanggalAkhirMenjabat { get; set; }
    public bool StatusAktif { get; set; } = true;
    public List<int>? RoleIds { get; set; }
}
