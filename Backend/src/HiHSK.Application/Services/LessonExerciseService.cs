using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;

namespace HiHSK.Application.Services;

public class LessonExerciseService : ILessonExerciseService
{
    private readonly ILessonExerciseRepository _exerciseRepository;

    public LessonExerciseService(ILessonExerciseRepository exerciseRepository)
    {
        _exerciseRepository = exerciseRepository;
    }

    public async Task<List<LessonExerciseListDto>> GetExercisesByTopicIdAsync(int topicId, string userId)
    {
        var exercises = await _exerciseRepository.GetExercisesByTopicIdAsync(topicId);
        var result = new List<LessonExerciseListDto>();

        foreach (var exercise in exercises)
        {
            var isLocked = await CheckExerciseUnlockStatusAsync(exercise.Id, userId);
            var isCompleted = await _exerciseRepository.IsExerciseCompletedAsync(userId, exercise.Id);

            result.Add(new LessonExerciseListDto
            {
                Id = exercise.Id,
                TopicId = exercise.TopicId,
                ExerciseType = exercise.ExerciseType,
                Title = exercise.Title,
                Description = exercise.Description,
                ExerciseIndex = exercise.ExerciseIndex,
                IsLocked = isLocked,
                IsCompleted = isCompleted,
                ExerciseTypeName = GetExerciseTypeName(exercise.ExerciseType)
            });
        }

        return result;
    }

    public async Task<LessonExerciseDto?> GetExerciseByIdAsync(int id, string userId)
    {
        var exercise = await _exerciseRepository.GetExerciseWithDetailsAsync(id);
        if (exercise == null)
            return null;

        var isLocked = await CheckExerciseUnlockStatusAsync(id, userId);

        return new LessonExerciseDto
        {
            Id = exercise.Id,
            TopicId = exercise.TopicId,
            ExerciseType = exercise.ExerciseType,
            Title = exercise.Title,
            Description = exercise.Description,
            ExerciseIndex = exercise.ExerciseIndex,
            IsLocked = isLocked,
            PrerequisiteExerciseId = exercise.PrerequisiteExerciseId,
            
            // Map dữ liệu tùy theo loại bài tập
            Questions = exercise.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                AudioUrl = q.AudioUrl,
                Points = q.Points,
                Explanation = q.Explanation,
                Options = q.QuestionOptions.Select(o => new QuestionOptionDto
                {
                    Id = o.Id,
                    OptionText = o.OptionText,
                    OptionLabel = o.OptionLabel,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList(),
            
            Dialogues = exercise.Dialogues.Select(d => new DialogueDto
            {
                Id = d.Id,
                LessonId = d.LessonId,
                Title = d.Title,
                DialogueText = d.DialogueText,
                Pinyin = d.Pinyin,
                Translation = d.Translation,
                AudioUrl = d.AudioUrl,
                DifficultyLevel = d.DifficultyLevel,
                Category = d.Category,
                Questions = d.Questions?.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    AudioUrl = q.AudioUrl,
                    Points = q.Points,
                    Explanation = q.Explanation,
                    Options = q.QuestionOptions?.Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        OptionLabel = o.OptionLabel,
                        IsCorrect = o.IsCorrect
                    }).ToList() ?? new List<QuestionOptionDto>()
                }).ToList() ?? new List<QuestionDto>()
            }).ToList(),
            
            ReadingPassages = exercise.ReadingPassages.Select(rp => new ReadingPassageDto
            {
                Id = rp.Id,
                LessonId = rp.LessonId,
                Title = rp.Title,
                PassageText = rp.PassageText,
                Pinyin = rp.Pinyin,
                Translation = rp.Translation,
                DifficultyLevel = rp.DifficultyLevel,
                WordCount = rp.WordCount,
                Category = rp.Category,
                ImageUrl = rp.ImageUrl,
                Questions = rp.Questions?.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    AudioUrl = q.AudioUrl,
                    Points = q.Points,
                    Explanation = q.Explanation,
                    Options = q.QuestionOptions?.Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        OptionText = o.OptionText,
                        OptionLabel = o.OptionLabel,
                        IsCorrect = o.IsCorrect
                    }).ToList() ?? new List<QuestionOptionDto>()
                }).ToList() ?? new List<QuestionDto>()
            }).ToList(),
            
            SentencePatterns = exercise.SentencePatterns.Select(sp => new SentencePatternDto
            {
                Id = sp.Id,
                LessonId = sp.LessonId,
                PatternText = sp.PatternText,
                Pinyin = sp.Pinyin,
                Meaning = sp.Meaning,
                Usage = sp.Usage,
                ExampleSentences = sp.ExampleSentences,
                Category = sp.Category,
                DifficultyLevel = sp.DifficultyLevel
            }).ToList(),
            
            Words = exercise.Topic?.Words?.Select(w => new WordDto
            {
                Id = w.Id,
                Character = w.Character,
                Pinyin = w.Pinyin,
                Meaning = w.Meaning,
                AudioUrl = w.AudioUrl,
                ExampleSentence = w.ExampleSentence,
                HSKLevel = w.HSKLevel,
                StrokeCount = w.StrokeCount
            }).ToList()
        };
    }

    public async Task<bool> CheckExerciseUnlockStatusAsync(int exerciseId, string userId)
    {
        var exercise = await _exerciseRepository.GetExerciseByIdAsync(exerciseId);
        if (exercise == null)
            return false;

        // Nếu exercise không bị khóa trong database, cho phép truy cập
        if (!exercise.IsLocked)
            return false;

        // Kiểm tra prerequisite
        if (exercise.PrerequisiteExerciseId.HasValue)
        {
            var prerequisiteCompleted = await _exerciseRepository.IsPrerequisiteExerciseCompletedAsync(
                userId, exercise.PrerequisiteExerciseId.Value);

            return !prerequisiteCompleted; // Return true nếu bị khóa
        }

        // Exercise đầu tiên trong topic thì mở khóa
        if (exercise.ExerciseIndex == 1)
            return false;

        return true; // Các exercise khác mặc định bị khóa
    }

    private string GetExerciseTypeName(string exerciseType)
    {
        return exerciseType switch
        {
            ExerciseTypes.Vocabulary => "Từ vựng",
            ExerciseTypes.QuickMemorize => "Nhớ nhanh từ",
            ExerciseTypes.TrueFalse => "Chọn đúng sai",
            ExerciseTypes.TrueFalseSentence => "Chọn đúng sai với câu",
            ExerciseTypes.ListenChooseImage => "Nghe câu chọn hình ảnh",
            ExerciseTypes.MatchSentence => "Ghép câu",
            ExerciseTypes.FillBlank => "Điền từ",
            ExerciseTypes.Flashcard => "Flashcard từ vựng",
            ExerciseTypes.Dialogue => "Hội thoại",
            ExerciseTypes.Reading => "Đọc hiểu",
            ExerciseTypes.Grammar => "Ngữ pháp",
            ExerciseTypes.ArrangeSentence => "Sắp xếp câu",
            ExerciseTypes.Translation => "Bài tập luyện dịch",
            ExerciseTypes.ComprehensiveTest => "Kiểm tra tổng hợp",
            _ => exerciseType
        };
    }
}

