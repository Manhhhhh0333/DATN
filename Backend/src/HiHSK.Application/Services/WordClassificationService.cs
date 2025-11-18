using HiHSK.Application.DTOs;
using HiHSK.Application.Interfaces;
using HiHSK.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace HiHSK.Application.Services;

public class WordClassificationService : IWordClassificationService
{
    private readonly IWordClassificationRepository _repository;
    private readonly ILogger<WordClassificationService> _logger;

    // Keywords cho mỗi chủ đề HSK1
    private readonly Dictionary<string, List<string>> _topicKeywords = new()
    {
        ["Chào hỏi & Giao tiếp cơ bản"] = new() 
        { 
            "你", "好", "谢谢", "再见", "请", "不客气", "对不起", "没关系", 
            "是", "不是", "对", "不对", "可以", "不可以"
        },
        ["Số đếm & Thời gian"] = new() 
        { 
            "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", 
            "百", "千", "万", "今天", "明天", "昨天", "现在", "小时", 
            "分钟", "年", "月", "日", "星期", "点"
        },
        ["Người & Gia đình"] = new() 
        { 
            "人", "爸爸", "妈妈", "孩子", "家", "朋友", "老师", "学生", 
            "医生", "先生", "小姐", "男", "女", "孩子", "儿子", "女儿"
        },
        ["Động từ cơ bản"] = new() 
        { 
            "是", "有", "来", "去", "看", "听", "说", "做", "吃", "喝", 
            "睡", "工作", "学习", "买", "卖", "开", "关", "走", "跑", "坐"
        },
        ["Tính từ & Mô tả"] = new() 
        { 
            "大", "小", "好", "新", "老", "多", "少", "高", "低", "长", 
            "短", "热", "冷", "快", "慢", "好", "坏", "对", "错"
        },
        ["Địa điểm & Phương hướng"] = new() 
        { 
            "上", "下", "里", "外", "前", "后", "左", "右", "学校", 
            "家", "医院", "商店", "饭店", "北京", "中国"
        },
        ["Thức ăn & Đồ uống"] = new() 
        { 
            "水", "茶", "饭", "菜", "水果", "肉", "鱼", "米", "面", 
            "鸡蛋", "牛奶", "咖啡", "酒"
        },
        ["Màu sắc & Đồ vật"] = new() 
        { 
            "红", "白", "黑", "绿", "蓝", "黄", "书", "笔", "纸", 
            "桌子", "椅子", "门", "窗", "车", "电脑", "手机"
        },
        ["Thời tiết & Thiên nhiên"] = new() 
        { 
            "天", "地", "山", "水", "雨", "雪", "风", "太阳", "月亮", 
            "树", "花", "草", "鸟", "狗", "猫"
        },
        ["Cơ thể & Sức khỏe"] = new() 
        { 
            "手", "头", "眼", "身体", "脚", "口", "耳", "心", "病", 
            "医院", "医生", "药"
        },
        ["Hoạt động hàng ngày"] = new() 
        { 
            "吃", "喝", "睡", "工作", "学习", "玩", "看", "听", "说", 
            "写", "读", "买", "卖", "洗", "穿"
        },
        ["Tổng hợp & Ôn tập"] = new() 
        { 
            // Các từ khó phân loại hoặc từ tổng hợp
        }
    };

    public WordClassificationService(
        IWordClassificationRepository repository,
        ILogger<WordClassificationService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Dictionary<int, List<int>>> ClassifyWordsByTopicAsync(
        List<int> wordIds, 
        int hskLevel)
    {
        var words = await _repository.GetWordsByIdsAsync(wordIds);
        words = words.Where(w => w.HSKLevel == hskLevel).ToList();

        var topics = await _repository.GetLessonTopicsByHSKLevelAsync(hskLevel);

        var classification = new Dictionary<int, List<int>>();

        foreach (var word in words)
        {
            var bestTopic = FindBestTopicForWord(word, topics);
            if (bestTopic != null)
            {
                if (!classification.ContainsKey(bestTopic.Id))
                    classification[bestTopic.Id] = new List<int>();
                classification[bestTopic.Id].Add(word.Id);
            }
        }

        return classification;
    }

    public async Task<AutoOrganizeResultDto> AutoOrganizeHSK1Async(
        string strategy = "thematic",
        int? wordsPerTopic = null)
    {
        var result = new AutoOrganizeResultDto();

        // Lấy tất cả từ vựng HSK1 chưa có TopicId
        var words = await _repository.GetWordsWithoutTopicAsync(1);
        result.TotalWords = words.Count;

        // Lấy hoặc tạo LessonTopics cho HSK1
        var topics = await GetOrCreateHSK1TopicsAsync();

        var classification = new Dictionary<int, List<int>>();

        // Phân loại từ vựng
        foreach (var word in words)
        {
            var bestTopic = FindBestTopicForWord(word, topics);
            if (bestTopic != null)
            {
                if (!classification.ContainsKey(bestTopic.Id))
                    classification[bestTopic.Id] = new List<int>();
                classification[bestTopic.Id].Add(word.Id);
            }
        }

        // Cân bằng số lượng từ nếu cần
        if (wordsPerTopic.HasValue && wordsPerTopic.Value > 0)
        {
            classification = BalanceWordsPerTopic(classification, wordsPerTopic.Value);
        }

        // Gán từ vựng vào topics
        foreach (var (topicId, wordIds) in classification)
        {
            await AssignWordsToTopicAsync(wordIds, topicId);
            result.ClassifiedWords += wordIds.Count;

            var topic = topics.FirstOrDefault(t => t.Id == topicId);
            result.Topics.Add(new TopicOrganizationDto
            {
                TopicId = topicId,
                Title = topic?.Title ?? "Unknown",
                WordCount = wordIds.Count,
                WordIds = wordIds
            });
        }

        result.UnclassifiedWords = result.TotalWords - result.ClassifiedWords;
        result.Message = $"Đã phân loại {result.ClassifiedWords}/{result.TotalWords} từ vựng vào {result.Topics.Count} chủ đề.";

        _logger.LogInformation(result.Message);

        return result;
    }

    public async Task<bool> AssignWordsToTopicAsync(List<int> wordIds, int topicId)
    {
        try
        {
            await _repository.UpdateWordsTopicIdAsync(wordIds, topicId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gán từ vựng vào topic {TopicId}", topicId);
            return false;
        }
    }

    public async Task<int?> SuggestTopicForWordAsync(int wordId, int hskLevel)
    {
        var words = await _repository.GetWordsByIdsAsync(new List<int> { wordId });
        var wordEntity = words.FirstOrDefault();
        if (wordEntity == null || wordEntity.HSKLevel != hskLevel)
            return null;

        var topics = await _repository.GetLessonTopicsByHSKLevelAsync(hskLevel);

        var bestTopic = FindBestTopicForWord(wordEntity, topics);
        return bestTopic?.Id;
    }

    private LessonTopic? FindBestTopicForWord(Word word, List<LessonTopic> topics)
    {
        var bestMatch = topics
            .Select(topic => new
            {
                Topic = topic,
                Score = CalculateMatchScore(word, topic)
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .FirstOrDefault();

        return bestMatch?.Topic;
    }

    private int CalculateMatchScore(Word word, LessonTopic topic)
    {
        int score = 0;

        // Kiểm tra keywords
        if (_topicKeywords.TryGetValue(topic.Title, out var keywords))
        {
            // Match character
            if (keywords.Contains(word.Character))
                score += 10;

            // Match trong meaning (tiếng Việt)
            var meaningLower = word.Meaning.ToLower();
            foreach (var keyword in keywords)
            {
                // Có thể thêm logic match meaning nếu cần
            }
        }

        // Nếu là topic "Tổng hợp", điểm thấp hơn
        if (topic.Title.Contains("Tổng hợp"))
            score = Math.Max(0, score - 5);

        return score;
    }

    private Dictionary<int, List<int>> BalanceWordsPerTopic(
        Dictionary<int, List<int>> classification, 
        int targetWordsPerTopic)
    {
        var balanced = new Dictionary<int, List<int>>();
        var allWords = classification.Values.SelectMany(x => x).ToList();
        var currentIndex = 0;

        foreach (var (topicId, wordIds) in classification.OrderBy(x => x.Key))
        {
            if (wordIds.Count <= targetWordsPerTopic)
            {
                balanced[topicId] = wordIds;
            }
            else
            {
                // Chia nhỏ topic quá lớn
                var parts = (int)Math.Ceiling((double)wordIds.Count / targetWordsPerTopic);
                for (int i = 0; i < parts; i++)
                {
                    var partWords = wordIds.Skip(i * targetWordsPerTopic)
                        .Take(targetWordsPerTopic)
                        .ToList();
                    
                    if (i == 0)
                        balanced[topicId] = partWords;
                    else
                    {
                        // Tạo topic mới hoặc gán vào topic tổng hợp
                        // Tạm thời gán vào topic hiện tại
                        balanced[topicId].AddRange(partWords);
                    }
                }
            }
        }

        return balanced;
    }

    private async Task<List<LessonTopic>> GetOrCreateHSK1TopicsAsync()
    {
        var existingTopics = await _repository.GetLessonTopicsByHSKLevelAsync(1);

        if (existingTopics.Count >= 12)
            return existingTopics;

        // Tạo các topics còn thiếu
        var course = await _repository.GetCourseByHSKLevelAsync(1);
        if (course == null)
        {
            _logger.LogWarning("Không tìm thấy Course HSK1");
            return existingTopics;
        }

        var topicsToCreate = new[]
        {
            ("Chào hỏi & Giao tiếp cơ bản", 1, "Học các từ cơ bản nhất để giao tiếp"),
            ("Số đếm & Thời gian", 2, "Học số đếm và cách nói về thời gian"),
            ("Người & Gia đình", 3, "Từ vựng về người và gia đình"),
            ("Động từ cơ bản", 4, "Các động từ thường dùng nhất"),
            ("Tính từ & Mô tả", 5, "Tính từ và từ mô tả cơ bản"),
            ("Địa điểm & Phương hướng", 6, "Nơi chốn và phương hướng"),
            ("Thức ăn & Đồ uống", 7, "Đồ ăn và thức uống"),
            ("Màu sắc & Đồ vật", 8, "Màu sắc và đồ vật thường dùng"),
            ("Thời tiết & Thiên nhiên", 9, "Thời tiết và thiên nhiên"),
            ("Cơ thể & Sức khỏe", 10, "Bộ phận cơ thể và sức khỏe"),
            ("Hoạt động hàng ngày", 11, "Các hoạt động thường ngày"),
            ("Tổng hợp & Ôn tập", 12, "Từ vựng tổng hợp và ôn tập")
        };

        var createdTopics = new List<LessonTopic>();

        foreach (var (title, index, description) in topicsToCreate)
        {
            if (existingTopics.Any(t => t.TopicIndex == index))
                continue;

            // Tìm prerequisite topic (topic trước đó)
            int? prerequisiteTopicId = null;
            if (index > 1)
            {
                var previousTopic = existingTopics
                    .Concat(createdTopics)
                    .FirstOrDefault(t => t.TopicIndex == index - 1);
                prerequisiteTopicId = previousTopic?.Id;
            }

            var topic = new LessonTopic
            {
                CourseId = course.Id,
                HSKLevel = 1,
                Title = title,
                Description = description,
                TopicIndex = index,
                IsLocked = index > 1,
                PrerequisiteTopicId = prerequisiteTopicId,
                IsActive = true
            };

            await _repository.CreateLessonTopicAsync(topic);
            createdTopics.Add(topic);
        }

        if (createdTopics.Any())
        {
            _logger.LogInformation($"Đã tạo {createdTopics.Count} LessonTopics mới cho HSK1");
        }

        return await _repository.GetLessonTopicsByHSKLevelAsync(1);
    }
}

