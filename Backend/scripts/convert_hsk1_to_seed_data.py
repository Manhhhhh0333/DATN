"""
Script để chuyển đổi file hsk1.json sang format seed data
và tích hợp Text-to-Speech cho audioUrl
"""

import json
import math
import urllib.parse
from typing import List, Dict, Any
from translation_dict import translate_meaning

# Cấu hình
WORDS_PER_LESSON = 12  # Số từ vựng mỗi bài học
COURSE_ID = 1  # ID khóa học HSK 1
HSK_LEVEL = 1

# Text-to-Speech service URL
# Có thể dùng Google TTS, Baidu TTS, hoặc tạo endpoint backend
TTS_SERVICE_URL = "https://api.voicerss.org/?key=YOUR_KEY&hl=zh-cn&src={text}"
# Hoặc dùng endpoint backend: "/api/audio/tts?text={text}&lang=zh"
# Hoặc Google TTS: "https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q={text}"


def generate_audio_url(character: str, pinyin: str = None, tts_service: str = "google") -> str:
    """
    Tạo audioUrl cho từ vựng bằng Text-to-Speech
    
    Args:
        character: Chữ Hán cần phát âm
        pinyin: Phiên âm (có thể dùng để cải thiện phát âm)
        tts_service: Service TTS ("google", "baidu", hoặc "backend")
    
    Returns:
        URL audio để phát âm từ vựng
    """
    # Dùng character làm text để phát âm
    text = character
    
    # Encode text cho URL
    encoded_text = urllib.parse.quote(text)
    
    if tts_service == "google":
        # Google TTS (miễn phí, không cần API key)
        # Lưu ý: Google có thể chặn nếu request quá nhiều
        audio_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q={encoded_text}"
    elif tts_service == "baidu":
        # Baidu TTS (tốt cho tiếng Trung, không cần API key cho basic usage)
        audio_url = f"https://fanyi.baidu.com/gettts?lan=zh&text={encoded_text}&spd=3&source=web"
    else:
        # Backend endpoint (cho dynamic generation)
        audio_url = f"/api/audio/tts-url?text={encoded_text}&lang=zh-CN"
    
    return audio_url


def estimate_stroke_count(character: str) -> int:
    """
    Ước tính số nét của chữ Hán (đơn giản)
    Có thể cải thiện bằng cách dùng thư viện chuyên dụng
    """
    # Số nét ước tính dựa trên độ phức tạp
    # Đây là cách đơn giản, có thể cải thiện
    if len(character) == 1:
        # Ước tính dựa trên số lượng nét phổ biến
        # Có thể dùng database hoặc API để lấy chính xác
        return 7  # Giá trị mặc định
    else:
        # Từ ghép: tính trung bình
        return len(character) * 5


def estimate_frequency(index: int, total: int) -> int:
    """
    Ước tính tần suất sử dụng (từ đầu danh sách thường phổ biến hơn)
    """
    # Từ đầu danh sách có frequency cao hơn
    frequency = 100 - (index * 50 // total)
    return max(10, frequency)  # Tối thiểu 10


def convert_hsk1_to_seed_format(hsk1_file: str) -> List[Dict[str, Any]]:
    """
    Chuyển đổi từ format hsk1.json sang format seed data
    """
    with open(hsk1_file, 'r', encoding='utf-8') as f:
        hsk1_data = json.load(f)
    
    words = []
    
    for index, item in enumerate(hsk1_data):
        # Lấy dữ liệu từ hsk1.json
        character = item.get('simplified', '').strip()
        pinyin = item.get('pinyin', '').strip()
        definitions = item.get('definitions', [])
        
        # Chuyển đổi definitions thành meaning (tiếng Việt)
        english_meaning = ', '.join(definitions) if definitions else ''
        meaning = translate_meaning(english_meaning) if english_meaning else ''
        
        # Tạo example sentence đơn giản (dùng tiếng Việt)
        example_sentence = f"{character} ({pinyin}) - {meaning}"
        
        # Tạo audioUrl bằng Text-to-Speech (dùng Google TTS cho seed data)
        audio_url = generate_audio_url(character, pinyin, tts_service="google")
        
        # Tạo word object
        word = {
            "character": character,
            "pinyin": pinyin,
            "meaning": meaning,
            "audioUrl": audio_url,
            "exampleSentence": example_sentence,
            "hskLevel": HSK_LEVEL,
            "frequency": estimate_frequency(index, len(hsk1_data)),
            "strokeCount": estimate_stroke_count(character)
        }
        
        words.append(word)
    
    return words


def divide_words_into_lessons(words: List[Dict[str, Any]], course_id: int) -> Dict[str, Any]:
    """
    Chia từ vựng thành các bài học
    """
    total_words = len(words)
    num_lessons = math.ceil(total_words / WORDS_PER_LESSON)
    
    print(f"Tổng số từ vựng: {total_words}")
    print(f"Số từ vựng mỗi bài: {WORDS_PER_LESSON}")
    print(f"Số bài học cần tạo: {num_lessons}")
    print("-" * 50)
    
    lessons = []
    word_id = 1
    
    for lesson_index in range(1, num_lessons + 1):
        start_idx = (lesson_index - 1) * WORDS_PER_LESSON
        end_idx = min(start_idx + WORDS_PER_LESSON, total_words)
        lesson_words = words[start_idx:end_idx]
        
        # Tạo tiêu đề bài học
        if lesson_words:
            first_chars = [w['character'] for w in lesson_words[:3]]
            if len(first_chars) >= 2:
                title = f"Bài {lesson_index}: {first_chars[0]}, {first_chars[1]} và các từ liên quan"
            else:
                title = f"Bài {lesson_index}: {first_chars[0]} và các từ cơ bản"
        else:
            title = f"Bài {lesson_index}: Từ vựng cơ bản"
        
        # Tạo nội dung bài học
        content = f"<h2>Học {len(lesson_words)} từ vựng</h2>\n"
        content += "<p>Trong bài học này, bạn sẽ học các từ vựng sau:</p>\n<ul>\n"
        for word in lesson_words:
            content += f"<li><strong>{word['character']}</strong> ({word['pinyin']}) - {word['meaning']}</li>\n"
        content += "</ul>"
        
        # Tạo lesson
        lesson = {
            "courseId": course_id,
            "title": title,
            "description": f"Học {len(lesson_words)} từ vựng HSK {HSK_LEVEL} cơ bản",
            "lessonIndex": lesson_index,
            "content": content,
            "isLocked": lesson_index > 1,
            "prerequisiteLessonId": lesson_index - 1 if lesson_index > 1 else None,
            "isActive": True
        }
        
        lessons.append(lesson)
        
        # Thêm từ vựng với lessonId
        for word in lesson_words:
            word["lessonId"] = lesson_index
            word["id"] = word_id
            word_id += 1
        
        print(f"Bài {lesson_index}: {title} - {len(lesson_words)} từ vựng")
    
    return {
        "lessons": lessons,
        "words": words
    }


def create_seed_data_json(output_file: str, hsk1_file: str = "hsk1.json"):
    """
    Tạo file seed data JSON đầy đủ
    """
    print("=" * 50)
    print("Chuyển đổi HSK1 JSON sang Seed Data")
    print("=" * 50)
    
    # Đọc và chuyển đổi từ vựng
    print("\n1. Đọc và chuyển đổi từ vựng...")
    words = convert_hsk1_to_seed_format(hsk1_file)
    print(f"   Đã chuyển đổi {len(words)} từ vựng")
    
    # Chia thành bài học
    print("\n2. Chia từ vựng thành bài học...")
    lesson_data = divide_words_into_lessons(words, COURSE_ID)
    
    # Tạo seed data đầy đủ
    print("\n3. Tạo seed data đầy đủ...")
    seed_data = {
        "courseCategories": [
            {
                "id": 1,
                "name": "HSK1",
                "displayName": "HSK Cấp độ 1",
                "description": "Cấp độ cơ bản nhất - 150 từ vựng",
                "iconUrl": None,
                "sortOrder": 1
            }
        ],
        "courses": [
            {
                "id": 1,
                "categoryId": 1,
                "title": "HSK 1 - Khóa học cơ bản",
                "description": f"Khóa học HSK 1 với {len(lesson_data['lessons'])} bài học cơ bản, học {len(words)} từ vựng và các mẫu câu giao tiếp đơn giản nhất.",
                "imageUrl": None,
                "level": "HSK 1",
                "hskLevel": 1,
                "sortOrder": 1,
                "isActive": True
            }
        ],
        "lessons": lesson_data["lessons"],
        "words": lesson_data["words"],
        "questions": []  # Có thể thêm sau
    }
    
    # Lưu vào file
    print(f"\n4. Lưu vào file {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(seed_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 50)
    print("Hoàn thành!")
    print(f"   - Tổng số bài học: {len(lesson_data['lessons'])}")
    print(f"   - Tổng số từ vựng: {len(words)}")
    print(f"   - File output: {output_file}")
    print("=" * 50)
    
    return seed_data


if __name__ == "__main__":
    import sys
    
    # Đường dẫn file input và output
    hsk1_file = "hsk1.json"
    output_file = "../data/seed-data-hsk1.json"
    
    # Kiểm tra file input
    import os
    if not os.path.exists(hsk1_file):
        print(f"Lỗi: Không tìm thấy file {hsk1_file}")
        print("Vui lòng đặt file hsk1.json trong thư mục scripts/")
        sys.exit(1)
    
    # Tạo seed data
    create_seed_data_json(output_file, hsk1_file)
