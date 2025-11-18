namespace HiHSK.Application.DTOs;

/// <summary>
/// DTO cho một câu trong monologue
/// </summary>
public class MonologueSentenceDto
{
    public string Chinese { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
}

/// <summary>
/// DTO cho conversation được generate từ AI
/// </summary>
public class ConversationDto
{
    public string Topic { get; set; } = string.Empty;
    public List<MonologueSentenceDto> Monologue { get; set; } = new();
}

