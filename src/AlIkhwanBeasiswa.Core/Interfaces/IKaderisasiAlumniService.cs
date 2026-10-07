using AlIkhwanBeasiswa.Core.DTOs;

namespace AlIkhwanBeasiswa.Core.Interfaces;

public interface IKaderisasiAlumniService
{
    // Kaderisasi
    Task<List<KaderisasiProfilDto>> GetKaderListAsync();
    Task<KaderisasiProfilDto?> GetKaderByMahasiswaIdAsync(int mahasiswaId);
    Task<KaderisasiProfilDto?> GetKaderByUserIdAsync(int userId);
    Task<bool> UpdateKaderProfilAsync(int mahasiswaId, UpdateKaderisasiProfilDto request);

    Task<List<KaderisasiKegiatanDto>> GetAllKegiatanAsync();
    Task<KaderisasiKegiatanDto> CreateKegiatanAsync(CreateKegiatanDto request);
    Task<bool> RecordPresensiAsync(InputPresensiDto request);
    Task<List<PresensiPesertaDto>> GetPresensiKegiatanAsync(int kegiatanId);

    // Alumni Tracer
    Task<List<AlumniTracerDto>> GetTracerListAsync();
    Task<AlumniTracerDto?> GetTracerByMahasiswaIdAsync(int mahasiswaId);
    Task<AlumniTracerDto?> GetTracerByUserIdAsync(int userId);
    Task<bool> UpdateTracerAsync(int mahasiswaId, UpdateAlumniTracerDto request);
    Task<AlumniStatistikDto> GetStatistikAlumniAsync();

    // Alumni Kontribusi
    Task<List<AlumniKontribusiDto>> GetKontribusiListAsync();
    Task<AlumniKontribusiDto> AddKontribusiAsync(CreateAlumniKontribusiDto request);
}
