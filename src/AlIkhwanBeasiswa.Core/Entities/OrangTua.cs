namespace AlIkhwanBeasiswa.Core.Entities;

public class IkhwanOrangTua
{
    public int OrangTuaId { get; set; }
    public string NamaAyah { get; set; } = string.Empty;
    public string NamaIbu { get; set; } = string.Empty;
    public string? PekerjaanAyah { get; set; }
    public string? PekerjaanIbu { get; set; }
    public bool TelahMeninggalAyah { get; set; } = false;
    public bool TelahMeninggalIbu { get; set; } = false;
    public string? NoTelpAyah { get; set; }
    public string? NoTelpIbu { get; set; }
    public string? EmailAyah { get; set; }
    public string? EmailIbu { get; set; }
    public string? InformasiTambahan { get; set; }

    // Navigation properties
    public ICollection<IkhwanSiswa> AnakSiswa { get; set; } = new List<IkhwanSiswa>();
    public ICollection<IkhwanMahasiswa> AnakMahasiswa { get; set; } = new List<IkhwanMahasiswa>();
}
