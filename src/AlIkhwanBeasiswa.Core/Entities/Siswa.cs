namespace AlIkhwanBeasiswa.Core.Entities;

public class IkhwanSiswa
{
    public int SiswaId { get; set; }
    public int OrangTuaId { get; set; }
    public string NamaSiswa { get; set; } = string.Empty;
    public string? NamaPanggilan { get; set; }
    public string TempatLahir { get; set; } = string.Empty;
    public DateTime TanggalLahir { get; set; }
    public string AlamatLengkap { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? InformasiTambahan { get; set; }

    // Navigation properties
    public IkhwanOrangTua? OrangTua { get; set; }
    public ICollection<IkhwanPendidikan> RiwayatPendidikan { get; set; } = new List<IkhwanPendidikan>();
    public ICollection<IkhwanNilaiSekolah> DaftarNilai { get; set; } = new List<IkhwanNilaiSekolah>();
    public ICollection<PengajuanBeasiswa> DaftarPengajuanBeasiswa { get; set; } = new List<PengajuanBeasiswa>();
}

public class IkhwanPendidikan
{
    public int PendidikanId { get; set; }
    public int SiswaId { get; set; }
    public string NamaSekolah { get; set; } = string.Empty;
    public string AlamatSekolah { get; set; } = string.Empty;
    public string Jenjang { get; set; } = string.Empty; // SD, SMP, SMA, SMK
    public DateTime TanggalMasuk { get; set; }
    public bool MasihDalamPendidikan { get; set; } = true;
    public DateTime? TanggalKeluar { get; set; }
    public string? NoTelpSekolah { get; set; }
    public string? EmailSekolah { get; set; }

    // Navigation property
    public IkhwanSiswa? Siswa { get; set; }
    public ICollection<IkhwanNilaiSekolah> DaftarNilai { get; set; } = new List<IkhwanNilaiSekolah>();
}

public class IkhwanNilaiSekolah
{
    public int NilaiSekolahId { get; set; }
    public int PendidikanId { get; set; }
    public int SiswaId { get; set; }
    public string NamaPelajaran { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal? NilaiUTS { get; set; }
    public decimal? NilaiUAS { get; set; }
    public decimal NilaiRata { get; set; }
    public string? InformasiTambahan { get; set; }

    // Navigation properties
    public IkhwanPendidikan? Pendidikan { get; set; }
    public IkhwanSiswa? Siswa { get; set; }
}
