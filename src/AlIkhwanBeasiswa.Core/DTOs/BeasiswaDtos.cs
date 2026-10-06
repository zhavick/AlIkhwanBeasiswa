using AlIkhwanBeasiswa.Core.Enums;

namespace AlIkhwanBeasiswa.Core.DTOs;

public class PeriodeBeasiswaDto
{
    public int PeriodeId { get; set; }
    public string NamaPeriode { get; set; } = string.Empty;
    public DateTime TanggalMulaiDaftar { get; set; }
    public DateTime TanggalSelesaiDaftar { get; set; }
    public decimal TotalAnggaranPagu { get; set; }
    public int KuotaSiswa { get; set; }
    public int KuotaMahasiswa { get; set; }
    public bool StatusAktif { get; set; }
    public int TotalPengajuan { get; set; }
}

public class CreatePeriodeDto
{
    public string NamaPeriode { get; set; } = string.Empty;
    public DateTime TanggalMulaiDaftar { get; set; }
    public DateTime TanggalSelesaiDaftar { get; set; }
    public decimal TotalAnggaranPagu { get; set; }
    public int KuotaSiswa { get; set; } = 50;
    public int KuotaMahasiswa { get; set; } = 50;
    public bool StatusAktif { get; set; } = true;
}

public class SubmitPengajuanBeasiswaDto
{
    public int PeriodeId { get; set; }
    public TipePenerima TipePenerima { get; set; }
    public int? SiswaId { get; set; }
    public int? MahasiswaId { get; set; }
    public decimal PaguBeasiswa { get; set; }
    public string? CatatanPengajuan { get; set; }
}

public class PengajuanBeasiswaListDto
{
    public int PengajuanId { get; set; }
    public int PeriodeId { get; set; }
    public string NamaPeriode { get; set; } = string.Empty;
    public TipePenerima TipePenerima { get; set; }
    public string NamaPenerima { get; set; } = string.Empty;
    public string InstitusiPendidikan { get; set; } = string.Empty;
    public decimal NilaiRataRata { get; set; }
    public decimal PaguBeasiswa { get; set; }
    public decimal PaguTertanggung { get; set; }
    public bool TelahDibayarLunas { get; set; }
    public DateTime TanggalPengajuan { get; set; }
    public StatusPengajuan StatusPengajuan { get; set; }
    public int CurrentApprovalLevel { get; set; }
}

public class PengajuanBeasiswaDetailDto
{
    public int PengajuanId { get; set; }
    public int PeriodeId { get; set; }
    public string NamaPeriode { get; set; } = string.Empty;
    public TipePenerima TipePenerima { get; set; }
    public int? SiswaId { get; set; }
    public int? MahasiswaId { get; set; }
    public string NamaPenerima { get; set; } = string.Empty;
    public string NoTelp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string InstitusiPendidikan { get; set; } = string.Empty;
    public decimal NilaiRataRata { get; set; }
    public decimal PaguBeasiswa { get; set; }
    public decimal PaguTertanggung { get; set; }
    public bool TelahDibayarLunas { get; set; }
    public DateTime TanggalPengajuan { get; set; }
    public StatusPengajuan StatusPengajuan { get; set; }
    public string? CatatanPengajuan { get; set; }

    public List<ApprovalHistoryDto> RiwayatApproval { get; set; } = new();
    public List<PencairanDto> RiwayatPencairan { get; set; } = new();
}

public class ApprovalRequestDto
{
    public TingkatApproval TingkatApproval { get; set; }
    public StatusApproval StatusApproval { get; set; }
    public decimal? PaguTertanggungDisetujui { get; set; }
    public string? CatatanApproval { get; set; }
}

public class ApprovalHistoryDto
{
    public int ApprovalId { get; set; }
    public TingkatApproval TingkatApproval { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public StatusApproval StatusApproval { get; set; }
    public string? CatatanApproval { get; set; }
    public DateTime TanggalApproval { get; set; }
}

public class PencairanRequestDto
{
    public int PengajuanId { get; set; }
    public int TerminKe { get; set; } = 1;
    public DateTime TanggalPembayaran { get; set; }
    public decimal Biaya { get; set; }
    public string BuktiPembayaran { get; set; } = string.Empty;
    public string? NomorReferensiBank { get; set; }
    public string? InformasiTambahan { get; set; }
}

public class PencairanDto
{
    public int PencairanId { get; set; }
    public int PengajuanId { get; set; }
    public int TerminKe { get; set; }
    public DateTime TanggalPembayaran { get; set; }
    public decimal Biaya { get; set; }
    public string BuktiPembayaran { get; set; } = string.Empty;
    public string? NomorReferensiBank { get; set; }
    public StatusPencairan StatusPencairan { get; set; }
    public string? DicairkanOleh { get; set; }
}
