using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.DTOs;

// --- DTO SISWA ---
public class SiswaListDto
{
    public int SiswaId { get; set; }
    public string NamaSiswa { get; set; } = string.Empty;
    public string? NamaPanggilan { get; set; }
    public string Jenjang { get; set; } = string.Empty;
    public string NamaSekolah { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal NilaiRataRataTerakhir { get; set; }
    public bool IsYatimPiatu { get; set; }
}

public class SiswaDetailDto
{
    public int SiswaId { get; set; }
    public string NamaSiswa { get; set; } = string.Empty;
    public string? NamaPanggilan { get; set; }
    public string TempatLahir { get; set; } = string.Empty;
    public DateTime TanggalLahir { get; set; }
    public string AlamatLengkap { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? InformasiTambahan { get; set; }

    // Orang Tua
    public int OrangTuaId { get; set; }
    public string NamaAyah { get; set; } = string.Empty;
    public string NamaIbu { get; set; } = string.Empty;
    public string? PekerjaanAyah { get; set; }
    public string? PekerjaanIbu { get; set; }
    public bool TelahMeninggalAyah { get; set; }
    public bool TelahMeninggalIbu { get; set; }

    // Riwayat Pendidikan & Nilai
    public List<PendidikanSekolahDto> RiwayatPendidikan { get; set; } = new();
    public List<NilaiSekolahDto> DaftarNilai { get; set; } = new();
}

public class PendidikanSekolahDto
{
    public int PendidikanId { get; set; }
    public string NamaSekolah { get; set; } = string.Empty;
    public string AlamatSekolah { get; set; } = string.Empty;
    public string Jenjang { get; set; } = string.Empty;
    public DateTime TanggalMasuk { get; set; }
    public bool MasihDalamPendidikan { get; set; }
}

public class NilaiSekolahDto
{
    public int NilaiSekolahId { get; set; }
    public int PendidikanId { get; set; }
    public string NamaPelajaran { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal? NilaiUTS { get; set; }
    public decimal? NilaiUAS { get; set; }
    public decimal NilaiRata { get; set; }
}

public class InputNilaiSekolahDto
{
    public int SiswaId { get; set; }
    public int PendidikanId { get; set; }
    public string NamaPelajaran { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal? NilaiUTS { get; set; }
    public decimal? NilaiUAS { get; set; }
    public decimal NilaiRata { get; set; }
    public string? InformasiTambahan { get; set; }
}

// --- DTO MAHASISWA ---
public class MahasiswaListDto
{
    public int MahasiswaId { get; set; }
    public string NamaMahasiswa { get; set; } = string.Empty;
    public string? NamaPanggilan { get; set; }
    public string NamaUniversitas { get; set; } = string.Empty;
    public string Jurusan { get; set; } = string.Empty;
    public string Jenjang { get; set; } = "S1";
    public StatusAkademik StatusAkademik { get; set; }
    public decimal IPK { get; set; }
    public bool CalonKaderisasi { get; set; }
    public bool IsYatimPiatu { get; set; }
}

public class MahasiswaDetailDto
{
    public int MahasiswaId { get; set; }
    public string NamaMahasiswa { get; set; } = string.Empty;
    public string? NamaPanggilan { get; set; }
    public string TempatLahir { get; set; } = string.Empty;
    public DateTime TanggalLahir { get; set; }
    public string AlamatLengkap { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool CalonKaderisasi { get; set; }
    public StatusAkademik StatusAkademik { get; set; }
    public string? InformasiTambahan { get; set; }

    // Orang Tua
    public int OrangTuaId { get; set; }
    public string NamaAyah { get; set; } = string.Empty;
    public string NamaIbu { get; set; } = string.Empty;
    public string? PekerjaanAyah { get; set; }
    public string? PekerjaanIbu { get; set; }
    public bool TelahMeninggalAyah { get; set; }
    public bool TelahMeninggalIbu { get; set; }

    // Universitas & Nilai
    public List<UniversitasDto> RiwayatUniversitas { get; set; } = new();
    public List<NilaiUnivDto> DaftarNilai { get; set; } = new();
}

public class UniversitasDto
{
    public int UnivId { get; set; }
    public string NamaUniversitas { get; set; } = string.Empty;
    public string Jenjang { get; set; } = "S1";
    public string Jurusan { get; set; } = string.Empty;
    public DateTime TanggalMasuk { get; set; }
    public bool MasihBerjalan { get; set; }
    public DateTime? TanggalLulus { get; set; }
}

public class NilaiUnivDto
{
    public int NilaiId { get; set; }
    public int UnivId { get; set; }
    public string MataKuliah { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal? NilaiUTS { get; set; }
    public decimal? NilaiUAS { get; set; }
    public decimal NilaiRata { get; set; }
    public int Sks { get; set; }
}

public class InputNilaiUnivDto
{
    public int MahasiswaId { get; set; }
    public int UnivId { get; set; }
    public string MataKuliah { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal? NilaiUTS { get; set; }
    public decimal? NilaiUAS { get; set; }
    public decimal NilaiRata { get; set; }
    public int Sks { get; set; } = 3;
    public string? InformasiTambahan { get; set; }
}
