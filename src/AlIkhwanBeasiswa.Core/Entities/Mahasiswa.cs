using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.Entities;

public class IkhwanMahasiswa
{
    public int MahasiswaId { get; set; }
    public int OrangTuaId { get; set; }
    public string NamaMahasiswa { get; set; } = string.Empty;
    public string? NamaPanggilan { get; set; }
    public string TempatLahir { get; set; } = string.Empty;
    public DateTime TanggalLahir { get; set; }
    public string AlamatLengkap { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool CalonKaderisasi { get; set; } = true;
    public StatusAkademik StatusAkademik { get; set; } = StatusAkademik.Aktif;
    public string? InformasiTambahan { get; set; }

    // Navigation properties
    public IkhwanOrangTua? OrangTua { get; set; }
    public ICollection<IkhwanUniversitas> RiwayatUniversitas { get; set; } = new List<IkhwanUniversitas>();
    public ICollection<IkhwanNilaiUniv> DaftarNilai { get; set; } = new List<IkhwanNilaiUniv>();
    public ICollection<PengajuanBeasiswa> DaftarPengajuanBeasiswa { get; set; } = new List<PengajuanBeasiswa>();
    public KaderisasiProfil? KaderisasiProfile { get; set; }
    public ICollection<AlumniTracerKarir> RiwayatKarir { get; set; } = new List<AlumniTracerKarir>();
    public ICollection<AlumniKontribusi> DaftarKontribusi { get; set; } = new List<AlumniKontribusi>();
}

public class IkhwanUniversitas
{
    public int UnivId { get; set; }
    public int MahasiswaId { get; set; }
    public string NamaUniversitas { get; set; } = string.Empty;
    public string? AlamatUniversitas { get; set; }
    public string? NoTelpUniversitas { get; set; }
    public string? EmailUniversitas { get; set; }
    public DateTime TanggalMasuk { get; set; }
    public bool MasihBerjalan { get; set; } = true;
    public string Jenjang { get; set; } = "S1"; // D3, D4, S1
    public string Jurusan { get; set; } = string.Empty;
    public DateTime? TanggalLulus { get; set; }
    public int JumlahTahun { get; set; } = 4;
    public int JumlahSemester { get; set; } = 8;
    public string? InformasiTambahan { get; set; }

    // Navigation property
    public IkhwanMahasiswa? Mahasiswa { get; set; }
    public ICollection<IkhwanNilaiUniv> DaftarNilai { get; set; } = new List<IkhwanNilaiUniv>();
}

public class IkhwanNilaiUniv
{
    public int NilaiId { get; set; }
    public int UnivId { get; set; }
    public int MahasiswaId { get; set; }
    public string MataKuliah { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal? NilaiUTS { get; set; }
    public decimal? NilaiUAS { get; set; }
    public decimal NilaiRata { get; set; }
    public int Sks { get; set; } = 3;
    public string? InformasiTambahan { get; set; }

    // Navigation properties
    public IkhwanUniversitas? Universitas { get; set; }
    public IkhwanMahasiswa? Mahasiswa { get; set; }
}
