"""
Script để kiểm tra file seed data
"""

import json
import os

def check_seed_data(file_path):
    """Kiểm tra và hiển thị thống kê file seed data"""
    
    if not os.path.exists(file_path):
        print(f"Lỗi: Không tìm thấy file {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("=" * 50)
    print("THỐNG KÊ FILE SEED DATA")
    print("=" * 50)
    
    # Course Categories
    categories = data.get("courseCategories", [])
    print(f"\n📚 Course Categories: {len(categories)}")
    for cat in categories:
        print(f"   - {cat.get('name')}: {cat.get('displayName')}")
    
    # Courses
    courses = data.get("courses", [])
    print(f"\n🎓 Courses: {len(courses)}")
    for course in courses:
        print(f"   - {course.get('title')} (HSK {course.get('hskLevel')})")
    
    # Lessons
    lessons = data.get("lessons", [])
    print(f"\n📖 Lessons: {len(lessons)}")
    if lessons:
        print(f"   Bài đầu tiên: {lessons[0].get('title')}")
        print(f"   Bài cuối cùng: {lessons[-1].get('title')}")
        # Đếm số từ mỗi bài
        words = data.get("words", [])
        lesson_word_count = {}
        for word in words:
            lesson_id = word.get("lessonId")
            if lesson_id:
                lesson_word_count[lesson_id] = lesson_word_count.get(lesson_id, 0) + 1
        print(f"   Số từ mỗi bài: {min(lesson_word_count.values()) if lesson_word_count else 0}-{max(lesson_word_count.values()) if lesson_word_count else 0}")
    
    # Words
    words = data.get("words", [])
    print(f"\n📝 Words: {len(words)}")
    
    # Đếm words có audioUrl
    words_with_audio = sum(1 for w in words if w.get("audioUrl"))
    print(f"   Words có audioUrl: {words_with_audio} ({words_with_audio*100//len(words) if words else 0}%)")
    
    # Đếm words có exampleSentence
    words_with_example = sum(1 for w in words if w.get("exampleSentence"))
    print(f"   Words có exampleSentence: {words_with_example} ({words_with_example*100//len(words) if words else 0}%)")
    
    # Hiển thị một vài từ mẫu
    if words:
        print(f"\n📋 Mẫu từ vựng (5 từ đầu):")
        for i, word in enumerate(words[:5], 1):
            print(f"   {i}. {word.get('character')} ({word.get('pinyin')}) - {word.get('meaning')}")
            if word.get('audioUrl'):
                print(f"      Audio: ✓")
            else:
                print(f"      Audio: ✗")
    
    # Questions
    questions = data.get("questions", [])
    print(f"\n❓ Questions: {len(questions)}")
    
    print("\n" + "=" * 50)
    print("✅ Kiểm tra hoàn tất!")
    print("=" * 50)

if __name__ == "__main__":
    import sys
    
    # Đường dẫn file seed data
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = "../data/seed-data-hsk1.json"
    
    check_seed_data(file_path)

