namespace HiHSK.Application.DTOs;

public class PartProgressDto
{
    public int HskLevel { get; set; }
    public int PartNumber { get; set; }
    public int TotalWords { get; set; }
    public int MasteredWords { get; set; }
    public int LearningWords { get; set; }
    public int NewWords { get; set; }
    public int CompletedActivities { get; set; }
    public int TotalActivities { get; set; }
    public int ProgressPercentage { get; set; }
    public List<ActivityProgressDto> Activities { get; set; } = new();
}

public class ActivityProgressDto
{
    public string ActivityId { get; set; } = string.Empty;
    public string ActivityName { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int? Score { get; set; }
    public DateTime? CompletedAt { get; set; }
}

