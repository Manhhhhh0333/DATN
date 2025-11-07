namespace HiHSK.Application.DTOs;

public class WordDto
{
    public int Id { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public int? HSKLevel { get; set; }
    public int? StrokeCount { get; set; }
}







