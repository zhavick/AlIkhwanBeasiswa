using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.Entities;

public class PortalPengumuman
{
    public int PengumumanId { get; set; }
    public string Judul { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Ringkasan { get; set; }
    public string IsiKonten { get; set; } = string.Empty;
    public string? GambarCoverUrl { get; set; }
    public string Kategori { get; set; } = "Beasiswa";
    public bool IsPublished { get; set; } = true;
    public DateTime TanggalTerbit { get; set; } = DateTime.UtcNow;
    public int? PenulisUserId { get; set; }

    // Navigation property
    public AppUser? PenulisUser { get; set; }
}

public class PortalBanner
{
    public int BannerId { get; set; }
    public string Judul { get; set; } = string.Empty;
    public string? Subjudul { get; set; }
    public string GambarUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public int Urutan { get; set; } = 0;
    public bool StatusAktif { get; set; } = true;
}

public class PortalSyaratDokumen
{
    public int SyaratId { get; set; }
    public string NamaDokumen { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
    public bool Wajib { get; set; } = true;
    public string TipePenerima { get; set; } = "Semua"; // Siswa, Mahasiswa, Semua
    public string FormatFileDiizinkan { get; set; } = "pdf,jpg,png";
    public int MaxSizeMb { get; set; } = 2;

    // Navigation property
    public ICollection<PortalDokumenPenerima> DokumenTerunggah { get; set; } = new List<PortalDokumenPenerima>();
}

public class PortalDokumenPenerima
{
    public int DokumenId { get; set; }
    public int PengajuanId { get; set; }
    public int SyaratId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string NamaFileAsli { get; set; } = string.Empty;
    public DateTime TanggalUnggah { get; set; } = DateTime.UtcNow;
    public string StatusVerifikasi { get; set; } = "Pending"; // Pending, Valid, Ditolak
    public string? CatatanRevisi { get; set; }

    // Navigation properties
    public PengajuanBeasiswa? Pengajuan { get; set; }
    public PortalSyaratDokumen? Syarat { get; set; }
}

public class PortalHelpdeskTiket
{
    public int TiketId { get; set; }
    public int UserId { get; set; }
    public string NomorTiket { get; set; } = string.Empty;
    public string Subjek { get; set; } = string.Empty;
    public string Pesan { get; set; } = string.Empty;
    public string Kategori { get; set; } = "Kendala Pengajuan";
    public StatusTiket StatusTiket { get; set; } = StatusTiket.Menunggu;
    public string? JawabanAdmin { get; set; }
    public int? DijawabOlehUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public AppUser? User { get; set; }
    public AppUser? DijawabOlehUser { get; set; }
}
