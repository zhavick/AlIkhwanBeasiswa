using System;
using System.Text.RegularExpressions;

namespace AlIkhwanBeasiswa.Infrastructure.Helpers;

public static class TerbilangHelper
{
    private static readonly string[] Satuan = {
        "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
    };

    public static string ToTerbilang(decimal nominal)
    {
        long n = (long)Math.Floor(nominal);
        if (n == 0) return "Nol Rupiah";

        string words = ConvertNumberToWords(n);
        words = Regex.Replace(words, @"\s+", " ").Trim();
        return $"{words} Rupiah";
    }

    private static string ConvertNumberToWords(long number)
    {
        if (number < 0)
            return "Minus " + ConvertNumberToWords(-number);

        if (number == 0)
            return "";

        if (number <= 11)
            return Satuan[number];

        if (number < 20)
            return Satuan[number - 10] + " Belas";

        if (number < 100)
        {
            var sisa = number % 10;
            return Satuan[number / 10] + " Puluh" + (sisa > 0 ? " " + Satuan[sisa] : "");
        }

        if (number < 200)
        {
            var sisa = number - 100;
            return "Seratus" + (sisa > 0 ? " " + ConvertNumberToWords(sisa) : "");
        }

        if (number < 1000)
        {
            var sisa = number % 100;
            return Satuan[number / 100] + " Ratus" + (sisa > 0 ? " " + ConvertNumberToWords(sisa) : "");
        }

        if (number < 2000)
        {
            var sisa = number - 1000;
            return "Seribu" + (sisa > 0 ? " " + ConvertNumberToWords(sisa) : "");
        }

        if (number < 1000000)
        {
            var sisa = number % 1000;
            return ConvertNumberToWords(number / 1000) + " Ribu" + (sisa > 0 ? " " + ConvertNumberToWords(sisa) : "");
        }

        if (number < 1000000000)
        {
            var sisa = number % 1000000;
            return ConvertNumberToWords(number / 1000000) + " Juta" + (sisa > 0 ? " " + ConvertNumberToWords(sisa) : "");
        }

        if (number < 1000000000000)
        {
            var sisa = number % 1000000000;
            return ConvertNumberToWords(number / 1000000000) + " Miliar" + (sisa > 0 ? " " + ConvertNumberToWords(sisa) : "");
        }

        var sisaTriliun = number % 1000000000000;
        return ConvertNumberToWords(number / 1000000000000) + " Triliun" + (sisaTriliun > 0 ? " " + ConvertNumberToWords(sisaTriliun) : "");
    }
}
