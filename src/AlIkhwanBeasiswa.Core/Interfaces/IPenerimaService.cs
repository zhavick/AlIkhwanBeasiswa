using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IPenerimaService
{
    // Siswa
    Task<List<SiswaListDto>> GetAllSiswaAsync();
    Task<SiswaDetailDto?> GetSiswaByIdAsync(int siswaId);
    Task<NilaiSekolahDto> InputNilaiSekolahAsync(InputNilaiSekolahDto request);

    // Mahasiswa
    Task<List<MahasiswaListDto>> GetAllMahasiswaAsync();
    Task<MahasiswaDetailDto?> GetMahasiswaByIdAsync(int mahasiswaId);
    Task<NilaiUnivDto> InputNilaiUnivAsync(InputNilaiUnivDto request);
    Task<bool> LuluskanMahasiswaAsync(int mahasiswaId, DateTime tanggalLulus);
}
