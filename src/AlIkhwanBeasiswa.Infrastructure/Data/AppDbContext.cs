using AlIkhwanBeasiswa.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AlIkhwanBeasiswa.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<AppPengurus> Pengurus => Set<AppPengurus>();
    public DbSet<AppRole> Roles => Set<AppRole>();
    public DbSet<AppPermission> Permissions => Set<AppPermission>();
    public DbSet<AppRolePermission> RolePermissions => Set<AppRolePermission>();
    public DbSet<AppUserRole> UserRoles => Set<AppUserRole>();
    public DbSet<AppUserProfile> UserProfiles => Set<AppUserProfile>();

    public DbSet<IkhwanOrangTua> OrangTua => Set<IkhwanOrangTua>();
    public DbSet<IkhwanSiswa> Siswa => Set<IkhwanSiswa>();
    public DbSet<IkhwanPendidikan> PendidikanSekolah => Set<IkhwanPendidikan>();
    public DbSet<IkhwanNilaiSekolah> NilaiSekolah => Set<IkhwanNilaiSekolah>();

    public DbSet<IkhwanMahasiswa> Mahasiswa => Set<IkhwanMahasiswa>();
    public DbSet<IkhwanUniversitas> Universitas => Set<IkhwanUniversitas>();
    public DbSet<IkhwanNilaiUniv> NilaiUniv => Set<IkhwanNilaiUniv>();

    public DbSet<PeriodeBeasiswa> PeriodeBeasiswa => Set<PeriodeBeasiswa>();
    public DbSet<PengajuanBeasiswa> PengajuanBeasiswa => Set<PengajuanBeasiswa>();
    public DbSet<ApprovalBeasiswa> ApprovalBeasiswa => Set<ApprovalBeasiswa>();
    public DbSet<PencairanBeasiswa> PencairanBeasiswa => Set<PencairanBeasiswa>();

    public DbSet<KaderisasiProfil> KaderisasiProfil => Set<KaderisasiProfil>();
    public DbSet<KaderisasiKegiatan> KaderisasiKegiatan => Set<KaderisasiKegiatan>();
    public DbSet<KaderisasiPresensi> KaderisasiPresensi => Set<KaderisasiPresensi>();
    public DbSet<AlumniTracerKarir> AlumniTracerKarir => Set<AlumniTracerKarir>();
    public DbSet<AlumniKontribusi> AlumniKontribusi => Set<AlumniKontribusi>();

    public DbSet<PortalPengumuman> PortalPengumuman => Set<PortalPengumuman>();
    public DbSet<PortalBanner> PortalBanner => Set<PortalBanner>();
    public DbSet<PortalSyaratDokumen> PortalSyaratDokumen => Set<PortalSyaratDokumen>();
    public DbSet<PortalDokumenPenerima> PortalDokumenPenerima => Set<PortalDokumenPenerima>();
    public DbSet<PortalHelpdeskTiket> PortalHelpdeskTiket => Set<PortalHelpdeskTiket>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Explicit Primary Keys
        modelBuilder.Entity<AppUser>().HasKey(u => u.UserId);
        modelBuilder.Entity<AppPengurus>().HasKey(p => p.PengurusId);
        modelBuilder.Entity<AppRole>().HasKey(r => r.RoleId);
        modelBuilder.Entity<AppPermission>().HasKey(p => p.PermissionId);
        modelBuilder.Entity<AppUserProfile>().HasKey(up => up.ProfileLinkId);

        modelBuilder.Entity<IkhwanOrangTua>().HasKey(ot => ot.OrangTuaId);
        modelBuilder.Entity<IkhwanSiswa>().HasKey(s => s.SiswaId);
        modelBuilder.Entity<IkhwanPendidikan>().HasKey(p => p.PendidikanId);
        modelBuilder.Entity<IkhwanNilaiSekolah>().HasKey(ns => ns.NilaiSekolahId);

        modelBuilder.Entity<IkhwanMahasiswa>().HasKey(m => m.MahasiswaId);
        modelBuilder.Entity<IkhwanUniversitas>().HasKey(u => u.UnivId);
        modelBuilder.Entity<IkhwanNilaiUniv>().HasKey(nu => nu.NilaiId);

        modelBuilder.Entity<PeriodeBeasiswa>().HasKey(pb => pb.PeriodeId);
        modelBuilder.Entity<PengajuanBeasiswa>().HasKey(pb => pb.PengajuanId);
        modelBuilder.Entity<ApprovalBeasiswa>().HasKey(ab => ab.ApprovalId);
        modelBuilder.Entity<PencairanBeasiswa>().HasKey(pb => pb.PencairanId);

        modelBuilder.Entity<KaderisasiProfil>().HasKey(kp => kp.KaderId);
        modelBuilder.Entity<KaderisasiKegiatan>().HasKey(kk => kk.KegiatanId);
        modelBuilder.Entity<KaderisasiPresensi>().HasKey(kp => kp.PresensiId);
        modelBuilder.Entity<AlumniTracerKarir>().HasKey(atk => atk.TracerId);
        modelBuilder.Entity<AlumniKontribusi>().HasKey(ak => ak.KontribusiId);

        modelBuilder.Entity<PortalPengumuman>().HasKey(pp => pp.PengumumanId);
        modelBuilder.Entity<PortalBanner>().HasKey(pb => pb.BannerId);
        modelBuilder.Entity<PortalSyaratDokumen>().HasKey(psd => psd.SyaratId);
        modelBuilder.Entity<PortalDokumenPenerima>().HasKey(pdp => pdp.DokumenId);
        modelBuilder.Entity<PortalHelpdeskTiket>().HasKey(pht => pht.TiketId);

        // RBAC Relationships
        modelBuilder.Entity<AppRolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<AppUserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<AppPengurus>()
            .HasOne(p => p.User)
            .WithOne(u => u.PengurusProfile)
            .HasForeignKey<AppPengurus>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppUserProfile>()
            .HasOne(up => up.User)
            .WithOne(u => u.RecipientProfile)
            .HasForeignKey<AppUserProfile>(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Siswa & Orang Tua
        modelBuilder.Entity<IkhwanSiswa>()
            .HasOne(s => s.OrangTua)
            .WithMany(ot => ot.AnakSiswa)
            .HasForeignKey(s => s.OrangTuaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Mahasiswa & Orang Tua
        modelBuilder.Entity<IkhwanMahasiswa>()
            .HasOne(m => m.OrangTua)
            .WithMany(ot => ot.AnakMahasiswa)
            .HasForeignKey(m => m.OrangTuaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Mahasiswa & Kaderisasi Profile (1-to-1)
        modelBuilder.Entity<KaderisasiProfil>()
            .HasOne(kp => kp.Mahasiswa)
            .WithOne(m => m.KaderisasiProfile)
            .HasForeignKey<KaderisasiProfil>(kp => kp.MahasiswaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Pengajuan Beasiswa
        modelBuilder.Entity<PengajuanBeasiswa>()
            .HasOne(pb => pb.Periode)
            .WithMany(p => p.DaftarPengajuan)
            .HasForeignKey(pb => pb.PeriodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PengajuanBeasiswa>()
            .HasOne(pb => pb.Siswa)
            .WithMany(s => s.DaftarPengajuanBeasiswa)
            .HasForeignKey(pb => pb.SiswaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PengajuanBeasiswa>()
            .HasOne(pb => pb.Mahasiswa)
            .WithMany(m => m.DaftarPengajuanBeasiswa)
            .HasForeignKey(pb => pb.MahasiswaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Approval 3 Tingkat
        modelBuilder.Entity<ApprovalBeasiswa>()
            .HasIndex(ab => new { ab.PengajuanId, ab.TingkatApproval })
            .IsUnique();

        // Presensi Kegiatan Kaderisasi
        modelBuilder.Entity<KaderisasiPresensi>()
            .HasIndex(kp => new { kp.KegiatanId, kp.MahasiswaId })
            .IsUnique();

        // Convert table and column names to snake_case for PostgreSQL
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName();
            if (!string.IsNullOrEmpty(tableName))
            {
                entity.SetTableName(ToSnakeCase(tableName));
            }

            foreach (var property in entity.GetProperties())
            {
                var columnName = property.GetColumnName();
                if (!string.IsNullOrEmpty(columnName))
                {
                    property.SetColumnName(ToSnakeCase(columnName));
                }
            }
        }
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        var startUnderscores = System.Text.RegularExpressions.Regex.Match(input, @"^_+");
        return startUnderscores + System.Text.RegularExpressions.Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToLower();
    }
}
