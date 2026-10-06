using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.Entities;

public class KaderisasiProfil
{
    public int KaderId { get; set; }
    public int MahasiswaId { get; set; }
    public StatusKader StatusKader { get; set; } = StatusKader.KaderAktif;
    public string? KelompokHalaqah { get; set; }
    public string? NamaMurabbi { get; set; }
    public string TingkatPembinaan { get; set; } = "Dasar";
    public string? CatatanPerkembangan { get; set; }
    public DateTime TanggalBergabung { get; set; } = DateTime.UtcNow;

    // Navigation property
    public IkhwanMahasiswa? Mahasiswa { get; set; }
}

public class KaderisasiKegiatan
{
    public int KegiatanId { get; set; }
    public string NamaKegiatan { get; set; } = string.Empty;
    public string? Deskripsi { get; set; }
    public DateTime TanggalKegiatan { get; set; }
    public string Tempat { get; set; } = string.Empty;
    public string TipeKegiatan { get; set; } = "Kajian"; // Kajian, Pelatihan Leadership, Bakti Sosial
    public bool WajibHadir { get; set; } = true;

    // Navigation property
    public ICollection<KaderisasiPresensi> DaftarPresensi { get; set; } = new List<KaderisasiPresensi>();
}

public class KaderisasiPresensi
{
    public int PresensiId { get; set; }
    public int KegiatanId { get; set; }
    public int MahasiswaId { get; set; }
    public StatusKehadiran StatusKehadiran { get; set; } = StatusKehadiran.Hadir;
    public DateTime WaktuPresensi { get; set; } = DateTime.UtcNow;
    public string? Keterangan { get; set; }

    // Navigation properties
    public KaderisasiKegiatan? Kegiatan { get; set; }
    public IkhwanMahasiswa? Mahasiswa { get; set; }
}

public class AlumniTracerKarir
{
    public int TracerId { get; set; }
    public int MahasiswaId { get; set; }
    public string NamaPerusahaan { get; set; } = string.Empty;
    public string BidangPekerjaan { get; set; } = string.Empty;
    public string Jabatan { get; set; } = string.Empty;
    public StatusPekerjaan StatusPekerjaan { get; set; } = StatusPekerjaan.KaryawanTetap;
    public int BulanBergabung { get; set; }
    public int TahunBergabung { get; set; }
    public bool MasihBekerja { get; set; } = true;
    public int? BulanSelesai { get; set; }
    public int? TahunSelesai { get; set; }
    public string? RentangGaji { get; set; }
    public string? KeselarasanJurusan { get; set; }
    public string? InformasiTambahan { get; set; }

    // Navigation property
    public IkhwanMahasiswa? Mahasiswa { get; set; }
}

public class AlumniKontribusi
{
    public int KontribusiId { get; set; }
    public int MahasiswaId { get; set; }
    public string TipeKontribusi { get; set; } = "Mentor"; // Donasi Rutin, Orang Tua Asuh, Mentor Karir, Pemateri
    public string? DeskripsiKontribusi { get; set; }
    public DateTime TanggalKontribusi { get; set; } = DateTime.UtcNow;
    public decimal? NominalDonasi { get; set; }
    public bool StatusAktif { get; set; } = true;

    // Navigation property
    public IkhwanMahasiswa? Mahasiswa { get; set; }
}
