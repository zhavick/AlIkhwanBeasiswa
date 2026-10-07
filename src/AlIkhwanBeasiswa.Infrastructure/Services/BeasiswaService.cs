using AlIkhwanBeasiswa.Core.DTOs;
using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using AlIkhwanBeasiswa.Core.Interfaces;
using AlIkhwanBeasiswa.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Services;

public class BeasiswaService : IBeasiswaService
{
    private readonly AppDbContext _context;

    public BeasiswaService(AppDbContext context)
    {
        _context = context;
    }

    // --- PERIODE BEASISWA ---
    public async Task<List<PeriodeBeasiswaDto>> GetAllPeriodeAsync()
    {
        return await _context.PeriodeBeasiswa
            .Include(p => p.DaftarPengajuan)
            .OrderByDescending(p => p.PeriodeId)
            .Select(p => new PeriodeBeasiswaDto
            {
                PeriodeId = p.PeriodeId,
                NamaPeriode = p.NamaPeriode,
                TanggalMulaiDaftar = p.TanggalMulaiDaftar,
                TanggalSelesaiDaftar = p.TanggalSelesaiDaftar,
                TotalAnggaranPagu = p.TotalAnggaranPagu,
                KuotaSiswa = p.KuotaSiswa,
                KuotaMahasiswa = p.KuotaMahasiswa,
                StatusAktif = p.StatusAktif,
                TotalPengajuan = p.DaftarPengajuan.Count
            })
            .ToListAsync();
    }

    public async Task<PeriodeBeasiswaDto?> GetPeriodeAktifAsync()
    {
        var p = await _context.PeriodeBeasiswa
            .Include(x => x.DaftarPengajuan)
            .FirstOrDefaultAsync(x => x.StatusAktif && DateTime.UtcNow >= x.TanggalMulaiDaftar && DateTime.UtcNow <= x.TanggalSelesaiDaftar);

        if (p == null) return null;

        return new PeriodeBeasiswaDto
        {
            PeriodeId = p.PeriodeId,
            NamaPeriode = p.NamaPeriode,
            TanggalMulaiDaftar = p.TanggalMulaiDaftar,
            TanggalSelesaiDaftar = p.TanggalSelesaiDaftar,
            TotalAnggaranPagu = p.TotalAnggaranPagu,
            KuotaSiswa = p.KuotaSiswa,
            KuotaMahasiswa = p.KuotaMahasiswa,
            StatusAktif = p.StatusAktif,
            TotalPengajuan = p.DaftarPengajuan.Count
        };
    }

    public async Task<PeriodeBeasiswaDto> CreatePeriodeAsync(CreatePeriodeDto request)
    {
        var periode = new PeriodeBeasiswa
        {
            NamaPeriode = request.NamaPeriode,
            TanggalMulaiDaftar = request.TanggalMulaiDaftar.ToUniversalTime(),
            TanggalSelesaiDaftar = request.TanggalSelesaiDaftar.ToUniversalTime(),
            TotalAnggaranPagu = request.TotalAnggaranPagu,
            KuotaSiswa = request.KuotaSiswa,
            KuotaMahasiswa = request.KuotaMahasiswa,
            StatusAktif = request.StatusAktif
        };

        _context.PeriodeBeasiswa.Add(periode);
        await _context.SaveChangesAsync();

        return new PeriodeBeasiswaDto
        {
            PeriodeId = periode.PeriodeId,
            NamaPeriode = periode.NamaPeriode,
            TanggalMulaiDaftar = periode.TanggalMulaiDaftar,
            TanggalSelesaiDaftar = periode.TanggalSelesaiDaftar,
            TotalAnggaranPagu = periode.TotalAnggaranPagu,
            KuotaSiswa = periode.KuotaSiswa,
            KuotaMahasiswa = periode.KuotaMahasiswa,
            StatusAktif = periode.StatusAktif
        };
    }

    public async Task<bool> TogglePeriodeStatusAsync(int periodeId)
    {
        var p = await _context.PeriodeBeasiswa.FindAsync(periodeId);
        if (p == null) return false;

        p.StatusAktif = !p.StatusAktif;
        await _context.SaveChangesAsync();
        return true;
    }

    // --- PENGAJUAN BEASISWA ---
    public async Task<List<PengajuanBeasiswaListDto>> GetAllPengajuanAsync(int? periodeId = null, StatusPengajuan? status = null)
    {
        var query = _context.PengajuanBeasiswa
            .Include(pb => pb.Periode)
            .Include(pb => pb.Siswa)
                .ThenInclude(s => s!.RiwayatPendidikan)
            .Include(pb => pb.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .Include(pb => pb.DaftarApproval)
            .AsQueryable();

        if (periodeId.HasValue)
        {
            query = query.Where(pb => pb.PeriodeId == periodeId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(pb => pb.StatusPengajuan == status.Value);
        }

        return await query
            .OrderByDescending(pb => pb.PengajuanId)
            .Select(pb => new PengajuanBeasiswaListDto
            {
                PengajuanId = pb.PengajuanId,
                PeriodeId = pb.PeriodeId,
                NamaPeriode = pb.Periode != null ? pb.Periode.NamaPeriode : string.Empty,
                TipePenerima = pb.TipePenerima,
                NamaPenerima = pb.TipePenerima == TipePenerima.Siswa && pb.Siswa != null
                    ? pb.Siswa.NamaSiswa
                    : (pb.Mahasiswa != null ? pb.Mahasiswa.NamaMahasiswa : "-"),
                InstitusiPendidikan = pb.TipePenerima == TipePenerima.Siswa && pb.Siswa != null
                    ? (pb.Siswa.RiwayatPendidikan.OrderByDescending(p => p.PendidikanId).Select(p => p.NamaSekolah).FirstOrDefault() ?? "-")
                    : (pb.Mahasiswa != null ? (pb.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-") : "-"),
                NilaiRataRata = pb.NilaiRataRata,
                PaguBeasiswa = pb.PaguBeasiswa,
                PaguTertanggung = pb.PaguTertanggung,
                TelahDibayarLunas = pb.TelahDibayarLunas,
                TanggalPengajuan = pb.TanggalPengajuan,
                StatusPengajuan = pb.StatusPengajuan,
                CurrentApprovalLevel = pb.DaftarApproval.Count(a => a.StatusApproval == StatusApproval.Approved)
            })
            .ToListAsync();
    }

    public async Task<List<PengajuanBeasiswaListDto>> GetPengajuanByUserIdAsync(int userId)
    {
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(up => up.UserId == userId);
        if (profile == null) return new List<PengajuanBeasiswaListDto>();

        return await GetPengajuanByPenerimaAsync(profile.SiswaId, profile.MahasiswaId);
    }

    public async Task<List<PengajuanBeasiswaListDto>> GetPengajuanByPenerimaAsync(int? siswaId, int? mahasiswaId)
    {
        var query = _context.PengajuanBeasiswa
            .Include(pb => pb.Periode)
            .Include(pb => pb.Siswa)
                .ThenInclude(s => s!.RiwayatPendidikan)
            .Include(pb => pb.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .Include(pb => pb.DaftarApproval)
            .AsQueryable();

        if (siswaId.HasValue && mahasiswaId.HasValue)
        {
            query = query.Where(pb => pb.SiswaId == siswaId.Value || pb.MahasiswaId == mahasiswaId.Value);
        }
        else if (siswaId.HasValue)
        {
            query = query.Where(pb => pb.SiswaId == siswaId.Value);
        }
        else if (mahasiswaId.HasValue)
        {
            query = query.Where(pb => pb.MahasiswaId == mahasiswaId.Value);
        }
        else
        {
            return new List<PengajuanBeasiswaListDto>();
        }

        return await query
            .OrderByDescending(pb => pb.PengajuanId)
            .Select(pb => new PengajuanBeasiswaListDto
            {
                PengajuanId = pb.PengajuanId,
                PeriodeId = pb.PeriodeId,
                NamaPeriode = pb.Periode != null ? pb.Periode.NamaPeriode : string.Empty,
                TipePenerima = pb.TipePenerima,
                NamaPenerima = pb.TipePenerima == TipePenerima.Siswa && pb.Siswa != null
                    ? pb.Siswa.NamaSiswa
                    : (pb.Mahasiswa != null ? pb.Mahasiswa.NamaMahasiswa : "-"),
                InstitusiPendidikan = pb.TipePenerima == TipePenerima.Siswa && pb.Siswa != null
                    ? (pb.Siswa.RiwayatPendidikan.OrderByDescending(p => p.PendidikanId).Select(p => p.NamaSekolah).FirstOrDefault() ?? "-")
                    : (pb.Mahasiswa != null ? (pb.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-") : "-"),
                NilaiRataRata = pb.NilaiRataRata,
                PaguBeasiswa = pb.PaguBeasiswa,
                PaguTertanggung = pb.PaguTertanggung,
                TelahDibayarLunas = pb.TelahDibayarLunas,
                TanggalPengajuan = pb.TanggalPengajuan,
                StatusPengajuan = pb.StatusPengajuan,
                CurrentApprovalLevel = pb.DaftarApproval.Count(a => a.StatusApproval == StatusApproval.Approved)
            })
            .ToListAsync();
    }

    public async Task<PengajuanBeasiswaDetailDto?> GetPengajuanByIdAsync(int id)
    {
        var pb = await _context.PengajuanBeasiswa
            .Include(x => x.Periode)
            .Include(x => x.Siswa)
                .ThenInclude(s => s!.RiwayatPendidikan)
            .Include(x => x.Mahasiswa)
                .ThenInclude(m => m!.RiwayatUniversitas)
            .Include(x => x.DaftarApproval)
                .ThenInclude(a => a.ApproverUser)
                    .ThenInclude(u => u!.PengurusProfile)
            .Include(x => x.DaftarPencairan)
                .ThenInclude(p => p.DicairkanOlehUser)
            .FirstOrDefaultAsync(x => x.PengajuanId == id);

        if (pb == null) return null;

        string namaPenerima = "-";
        string noTelp = "-";
        string email = "-";
        string institusi = "-";

        if (pb.TipePenerima == TipePenerima.Siswa && pb.Siswa != null)
        {
            namaPenerima = pb.Siswa.NamaSiswa;
            noTelp = pb.Siswa.NoTelp;
            email = pb.Siswa.Email;
            institusi = pb.Siswa.RiwayatPendidikan.OrderByDescending(p => p.PendidikanId).Select(p => p.NamaSekolah).FirstOrDefault() ?? "-";
        }
        else if (pb.Mahasiswa != null)
        {
            namaPenerima = pb.Mahasiswa.NamaMahasiswa;
            noTelp = pb.Mahasiswa.NoTelp;
            email = pb.Mahasiswa.Email;
            institusi = pb.Mahasiswa.RiwayatUniversitas.OrderByDescending(u => u.UnivId).Select(u => u.NamaUniversitas).FirstOrDefault() ?? "-";
        }

        return new PengajuanBeasiswaDetailDto
        {
            PengajuanId = pb.PengajuanId,
            PeriodeId = pb.PeriodeId,
            NamaPeriode = pb.Periode?.NamaPeriode ?? "-",
            TipePenerima = pb.TipePenerima,
            SiswaId = pb.SiswaId,
            MahasiswaId = pb.MahasiswaId,
            NamaPenerima = namaPenerima,
            NoTelp = noTelp,
            Email = email,
            InstitusiPendidikan = institusi,
            NilaiRataRata = pb.NilaiRataRata,
            PaguBeasiswa = pb.PaguBeasiswa,
            PaguTertanggung = pb.PaguTertanggung,
            TelahDibayarLunas = pb.TelahDibayarLunas,
            TanggalPengajuan = pb.TanggalPengajuan,
            StatusPengajuan = pb.StatusPengajuan,
            CatatanPengajuan = pb.CatatanPengajuan,
            RiwayatApproval = pb.DaftarApproval.OrderBy(a => a.TingkatApproval).Select(a => new ApprovalHistoryDto
            {
                ApprovalId = a.ApprovalId,
                TingkatApproval = a.TingkatApproval,
                ApproverName = a.ApproverUser?.PengurusProfile?.NamaLengkap ?? a.ApproverUser?.Username ?? "Approver",
                StatusApproval = a.StatusApproval,
                CatatanApproval = a.CatatanApproval,
                TanggalApproval = a.TanggalApproval
            }).ToList(),
            RiwayatPencairan = pb.DaftarPencairan.OrderBy(p => p.TerminKe).Select(p => new PencairanDto
            {
                PencairanId = p.PencairanId,
                PengajuanId = p.PengajuanId,
                TerminKe = p.TerminKe,
                TanggalPembayaran = p.TanggalPembayaran,
                Biaya = p.Biaya,
                BuktiPembayaran = p.BuktiPembayaran,
                NomorReferensiBank = p.NomorReferensiBank,
                StatusPencairan = p.StatusPencairan,
                DicairkanOleh = p.DicairkanOlehUser?.Username
            }).ToList()
        };
    }

    public async Task<PengajuanBeasiswaDetailDto> SubmitPengajuanAsync(SubmitPengajuanBeasiswaDto request)
    {
        var periode = await _context.PeriodeBeasiswa.FindAsync(request.PeriodeId);
        if (periode == null || !periode.StatusAktif)
        {
            throw new InvalidOperationException("Periode beasiswa tidak valid atau pendaftaran telah ditutup.");
        }

        // Hitung nilai rata-rata otomatis dari database akademik
        decimal nilaiRata = 0;
        if (request.TipePenerima == TipePenerima.Siswa && request.SiswaId.HasValue)
        {
            var nilaiList = await _context.NilaiSekolah.Where(n => n.SiswaId == request.SiswaId.Value).ToListAsync();
            nilaiRata = nilaiList.Any() ? nilaiList.Average(n => n.NilaiRata) : 80;
        }
        else if (request.MahasiswaId.HasValue)
        {
            var nilaiList = await _context.NilaiUniv.Where(n => n.MahasiswaId == request.MahasiswaId.Value).ToListAsync();
            nilaiRata = nilaiList.Any() ? nilaiList.Average(n => n.NilaiRata) : 3.5m;
        }

        var pengajuan = new PengajuanBeasiswa
        {
            PeriodeId = request.PeriodeId,
            TipePenerima = request.TipePenerima,
            SiswaId = request.SiswaId,
            MahasiswaId = request.MahasiswaId,
            NilaiRataRata = nilaiRata,
            PaguBeasiswa = request.PaguBeasiswa,
            PaguTertanggung = request.PaguBeasiswa, // Awalnya sama, dapat disesuaikan pada saat approval
            TelahDibayarLunas = false,
            TanggalPengajuan = DateTime.UtcNow,
            StatusPengajuan = StatusPengajuan.Diajukan,
            CatatanPengajuan = request.CatatanPengajuan
        };

        _context.PengajuanBeasiswa.Add(pengajuan);
        await _context.SaveChangesAsync();

        return (await GetPengajuanByIdAsync(pengajuan.PengajuanId))!;
    }

    // --- APPROVAL 3 TINGKAT ---
    public async Task<bool> ProcessApprovalAsync(int pengajuanId, ApprovalRequestDto request, int approverUserId)
    {
        var pengajuan = await _context.PengajuanBeasiswa.FindAsync(pengajuanId);
        if (pengajuan == null) return false;

        var existingApproval = await _context.ApprovalBeasiswa
            .FirstOrDefaultAsync(a => a.PengajuanId == pengajuanId && a.TingkatApproval == request.TingkatApproval);

        if (existingApproval == null)
        {
            existingApproval = new ApprovalBeasiswa
            {
                PengajuanId = pengajuanId,
                TingkatApproval = request.TingkatApproval,
                ApproverUserId = approverUserId,
                StatusApproval = request.StatusApproval,
                CatatanApproval = request.CatatanApproval,
                TanggalApproval = DateTime.UtcNow
            };
            _context.ApprovalBeasiswa.Add(existingApproval);
        }
        else
        {
            existingApproval.ApproverUserId = approverUserId;
            existingApproval.StatusApproval = request.StatusApproval;
            existingApproval.CatatanApproval = request.CatatanApproval;
            existingApproval.TanggalApproval = DateTime.UtcNow;
        }

        // Transisi Status Pengajuan
        if (request.StatusApproval == StatusApproval.Rejected)
        {
            pengajuan.StatusPengajuan = StatusPengajuan.Ditolak;
        }
        else if (request.StatusApproval == StatusApproval.Revisi)
        {
            pengajuan.StatusPengajuan = StatusPengajuan.Draft;
        }
        else if (request.StatusApproval == StatusApproval.Approved)
        {
            if (request.PaguTertanggungDisetujui.HasValue && request.PaguTertanggungDisetujui.Value > 0)
            {
                pengajuan.PaguTertanggung = request.PaguTertanggungDisetujui.Value;
            }

            if (request.TingkatApproval == TingkatApproval.VerifikatorAdministrasi)
            {
                pengajuan.StatusPengajuan = StatusPengajuan.Verifikasi;
            }
            else if (request.TingkatApproval == TingkatApproval.KoordinatorBeasiswa)
            {
                pengajuan.StatusPengajuan = StatusPengajuan.Verifikasi;
            }
            else if (request.TingkatApproval == TingkatApproval.PimpinanYayasan)
            {
                // Final Approval tercapai
                pengajuan.StatusPengajuan = StatusPengajuan.Disetujui;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // --- PENCAIRAN DANA (DISBURSEMENT) ---
    public async Task<PencairanDto> ProcessPencairanAsync(PencairanRequestDto request, int userId)
    {
        var pengajuan = await _context.PengajuanBeasiswa
            .Include(p => p.DaftarPencairan)
            .FirstOrDefaultAsync(p => p.PengajuanId == request.PengajuanId);

        if (pengajuan == null)
        {
            throw new InvalidOperationException("Pengajuan beasiswa tidak ditemukan.");
        }

        if (pengajuan.StatusPengajuan != StatusPengajuan.Disetujui && pengajuan.StatusPengajuan != StatusPengajuan.Selesai)
        {
            throw new InvalidOperationException("Pencairan hanya dapat dilakukan untuk pengajuan yang telah disetujui (Approved).");
        }

        var pencairan = new PencairanBeasiswa
        {
            PengajuanId = request.PengajuanId,
            TerminKe = request.TerminKe,
            TanggalPembayaran = request.TanggalPembayaran.ToUniversalTime(),
            Biaya = request.Biaya,
            BuktiPembayaran = request.BuktiPembayaran,
            NomorReferensiBank = request.NomorReferensiBank,
            StatusPencairan = StatusPencairan.Selesai,
            DicairkanOlehUserId = userId,
            InformasiTambahan = request.InformasiTambahan
        };

        _context.PencairanBeasiswa.Add(pencairan);

        // Periksa apakah total pencairan telah melunasi pagu tertanggung
        var totalSebelumnya = pengajuan.DaftarPencairan.Sum(p => p.Biaya);
        if ((totalSebelumnya + request.Biaya) >= pengajuan.PaguTertanggung)
        {
            pengajuan.TelahDibayarLunas = true;
            pengajuan.StatusPengajuan = StatusPengajuan.Selesai;
        }

        await _context.SaveChangesAsync();

        return new PencairanDto
        {
            PencairanId = pencairan.PencairanId,
            PengajuanId = pencairan.PengajuanId,
            TerminKe = pencairan.TerminKe,
            TanggalPembayaran = pencairan.TanggalPembayaran,
            Biaya = pencairan.Biaya,
            BuktiPembayaran = pencairan.BuktiPembayaran,
            NomorReferensiBank = pencairan.NomorReferensiBank,
            StatusPencairan = pencairan.StatusPencairan
        };
    }

    public async Task<List<PencairanDto>> GetRiwayatPencairanAsync(int pengajuanId)
    {
        return await _context.PencairanBeasiswa
            .Include(p => p.DicairkanOlehUser)
            .Where(p => p.PengajuanId == pengajuanId)
            .OrderBy(p => p.TerminKe)
            .Select(p => new PencairanDto
            {
                PencairanId = p.PencairanId,
                PengajuanId = p.PengajuanId,
                TerminKe = p.TerminKe,
                TanggalPembayaran = p.TanggalPembayaran,
                Biaya = p.Biaya,
                BuktiPembayaran = p.BuktiPembayaran,
                NomorReferensiBank = p.NomorReferensiBank,
                StatusPencairan = p.StatusPencairan,
                DicairkanOleh = p.DicairkanOlehUser != null ? p.DicairkanOlehUser.Username : null
            })
            .ToListAsync();
    }

    public async Task<List<PencairanDto>> GetAllPencairanAsync()
    {
        return await _context.PencairanBeasiswa
            .Include(p => p.DicairkanOlehUser)
            .OrderByDescending(p => p.PencairanId)
            .Select(p => new PencairanDto
            {
                PencairanId = p.PencairanId,
                PengajuanId = p.PengajuanId,
                TerminKe = p.TerminKe,
                TanggalPembayaran = p.TanggalPembayaran,
                Biaya = p.Biaya,
                BuktiPembayaran = p.BuktiPembayaran,
                NomorReferensiBank = p.NomorReferensiBank,
                StatusPencairan = p.StatusPencairan,
                DicairkanOleh = p.DicairkanOlehUser != null ? p.DicairkanOlehUser.Username : null
            })
            .ToListAsync();
    }
}
