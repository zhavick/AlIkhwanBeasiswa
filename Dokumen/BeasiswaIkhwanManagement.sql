CREATE TABLE [IkhwanOrangTua] (
	[orangTuaID] INTEGER NOT NULL IDENTITY,
	[namaAyah] VARCHAR(255) NOT NULL,
	[namaIbu] VARCHAR(255) NOT NULL,
	[pekerjaapekerjaanAyah] VARCHAR(255),
	[pekerjaanIbu] VARCHAR(255),
	[telahMeninggalAyah] BIT,
	[telahMeninggalIbu] BIT,
	[noTelpAyah] VARCHAR(255),
	[noTelpIbu] VARCHAR(255),
	[emailAyah] VARCHAR(255) NOT NULL,
	[emailIbu] VARCHAR(255),
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([orangTuaID])
);


CREATE TABLE [IkhwanSiswa] (
	[siswaID] INTEGER NOT NULL IDENTITY,
	[orangTuaID] INTEGER NOT NULL,
	[namaSiswa] VARCHAR(255) NOT NULL,
	[namaPanggilan] VARCHAR(255),
	[tempatLahir] VARCHAR(255) NOT NULL,
	[tanggalLahir] DATE NOT NULL,
	[alamatLengkap] VARCHAR(255) NOT NULL,
	[noTelp] VARCHAR(255) NOT NULL,
	[email] VARCHAR(255) NOT NULL,
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([siswaID])
);


CREATE TABLE [IkhwanMahasiswa] (
	[mahasiswaID] INTEGER NOT NULL IDENTITY,
	[orangTuaID] INTEGER NOT NULL,
	[namaMahasiswa] VARCHAR(255) NOT NULL,
	[namaPanggilan] VARCHAR(255),
	[tempatLahir] VARCHAR(255) NOT NULL,
	[tanggalLahir] DATE NOT NULL,
	[alamatLengkap] VARCHAR(255) NOT NULL,
	[noTelp] VARCHAR(255) NOT NULL,
	[email] VARCHAR(255) NOT NULL,
	[informasiTambahan] VARCHAR(255),
	[calonKaderisasi] BIT,
	PRIMARY KEY([mahasiswaID])
);


CREATE TABLE [IkhwanPekerjaan] (
	[pekerjaanID] INTEGER NOT NULL IDENTITY,
	[mahasiswaID] INTEGER NOT NULL,
	[namaPerusahaan] VARCHAR(255) NOT NULL,
	[bulanBergabung] INTEGER NOT NULL,
	[tahunBergabung] INTEGER NOT NULL,
	[masihBekerja] BIT,
	[bulanSelesai] INTEGER,
	[tahunSelesai] INTEGER,
	[bidangPekerjaan] VARCHAR(255) NOT NULL,
	[jabatan] VARCHAR(255) NOT NULL,
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([pekerjaanID])
);


CREATE TABLE [IkhwanPendidikan] (
	[pendidikanID] INTEGER NOT NULL IDENTITY,
	[siswaID] INTEGER NOT NULL,
	[namaSekolah] VARCHAR(255) NOT NULL,
	[alamatSekolah] VARCHAR(255) NOT NULL,
	[jenjang] VARCHAR(255) NOT NULL,
	[tanggalMasuk] DATE NOT NULL,
	[masihDalamPendidian] BIT,
	[tanggalKeluar] DATE,
	[noTelpSekolah] VARCHAR(255),
	[emailSekolah] VARCHAR(255),
	PRIMARY KEY([pendidikanID])
);


CREATE TABLE [IkhwanUniversitas] (
	[univID] INTEGER NOT NULL IDENTITY,
	[mahasiswaID] INTEGER NOT NULL,
	[namaUniversitas] VARCHAR(255) NOT NULL,
	[alamatUniversitas] VARCHAR(255),
	[noTelpUniversitas] VARCHAR(255),
	[emailUniversitas] VARCHAR(255),
	[tanggalMasuk] DATE NOT NULL,
	[masihBerjalan] BIT,
	[jenjang] VARCHAR(255) NOT NULL,
	[jurusan] VARCHAR(255) NOT NULL,
	[tanggalLulus] VARCHAR(255),
	[jumlahTahun] INTEGER NOT NULL,
	[jumlahSemester] INTEGER NOT NULL,
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([univID])
);


CREATE TABLE [IkhwanNilaiUniv] (
	[nilaiID] INTEGER NOT NULL IDENTITY,
	[mahasiswaID] INTEGER NOT NULL,
	[mataKuliah] VARCHAR(255) NOT NULL,
	[semester] INTEGER NOT NULL,
	[nilaiUTS] DECIMAL,
	[nilaiUAS] DECIMAL,
	[nilaiRata] DECIMAL NOT NULL,
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([nilaiID])
);


CREATE TABLE [IkhwanNilaiSekolah] (
	[nilaiSekolahID] INTEGER NOT NULL IDENTITY,
	[siswaID] INTEGER NOT NULL,
	[namaPelajaran] VARCHAR(255) NOT NULL,
	[semester] INTEGER NOT NULL,
	[nilaiUTS] DECIMAL,
	[nilaiUAS] DECIMAL,
	[nilaiRata] DECIMAL NOT NULL,
	[informasiTambahan] VARCHAR,
	PRIMARY KEY([nilaiSekolahID])
);


CREATE TABLE [IkhwanBeasiswaMahasiswa] (
	[beasiswaID] INTEGER NOT NULL IDENTITY,
	[mahasiswaID] INTEGER NOT NULL,
	[nilaiRata] DECIMAL NOT NULL,
	[paguBeasiswa] DECIMAL NOT NULL,
	[paguTertanggung] DECIMAL NOT NULL,
	[telahDibayar] BIT,
	[tanggalDiterima] DATE NOT NULL,
	[approvalPertama] VARCHAR(255),
	[approvalKedua] VARCHAR(255),
	[approvalTambahan] VARCHAR(255),
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([beasiswaID])
);


CREATE TABLE [IkhwanPembayaranBeaMahasiswa] (
	[pembayaranBeaMahasiswaID] INTEGER NOT NULL IDENTITY,
	[mahasiswaID] INTEGER NOT NULL,
	[tanggalPembayaran] DATE NOT NULL,
	[biaya] DECIMAL NOT NULL,
	[buktiPembayaran] VARCHAR(255) NOT NULL,
	[informasiTambahan] VARCHAR(255),
	PRIMARY KEY([pembayaranBeaMahasiswaID])
);



ALTER TABLE [IkhwanOrangTua]
ADD FOREIGN KEY([orangTuaID])
REFERENCES [IkhwanSiswa]([siswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanOrangTua]
ADD FOREIGN KEY([orangTuaID])
REFERENCES [IkhwanMahasiswa]([orangTuaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanMahasiswa]
ADD FOREIGN KEY([mahasiswaID])
REFERENCES [IkhwanPekerjaan]([mahasiswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanSiswa]
ADD FOREIGN KEY([siswaID])
REFERENCES [IkhwanPendidikan]([siswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanMahasiswa]
ADD FOREIGN KEY([mahasiswaID])
REFERENCES [IkhwanUniversitas]([mahasiswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanMahasiswa]
ADD FOREIGN KEY([mahasiswaID])
REFERENCES [IkhwanNilaiUniv]([mahasiswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanSiswa]
ADD FOREIGN KEY([siswaID])
REFERENCES [IkhwanNilaiSekolah]([siswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanMahasiswa]
ADD FOREIGN KEY([mahasiswaID])
REFERENCES [IkhwanBeasiswaMahasiswa]([mahasiswaID])
ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [IkhwanMahasiswa]
ADD FOREIGN KEY([mahasiswaID])
REFERENCES [IkhwanPembayaranBeaMahasiswa]([mahasiswaID])
ON UPDATE CASCADE ON DELETE CASCADE;
