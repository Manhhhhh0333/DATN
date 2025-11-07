namespace HiHSK.Application.DTOs;

public class QuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public int Points { get; set; }
    public string? Explanation { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}

public class QuestionOptionDto
{
    public int Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public string OptionLabel { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class QuizSubmissionDto
{
    public int LessonId { get; set; }
    public List<AnswerSubmissionDto> Answers { get; set; } = new();
}

public class AnswerSubmissionDto
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? AnswerText { get; set; }
}

public class QuizResultDto
{
    public int Score { get; set; }
    public int TotalPoints { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public bool LessonCompleted { get; set; }
    public bool NextLessonUnlocked { get; set; }
    public int? NextLessonId { get; set; }
    public List<QuestionResultDto> QuestionResults { get; set; } = new();
}

public class QuestionResultDto
{
    public int QuestionId { get; set; }
    public bool IsCorrect { get; set; }
    public int PointsEarned { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? Explanation { get; set; }
}







