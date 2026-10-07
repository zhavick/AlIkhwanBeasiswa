using AlIkhwanBeasiswa.Infrastructure.Helpers;
using Xunit;

namespace AlIkhwanBeasiswa.Tests.UnitTests;

public class TerbilangHelperTests
{
    [Theory]
    [InlineData(0, "Nol Rupiah")]
    [InlineData(1, "Satu Rupiah")]
    [InlineData(12, "Dua Belas Rupiah")]
    [InlineData(105, "Seratus Lima Rupiah")]
    [InlineData(1000, "Seribu Rupiah")]
    [InlineData(2500000, "Dua Juta Lima Ratus Ribu Rupiah")]
    [InlineData(15750000, "Lima Belas Juta Tujuh Ratus Lima Puluh Ribu Rupiah")]
    public void ToTerbilang_ShouldConvertNominalCorrectly(decimal nominal, string expected)
    {
        var result = TerbilangHelper.ToTerbilang(nominal);
        Assert.Equal(expected, result);
    }
}
