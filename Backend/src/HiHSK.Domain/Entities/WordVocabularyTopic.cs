namespace HiHSK.Domain.Entities;

public class WordVocabularyTopic
{
    public int WordId { get; set; }
    public int VocabularyTopicId { get; set; }

    // Navigation properties
    public Word Word { get; set; } = null!;
    public VocabularyTopic VocabularyTopic { get; set; } = null!;
}

