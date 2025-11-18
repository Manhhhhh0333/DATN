namespace HiHSK.Application.DTOs;

public class AutoOrganizeResultDto
{
    public List<TopicOrganizationDto> Topics { get; set; } = new();
    public int TotalWords { get; set; }
    public int ClassifiedWords { get; set; }
    public int UnclassifiedWords { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class TopicOrganizationDto
{
    public int TopicId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public List<int> WordIds { get; set; } = new();
}

