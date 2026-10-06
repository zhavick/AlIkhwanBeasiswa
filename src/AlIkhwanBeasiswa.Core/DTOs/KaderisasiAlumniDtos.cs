using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.DTOs;

public class KaderisasiProfilDto
{
    public int KaderId { get; set; }
    public int MahasiswaId { get; set; }
    public string NamaMahasiswa { get; set; } = string.Empty;
    public string NamaUniversitas { get; set; } = string.Empty;
    public string Jurusan { get; set; } = string.Empty;
    public StatusKader StatusKader { get; set; }
    public string? KelompokHalaqah { get; set; }
    public string? NamaMurabbi { get; set; }
    public string TingkatPembinaan { get; set; } = string.Empty;
    public string? CatatanPerkembangan { get; set; }
    public DateTime TanggalBergabung { get; set; }
    public int TotalKegiatanDiikuti { get; set; }
}

public class UpdateKaderisasiProfilDto
{
    public StatusKader StatusKader { get; set; }
    public string? KelompokHalaqah { get; set; }
    public string? NamaMurabbi { get; set; }
    public string TingkatPembinaan { get; set; } = "Dasar";
    public string? CatatanPerkembangan { get; set; }
}

public class KaderisasiKegiatanDto
{
    public int KegiatanId { get; set; }
    public string NamaKegiatan { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
    public DateTime TanggalKegiatan { get; set; }
    public string Tempat { get; set; } = string.Empty;
    public string TipeKegiatan { get; set; } = string.Empty;
    public bool WajibHadir { get; set; }
    public int TotalPesertaHadir { get; set; }
}

public class CreateKegiatanDto
{
    public string NamaKegiatan { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
    public DateTime TanggalKegiatan { get; set; }
    public string Tempat { get; set; } = string.Empty;
    public string TipeKegiatan { get; set; } = "Kajian Bulanan";
    public bool WajibHadir { get; set; } = true;
}

public class InputPresensiDto
{
    public int KegiatanId { get; set; }
    public int MahasiswaId { get; set; }
    public StatusKehadiran StatusKehadiran { get; set; }
    public string? Keterangan { get; set; }
}

public class PresensiPesertaDto
{
    public int PresensiId { get; set; }
    public int MahasiswaId { get; set; }
    public string NamaMahasiswa { get; set; } = string.Empty;
    public StatusKehadiran StatusKehadiran { get; set; }
    public DateTime WaktuPresensi { get; set; }
    public string? Keterangan { get; set; }
}

// --- DTO ALUMNI TRACER ---
public class AlumniTracerDto
{
    public int TracerId { get; set; }
    public int MahasiswaId { get; set; }
    public string NamaAlumni { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Universitas { get; set; } = string.Empty;
    public string Jurusan { get; set; } = string.Empty;
    public string NamaPerusahaan { get; set; } = string.Empty;
    public string BidangPekerjaan { get; set; } = string.Empty;
    public string Jabatan { get; set; } = string.Empty;
    public StatusPekerjaan StatusPekerjaan { get; set; }
    public int BulanBergabung { get; set; }
    public int TahunBergabung { get; set; }
    public bool MasihBekerja { get; set; }
    public string? RentangGaji { get; set; }
    public string? KeselarasanJurusan { get; set; }
    public string? InformasiTambahan { get; set; }
}

public class UpdateAlumniTracerDto
{
    public string NamaPerusahaan { get; set; } = string.Empty;
    public string BidangPekerjaan { get; set; } = string.Empty;
    public string Jabatan { get; set; } = string.Empty;
    public StatusPekerjaan StatusPekerjaan { get; set; }
    public int BulanBergabung { get; set; }
    public int TahunBergabung { get; set; }
    public bool MasihBekerja { get; set; } = true;
    public int? BulanSelesai { get; set; }
    public int? TahunSelesai { get; set; }
    public string? RentangGaji { get; set; }
    public string? KeselarasanJurusan { get; set; }
    public string? InformasiTambahan { get; set; }
}

public class AlumniStatistikDto
{
    public int TotalAlumni { get; set; }
    public int BekerjaTetap { get; set; }
    public int BekerjaKontrak { get; set; }
    public int Wirausaha { get; set; }
    public int StudiLanjut { get; set; }
    public int BelumBekerja { get; set; }
    public decimal PersentaseBekerja { get; set; }
}

public class AlumniKontribusiDto
{
    public int KontribusiId { get; set; }
    public int MahasiswaId { get; set; }
    public string NamaAlumni { get; set; } = string.Empty;
    public string TipeKontribusi { get; set; } = string.Empty;
    public string? DeskripsiKontribusi { get; set; }
    public DateTime TanggalKontribusi { get; set; }
    public decimal? NominalDonasi { get; set; }
    public bool StatusAktif { get; set; }
}

public class CreateAlumniKontribusiDto
{
    public int MahasiswaId { get; set; }
    public string TipeKontribusi { get; set; } = "Mentor";
    public string? DeskripsiKontribusi { get; set; }
    public decimal? NominalDonasi { get; set; }
}
