using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AlIkhwanBeasiswa.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "kaderisasi_kegiatan",
                columns: table => new
                {
                    kegiatan_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nama_kegiatan = table.Column<string>(type: "text", nullable: false),
                    deskripsi = table.Column<string>(type: "text", nullable: true),
                    tanggal_kegiatan = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    tempat = table.Column<string>(type: "text", nullable: false),
                    tipe_kegiatan = table.Column<string>(type: "text", nullable: false),
                    wajib_hadir = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kaderisasi_kegiatan", x => x.kegiatan_id);
                });

            migrationBuilder.CreateTable(
                name: "orang_tua",
                columns: table => new
                {
                    orang_tua_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nama_ayah = table.Column<string>(type: "text", nullable: false),
                    nama_ibu = table.Column<string>(type: "text", nullable: false),
                    pekerjaan_ayah = table.Column<string>(type: "text", nullable: true),
                    pekerjaan_ibu = table.Column<string>(type: "text", nullable: true),
                    telah_meninggal_ayah = table.Column<bool>(type: "boolean", nullable: false),
                    telah_meninggal_ibu = table.Column<bool>(type: "boolean", nullable: false),
                    no_telp_ayah = table.Column<string>(type: "text", nullable: true),
                    no_telp_ibu = table.Column<string>(type: "text", nullable: true),
                    email_ayah = table.Column<string>(type: "text", nullable: true),
                    email_ibu = table.Column<string>(type: "text", nullable: true),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orang_tua", x => x.orang_tua_id);
                });

            migrationBuilder.CreateTable(
                name: "periode_beasiswa",
                columns: table => new
                {
                    periode_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nama_periode = table.Column<string>(type: "text", nullable: false),
                    tanggal_mulai_daftar = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    tanggal_selesai_daftar = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_anggaran_pagu = table.Column<decimal>(type: "numeric", nullable: false),
                    kuota_siswa = table.Column<int>(type: "integer", nullable: false),
                    kuota_mahasiswa = table.Column<int>(type: "integer", nullable: false),
                    status_aktif = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_periode_beasiswa", x => x.periode_id);
                });

            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    permission_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    permission_code = table.Column<string>(type: "text", nullable: false),
                    modul = table.Column<string>(type: "text", nullable: false),
                    deskripsi = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissions", x => x.permission_id);
                });

            migrationBuilder.CreateTable(
                name: "portal_banner",
                columns: table => new
                {
                    banner_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    judul = table.Column<string>(type: "text", nullable: false),
                    subjudul = table.Column<string>(type: "text", nullable: true),
                    gambar_url = table.Column<string>(type: "text", nullable: false),
                    link_url = table.Column<string>(type: "text", nullable: true),
                    urutan = table.Column<int>(type: "integer", nullable: false),
                    status_aktif = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_banner", x => x.banner_id);
                });

            migrationBuilder.CreateTable(
                name: "portal_syarat_dokumen",
                columns: table => new
                {
                    syarat_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nama_dokumen = table.Column<string>(type: "text", nullable: false),
                    deskripsi = table.Column<string>(type: "text", nullable: true),
                    wajib = table.Column<bool>(type: "boolean", nullable: false),
                    tipe_penerima = table.Column<string>(type: "text", nullable: false),
                    format_file_diizinkan = table.Column<string>(type: "text", nullable: false),
                    max_size_mb = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_syarat_dokumen", x => x.syarat_id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_name = table.Column<string>(type: "text", nullable: false),
                    deskripsi = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "mahasiswa",
                columns: table => new
                {
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    orang_tua_id = table.Column<int>(type: "integer", nullable: false),
                    nama_mahasiswa = table.Column<string>(type: "text", nullable: false),
                    nama_panggilan = table.Column<string>(type: "text", nullable: true),
                    tempat_lahir = table.Column<string>(type: "text", nullable: false),
                    tanggal_lahir = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    alamat_lengkap = table.Column<string>(type: "text", nullable: false),
                    no_telp = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    calon_kaderisasi = table.Column<bool>(type: "boolean", nullable: false),
                    status_akademik = table.Column<int>(type: "integer", nullable: false),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mahasiswa", x => x.mahasiswa_id);
                    table.ForeignKey(
                        name: "FK_mahasiswa_orang_tua_orang_tua_id",
                        column: x => x.orang_tua_id,
                        principalTable: "orang_tua",
                        principalColumn: "orang_tua_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "siswa",
                columns: table => new
                {
                    siswa_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    orang_tua_id = table.Column<int>(type: "integer", nullable: false),
                    nama_siswa = table.Column<string>(type: "text", nullable: false),
                    nama_panggilan = table.Column<string>(type: "text", nullable: true),
                    tempat_lahir = table.Column<string>(type: "text", nullable: false),
                    tanggal_lahir = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    alamat_lengkap = table.Column<string>(type: "text", nullable: false),
                    no_telp = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_siswa", x => x.siswa_id);
                    table.ForeignKey(
                        name: "FK_siswa_orang_tua_orang_tua_id",
                        column: x => x.orang_tua_id,
                        principalTable: "orang_tua",
                        principalColumn: "orang_tua_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "role_permissions",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "integer", nullable: false),
                    permission_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_permissions", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "FK_role_permissions_permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "permissions",
                        principalColumn: "permission_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_role_permissions_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pengurus",
                columns: table => new
                {
                    pengurus_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    nip = table.Column<string>(type: "text", nullable: true),
                    nama_lengkap = table.Column<string>(type: "text", nullable: false),
                    gelar = table.Column<string>(type: "text", nullable: true),
                    jabatan = table.Column<string>(type: "text", nullable: false),
                    divisi = table.Column<string>(type: "text", nullable: false),
                    no_telp = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    alamat_lengkap = table.Column<string>(type: "text", nullable: true),
                    tanggal_mulai_menjabat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    tanggal_akhir_menjabat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status_aktif = table.Column<bool>(type: "boolean", nullable: false),
                    foto_profil_url = table.Column<string>(type: "text", nullable: true),
                    tanda_tangan_digital_url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pengurus", x => x.pengurus_id);
                    table.ForeignKey(
                        name: "FK_pengurus_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "portal_helpdesk_tiket",
                columns: table => new
                {
                    tiket_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    nomor_tiket = table.Column<string>(type: "text", nullable: false),
                    subjek = table.Column<string>(type: "text", nullable: false),
                    pesan = table.Column<string>(type: "text", nullable: false),
                    kategori = table.Column<string>(type: "text", nullable: false),
                    status_tiket = table.Column<int>(type: "integer", nullable: false),
                    jawaban_admin = table.Column<string>(type: "text", nullable: true),
                    dijawab_oleh_user_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_helpdesk_tiket", x => x.tiket_id);
                    table.ForeignKey(
                        name: "FK_portal_helpdesk_tiket_users_dijawab_oleh_user_id",
                        column: x => x.dijawab_oleh_user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK_portal_helpdesk_tiket_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "portal_pengumuman",
                columns: table => new
                {
                    pengumuman_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    judul = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    ringkasan = table.Column<string>(type: "text", nullable: true),
                    isi_konten = table.Column<string>(type: "text", nullable: false),
                    gambar_cover_url = table.Column<string>(type: "text", nullable: true),
                    kategori = table.Column<string>(type: "text", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    tanggal_terbit = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    penulis_user_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_pengumuman", x => x.pengumuman_id);
                    table.ForeignKey(
                        name: "FK_portal_pengumuman_users_penulis_user_id",
                        column: x => x.penulis_user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    role_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "FK_user_roles_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_roles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "alumni_kontribusi",
                columns: table => new
                {
                    kontribusi_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false),
                    tipe_kontribusi = table.Column<string>(type: "text", nullable: false),
                    deskripsi_kontribusi = table.Column<string>(type: "text", nullable: true),
                    tanggal_kontribusi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    nominal_donasi = table.Column<decimal>(type: "numeric", nullable: true),
                    status_aktif = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alumni_kontribusi", x => x.kontribusi_id);
                    table.ForeignKey(
                        name: "FK_alumni_kontribusi_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "alumni_tracer_karir",
                columns: table => new
                {
                    tracer_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false),
                    nama_perusahaan = table.Column<string>(type: "text", nullable: false),
                    bidang_pekerjaan = table.Column<string>(type: "text", nullable: false),
                    jabatan = table.Column<string>(type: "text", nullable: false),
                    status_pekerjaan = table.Column<int>(type: "integer", nullable: false),
                    bulan_bergabung = table.Column<int>(type: "integer", nullable: false),
                    tahun_bergabung = table.Column<int>(type: "integer", nullable: false),
                    masih_bekerja = table.Column<bool>(type: "boolean", nullable: false),
                    bulan_selesai = table.Column<int>(type: "integer", nullable: true),
                    tahun_selesai = table.Column<int>(type: "integer", nullable: true),
                    rentang_gaji = table.Column<string>(type: "text", nullable: true),
                    keselarasan_jurusan = table.Column<string>(type: "text", nullable: true),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alumni_tracer_karir", x => x.tracer_id);
                    table.ForeignKey(
                        name: "FK_alumni_tracer_karir_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "kaderisasi_presensi",
                columns: table => new
                {
                    presensi_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kegiatan_id = table.Column<int>(type: "integer", nullable: false),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false),
                    status_kehadiran = table.Column<int>(type: "integer", nullable: false),
                    waktu_presensi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    keterangan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kaderisasi_presensi", x => x.presensi_id);
                    table.ForeignKey(
                        name: "FK_kaderisasi_presensi_kaderisasi_kegiatan_kegiatan_id",
                        column: x => x.kegiatan_id,
                        principalTable: "kaderisasi_kegiatan",
                        principalColumn: "kegiatan_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_kaderisasi_presensi_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "kaderisasi_profil",
                columns: table => new
                {
                    kader_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false),
                    status_kader = table.Column<int>(type: "integer", nullable: false),
                    kelompok_halaqah = table.Column<string>(type: "text", nullable: true),
                    nama_murabbi = table.Column<string>(type: "text", nullable: true),
                    tingkat_pembinaan = table.Column<string>(type: "text", nullable: false),
                    catatan_perkembangan = table.Column<string>(type: "text", nullable: true),
                    tanggal_bergabung = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kaderisasi_profil", x => x.kader_id);
                    table.ForeignKey(
                        name: "FK_kaderisasi_profil_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "universitas",
                columns: table => new
                {
                    univ_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false),
                    nama_universitas = table.Column<string>(type: "text", nullable: false),
                    alamat_universitas = table.Column<string>(type: "text", nullable: true),
                    no_telp_universitas = table.Column<string>(type: "text", nullable: true),
                    email_universitas = table.Column<string>(type: "text", nullable: true),
                    tanggal_masuk = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    masih_berjalan = table.Column<bool>(type: "boolean", nullable: false),
                    jenjang = table.Column<string>(type: "text", nullable: false),
                    jurusan = table.Column<string>(type: "text", nullable: false),
                    tanggal_lulus = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    jumlah_tahun = table.Column<int>(type: "integer", nullable: false),
                    jumlah_semester = table.Column<int>(type: "integer", nullable: false),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_universitas", x => x.univ_id);
                    table.ForeignKey(
                        name: "FK_universitas_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pendidikan_sekolah",
                columns: table => new
                {
                    pendidikan_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    siswa_id = table.Column<int>(type: "integer", nullable: false),
                    nama_sekolah = table.Column<string>(type: "text", nullable: false),
                    alamat_sekolah = table.Column<string>(type: "text", nullable: false),
                    jenjang = table.Column<string>(type: "text", nullable: false),
                    tanggal_masuk = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    masih_dalam_pendidikan = table.Column<bool>(type: "boolean", nullable: false),
                    tanggal_keluar = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    no_telp_sekolah = table.Column<string>(type: "text", nullable: true),
                    email_sekolah = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pendidikan_sekolah", x => x.pendidikan_id);
                    table.ForeignKey(
                        name: "FK_pendidikan_sekolah_siswa_siswa_id",
                        column: x => x.siswa_id,
                        principalTable: "siswa",
                        principalColumn: "siswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pengajuan_beasiswa",
                columns: table => new
                {
                    pengajuan_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    periode_id = table.Column<int>(type: "integer", nullable: false),
                    tipe_penerima = table.Column<int>(type: "integer", nullable: false),
                    siswa_id = table.Column<int>(type: "integer", nullable: true),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: true),
                    nilai_rata_rata = table.Column<decimal>(type: "numeric", nullable: false),
                    pagu_beasiswa = table.Column<decimal>(type: "numeric", nullable: false),
                    pagu_tertanggung = table.Column<decimal>(type: "numeric", nullable: false),
                    telah_dibayar_lunas = table.Column<bool>(type: "boolean", nullable: false),
                    tanggal_pengajuan = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status_pengajuan = table.Column<int>(type: "integer", nullable: false),
                    catatan_pengajuan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pengajuan_beasiswa", x => x.pengajuan_id);
                    table.ForeignKey(
                        name: "FK_pengajuan_beasiswa_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_pengajuan_beasiswa_periode_beasiswa_periode_id",
                        column: x => x.periode_id,
                        principalTable: "periode_beasiswa",
                        principalColumn: "periode_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_pengajuan_beasiswa_siswa_siswa_id",
                        column: x => x.siswa_id,
                        principalTable: "siswa",
                        principalColumn: "siswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_profiles",
                columns: table => new
                {
                    profile_link_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    siswa_id = table.Column<int>(type: "integer", nullable: true),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_profiles", x => x.profile_link_id);
                    table.ForeignKey(
                        name: "FK_user_profiles_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id");
                    table.ForeignKey(
                        name: "FK_user_profiles_siswa_siswa_id",
                        column: x => x.siswa_id,
                        principalTable: "siswa",
                        principalColumn: "siswa_id");
                    table.ForeignKey(
                        name: "FK_user_profiles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "nilai_univ",
                columns: table => new
                {
                    nilai_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    univ_id = table.Column<int>(type: "integer", nullable: false),
                    mahasiswa_id = table.Column<int>(type: "integer", nullable: false),
                    mata_kuliah = table.Column<string>(type: "text", nullable: false),
                    semester = table.Column<int>(type: "integer", nullable: false),
                    nilai_uts = table.Column<decimal>(type: "numeric", nullable: true),
                    nilai_uas = table.Column<decimal>(type: "numeric", nullable: true),
                    nilai_rata = table.Column<decimal>(type: "numeric", nullable: false),
                    sks = table.Column<int>(type: "integer", nullable: false),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true),
                    universitas_univ_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nilai_univ", x => x.nilai_id);
                    table.ForeignKey(
                        name: "FK_nilai_univ_mahasiswa_mahasiswa_id",
                        column: x => x.mahasiswa_id,
                        principalTable: "mahasiswa",
                        principalColumn: "mahasiswa_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_nilai_univ_universitas_universitas_univ_id",
                        column: x => x.universitas_univ_id,
                        principalTable: "universitas",
                        principalColumn: "univ_id");
                });

            migrationBuilder.CreateTable(
                name: "nilai_sekolah",
                columns: table => new
                {
                    nilai_sekolah_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pendidikan_id = table.Column<int>(type: "integer", nullable: false),
                    siswa_id = table.Column<int>(type: "integer", nullable: false),
                    nama_pelajaran = table.Column<string>(type: "text", nullable: false),
                    semester = table.Column<int>(type: "integer", nullable: false),
                    nilai_uts = table.Column<decimal>(type: "numeric", nullable: true),
                    nilai_uas = table.Column<decimal>(type: "numeric", nullable: true),
                    nilai_rata = table.Column<decimal>(type: "numeric", nullable: false),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nilai_sekolah", x => x.nilai_sekolah_id);
                    table.ForeignKey(
                        name: "FK_nilai_sekolah_pendidikan_sekolah_pendidikan_id",
                        column: x => x.pendidikan_id,
                        principalTable: "pendidikan_sekolah",
                        principalColumn: "pendidikan_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_nilai_sekolah_siswa_siswa_id",
                        column: x => x.siswa_id,
                        principalTable: "siswa",
                        principalColumn: "siswa_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "approval_beasiswa",
                columns: table => new
                {
                    approval_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pengajuan_id = table.Column<int>(type: "integer", nullable: false),
                    tingkat_approval = table.Column<int>(type: "integer", nullable: false),
                    approver_user_id = table.Column<int>(type: "integer", nullable: false),
                    status_approval = table.Column<int>(type: "integer", nullable: false),
                    catatan_approval = table.Column<string>(type: "text", nullable: true),
                    tanggal_approval = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_beasiswa", x => x.approval_id);
                    table.ForeignKey(
                        name: "FK_approval_beasiswa_pengajuan_beasiswa_pengajuan_id",
                        column: x => x.pengajuan_id,
                        principalTable: "pengajuan_beasiswa",
                        principalColumn: "pengajuan_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_approval_beasiswa_users_approver_user_id",
                        column: x => x.approver_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pencairan_beasiswa",
                columns: table => new
                {
                    pencairan_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pengajuan_id = table.Column<int>(type: "integer", nullable: false),
                    termin_ke = table.Column<int>(type: "integer", nullable: false),
                    tanggal_pembayaran = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    biaya = table.Column<decimal>(type: "numeric", nullable: false),
                    bukti_pembayaran = table.Column<string>(type: "text", nullable: false),
                    nomor_referensi_bank = table.Column<string>(type: "text", nullable: true),
                    status_pencairan = table.Column<int>(type: "integer", nullable: false),
                    dicairkan_oleh_user_id = table.Column<int>(type: "integer", nullable: true),
                    informasi_tambahan = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pencairan_beasiswa", x => x.pencairan_id);
                    table.ForeignKey(
                        name: "FK_pencairan_beasiswa_pengajuan_beasiswa_pengajuan_id",
                        column: x => x.pengajuan_id,
                        principalTable: "pengajuan_beasiswa",
                        principalColumn: "pengajuan_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_pencairan_beasiswa_users_dicairkan_oleh_user_id",
                        column: x => x.dicairkan_oleh_user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "portal_dokumen_penerima",
                columns: table => new
                {
                    dokumen_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pengajuan_id = table.Column<int>(type: "integer", nullable: false),
                    syarat_id = table.Column<int>(type: "integer", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    nama_file_asli = table.Column<string>(type: "text", nullable: false),
                    tanggal_unggah = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status_verifikasi = table.Column<string>(type: "text", nullable: false),
                    catatan_revisi = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_portal_dokumen_penerima", x => x.dokumen_id);
                    table.ForeignKey(
                        name: "FK_portal_dokumen_penerima_pengajuan_beasiswa_pengajuan_id",
                        column: x => x.pengajuan_id,
                        principalTable: "pengajuan_beasiswa",
                        principalColumn: "pengajuan_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_portal_dokumen_penerima_portal_syarat_dokumen_syarat_id",
                        column: x => x.syarat_id,
                        principalTable: "portal_syarat_dokumen",
                        principalColumn: "syarat_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_alumni_kontribusi_mahasiswa_id",
                table: "alumni_kontribusi",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_alumni_tracer_karir_mahasiswa_id",
                table: "alumni_tracer_karir",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_approval_beasiswa_approver_user_id",
                table: "approval_beasiswa",
                column: "approver_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_approval_beasiswa_pengajuan_id_tingkat_approval",
                table: "approval_beasiswa",
                columns: new[] { "pengajuan_id", "tingkat_approval" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_kaderisasi_presensi_kegiatan_id_mahasiswa_id",
                table: "kaderisasi_presensi",
                columns: new[] { "kegiatan_id", "mahasiswa_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_kaderisasi_presensi_mahasiswa_id",
                table: "kaderisasi_presensi",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_kaderisasi_profil_mahasiswa_id",
                table: "kaderisasi_profil",
                column: "mahasiswa_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mahasiswa_orang_tua_id",
                table: "mahasiswa",
                column: "orang_tua_id");

            migrationBuilder.CreateIndex(
                name: "IX_nilai_sekolah_pendidikan_id",
                table: "nilai_sekolah",
                column: "pendidikan_id");

            migrationBuilder.CreateIndex(
                name: "IX_nilai_sekolah_siswa_id",
                table: "nilai_sekolah",
                column: "siswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_nilai_univ_mahasiswa_id",
                table: "nilai_univ",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_nilai_univ_universitas_univ_id",
                table: "nilai_univ",
                column: "universitas_univ_id");

            migrationBuilder.CreateIndex(
                name: "IX_pencairan_beasiswa_dicairkan_oleh_user_id",
                table: "pencairan_beasiswa",
                column: "dicairkan_oleh_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_pencairan_beasiswa_pengajuan_id",
                table: "pencairan_beasiswa",
                column: "pengajuan_id");

            migrationBuilder.CreateIndex(
                name: "IX_pendidikan_sekolah_siswa_id",
                table: "pendidikan_sekolah",
                column: "siswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_pengajuan_beasiswa_mahasiswa_id",
                table: "pengajuan_beasiswa",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_pengajuan_beasiswa_periode_id",
                table: "pengajuan_beasiswa",
                column: "periode_id");

            migrationBuilder.CreateIndex(
                name: "IX_pengajuan_beasiswa_siswa_id",
                table: "pengajuan_beasiswa",
                column: "siswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_pengurus_user_id",
                table: "pengurus",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_portal_dokumen_penerima_pengajuan_id",
                table: "portal_dokumen_penerima",
                column: "pengajuan_id");

            migrationBuilder.CreateIndex(
                name: "IX_portal_dokumen_penerima_syarat_id",
                table: "portal_dokumen_penerima",
                column: "syarat_id");

            migrationBuilder.CreateIndex(
                name: "IX_portal_helpdesk_tiket_dijawab_oleh_user_id",
                table: "portal_helpdesk_tiket",
                column: "dijawab_oleh_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_portal_helpdesk_tiket_user_id",
                table: "portal_helpdesk_tiket",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_portal_pengumuman_penulis_user_id",
                table: "portal_pengumuman",
                column: "penulis_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_permissions_permission_id",
                table: "role_permissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "IX_siswa_orang_tua_id",
                table: "siswa",
                column: "orang_tua_id");

            migrationBuilder.CreateIndex(
                name: "IX_universitas_mahasiswa_id",
                table: "universitas",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_mahasiswa_id",
                table: "user_profiles",
                column: "mahasiswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_siswa_id",
                table: "user_profiles",
                column: "siswa_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_user_id",
                table: "user_profiles",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_roles_role_id",
                table: "user_roles",
                column: "role_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "alumni_kontribusi");

            migrationBuilder.DropTable(
                name: "alumni_tracer_karir");

            migrationBuilder.DropTable(
                name: "approval_beasiswa");

            migrationBuilder.DropTable(
                name: "kaderisasi_presensi");

            migrationBuilder.DropTable(
                name: "kaderisasi_profil");

            migrationBuilder.DropTable(
                name: "nilai_sekolah");

            migrationBuilder.DropTable(
                name: "nilai_univ");

            migrationBuilder.DropTable(
                name: "pencairan_beasiswa");

            migrationBuilder.DropTable(
                name: "pengurus");

            migrationBuilder.DropTable(
                name: "portal_banner");

            migrationBuilder.DropTable(
                name: "portal_dokumen_penerima");

            migrationBuilder.DropTable(
                name: "portal_helpdesk_tiket");

            migrationBuilder.DropTable(
                name: "portal_pengumuman");

            migrationBuilder.DropTable(
                name: "role_permissions");

            migrationBuilder.DropTable(
                name: "user_profiles");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "kaderisasi_kegiatan");

            migrationBuilder.DropTable(
                name: "pendidikan_sekolah");

            migrationBuilder.DropTable(
                name: "universitas");

            migrationBuilder.DropTable(
                name: "pengajuan_beasiswa");

            migrationBuilder.DropTable(
                name: "portal_syarat_dokumen");

            migrationBuilder.DropTable(
                name: "permissions");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "mahasiswa");

            migrationBuilder.DropTable(
                name: "periode_beasiswa");

            migrationBuilder.DropTable(
                name: "siswa");

            migrationBuilder.DropTable(
                name: "orang_tua");
        }
    }
}
