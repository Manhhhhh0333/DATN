using HiHSK.Application.DTOs;

namespace HiHSK.Application.Interfaces;

/// <summary>
/// Service để phân loại từ vựng theo chủ đề (LessonTopic)
/// </summary>
public interface IWordClassificationService
{
    /// <summary>
    /// Phân loại từ vựng theo chủ đề dựa trên keywords và meaning
    /// </summary>
    Task<Dictionary<int, List<int>>> ClassifyWordsByTopicAsync(
        List<int> wordIds, 
        int hskLevel);

    /// <summary>
    /// Tự động tổ chức từ vựng HSK1 thành các LessonTopics
    /// </summary>
    Task<AutoOrganizeResultDto> AutoOrganizeHSK1Async(
        string strategy = "thematic",
        int? wordsPerTopic = null);

    /// <summary>
    /// Gán từ vựng vào topic cụ thể
    /// </summary>
    Task<bool> AssignWordsToTopicAsync(List<int> wordIds, int topicId);

    /// <summary>
    /// Gợi ý topic phù hợp cho từ vựng (dùng AI hoặc keyword matching)
    /// </summary>
    Task<int?> SuggestTopicForWordAsync(int wordId, int hskLevel);
}

