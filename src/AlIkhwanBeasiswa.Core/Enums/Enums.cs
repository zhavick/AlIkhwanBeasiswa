namespace AlIkhwanBeasiswa.Core.Enums;

public enum TipePenerima
{
    Siswa = 1,
    Mahasiswa = 2
}

public enum StatusPengajuan
{
    Draft = 1,
    Diajukan = 2,
    Verifikasi = 3,
    Disetujui = 4,
    Ditolak = 5,
    Selesai = 6
}

public enum TingkatApproval
{
    VerifikatorAdministrasi = 1,
    KoordinatorBeasiswa = 2,
    PimpinanYayasan = 3
}

public enum StatusApproval
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Revisi = 4
}

public enum StatusPencairan
{
    Pending = 1,
    Selesai = 2,
    Dibatalkan = 3
}

public enum StatusKader
{
    Calon = 1,
    KaderAktif = 2,
    KaderMandiri = 3,
    AlumniPenggerak = 4,
    Demisioner = 5
}

public enum StatusKehadiran
{
    Hadir = 1,
    Izin = 2,
    Sakit = 3,
    Alpa = 4
}

public enum StatusPekerjaan
{
    KaryawanTetap = 1,
    Kontrak = 2,
    Freelance = 3,
    Wirausaha = 4,
    StudiLanjut = 5
}

public enum StatusAkademik
{
    Aktif = 1,
    Cuti = 2,
    LulusAlumni = 3,
    DropOut = 4
}

public enum StatusTiket
{
    Menunggu = 1,
    Dijawab = 2,
    Selesai = 3,
    Ditutup = 4
}
