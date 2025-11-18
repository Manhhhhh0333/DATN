namespace HiHSK.Domain.Entities;

/// <summary>
/// Tiến độ hoàn thành các hoạt động học tập của user
/// Mỗi Part/Topic có nhiều activities (vocabulary, quiz, flashcard, etc.)
/// </summary>
public class UserActivityProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    
    // Có thể theo HSK Level + Part hoặc TopicId
    public int? HskLevel { get; set; }
    public int? PartNumber { get; set; }
    public int? TopicId { get; set; }
    
    /// <summary>
    /// ID của activity: "vocabulary", "quick-memorize", "true-false", etc.
    /// </summary>
    public string ActivityId { get; set; } = string.Empty;
    
    /// <summary>
    /// Trạng thái hoàn thành
    /// </summary>
    public bool IsCompleted { get; set; } = false;
    
    /// <summary>
    /// Điểm số (nếu là quiz/test), null nếu không có điểm
    /// </summary>
    public int? Score { get; set; }
    
    /// <summary>
    /// Thời gian hoàn thành
    /// </summary>
    public DateTime? CompletedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

