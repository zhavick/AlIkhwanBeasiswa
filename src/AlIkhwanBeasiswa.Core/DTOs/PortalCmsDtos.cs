using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.DTOs;

// --- PENGUMUMAN ---
public class PengumumanDto
{
    public int PengumumanId { get; set; }
    public string Judul { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Ringkasan { get; set; }
    public string IsiKonten { get; set; } = string.Empty;
    public string? GambarCoverUrl { get; set; }
    public string Kategori { get; set; } = "Info Beasiswa";
    public bool IsPublished { get; set; }
    public DateTime TanggalTerbit { get; set; }
    public DateTime TanggalDibuat => TanggalTerbit;
    public string PenulisName { get; set; } = string.Empty;
}

public class CreatePengumumanDto
{
    public string Judul { get; set; } = string.Empty;
    public string? Ringkasan { get; set; }
    public string IsiKonten { get; set; } = string.Empty;
    public string? GambarCoverUrl { get; set; }
    public string Kategori { get; set; } = "Info Beasiswa";
    public bool IsPublished { get; set; } = true;
}

public class UpdatePengumumanDto
{
    public string Judul { get; set; } = string.Empty;
    public string? Ringkasan { get; set; }
    public string IsiKonten { get; set; } = string.Empty;
    public string? GambarCoverUrl { get; set; }
    public string Kategori { get; set; } = "Info Beasiswa";
    public bool IsPublished { get; set; } = true;
}

// --- BANNER ---
public class BannerDto
{
    public int BannerId { get; set; }
    public string Judul { get; set; } = string.Empty;
    public string? Subjudul { get; set; }
    public string GambarUrl { get; set; } = string.Empty;
    public string ImageUrl => GambarUrl;
    public string? LinkUrl { get; set; }
    public int Urutan { get; set; }
    public bool StatusAktif { get; set; }
    public bool IsActive => StatusAktif;
}

public class CreateBannerDto
{
    public string Judul { get; set; } = string.Empty;
    public string? Subjudul { get; set; }
    public string GambarUrl { get; set; } = string.Empty;
    public string? ImageUrl { get => GambarUrl; set => GambarUrl = value ?? string.Empty; }
    public string? LinkUrl { get; set; }
    public int Urutan { get; set; } = 1;
    public bool StatusAktif { get; set; } = true;
    public bool? IsActive { get => StatusAktif; set => StatusAktif = value ?? true; }
}

// --- SYARAT DOKUMEN ---
public class SyaratDokumenDto
{
    public int SyaratId { get; set; }
    public string NamaDokumen { get; set; } = string.Empty;
    public string NamaSyarat => NamaDokumen;
    public string? Deskripsi { get; set; }
    public bool Wajib { get; set; }
    public bool IsWajib => Wajib;
    public string TipePenerima { get; set; } = "Semua";
    public string BerlakuUntuk => TipePenerima;
    public string FormatFileDiizinkan { get; set; } = "pdf,jpg,png";
    public int MaxSizeMb { get; set; }
}

public class CreateSyaratDokumenDto
{
    public string NamaDokumen { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
    public bool Wajib { get; set; } = true;
    public string TipePenerima { get; set; } = "Semua";
    public string FormatFileDiizinkan { get; set; } = "pdf,jpg,png";
    public int MaxSizeMb { get; set; } = 2;
}

// --- DOKUMEN PENERIMA ---
public class DokumenPenerimaDto
{
    public int DokumenId { get; set; }
    public int PengajuanId { get; set; }
    public int SyaratId { get; set; }
    public string NamaSyarat { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string NamaFileAsli { get; set; } = string.Empty;
    public DateTime TanggalUnggah { get; set; }
    public string StatusVerifikasi { get; set; } = "Pending";
    public string? CatatanRevisi { get; set; }
}

public class VerifikasiDokumenDto
{
    public int DokumenId { get; set; }
    public string StatusVerifikasi { get; set; } = "Valid"; // Valid, Ditolak
    public string? CatatanRevisi { get; set; }
}

// --- HELPDESK TIKET ---
public class HelpdeskTiketDto
{
    public int TiketId { get; set; }
    public int UserId { get; set; }
    public string PengirimName { get; set; } = string.Empty;
    public string PengirimEmail { get; set; } = string.Empty;
    public string NomorTiket { get; set; } = string.Empty;
    public string Subjek { get; set; } = string.Empty;
    public string Pesan { get; set; } = string.Empty;
    public string Kategori { get; set; } = "Kendala Pengajuan";
    public StatusTiket StatusTiket { get; set; }
    public string? JawabanAdmin { get; set; }
    public string? DijawabOleh { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateHelpdeskTiketDto
{
    public string Subjek { get; set; } = string.Empty;
    public string Pesan { get; set; } = string.Empty;
    public string Kategori { get; set; } = "Kendala Pengajuan";
}

public class JawabHelpdeskTiketDto
{
    public string JawabanAdmin { get; set; } = string.Empty;
    public StatusTiket StatusTiket { get; set; } = StatusTiket.Dijawab;
}
