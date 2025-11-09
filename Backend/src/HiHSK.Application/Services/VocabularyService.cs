using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Application.Services;

public class VocabularyService : IVocabularyService
{
    private readonly IVocabularyRepository _vocabularyRepository;
    private readonly IUserWordProgressRepository _userProgressRepository;
    private readonly GeminiService _geminiService;

    public VocabularyService(
        IVocabularyRepository vocabularyRepository,
        IUserWordProgressRepository userProgressRepository,
        GeminiService geminiService)
    {
        _vocabularyRepository = vocabularyRepository;
        _userProgressRepository = userProgressRepository;
        _geminiService = geminiService;
    }

    public async Task<List<VocabularyTopicDto>> GetAllTopicsAsync(string? userId = null)
    {
        var topics = await _vocabularyRepository.GetAllTopicsAsync();
        var result = new List<VocabularyTopicDto>();

        foreach (var topic in topics)
        {
            var wordCount = await _vocabularyRepository.GetWordCountByTopicIdAsync(topic.Id);
            
            result.Add(new VocabularyTopicDto
            {
                Id = topic.Id,
                Name = topic.Name,
                Description = topic.Description,
                ImageUrl = topic.ImageUrl,
                SortOrder = topic.SortOrder,
                WordCount = wordCount
            });
        }

        return result;
    }

    public async Task<VocabularyTopicDetailDto?> GetTopicByIdAsync(int topicId, string? userId = null)
    {
        var topic = await _vocabularyRepository.GetTopicWithWordsAsync(topicId);
        if (topic == null)
            return null;

        var words = topic.WordVocabularyTopics.Select(wvt => wvt.Word).ToList();
        var wordsWithProgress = new List<WordWithProgressDto>();

        foreach (var word in words)
        {
            var wordDto = new WordWithProgressDto
            {
                Id = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = word.ExampleSentence,
                HSKLevel = word.HSKLevel,
                StrokeCount = word.StrokeCount
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            wordsWithProgress.Add(wordDto);
        }

        return new VocabularyTopicDetailDto
        {
            Id = topic.Id,
            Name = topic.Name,
            Description = topic.Description,
            ImageUrl = topic.ImageUrl,
            SortOrder = topic.SortOrder,
            WordCount = words.Count,
            Words = wordsWithProgress
        };
    }

    public async Task<List<FlashcardReviewDto>> GetWordsForReviewAsync(int topicId, string userId, bool onlyDue = true, int? limit = null)
    {
        List<Domain.Entities.Word> words;

        if (onlyDue)
        {
            var progressList = await _userProgressRepository.GetWordsDueForReviewAsync(userId, topicId, limit);
            words = progressList.Select(p => p.Word).ToList();
        }
        else
        {
            words = await _vocabularyRepository.GetWordsByTopicIdAsync(topicId);
            if (limit.HasValue)
            {
                words = words.Take(limit.Value).ToList();
            }
        }

        var result = new List<FlashcardReviewDto>();

        foreach (var word in words)
        {
            var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
            
            result.Add(new FlashcardReviewDto
            {
                WordId = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = word.ExampleSentence,
                Progress = progress != null ? new UserWordProgressDto
                {
                    Id = progress.Id,
                    Status = progress.Status,
                    NextReviewDate = progress.NextReviewDate,
                    ReviewCount = progress.ReviewCount,
                    CorrectCount = progress.CorrectCount,
                    WrongCount = progress.WrongCount,
                    LastReviewedAt = progress.LastReviewedAt
                } : null
            });
        }

        return result;
    }

    public async Task<ReviewStatsDto> GetTopicStatsAsync(int topicId, string userId)
    {
        var totalWords = await _vocabularyRepository.GetWordCountByTopicIdAsync(topicId);
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId, topicId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId, topicId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId, topicId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId, topicId);

        return new ReviewStatsDto
        {
            TotalWords = totalWords,
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }

    public async Task<ReviewStatsDto> GetOverallStatsAsync(string userId)
    {
        var newWords = await _userProgressRepository.GetNewWordsCountAsync(userId);
        var learningWords = await _userProgressRepository.GetLearningWordsCountAsync(userId);
        var masteredWords = await _userProgressRepository.GetMasteredWordsCountAsync(userId);
        var wordsDueToday = await _userProgressRepository.GetWordsDueTodayCountAsync(userId);

        return new ReviewStatsDto
        {
            TotalWords = 0, // Tổng số từ sẽ được tính từ tất cả topics
            NewWords = newWords,
            LearningWords = learningWords,
            MasteredWords = masteredWords,
            WordsDueToday = wordsDueToday
        };
    }

    public async Task<List<WordWithProgressDto>> GetWordsByHSKLevelAndPartAsync(int hskLevel, int partNumber, string? userId = null)
    {
        // Validate partNumber (1-10)
        if (partNumber < 1 || partNumber > 10)
        {
            throw new ArgumentException("Part number must be between 1 and 10", nameof(partNumber));
        }

        // Lấy 150 từ vựng theo HSK level, đã được sắp xếp theo ID (thứ tự)
        // Không phụ thuộc vào LessonId, chỉ chia theo thứ tự ID
        var allWords = await _vocabularyRepository.GetWordsByHSKLevelAsync(hskLevel);
        
        // Tính toán phần cần lấy: mỗi phần 15 từ (chia đều 150 từ thành 10 phần)
        // Part 1: từ 1-15, Part 2: từ 16-30, ..., Part 10: từ 136-150
        const int wordsPerPart = 15;
        int skip = (partNumber - 1) * wordsPerPart;
        
        // Lấy phần từ vựng theo thứ tự ID (không phụ thuộc vào LessonId)
        // allWords đã được sắp xếp theo ID trong repository
        var wordsInPart = allWords
            .Skip(skip)
            .Take(wordsPerPart)
            .ToList();

        var result = new List<WordWithProgressDto>();

        foreach (var word in wordsInPart)
        {
            var wordDto = new WordWithProgressDto
            {
                Id = word.Id,
                Character = word.Character,
                Pinyin = word.Pinyin,
                Meaning = word.Meaning,
                AudioUrl = word.AudioUrl,
                ExampleSentence = word.ExampleSentence,
                HSKLevel = word.HSKLevel,
                StrokeCount = word.StrokeCount,
                Examples = (word.WordExamples ?? new List<Domain.Entities.WordExample>())
                    .Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character,
                        Pinyin = e.Pinyin,
                        Meaning = e.Meaning,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .OrderBy(e => e.SortOrder)
                    .ToList()
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, word.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            result.Add(wordDto);
        }

        return result;
    }

    public async Task<WordWithProgressDto> GetOrCreateWordByCharacterAsync(string character, string? userId = null)
    {
        if (string.IsNullOrWhiteSpace(character))
            throw new ArgumentException("Character không được để trống");

        // 1. Tìm từ trong database
        var existingWord = await _vocabularyRepository.GetWordByCharacterAsync(character);
        if (existingWord != null)
        {
            // Từ đã tồn tại, trả về thông tin
            var wordDto = new WordWithProgressDto
            {
                Id = existingWord.Id,
                Character = existingWord.Character,
                Pinyin = existingWord.Pinyin,
                Meaning = existingWord.Meaning,
                AudioUrl = existingWord.AudioUrl,
                ExampleSentence = existingWord.ExampleSentence,
                HSKLevel = existingWord.HSKLevel,
                StrokeCount = existingWord.StrokeCount,
                Examples = (existingWord.WordExamples ?? new List<WordExample>())
                    .Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character,
                        Pinyin = e.Pinyin,
                        Meaning = e.Meaning,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .OrderBy(e => e.SortOrder)
                    .ToList()
            };

            if (userId != null)
            {
                var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, existingWord.Id);
                if (progress != null)
                {
                    wordDto.Progress = new UserWordProgressDto
                    {
                        Id = progress.Id,
                        Status = progress.Status,
                        NextReviewDate = progress.NextReviewDate,
                        ReviewCount = progress.ReviewCount,
                        CorrectCount = progress.CorrectCount,
                        WrongCount = progress.WrongCount,
                        LastReviewedAt = progress.LastReviewedAt
                    };
                }
            }

            return wordDto;
        }

        // 2. Từ chưa tồn tại, gọi Gemini API để generate thông tin
        WordInfoDto wordInfo;
        try
        {
            Console.WriteLine($"[VocabularyService] Bắt đầu gọi Gemini API cho character '{character}'");
            wordInfo = await _geminiService.GenerateWordInfoAsync(character);
            if (wordInfo == null)
            {
                throw new Exception("Gemini API trả về null");
            }
            if (string.IsNullOrWhiteSpace(wordInfo.Pinyin))
            {
                throw new Exception("Gemini API không trả về pinyin");
            }
            if (string.IsNullOrWhiteSpace(wordInfo.Meaning))
            {
                throw new Exception("Gemini API không trả về meaning");
            }
            Console.WriteLine($"[VocabularyService] ✅ Gemini API trả về thành công: Pinyin='{wordInfo.Pinyin}', Meaning='{wordInfo.Meaning}', Examples={wordInfo.Examples?.Count ?? 0}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyService] ❌ Lỗi khi gọi Gemini API cho '{character}': {ex.Message}");
            Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[VocabularyService] InnerException: {ex.InnerException.Message}");
            }
            throw new Exception($"Không thể generate thông tin từ vựng từ AI: {ex.Message}", ex);
        }

        // 3. Tạo từ mới (KHÔNG gán WordExamples vào navigation property để tránh lỗi tracking)
        var newWord = new Word
        {
            Character = character,
            Pinyin = wordInfo.Pinyin,
            Meaning = wordInfo.Meaning,
            CreatedAt = DateTime.UtcNow
        };

        // 4. Lưu Word vào database trước (để có Id)
        Word savedWord;
        try
        {
            savedWord = await _vocabularyRepository.AddWordAsync(newWord);
            if (savedWord == null)
            {
                throw new Exception("AddWordAsync trả về null");
            }
            if (savedWord.Id <= 0)
            {
                throw new Exception($"Word được lưu nhưng không có Id hợp lệ. Id={savedWord.Id}");
            }
            Console.WriteLine($"[VocabularyService] ✅ Đã lưu Word với Id={savedWord.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyService] ❌ Lỗi khi lưu từ mới '{character}' vào database: {ex.Message}");
            Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[VocabularyService] InnerException: {ex.InnerException.Message}");
                Console.WriteLine($"[VocabularyService] InnerStackTrace: {ex.InnerException.StackTrace}");
            }
            throw new Exception($"Không thể lưu từ vựng vào database: {ex.Message}", ex);
        }

        // 5. Lưu WordExamples sau khi Word đã có Id
        if (wordInfo.Examples != null && wordInfo.Examples.Any())
        {
            try
            {
                Console.WriteLine($"[VocabularyService] Bắt đầu lưu {wordInfo.Examples.Count} WordExamples cho WordId={savedWord.Id}");
                await _vocabularyRepository.AddWordExamplesAsync(savedWord.Id, wordInfo.Examples);
                
                // Reload Word để có WordExamples
                var reloadedWord = await _vocabularyRepository.GetWordByIdAsync(savedWord.Id);
                if (reloadedWord != null)
                {
                    savedWord = reloadedWord;
                    Console.WriteLine($"[VocabularyService] ✅ Reload Word thành công, có {savedWord.WordExamples?.Count ?? 0} WordExamples");
                }
                else
                {
                    Console.WriteLine($"[VocabularyService] ⚠️ Không thể reload Word sau khi lưu WordExamples, sử dụng savedWord gốc");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[VocabularyService] ⚠️ Lỗi khi lưu WordExamples cho từ '{character}': {ex.Message}");
                Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[VocabularyService] InnerException: {ex.InnerException.Message}");
                }
                // Không throw exception, vì Word đã được lưu thành công
                // Chỉ log lỗi và tiếp tục với savedWord gốc (không có WordExamples)
            }
        }

        // 6. Trả về DTO với WordExamples đã lưu (có Id)
        try
        {
            var result = new WordWithProgressDto
            {
                Id = savedWord.Id,
                Character = savedWord.Character ?? character,
                Pinyin = savedWord.Pinyin ?? wordInfo.Pinyin,
                Meaning = savedWord.Meaning ?? wordInfo.Meaning,
                AudioUrl = savedWord.AudioUrl,
                ExampleSentence = savedWord.ExampleSentence,
                HSKLevel = savedWord.HSKLevel,
                StrokeCount = savedWord.StrokeCount,
                Examples = (savedWord.WordExamples ?? new List<WordExample>())
                    .Where(e => e != null) // Lọc null
                    .Select(e => new WordExampleDto
                    {
                        Id = e.Id,
                        Character = e.Character ?? string.Empty,
                        Pinyin = e.Pinyin ?? string.Empty,
                        Meaning = e.Meaning ?? string.Empty,
                        AudioUrl = e.AudioUrl,
                        SortOrder = e.SortOrder
                    })
                    .OrderBy(e => e.SortOrder)
                    .ToList()
            };

            // Thêm progress nếu có userId
            if (userId != null)
            {
                try
                {
                    var progress = await _userProgressRepository.GetUserWordProgressAsync(userId, savedWord.Id);
                    if (progress != null)
                    {
                        result.Progress = new UserWordProgressDto
                        {
                            Id = progress.Id,
                            Status = progress.Status,
                            NextReviewDate = progress.NextReviewDate,
                            ReviewCount = progress.ReviewCount,
                            CorrectCount = progress.CorrectCount,
                            WrongCount = progress.WrongCount,
                            LastReviewedAt = progress.LastReviewedAt
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[VocabularyService] ⚠️ Lỗi khi lấy progress cho userId={userId}, wordId={savedWord.Id}: {ex.Message}");
                    // Không throw, chỉ log
                }
            }

            Console.WriteLine($"[VocabularyService] ✅ Trả về WordWithProgressDto thành công cho character '{character}'");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VocabularyService] ❌ Lỗi khi tạo WordWithProgressDto cho '{character}': {ex.Message}");
            Console.WriteLine($"[VocabularyService] StackTrace: {ex.StackTrace}");
            throw new Exception($"Không thể tạo DTO cho từ vựng: {ex.Message}", ex);
        }
    }

    public async Task<Dictionary<string, WordWithProgressDto>> GetOrCreateWordsBatchAsync(List<string> characters, string? userId = null)
    {
        var result = new Dictionary<string, WordWithProgressDto>();
        
        // Loại bỏ duplicates và empty strings
        var uniqueCharacters = characters
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Distinct()
            .ToList();

        if (!uniqueCharacters.Any())
        {
            return result;
        }

        // Lấy tất cả từ cùng lúc (song song) để tối ưu performance
        var tasks = uniqueCharacters.Select(async character =>
        {
            try
            {
                var word = await GetOrCreateWordByCharacterAsync(character, userId);
                return new { Character = character, Word = word };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[VocabularyService] Lỗi khi get/create word '{character}' trong batch: {ex.Message}");
                return new { Character = character, Word = (WordWithProgressDto?)null };
            }
        });

        var results = await Task.WhenAll(tasks);

        // Build dictionary
        foreach (var item in results)
        {
            if (item.Word != null)
            {
                result[item.Character] = item.Word;
            }
        }

        return result;
    }
}

