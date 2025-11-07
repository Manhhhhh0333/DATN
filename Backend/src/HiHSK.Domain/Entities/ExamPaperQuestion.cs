namespace HiHSK.Domain.Entities;

public class ExamPaperQuestion
{
    public int ExamPaperId { get; set; }
    public int QuestionId { get; set; }
    public int QuestionOrder { get; set; }

    // Navigation properties
    public ExamPaper ExamPaper { get; set; } = null!;
    public Question Question { get; set; } = null!;
}

