namespace HiHSK.Application.DTOs;

public class FlashcardReviewDto
{
    public int WordId { get; set; }
    public string Character { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public UserWordProgressDto? Progress { get; set; }
}

public class ReviewWordsRequest
{
    public int TopicId { get; set; }
    public int? Limit { get; set; } // Số từ cần ôn (null = tất cả)
    public bool OnlyDue { get; set; } = true; // Chỉ lấy từ cần ôn hôm nay
}

public class UpdateReviewStatusRequest
{
    public int WordId { get; set; }
    public string Rating { get; set; } = "Easy"; // 'Easy', 'Hard', 'Forgot'
}

public class ReviewStatsDto
{
    public int TotalWords { get; set; }
    public int NewWords { get; set; }
    public int LearningWords { get; set; }
    public int MasteredWords { get; set; }
    public int WordsDueToday { get; set; }
}

