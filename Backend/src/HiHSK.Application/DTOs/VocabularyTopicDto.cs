namespace HiHSK.Application.DTOs;

public class VocabularyTopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public int WordCount { get; set; }
}

public class VocabularyTopicDetailDto : VocabularyTopicDto
{
    public List<WordWithProgressDto> Words { get; set; } = new();
}

public class WordWithProgressDto : WordDto
{
    public UserWordProgressDto? Progress { get; set; }
}

public class UserWordProgressDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int WordId { get; set; }
    public string Status { get; set; } = "New"; // 'New', 'Learning', 'Mastered', 'Reviewing'
    public DateTime NextReviewDate { get; set; }
    public int ReviewCount { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public DateTime? LastReviewedAt { get; set; }
}

