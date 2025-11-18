using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;

namespace HiHSK.Application.Services;

public class SRSService : ISRSService
{
    private readonly IUserWordProgressRepository _userProgressRepository;
    private readonly IVocabularyRepository _vocabularyRepository;
    private readonly IUserProgressRepository _userProgressStatusRepository;
    private readonly IActivityProgressRepository _activityProgressRepository;

    public SRSService(
        IUserWordProgressRepository userProgressRepository,
        IVocabularyRepository vocabularyRepository,
        IUserProgressRepository userProgressStatusRepository,
        IActivityProgressRepository activityProgressRepository)
    {
        _userProgressRepository = userProgressRepository;
        _vocabularyRepository = vocabularyRepository;
        _userProgressStatusRepository = userProgressStatusRepository;
        _activityProgressRepository = activityProgressRepository;
    }

    public async Task<UserWordProgressDto> UpdateReviewStatusAsync(string userId, int wordId, string rating)
    {
        var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, wordId);
        
        if (progress == null)
        {
            progress = new UserWordProgress
            {
                UserId = userId,
                WordId = wordId,
                Status = "New",
                NextReviewDate = DateTime.UtcNow,
                ReviewCount = 0,
                CorrectCount = 0,
                WrongCount = 0
            };
        }

        // Cập nhật trạng thái dựa trên rating
        progress.ReviewCount++;
        progress.LastReviewedAt = DateTime.UtcNow;

        switch (rating.ToLower())
        {
            case "easy":
                progress.CorrectCount++;
                if (progress.Status == "New")
                {
                    progress.Status = "Learning";
                }
                else if (progress.CorrectCount >= 3 && progress.Status == "Learning")
                {
                    progress.Status = "Mastered";
                }
                // Tính toán next review date dựa trên SRS algorithm (SM-2)
                progress.NextReviewDate = CalculateNextReviewDate(progress, 1.3); // Easy = +30% interval
                break;

            case "mastered":
            case "instant":
                // Đánh dấu ngay lập tức là đã thuộc (dùng cho nút "Đánh dấu đã học")
                progress.Status = "Mastered";
                progress.CorrectCount = Math.Max(3, progress.CorrectCount); // Đảm bảo CorrectCount >= 3
                progress.NextReviewDate = DateTime.UtcNow.AddDays(30); // Review lại sau 30 ngày
                break;

            case "hard":
                progress.WrongCount++;
                if (progress.Status == "Mastered")
                {
                    progress.Status = "Learning";
                }
                progress.NextReviewDate = CalculateNextReviewDate(progress, 0.8); // Hard = -20% interval
                break;

            case "forgot":
                progress.WrongCount++;
                progress.Status = "Learning";
                progress.CorrectCount = 0; // Reset correct count
                progress.NextReviewDate = DateTime.UtcNow.AddMinutes(10); // Review lại sau 10 phút
                break;

            default:
                progress.CorrectCount++;
                progress.NextReviewDate = CalculateNextReviewDate(progress, 1.0);
                break;
        }

        var updatedProgress = await _userProgressRepository.CreateOrUpdateProgressAsync(progress);

        // Tự động cập nhật tiến độ lesson nếu từ vựng thuộc một lesson
        await UpdateLessonProgressAsync(userId, wordId);

        return new UserWordProgressDto
        {
            Id = updatedProgress.Id,
            UserId = updatedProgress.UserId,
            WordId = updatedProgress.WordId,
            Status = updatedProgress.Status,
            NextReviewDate = updatedProgress.NextReviewDate,
            ReviewCount = updatedProgress.ReviewCount,
            CorrectCount = updatedProgress.CorrectCount,
            WrongCount = updatedProgress.WrongCount,
            LastReviewedAt = updatedProgress.LastReviewedAt
        };
    }

    /// <summary>
    /// Tự động cập nhật tiến độ lesson khi từ vựng được đánh dấu đã học
    /// </summary>
    private async Task UpdateLessonProgressAsync(string userId, int wordId)
    {
        try
        {
            // Lấy thông tin word để biết nó thuộc lesson nào
            var word = await _vocabularyRepository.GetWordByIdAsync(wordId);
            if (word == null || !word.TopicId.HasValue)
                return; // Không có topic, không cần cập nhật

            var topicId = word.TopicId.Value;

            // Lấy tất cả từ vựng trong topic
            var topicWordIds = await _vocabularyRepository.GetWordIdsByTopicIdAsync(topicId);

            if (topicWordIds.Count == 0)
                return; // Không có từ vựng trong topic

            // Lấy progress của tất cả từ vựng trong topic cho user này
            var wordProgresses = await _userProgressRepository.GetUserWordProgressesByWordIdsAsync(userId, topicWordIds);

            // Tính toán tiến độ: số từ đã học (Learning hoặc Mastered) / tổng số từ
            var learnedWords = wordProgresses.Count(uwp => 
                uwp.Status == "Learning" || uwp.Status == "Mastered");
            
            var totalWords = topicWordIds.Count;
            var progressPercentage = totalWords > 0 
                ? (int)Math.Round((double)learnedWords / totalWords * 100) 
                : 0;

            // TODO: Cập nhật tiến độ topic thay vì lesson
            // Note: CreateOrUpdateUserLessonStatusAsync vẫn dùng LessonId, cần tạo method mới cho TopicId
            // Tạm thời comment out vì UserLessonStatus vẫn dùng LessonId
            // Xác định trạng thái topic
            // string status;
            // if (progressPercentage == 100)
            // {
            //     status = "Completed";
            // }
            // else if (progressPercentage > 0)
            // {
            //     status = "InProgress";
            // }
            // else
            // {
            //     status = "NotStarted";
            // }
            // await _userProgressStatusRepository.CreateOrUpdateUserLessonStatusAsync(
            //     userId, 
            //     topicId, 
            //     status, 
            //     progressPercentage);
        }
        catch (Exception ex)
        {
            // Log lỗi nhưng không throw để không ảnh hưởng đến việc cập nhật từ vựng
            Console.WriteLine($"[SRSService] Lỗi khi cập nhật tiến độ lesson: {ex.Message}");
        }
    }

    public async Task<List<FlashcardReviewDto>> GetWordsDueForReviewAsync(string userId, int? topicId = null, int? limit = null)
    {
        var progressList = await _userProgressRepository.GetWordsDueForReviewAsync(userId, topicId, limit);
        var result = new List<FlashcardReviewDto>();

        foreach (var progress in progressList)
        {
            result.Add(new FlashcardReviewDto
            {
                WordId = progress.Word.Id,
                Character = progress.Word.Character,
                Pinyin = progress.Word.Pinyin,
                Meaning = progress.Word.Meaning,
                AudioUrl = progress.Word.AudioUrl,
                ExampleSentence = progress.Word.ExampleSentence,
                Progress = new UserWordProgressDto
                {
                    Id = progress.Id,
                    UserId = progress.UserId,
                    WordId = progress.WordId,
                    Status = progress.Status,
                    NextReviewDate = progress.NextReviewDate,
                    ReviewCount = progress.ReviewCount,
                    CorrectCount = progress.CorrectCount,
                    WrongCount = progress.WrongCount,
                    LastReviewedAt = progress.LastReviewedAt
                }
            });
        }

        return result;
    }

    public async Task<ReviewStatsDto> GetReviewStatsAsync(string userId, int? topicId = null)
    {
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId, topicId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId, topicId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId, topicId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId, topicId);

        var totalWords = 0;
        if (topicId.HasValue)
        {
            totalWords = await _vocabularyRepository.GetWordCountByTopicIdAsync(topicId.Value);
        }

        return new ReviewStatsDto
        {
            TotalWords = totalWords,
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }

    /// <summary>
    /// Tính toán ngày ôn tập tiếp theo dựa trên SM-2 algorithm (Spaced Repetition)
    /// </summary>
    private DateTime CalculateNextReviewDate(UserWordProgress progress, double easeFactor)
    {
        if (progress.ReviewCount == 1)
        {
            // Lần đầu tiên: review sau 1 ngày
            return DateTime.UtcNow.AddDays(1);
        }
        else if (progress.ReviewCount == 2)
        {
            // Lần thứ 2: review sau 3 ngày
            return DateTime.UtcNow.AddDays(3);
        }
        else
        {
            // Từ lần thứ 3 trở đi: tính dựa trên interval và ease factor
            var daysSinceLastReview = progress.LastReviewedAt.HasValue
                ? (DateTime.UtcNow - progress.LastReviewedAt.Value).TotalDays
                : 1;

            var interval = daysSinceLastReview * easeFactor;
            
            // Giới hạn interval tối đa là 365 ngày
            interval = Math.Min(interval, 365);
            
            return DateTime.UtcNow.AddDays(interval);
        }
    }
}

