namespace AlIkhwanBeasiswa.Core.Entities;

public class AppPengurus
{
    public int PengurusId { get; set; }
    public int UserId { get; set; }
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
    public string? FotoProfilUrl { get; set; }
    public string? TandaTanganDigitalUrl { get; set; }

    // Navigation property
    public AppUser? User { get; set; }
}
