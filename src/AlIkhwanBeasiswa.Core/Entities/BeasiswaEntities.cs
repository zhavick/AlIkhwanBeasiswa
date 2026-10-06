using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.Entities;

public class PeriodeBeasiswa
{
    public int PeriodeId { get; set; }
    public string NamaPeriode { get; set; } = string.Empty;
    public DateTime TanggalMulaiDaftar { get; set; }
    public DateTime TanggalSelesaiDaftar { get; set; }
    public decimal TotalAnggaranPagu { get; set; }
    public int KuotaSiswa { get; set; } = 50;
    public int KuotaMahasiswa { get; set; } = 50;
    public bool StatusAktif { get; set; } = true;

    // Navigation property
    public ICollection<PengajuanBeasiswa> DaftarPengajuan { get; set; } = new List<PengajuanBeasiswa>();
}

public class PengajuanBeasiswa
{
    public int PengajuanId { get; set; }
    public int PeriodeId { get; set; }
    public TipePenerima TipePenerima { get; set; }

    public int? SiswaId { get; set; }
    public IkhwanSiswa? Siswa { get; set; }

    public int? MahasiswaId { get; set; }
    public IkhwanMahasiswa? Mahasiswa { get; set; }

    public decimal NilaiRataRata { get; set; } // Nilai Rapor atau IPK
    public decimal PaguBeasiswa { get; set; }
    public decimal PaguTertanggung { get; set; }
    public bool TelahDibayarLunas { get; set; } = false;
    public DateTime TanggalPengajuan { get; set; } = DateTime.UtcNow;
    public StatusPengajuan StatusPengajuan { get; set; } = StatusPengajuan.Diajukan;
    public string? CatatanPengajuan { get; set; }

    // Navigation properties
    public PeriodeBeasiswa? Periode { get; set; }
    public ICollection<ApprovalBeasiswa> DaftarApproval { get; set; } = new List<ApprovalBeasiswa>();
    public ICollection<PencairanBeasiswa> DaftarPencairan { get; set; } = new List<PencairanBeasiswa>();
    public ICollection<PortalDokumenPenerima> BerkasDokumen { get; set; } = new List<PortalDokumenPenerima>();
}

public class ApprovalBeasiswa
{
    public int ApprovalId { get; set; }
    public int PengajuanId { get; set; }
    public TingkatApproval TingkatApproval { get; set; }
    public int ApproverUserId { get; set; }
    public StatusApproval StatusApproval { get; set; } = StatusApproval.Pending;
    public string? CatatanApproval { get; set; }
    public DateTime TanggalApproval { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public PengajuanBeasiswa? Pengajuan { get; set; }
    public AppUser? ApproverUser { get; set; }
}

public class PencairanBeasiswa
{
    public int PencairanId { get; set; }
    public int PengajuanId { get; set; }
    public int TerminKe { get; set; } = 1;
    public DateTime TanggalPembayaran { get; set; }
    public decimal Biaya { get; set; }
    public string BuktiPembayaran { get; set; } = string.Empty;
    public string? NomorReferensiBank { get; set; }
    public StatusPencairan StatusPencairan { get; set; } = StatusPencairan.Selesai;
    public int? DicairkanOlehUserId { get; set; }
    public string? InformasiTambahan { get; set; }

    // Navigation properties
    public PengajuanBeasiswa? Pengajuan { get; set; }
    public AppUser? DicairkanOlehUser { get; set; }
}
