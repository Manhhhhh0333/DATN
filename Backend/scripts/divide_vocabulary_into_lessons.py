"""
Script để chia từ vựng HSK thành các bài học nhỏ
Mỗi bài học sẽ có 10-15 từ vựng
"""

import json
import math

def divide_vocabulary_into_lessons(vocabulary_file, course_id, words_per_lesson=12):
    """
    Chia từ vựng từ file Excel hoặc JSON thành các bài học
    
    Args:
        vocabulary_file: Đường dẫn đến file chứa từ vựng (JSON hoặc Excel)
        course_id: ID của khóa học
        words_per_lesson: Số từ vựng mỗi bài học (mặc định 12)
    """
    
    # Đọc từ vựng từ file
    # Ví dụ format JSON:
    # [
    #   {
    #     "character": "你",
    #     "pinyin": "nǐ",
    #     "meaning": "bạn",
    #     "hskLevel": 1,
    #     ...
    #   },
    #   ...
    # ]
    
    with open(vocabulary_file, 'r', encoding='utf-8') as f:
        words = json.load(f)
    
    # Tính số bài học cần thiết
    total_words = len(words)
    num_lessons = math.ceil(total_words / words_per_lesson)
    
    print(f"Tổng số từ vựng: {total_words}")
    print(f"Số từ vựng mỗi bài: {words_per_lesson}")
    print(f"Số bài học cần tạo: {num_lessons}")
    print("-" * 50)
    
    lessons = []
    lesson_index = 1
    
    # Chia từ vựng thành các bài học
    for i in range(0, total_words, words_per_lesson):
        lesson_words = words[i:i + words_per_lesson]
        
        # Tạo lesson
        lesson = {
            "courseId": course_id,
            "title": f"Bài {lesson_index}: {generate_lesson_title(lesson_words)}",
            "description": f"Học {len(lesson_words)} từ vựng HSK cơ bản",
            "lessonIndex": lesson_index,
            "content": generate_lesson_content(lesson_words),
            "isLocked": lesson_index > 1,  # Bài đầu tiên mở, các bài sau khóa
            "prerequisiteLessonId": lesson_index - 1 if lesson_index > 1 else None,
            "isActive": True,
            "words": []
        }
        
        # Thêm từ vựng vào lesson
        word_id = (lesson_index - 1) * words_per_lesson + 1
        for word in lesson_words:
            lesson_word = {
                "id": word_id,
                "lessonId": lesson_index,  # Sẽ được cập nhật sau khi tạo lesson
                "character": word.get("character", ""),
                "pinyin": word.get("pinyin", ""),
                "meaning": word.get("meaning", ""),
                "audioUrl": word.get("audioUrl"),
                "exampleSentence": word.get("exampleSentence"),
                "hskLevel": word.get("hskLevel"),
                "frequency": word.get("frequency"),
                "strokeCount": word.get("strokeCount")
            }
            lesson["words"].append(lesson_word)
            word_id += 1
        
        lessons.append(lesson)
        lesson_index += 1
        
        print(f"Bài {lesson['lessonIndex']}: {lesson['title']} - {len(lesson['words'])} từ vựng")
    
    # Tạo output JSON
    output = {
        "lessons": lessons,
        "summary": {
            "totalWords": total_words,
            "totalLessons": num_lessons,
            "wordsPerLesson": words_per_lesson,
            "courseId": course_id
        }
    }
    
    # Lưu vào file
    output_file = f"lessons_course_{course_id}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print("-" * 50)
    print(f"Đã tạo {num_lessons} bài học và lưu vào {output_file}")
    
    return output


def generate_lesson_title(words):
    """Tạo tiêu đề bài học dựa trên các từ vựng đầu tiên"""
    if not words:
        return "Từ vựng cơ bản"
    
    # Lấy 2-3 từ đầu tiên làm tiêu đề
    first_words = words[:3]
    titles = []
    for word in first_words:
        char = word.get("character", "")
        if char:
            titles.append(char)
    
    if len(titles) >= 2:
        return f"{titles[0]}, {titles[1]} và các từ liên quan"
    elif len(titles) == 1:
        return f"{titles[0]} và các từ cơ bản"
    else:
        return "Từ vựng cơ bản"


def generate_lesson_content(words):
    """Tạo nội dung HTML cho bài học"""
    content = f"<h2>Học {len(words)} từ vựng</h2>\n"
    content += "<p>Trong bài học này, bạn sẽ học các từ vựng sau:</p>\n"
    content += "<ul>\n"
    
    for word in words:
        char = word.get("character", "")
        pinyin = word.get("pinyin", "")
        meaning = word.get("meaning", "")
        content += f"<li><strong>{char}</strong> ({pinyin}) - {meaning}</li>\n"
    
    content += "</ul>"
    return content


if __name__ == "__main__":
    # Ví dụ sử dụng
    # vocabulary_file = "hsk1_vocabulary.json"
    # course_id = 1
    # divide_vocabulary_into_lessons(vocabulary_file, course_id, words_per_lesson=12)
    
    print("Script chia từ vựng thành bài học")
    print("Sử dụng: python divide_vocabulary_into_lessons.py")
    print("\nVí dụ input JSON:")
    print("""
    [
      {
        "character": "你",
        "pinyin": "nǐ",
        "meaning": "bạn",
        "hskLevel": 1,
        "exampleSentence": "你好 (nǐ hǎo) - Xin chào"
      },
      ...
    ]
    """)

