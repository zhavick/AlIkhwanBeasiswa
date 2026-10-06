using AlIkhwanBeasiswa.Core.Entities;
using AlIkhwanBeasiswa.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AlIkhwanBeasiswa.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetService<ILoggerFactory>()?.CreateLogger("DbSeeder");

        try
        {
            // Pastikan database telah dibuat / termigrasi jika memungkinkan
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            logger?.LogWarning(ex, "Database migration failed during startup (database server might not be running yet). Continuing with memory check.");
        }

        // 1. Seed Roles
        var roleNames = new[]
        {
            "SuperAdmin", "PimpinanYayasan", "KoordinatorBeasiswa",
            "Verifikator", "Bendahara", "PembinaKader",
            "Mahasiswa", "Siswa", "Alumni"
        };

        foreach (var roleName in roleNames)
        {
            if (!await context.Roles.AnyAsync(r => r.RoleName == roleName))
            {
                context.Roles.Add(new AppRole
                {
                    RoleName = roleName,
                    Deskripsi = $"Role untuk {roleName}"
                });
            }
        }
        await context.SaveChangesAsync();

        // 2. Seed Permissions
        var permissions = new (string Code, string Modul, string Deskripsi)[]
        {
            ("beasiswa.view", "Beasiswa", "Melihat data beasiswa"),
            ("beasiswa.create", "Beasiswa", "Membuat pengajuan beasiswa"),
            ("beasiswa.verify", "Beasiswa", "Verifikasi berkas beasiswa tahap 1"),
            ("beasiswa.approve_tahap1", "Beasiswa", "Approval verifikasi administrasi"),
            ("beasiswa.approve_tahap2", "Beasiswa", "Approval koordinator program"),
            ("beasiswa.approve_tahap3", "Beasiswa", "Approval final pimpinan yayasan"),
            ("pencairan.disburse", "Keuangan", "Mengeksekusi pencairan beasiswa"),
            ("pengurus.manage", "Pengurus", "Mengelola data pengurus dan jabatan"),
            ("rbac.manage", "Keamanan", "Mengelola hak akses role dan permission"),
            ("penerima.manage", "Penerima", "Mengelola data siswa dan mahasiswa"),
            ("kaderisasi.manage", "Kaderisasi", "Mengelola program pembinaan dan presensi"),
            ("alumni.tracer", "Alumni", "Mengelola dan mengisi tracer study karir alumni"),
            ("portal.manage", "PortalCMS", "Mengelola konten pengumuman, banner, dan syarat dokumen")
        };

        foreach (var p in permissions)
        {
            if (!await context.Permissions.AnyAsync(x => x.PermissionCode == p.Code))
            {
                context.Permissions.Add(new AppPermission
                {
                    PermissionCode = p.Code,
                    Modul = p.Modul,
                    Deskripsi = p.Deskripsi
                });
            }
        }
        await context.SaveChangesAsync();

        // 3. Assign All Permissions to SuperAdmin Role
        var superAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SuperAdmin");
        if (superAdminRole != null)
        {
            var allPerms = await context.Permissions.ToListAsync();
            foreach (var perm in allPerms)
            {
                if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == superAdminRole.RoleId && rp.PermissionId == perm.PermissionId))
                {
                    context.RolePermissions.Add(new AppRolePermission
                    {
                        RoleId = superAdminRole.RoleId,
                        PermissionId = perm.PermissionId
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // 4. Seed Default SuperAdmin User
        var adminEmail = "admin@alikhwan.id";
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (adminUser == null)
        {
            adminUser = new AppUser
            {
                Username = "superadmin",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            if (superAdminRole != null)
            {
                context.UserRoles.Add(new AppUserRole
                {
                    UserId = adminUser.UserId,
                    RoleId = superAdminRole.RoleId
                });
            }

            // Seed profil pengurus untuk SuperAdmin
            context.Pengurus.Add(new AppPengurus
            {
                UserId = adminUser.UserId,
                Nip = "PGR-2026-001",
                NamaLengkap = "Administrator Yayasan Al-Ikhwan",
                Jabatan = "Direktur Eksekutif",
                Divisi = "Manajemen & Teknologi",
                Email = adminEmail,
                TanggalMulaiMenjabat = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusAktif = true
            });

            await context.SaveChangesAsync();
        }

        // 5. Seed Syarat Dokumen
        if (!await context.PortalSyaratDokumen.AnyAsync())
        {
            context.PortalSyaratDokumen.AddRange(
                new PortalSyaratDokumen
                {
                    NamaDokumen = "Scan Kartu Keluarga (KK)",
                    Deskripsi = "Scan asli Kartu Keluarga terbaru",
                    Wajib = true,
                    TipePenerima = "Semua",
                    FormatFileDiizinkan = "pdf,jpg,png",
                    MaxSizeMb = 3
                },
                new PortalSyaratDokumen
                {
                    NamaDokumen = "Scan KTP / Kartu Identitas Anak (KIA)",
                    Deskripsi = "Scan identitas resmi siswa/mahasiswa",
                    Wajib = true,
                    TipePenerima = "Semua",
                    FormatFileDiizinkan = "pdf,jpg,png",
                    MaxSizeMb = 2
                },
                new PortalSyaratDokumen
                {
                    NamaDokumen = "Surat Keterangan Tidak Mampu (SKTM)",
                    Deskripsi = "Surat keterangan dari kelurahan setempat / rekomendasi DKM masjid",
                    Wajib = true,
                    TipePenerima = "Semua",
                    FormatFileDiizinkan = "pdf,jpg,png",
                    MaxSizeMb = 3
                },
                new PortalSyaratDokumen
                {
                    NamaDokumen = "Scan Rapor Semester Terakhir",
                    Deskripsi = "Bagi siswa SD, SMP, SMA/SMK",
                    Wajib = true,
                    TipePenerima = "Siswa",
                    FormatFileDiizinkan = "pdf",
                    MaxSizeMb = 5
                },
                new PortalSyaratDokumen
                {
                    NamaDokumen = "Scan Kartu Hasil Studi (KHS) / Transkrip",
                    Deskripsi = "Bagi mahasiswa perguruan tinggi (legalisir)",
                    Wajib = true,
                    TipePenerima = "Mahasiswa",
                    FormatFileDiizinkan = "pdf",
                    MaxSizeMb = 5
                }
            );
            await context.SaveChangesAsync();
        }

        // 6. Seed Sample Periode Beasiswa Aktif
        if (!await context.PeriodeBeasiswa.AnyAsync())
        {
            context.PeriodeBeasiswa.Add(new PeriodeBeasiswa
            {
                NamaPeriode = "Tahun Ajaran 2026/2027 - Gelombang 1",
                TanggalMulaiDaftar = DateTime.UtcNow.AddDays(-15),
                TanggalSelesaiDaftar = DateTime.UtcNow.AddMonths(2),
                TotalAnggaranPagu = 250000000m, // Rp 250 Juta
                KuotaSiswa = 60,
                KuotaMahasiswa = 40,
                StatusAktif = true
            });
            await context.SaveChangesAsync();
        }

        // 7. Seed Sample Pengumuman & Banner Portal
        if (!await context.PortalPengumuman.AnyAsync())
        {
            context.PortalPengumuman.Add(new PortalPengumuman
            {
                Judul = "Pembukaan Pendaftaran Beasiswa Pendidikan Yayasan Al-Ikhwan 2026/2027",
                Slug = "pembukaan-pendaftaran-beasiswa-2026-2027",
                Ringkasan = "Pendaftaran program beasiswa pendidikan untuk jenjang Siswa SD/SMP/SMA dan Mahasiswa D3/S1 resmi dibuka.",
                IsiKonten = "Yayasan Al-Ikhwan membuka kesempatan beasiswa pendidikan bagi para pelajar dan mahasiswa berprestasi dari keluarga dhuafa/yatim. Silakan melengkapi berkas persyaratan melalui portal mandiri.",
                Kategori = "Info Beasiswa",
                IsPublished = true,
                TanggalTerbit = DateTime.UtcNow,
                PenulisUserId = adminUser?.UserId
            });
            await context.SaveChangesAsync();
        }

        if (!await context.PortalBanner.AnyAsync())
        {
            context.PortalBanner.Add(new PortalBanner
            {
                Judul = "Wujudkan Masa Depan Gemilang Bersama Al-Ikhwan",
                Subjudul = "Program beasiswa terpadu, pembinaan akhlak, dan kaderisasi generasi bangsa.",
                GambarUrl = "/assets/hero.png",
                LinkUrl = "/portal/pengajuan-baru",
                Urutan = 1,
                StatusAktif = true
            });
            await context.SaveChangesAsync();
        }
    }
}
