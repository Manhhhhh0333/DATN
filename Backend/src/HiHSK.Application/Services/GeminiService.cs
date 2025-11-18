using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using HiHSK.Application.DTOs;
using Microsoft.Extensions.Configuration;

namespace HiHSK.Application.Services;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    // Thử nhiều model names và API versions
    // Lưu ý: Model names có thể cần prefix "models/" hoặc không, tùy vào API version
    private static readonly string[] GEMINI_MODELS = new[]
    {
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    };

    // Thử cả v1 và v1beta
    // API key có thể được truyền qua query string hoặc header
    private const string GEMINI_API_URL_V1 = "https://generativelanguage.googleapis.com/v1/models/{0}:generateContent";
    private const string GEMINI_API_URL_V1BETA = "https://generativelanguage.googleapis.com/v1beta/models/{0}:generateContent";

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeminiSettings:ApiKey"]
            ?? throw new InvalidOperationException("❌ Gemini API Key chưa được cấu hình trong appsettings.json");
    }

    /// <summary>
    /// Lấy danh sách các model có sẵn từ Gemini API
    /// </summary>
    public async Task<List<string>> GetAvailableModelsAsync()
    {
        try
        {
            // Thử cả v1 và v1beta
            var apiUrls = new[]
            {
                "https://generativelanguage.googleapis.com/v1/models?key={0}",
                "https://generativelanguage.googleapis.com/v1beta/models?key={0}"
            };

            foreach (var apiUrl in apiUrls)
            {
                try
                {
                    var url = string.Format(apiUrl, _apiKey);
                    var response = await _httpClient.GetAsync(url);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        var modelsResponse = JsonSerializer.Deserialize<ModelsListResponse>(content, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (modelsResponse?.Models != null)
                        {
                            var modelNames = modelsResponse.Models
                                .Where(m => m.SupportedGenerationMethods?.Contains("generateContent") == true)
                                .Select(m => m.Name?.Replace("models/", ""))
                                .Where(name => !string.IsNullOrEmpty(name))
                                .ToList();

                            if (modelNames.Any())
                            {
                                Console.WriteLine($"[GeminiService] Tìm thấy {modelNames.Count} models có sẵn:");
                                foreach (var name in modelNames)
                                {
                                    Console.WriteLine($"  - {name}");
                                }
                                return modelNames!;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[GeminiService] Lỗi khi lấy danh sách models: {ex.Message}");
                }
            }

            return new List<string>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GeminiService] Lỗi khi get available models: {ex.Message}");
            return new List<string>();
        }
    }

    /// <summary>
    /// Prompt hướng dẫn AI sinh ví dụ
    /// </summary>
    private const string SYSTEM_PROMPT = @"Bạn là một gia sư tiếng Trung chuyên nghiệp. Khi nhận được một từ HSK, hãy tạo đúng 3 câu ví dụ (từ dễ đến khó) sử dụng từ đó.

YÊU CẦU FORMAT TRẢ VỀ (BẮT BUỘC - PHẢI TUÂN THỦ CHÍNH XÁC):
Mỗi ví dụ trên một dòng, format: {[Từ vựng]} [Câu ví dụ đầy đủ chứa từ vựng] ([Pinyin của cả câu]) - [Nghĩa tiếng Việt của cả câu]

QUAN TRỌNG VỀ TỪ ĐƠN VÀ CỤM TỪ:
- Nếu từ vựng là TỪ ĐƠN (1 ký tự): Đảm bảo câu ví dụ sử dụng chính xác từ đơn đó, không dùng từ ghép chứa nó
  Ví dụ: Nếu từ vựng là ""问"" (hỏi), dùng ""我问老师"" (Tôi hỏi giáo viên), KHÔNG dùng ""问题"" (vấn đề)
  
- Nếu từ vựng là CỤM TỪ/TỪ GHÉP (2+ ký tự): Đảm bảo câu ví dụ sử dụng chính xác cụm từ đó
  Ví dụ: Nếu từ vựng là ""问题"" (vấn đề), dùng ""我有一个问题"" (Tôi có một vấn đề)

QUAN TRỌNG:
- {[Từ vựng]}: Đặt từ vựng được yêu cầu trong dấu ngoặc nhọn {}, tách riêng để dễ nhận diện
- [Câu ví dụ]: Câu ví dụ đầy đủ, tự nhiên, chứa CHÍNH XÁC từ vựng đó (không dùng từ khác có chứa từ vựng)
- ([Pinyin]): Pinyin của toàn bộ câu ví dụ, có khoảng trắng giữa các từ
- [Nghĩa]: Nghĩa tiếng Việt của toàn bộ câu, không chỉ nghĩa của từ vựng

Ví dụ minh họa (từ đơn: 五):
{五} 我有五本书。 (Wǒ yǒu wǔ běn shū.) - Tôi có năm quyển sách.
{五} 商店五点开门。 (Shāngdiàn wǔ diǎn kāimén.) - Cửa hàng mở cửa lúc năm giờ.
{五} 我们还需要五分钟。 (Wǒmen hái xūyào wǔ fēnzhōng.) - Chúng ta còn cần năm phút.

Ví dụ minh họa (từ đơn: 问):
{问} 我问老师。 (Wǒ wèn lǎoshī.) - Tôi hỏi giáo viên.
{问} 你问什么？ (Nǐ wèn shénme?) - Bạn hỏi gì?
{问} 他问我问题。 (Tā wèn wǒ wèntí.) - Anh ấy hỏi tôi vấn đề.

Ví dụ minh họa (cụm từ: 问题):
{问题} 我有一个问题。 (Wǒ yǒu yī gè wèntí.) - Tôi có một câu hỏi.
{问题} 这个问题很难。 (Zhège wèntí hěn nán.) - Vấn đề này rất khó.
{问题} 我们需要解决这个问题。 (Wǒmen xūyào jiějué zhège wèntí.) - Chúng ta cần giải quyết vấn đề này.

LƯU Ý:
- Chỉ trả về đúng 3 dòng, mỗi dòng là một ví dụ
- Không thêm giải thích, không thêm text khác
- Đảm bảo từ vựng trong {} xuất hiện CHÍNH XÁC trong câu ví dụ (không dùng từ khác)
- Câu ví dụ phải tự nhiên, có nghĩa, phù hợp với ngữ cảnh";

    /// <summary>
    /// Sinh 3 ví dụ cho một từ vựng bằng Gemini API
    /// </summary>
    public async Task<List<WordExampleDto>> GenerateExamplesAsync(string word)
    {
        var prompt = $"{SYSTEM_PROMPT}\n\nTừ vựng: {word}";
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                topK = 40,
                topP = 0.95,
                maxOutputTokens = 1024
            }
        };

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Đầu tiên, thử lấy danh sách models có sẵn
        Console.WriteLine("[GeminiService] Đang lấy danh sách models có sẵn...");
        var availableModels = await GetAvailableModelsAsync();
        
        // Tạo danh sách models để thử (ưu tiên models có sẵn, sau đó mới đến default list)
        var modelsToTry = new List<string>();
        if (availableModels.Any())
        {
            modelsToTry.AddRange(availableModels);
            Console.WriteLine($"[GeminiService] Sẽ thử {availableModels.Count} models từ danh sách có sẵn");
        }
        else
        {
            // Nếu không lấy được, dùng default list
            modelsToTry.AddRange(GEMINI_MODELS);
            Console.WriteLine($"[GeminiService] Không lấy được danh sách models, dùng default list");
        }

        // Thử cả v1 và v1beta API
        var apiUrls = new[] 
        { 
            ("v1", GEMINI_API_URL_V1),
            ("v1beta", GEMINI_API_URL_V1BETA)
        };

        var allErrors = new List<string>();

        foreach (var (apiVersion, apiUrlTemplate) in apiUrls)
        {
            foreach (var model in modelsToTry)
            {
                try
                {
                    var url = string.Format(apiUrlTemplate, model) + $"?key={_apiKey}";
                    Console.WriteLine($"[GeminiService] Đang thử: {apiVersion}/{model}");

                    var response = await _httpClient.PostAsync(url, content);
                    var body = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorMsg = $"{apiVersion}/{model}: {response.StatusCode} - {body}";
                        Console.WriteLine($"[GeminiService] ❌ {errorMsg}");
                        allErrors.Add(errorMsg);
                        
                        // Nếu là lỗi 401/403, có thể là API key sai - không cần thử tiếp
                        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized || 
                            response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                        {
                            throw new Exception($"API Key không hợp lệ hoặc không có quyền truy cập: {body}");
                        }
                        
                        continue; // Thử model/API version tiếp theo
                    }

                    var result = JsonSerializer.Deserialize<GeminiResponse>(body, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    var text = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
                    if (string.IsNullOrWhiteSpace(text))
                    {
                        Console.WriteLine($"[GeminiService] ⚠️ Không nhận được text từ response: {body}");
                        continue;
                    }

                    var examples = ParseGeminiResponse(text);
                    if (examples.Count == 0)
                    {
                        Console.WriteLine($"[GeminiService] ⚠️ Không parse được ví dụ nào từ text: {text}");
                        continue;
                    }

                    Console.WriteLine($"[GeminiService] ✅ Thành công với {apiVersion}/{model}: {examples.Count} ví dụ");
                    return examples;
                }
                catch (HttpRequestException ex)
                {
                    var errorMsg = $"{apiVersion}/{model}: Network error - {ex.Message}";
                    Console.WriteLine($"[GeminiService] ❌ {errorMsg}");
                    allErrors.Add(errorMsg);
                }
                catch (Exception ex)
                {
                    var errorMsg = $"{apiVersion}/{model}: {ex.GetType().Name} - {ex.Message}";
                    Console.WriteLine($"[GeminiService] ❌ {errorMsg}");
                    allErrors.Add(errorMsg);
                    
                    // Nếu là lỗi nghiêm trọng (không phải 404), throw ngay
                    if (!ex.Message.Contains("404") && !ex.Message.Contains("NotFound"))
                    {
                        throw;
                    }
                }
            }
        }

        // Tổng hợp tất cả lỗi
        var errorSummary = string.Join("\n", allErrors);
        var availableModelsInfo = availableModels.Any() 
            ? $"\n\nModels có sẵn đã tìm thấy: {string.Join(", ", availableModels)}" 
            : "\n\nKhông thể lấy danh sách models có sẵn. Có thể API key không có quyền hoặc không hợp lệ.";
        
        throw new Exception($"Không thể kết nối đến Gemini API. Đã thử {modelsToTry.Count} models với 2 API versions.{availableModelsInfo}\n\nChi tiết lỗi:\n{errorSummary}");
    }

    /// <summary>
    /// Phân tích text trả về của Gemini thành danh sách ví dụ
    /// Hỗ trợ nhiều format khác nhau
    /// </summary>
    private List<WordExampleDto> ParseGeminiResponse(string responseText)
    {
        var examples = new List<WordExampleDto>();
        var lines = responseText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(l => l.Trim())
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .ToList();

        var chineseRegex = new Regex(@"[\u4e00-\u9fa5]+");

        // Format 0 (MỚI - ƯU TIÊN CAO NHẤT): "{Từ vựng} Câu ví dụ (pinyin) - nghĩa"
        // Ví dụ: "{五} 我有五本书。 (Wǒ yǒu wǔ běn shū.) - Tôi có năm quyển sách."
        // Hoặc: "{问题} 我有一个问题。 (Wǒ yǒu yī gè wèntí.) - Tôi có một câu hỏi."
        // Hoặc: "{帮助} 帮助别人是应该的,不用客气 (Bāngzhù biéren shì yīnggāi de, bùyòng kèqì.) - Giúp đỡ..."
        var format0Regex = new Regex(@"\{([\u4e00-\u9fa5]+)\}\s+([\u4e00-\u9fa5\s，。、？！,\.!?]+)\s*\(([^)]+)\)\s*[-–—:]\s*(.+)");

        // Format 1: "Chữ Hán (pinyin) - nghĩa" hoặc "Chữ Hán (pinyin) : nghĩa"
        // Hỗ trợ: dấu phẩy trong câu, dấu chấm trong pinyin, nhiều dấu câu
        var format1Regex = new Regex(@"([\u4e00-\u9fa5\s，。、？！,\.!?]+)\s*\(([^)]+)\)\s*[-–—:]\s*(.+)");
        
        // Format 2: "(1) Chữ Hán (pinyin) (nghĩa)" - số thứ tự trong ngoặc đơn
        var format2Regex = new Regex(@"\(?\d+\)?\s*([\u4e00-\u9fa5\s，。、]+)\s*\(([^)]+)\)\s*\(([^)]+)\)");
        
        // Format 3: "Chữ Hán。(Pinyin.) Nghĩa" - không có dấu ngoặc cho pinyin
        var format3Regex = new Regex(@"([\u4e00-\u9fa5\s，。、]+)[。.]([A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+)[。.]\s*(.+)");

        // Format 4: Nhiều dòng: dòng 1 là chữ Hán, dòng 2 là pinyin, dòng 3 là nghĩa
        // Format 5: "(1) chữ Hán\n(2) pinyin\n(3) nghĩa" trên nhiều dòng

        int i = 0;
        while (i < lines.Count && examples.Count < 3)
        {
            var line = lines[i];

            // Bỏ qua các dòng không có chữ Hán
            if (!chineseRegex.IsMatch(line))
            {
                i++;
                continue;
            }

            // Format 0 (MỚI - ƯU TIÊN CAO NHẤT): "{Từ vựng} Câu ví dụ (pinyin) - nghĩa"
            // Ví dụ: "{帮助} 帮助别人是应该的,不用客气 (Bāngzhù biéren shì yīnggāi de, bùyòng kèqì.) - Giúp đỡ..."
            var match0 = format0Regex.Match(line);
            if (match0.Success)
            {
                var keyword = match0.Groups[1].Value.Trim(); // Từ vựng trong {}
                var character = match0.Groups[2].Value.Trim();
                // Loại bỏ các dấu câu ở cuối câu (nhưng giữ dấu phẩy trong câu)
                character = character.TrimEnd('。', '.', '？', '！', '?', '!');
                var pinyin = match0.Groups[3].Value.Trim();
                // Loại bỏ dấu chấm ở cuối pinyin nếu có
                pinyin = pinyin.TrimEnd('.', '。');
                var meaning = match0.Groups[4].Value.Trim(); // Nghĩa của cả câu
                
                // Validate: câu ví dụ phải chứa từ vựng (có thể là từ ghép)
                if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin) && character.Contains(keyword))
                {
                    examples.Add(new WordExampleDto
                    {
                        Character = character, // Lưu cả câu ví dụ (không bao gồm {keyword})
                        Pinyin = pinyin,
                        Meaning = meaning,
                        SortOrder = examples.Count + 1
                    });
                    i++;
                    continue;
                }
            }

            // Format 1: "Chữ Hán (pinyin) - nghĩa"
            // Ví dụ: "帮助别人是应该的,不用客气 (Bāngzhù biéren shì yīnggāi de, bùyòng kèqì.) - Giúp đỡ người khác..."
            var match1 = format1Regex.Match(line);
            if (match1.Success)
            {
                var character = match1.Groups[1].Value.Trim();
                // Loại bỏ các dấu câu ở cuối câu (nhưng giữ dấu phẩy trong câu)
                character = character.TrimEnd('。', '.', '？', '！', '?', '!');
                var pinyin = match1.Groups[2].Value.Trim();
                // Loại bỏ dấu chấm ở cuối pinyin nếu có
                pinyin = pinyin.TrimEnd('.', '。');
                var meaning = match1.Groups[3].Value.Trim();
                
                if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin))
                {
                    examples.Add(new WordExampleDto
                    {
                        Character = character,
                        Pinyin = pinyin,
                        Meaning = meaning,
                        SortOrder = examples.Count + 1
                    });
                    i++;
                    continue;
                }
            }

            // Format 2: "(1) Chữ Hán (pinyin) (nghĩa)"
            var match2 = format2Regex.Match(line);
            if (match2.Success)
            {
                var character = match2.Groups[1].Value.Trim().TrimEnd('。', '.');
                var pinyin = match2.Groups[2].Value.Trim();
                var meaning = match2.Groups[3].Value.Trim();
                
                if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin))
                {
                    examples.Add(new WordExampleDto
                    {
                        Character = character,
                        Pinyin = pinyin,
                        Meaning = meaning,
                        SortOrder = examples.Count + 1
                    });
                    i++;
                    continue;
                }
            }

            // Format 3: "Chữ Hán。(Pinyin.) Nghĩa"
            var match3 = format3Regex.Match(line);
            if (match3.Success)
            {
                var character = match3.Groups[1].Value.Trim().TrimEnd('。', '.');
                var pinyin = match3.Groups[2].Value.Trim().TrimEnd('。', '.');
                var meaning = match3.Groups[3].Value.Trim();
                
                if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin))
                {
                    examples.Add(new WordExampleDto
                    {
                        Character = character,
                        Pinyin = pinyin,
                        Meaning = meaning,
                        SortOrder = examples.Count + 1
                    });
                    i++;
                    continue;
                }
            }

            // Format 4 & 5: Nhiều dòng - thử parse 3 dòng liên tiếp
            // Format: dòng 1 = chữ Hán, dòng 2 = pinyin, dòng 3 = nghĩa
            if (i + 2 < lines.Count)
            {
                var line1 = lines[i];      // Chữ Hán
                var line2 = lines[i + 1];  // Pinyin
                var line3 = lines[i + 2];  // Nghĩa

                // Kiểm tra pattern: dòng 1 có chữ Hán, dòng 2 có pinyin, dòng 3 có nghĩa (không có chữ Hán)
                var hasChineseInLine1 = chineseRegex.IsMatch(line1);
                var hasPinyinInLine2 = Regex.IsMatch(line2, @"[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+");
                var line3NoChinese = !chineseRegex.IsMatch(line3);
                
                if (hasChineseInLine1 && hasPinyinInLine2 && line3NoChinese)
                {
                    // Tách chữ Hán từ dòng 1 (bỏ số thứ tự, bỏ pinyin trong ngoặc nếu có)
                    var charPart = line1;
                    
                    // Bỏ số thứ tự ở đầu
                    charPart = Regex.Replace(charPart, @"^\(?\d+\)?\s*\.?\s*", "");
                    
                    // Tìm pinyin trong ngoặc ở dòng 1 (nếu có)
                    var pinyinInLine1 = Regex.Match(charPart, @"\(([^)]+)\)");
                    string pinyin = "";
                    string character = "";
                    
                    if (pinyinInLine1.Success)
                    {
                        // Pinyin trong ngoặc ở dòng 1
                        pinyin = pinyinInLine1.Groups[1].Value.Trim();
                        charPart = charPart.Replace(pinyinInLine1.Value, "").Trim();
                        character = chineseRegex.Match(charPart).Value;
                    }
                    else
                    {
                        // Pinyin ở dòng 2
                        character = chineseRegex.Match(charPart).Value;
                        var pinyinLine = line2.Replace("(2)", "").Replace("(1)", "").Replace("(3)", "").Trim();
                        var pinyinMatch = Regex.Match(pinyinLine, @"([A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s，。、]+)");
                        pinyin = pinyinMatch.Success ? pinyinMatch.Groups[1].Value.Trim().TrimEnd('。', '.', '，', ',') : "";
                    }
                    
                    // Nghĩa từ dòng 3
                    var meaning = line3.Replace("(3)", "").Replace("(2)", "").Replace("(1)", "").Trim();
                    
                    if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin) && 
                        !examples.Any(e => e.Character == character))
                    {
                        examples.Add(new WordExampleDto
                        {
                            Character = character,
                            Pinyin = pinyin,
                            Meaning = meaning,
                            SortOrder = examples.Count + 1
                        });
                        i += 3; // Bỏ qua 3 dòng đã parse
                        continue;
                    }
                }
            }

            // Thử parse đơn giản: tìm chữ Hán, pinyin trong ngoặc, nghĩa
            var simpleChinese = chineseRegex.Match(line);
            if (simpleChinese.Success)
            {
                // Bỏ số thứ tự
                var cleanLine = Regex.Replace(line, @"^\(?\d+\)?\s*\.?\s*", "");
                
                // Tìm tất cả text trong ngoặc
                var allParentheses = Regex.Matches(cleanLine, @"\(([^)]+)\)");
                
                if (allParentheses.Count >= 2)
                {
                    // Có 2 ngoặc: pinyin và nghĩa
                    var character = chineseRegex.Match(cleanLine).Value;
                    var pinyin = allParentheses[0].Groups[1].Value.Trim();
                    var meaning = allParentheses[1].Groups[1].Value.Trim();
                    
                    if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin) && 
                        !examples.Any(e => e.Character == character))
                    {
                        examples.Add(new WordExampleDto
                        {
                            Character = character,
                            Pinyin = pinyin,
                            Meaning = meaning,
                            SortOrder = examples.Count + 1
                        });
                        i++;
                        continue;
                    }
                }
                else if (allParentheses.Count == 1)
                {
                    // Chỉ có 1 ngoặc: có thể là pinyin, nghĩa ở sau dấu chấm hoặc dòng tiếp theo
                    var character = chineseRegex.Match(cleanLine).Value;
                    var pinyin = allParentheses[0].Groups[1].Value.Trim();
                    
                    // Tìm nghĩa sau dấu chấm trong cùng dòng
                    var meaning = "";
                    var afterParen = cleanLine.Substring(cleanLine.IndexOf(')') + 1).Trim();
                    if (!string.IsNullOrWhiteSpace(afterParen) && afterParen.Length > 1)
                    {
                        meaning = afterParen.TrimStart(' ', '-', '–', '—', ':', '。', '.').Trim();
                    }
                    
                    // Hoặc nghĩa ở dòng tiếp theo
                    if (string.IsNullOrWhiteSpace(meaning) && i + 1 < lines.Count)
                    {
                        var nextLine = lines[i + 1];
                        if (!chineseRegex.IsMatch(nextLine) && !Regex.IsMatch(nextLine, @"^[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s\(\)]+$"))
                        {
                            meaning = nextLine.Trim();
                        }
                    }
                    
                    if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(pinyin) && 
                        !examples.Any(e => e.Character == character))
                    {
                        examples.Add(new WordExampleDto
                        {
                            Character = character,
                            Pinyin = pinyin,
                            Meaning = meaning,
                            SortOrder = examples.Count + 1
                        });
                    }
                }
            }

            i++;
        }

        return examples;
    }

    /// <summary>
    /// Generate thông tin từ vựng (pinyin, meaning, examples) từ character
    /// </summary>
    public async Task<WordInfoDto> GenerateWordInfoAsync(string character)
    {
        var prompt = $@"Bạn là một gia sư tiếng Trung. Khi nhận được một từ tiếng Trung, hãy cung cấp thông tin về từ đó.

Trả về CHÍNH XÁC theo format (không thêm text khác):
Dòng 1: Chỉ pinyin của từ (ví dụ: gēn)
Dòng 2: Chỉ nghĩa tiếng Việt (ví dụ: theo, với, cùng)
Dòng 3: Câu ví dụ 1, format: [Chữ Hán] ([Pinyin]) - [Nghĩa]
Dòng 4: Câu ví dụ 2 (tùy chọn)
Dòng 5: Câu ví dụ 3 (tùy chọn)

Ví dụ:
wèn
hỏi
你问什么？ (Nǐ wèn shénme?) - Bạn hỏi gì?
我问老师。 (Wǒ wèn lǎoshī.) - Tôi hỏi giáo viên.

Từ cần tra: {character}";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                topK = 40,
                topP = 0.95,
                maxOutputTokens = 1024
            }
        };

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Đầu tiên, thử lấy danh sách models có sẵn (giống như GenerateExamplesAsync)
        Console.WriteLine("[GeminiService] Đang lấy danh sách models có sẵn...");
        var availableModels = await GetAvailableModelsAsync();
        
        // Tạo danh sách models để thử (ưu tiên models có sẵn, sau đó mới đến default list)
        var modelsToTry = new List<string>();
        if (availableModels.Any())
        {
            modelsToTry.AddRange(availableModels);
            Console.WriteLine($"[GeminiService] Sẽ thử {availableModels.Count} models từ danh sách có sẵn");
        }
        else
        {
            // Nếu không lấy được, dùng default list
            modelsToTry.AddRange(GEMINI_MODELS);
            Console.WriteLine($"[GeminiService] Không lấy được danh sách models, dùng default list");
        }

        // Thử cả v1 và v1beta API (giống như GenerateExamplesAsync)
        var apiUrls = new[] 
        { 
            ("v1", GEMINI_API_URL_V1),
            ("v1beta", GEMINI_API_URL_V1BETA)
        };

        var allErrors = new List<string>();

        foreach (var (apiVersion, apiUrlTemplate) in apiUrls)
        {
            foreach (var model in modelsToTry)
            {
                try
                {
                    var url = string.Format(apiUrlTemplate, model) + $"?key={_apiKey}";
                    Console.WriteLine($"[GeminiService] Đang thử generate word info: {apiVersion}/{model}");

                    var response = await _httpClient.PostAsync(url, content);
                    var body = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorMsg = $"{apiVersion}/{model}: {response.StatusCode} - {body}";
                        Console.WriteLine($"[GeminiService] ❌ {errorMsg}");
                        allErrors.Add(errorMsg);
                        
                        // Nếu là lỗi 401/403, có thể là API key sai - không cần thử tiếp
                        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized || 
                            response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                        {
                            throw new Exception($"API Key không hợp lệ hoặc không có quyền truy cập: {body}");
                        }
                        
                        continue; // Thử model/API version tiếp theo
                    }

                    var result = JsonSerializer.Deserialize<GeminiResponse>(body, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    var text = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
                    if (string.IsNullOrWhiteSpace(text))
                    {
                        Console.WriteLine($"[GeminiService] ⚠️ Không nhận được text từ response: {body}");
                        continue;
                    }

                    var wordInfo = ParseWordInfoResponse(text);
                    if (wordInfo != null)
                    {
                        Console.WriteLine($"[GeminiService] ✅ Thành công với {apiVersion}/{model}");
                        return wordInfo;
                    }
                }
                catch (HttpRequestException ex)
                {
                    var errorMsg = $"{apiVersion}/{model}: Network error - {ex.Message}";
                    Console.WriteLine($"[GeminiService] ❌ {errorMsg}");
                    allErrors.Add(errorMsg);
                }
                catch (Exception ex)
                {
                    var errorMsg = $"{apiVersion}/{model}: {ex.Message}";
                    Console.WriteLine($"[GeminiService] ❌ {errorMsg}");
                    allErrors.Add(errorMsg);
                }
            }
        }

        // Tổng hợp tất cả lỗi
        var errorSummary = string.Join("\n", allErrors);
        var availableModelsInfo = availableModels.Any() 
            ? $"\n\nModels có sẵn đã tìm thấy: {string.Join(", ", availableModels)}" 
            : "\n\nKhông thể lấy danh sách models có sẵn. Có thể API key không có quyền hoặc không hợp lệ.";
        
        throw new Exception($"Không thể generate word info từ Gemini API. Đã thử {modelsToTry.Count} models với 2 API versions.{availableModelsInfo}\n\nChi tiết lỗi:\n{errorSummary}");
    }

    /// <summary>
    /// Parse response từ Gemini để lấy thông tin từ vựng
    /// </summary>
    private WordInfoDto? ParseWordInfoResponse(string responseText)
    {
        try
        {
            Console.WriteLine($"[GeminiService] Parsing response text (length: {responseText?.Length ?? 0})");
            Console.WriteLine($"[GeminiService] Full response:\n{responseText}");

            var lines = responseText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrWhiteSpace(l) && 
                            !l.StartsWith("```") && 
                            !l.ToLower().Contains("ví dụ") &&
                            !l.ToLower().Contains("format"))
                .ToList();

            Console.WriteLine($"[GeminiService] Filtered to {lines.Count} lines");
            for (int j = 0; j < Math.Min(lines.Count, 10); j++)
            {
                Console.WriteLine($"[GeminiService] Line {j}: {lines[j]}");
            }

            if (lines.Count < 2)
            {
                Console.WriteLine($"[GeminiService] ⚠️ Không đủ dòng (cần ít nhất 2, có {lines.Count})");
                return null;
            }

            // Dòng 1: Pinyin - bỏ qua các dòng label
            var pinyin = lines[0].Trim();
            if (pinyin.ToLower().Contains("pinyin") || pinyin.ToLower().Contains("dòng"))
            {
                pinyin = lines.Count > 1 ? lines[1].Trim() : "";
                lines.RemoveAt(0);
            }
            
            // Validate pinyin (chỉ chứa chữ cái latin và dấu thanh)
            if (!Regex.IsMatch(pinyin, @"^[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$"))
            {
                Console.WriteLine($"[GeminiService] ⚠️ Pinyin không hợp lệ: '{pinyin}', thử dòng tiếp");
                if (lines.Count > 1)
                {
                    pinyin = lines[1].Trim();
                    lines.RemoveAt(0);
                }
            }
            
            Console.WriteLine($"[GeminiService] Pinyin: '{pinyin}'");

            // Dòng 2: Meaning - bỏ qua các dòng label
            var meaning = lines.Count > 1 ? lines[1].Trim() : "";
            if (meaning.ToLower().Contains("nghĩa") || meaning.ToLower().Contains("dòng"))
            {
                meaning = lines.Count > 2 ? lines[2].Trim() : "";
                lines.RemoveAt(1);
            }
            
            Console.WriteLine($"[GeminiService] Meaning: '{meaning}'");

            // Validate pinyin và meaning
            if (string.IsNullOrWhiteSpace(pinyin) || string.IsNullOrWhiteSpace(meaning))
            {
                Console.WriteLine($"[GeminiService] ⚠️ Pinyin hoặc Meaning bị rỗng");
                return null;
            }

            // Dòng 3+: Examples (tùy chọn)
            var examples = new List<WordExampleDto>();
            var chineseRegex = new Regex(@"[\u4e00-\u9fa5]+");
            var format1Regex = new Regex(@"([\u4e00-\u9fa5\s，。、？！]+)\s*\(([^)]+)\)\s*[-–—:]\s*(.+)");

            for (int i = 2; i < lines.Count && examples.Count < 3; i++)
            {
                var line = lines[i];
                
                // Bỏ qua dòng không có chữ Hán
                if (!chineseRegex.IsMatch(line))
                {
                    Console.WriteLine($"[GeminiService] Skip line {i} (no Chinese): {line}");
                    continue;
                }

                var match = format1Regex.Match(line);
                if (match.Success)
                {
                    var character = match.Groups[1].Value.Trim().TrimEnd('。', '.', '？', '！', '?', '!');
                    var examplePinyin = match.Groups[2].Value.Trim();
                    var exampleMeaning = match.Groups[3].Value.Trim();

                    Console.WriteLine($"[GeminiService] Matched example {examples.Count + 1}: Character='{character}', Pinyin='{examplePinyin}', Meaning='{exampleMeaning}'");

                    if (!string.IsNullOrWhiteSpace(character) && !string.IsNullOrWhiteSpace(examplePinyin))
                    {
                        examples.Add(new WordExampleDto
                        {
                            Character = character,
                            Pinyin = examplePinyin,
                            Meaning = exampleMeaning,
                            SortOrder = examples.Count + 1
                        });
                    }
                }
                else
                {
                    Console.WriteLine($"[GeminiService] No match for line {i}: {line}");
                }
            }

            Console.WriteLine($"[GeminiService] ✅ Parsed successfully: Pinyin='{pinyin}', Meaning='{meaning}', Examples={examples.Count}");

            return new WordInfoDto
            {
                Pinyin = pinyin,
                Meaning = meaning,
                Examples = examples  // Có thể rỗng, không sao
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GeminiService] ❌ Lỗi khi parse word info: {ex.Message}");
            Console.WriteLine($"[GeminiService] StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    // Cấu trúc phản hồi từ Gemini
    private class GeminiResponse
    {
        public GeminiCandidate[]? Candidates { get; set; }
    }

    private class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }

    private class GeminiContent
    {
        public GeminiPart[]? Parts { get; set; }
    }

    private class GeminiPart
    {
        public string? Text { get; set; }
    }

    // Classes để deserialize Models List API response
    private class ModelsListResponse
    {
        public ModelInfo[]? Models { get; set; }
    }

    private class ModelInfo
    {
        public string? Name { get; set; }
        public string[]? SupportedGenerationMethods { get; set; }
    }
}