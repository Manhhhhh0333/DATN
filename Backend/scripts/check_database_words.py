"""
Script kiểm tra số lượng từ vựng trong database
Giúp xác nhận dữ liệu đã được import thành công

Sử dụng:
python check_database_words.py
"""

import requests
import sys

API_BASE_URL = "https://localhost:7028/api"

def check_word_count():
    """Kiểm tra tổng số từ trong database"""
    print("="*60)
    print("KIỂM TRA DỮ LIỆU TRONG DATABASE")
    print("="*60)
    
    try:
        # Gọi API để lấy danh sách từ (giả sử có endpoint này)
        # Nếu không có, có thể dùng SQL query trực tiếp
        
        print("\n📊 Đang kiểm tra...")
        print("\n⚠️  Lưu ý: Script này cần endpoint API để lấy thống kê")
        print("Hoặc dùng SQL query trực tiếp:")
        print()
        print("```sql")
        print("-- Tổng số từ")
        print("SELECT COUNT(*) as Total FROM Words;")
        print()
        print("-- Số từ theo HSK level")
        print("SELECT HSKLevel, COUNT(*) as Total")
        print("FROM Words")
        print("GROUP BY HSKLevel")
        print("ORDER BY HSKLevel;")
        print()
        print("-- Từ mới nhất")
        print("SELECT TOP 10 Character, Pinyin, Meaning, CreatedAt")
        print("FROM Words")
        print("ORDER BY CreatedAt DESC;")
        print("```")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_word_count()

