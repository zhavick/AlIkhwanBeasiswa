using System;

namespace AlIkhwanBeasiswa.Core.DTOs;

public class KwitansiPencairanDto
{
    public int PencairanId { get; set; }
    public int PengajuanId { get; set; }
    public string NomorKwitansi { get; set; } = string.Empty;
    public string NomorRegistrasi { get; set; } = string.Empty;
    public string NamaPenerima { get; set; } = string.Empty;
    public string TipePenerima { get; set; } = string.Empty;
    public string InstitusiPendidikan { get; set; } = string.Empty;
    public int TerminKe { get; set; } = 1;
    public DateTime TanggalPencairan { get; set; }
    public decimal JumlahNominal { get; set; }
    public string Terbilang { get; set; } = string.Empty;
    public string? NomorReferensiBank { get; set; }
    public string NamaBendahara { get; set; } = string.Empty;
    public string JabatanBendahara { get; set; } = "Bendahara Yayasan";
    public string KodeVerifikasi { get; set; } = string.Empty;
    public string QrUrl { get; set; } = string.Empty;
    public string? CatatanPencairan { get; set; }
}

public class SuratKeteranganBeasiswaDto
{
    public int PengajuanId { get; set; }
    public string NomorSurat { get; set; } = string.Empty;
    public string NamaPenerima { get; set; } = string.Empty;
    public string TipePenerima { get; set; } = string.Empty;
    public string? NISN_NIM { get; set; }
    public string TempatTanggalLahir { get; set; } = string.Empty;
    public string JenjangPendidikan { get; set; } = string.Empty;
    public string InstitusiPendidikan { get; set; } = string.Empty;
    public string NamaPeriode { get; set; } = string.Empty;
    public decimal PaguTertanggung { get; set; }
    public DateTime TanggalDitetapkan { get; set; }
    public string NamaPimpinanYayasan { get; set; } = string.Empty;
    public string JabatanPimpinan { get; set; } = "Ketua Yayasan Al-Ikhwan";
    public string KodeVerifikasi { get; set; } = string.Empty;
    public string QrUrl { get; set; } = string.Empty;
    public string StatusVerifikasi { get; set; } = "Sah & Aktif";
}

public class VerifikasiDokumenResponseDto
{
    public bool IsValid { get; set; }
    public string JenisDokumen { get; set; } = string.Empty;
    public string NomorDokumen { get; set; } = string.Empty;
    public string NamaPenerima { get; set; } = string.Empty;
    public string Institusi { get; set; } = string.Empty;
    public DateTime TanggalTerbit { get; set; }
    public string Keterangan { get; set; } = string.Empty;
    public string Penandatangan { get; set; } = string.Empty;
    public string Status { get; set; } = "Valid";
}
