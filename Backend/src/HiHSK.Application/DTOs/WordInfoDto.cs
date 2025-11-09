namespace HiHSK.Application.DTOs;

/// <summary>
/// DTO chứa thông tin từ vựng được generate từ AI
/// </summary>
public class WordInfoDto
{
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public List<WordExampleDto> Examples { get; set; } = new();
}

