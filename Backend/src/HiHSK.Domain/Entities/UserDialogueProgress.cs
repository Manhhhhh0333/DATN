namespace HiHSK.Domain.Entities;

public class UserDialogueProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int DialogueId { get; set; }
    public string Status { get; set; } = "NotStarted"; // 'NotStarted', 'InProgress', 'Completed'
    public int TimesListened { get; set; } = 0;
    public DateTime? LastAccessedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Dialogue Dialogue { get; set; } = null!;
}

