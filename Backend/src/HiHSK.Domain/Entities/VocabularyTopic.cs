namespace HiHSK.Domain.Entities;

public class VocabularyTopic
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public ICollection<WordVocabularyTopic> WordVocabularyTopics { get; set; } = new List<WordVocabularyTopic>();
}

