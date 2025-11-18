"""
Script import toàn bộ từ vựng HSK 1-6 vào database
Sử dụng data từ các nguồn mở: HSK Standard, CC-CEDICT, etc.

Cách sử dụng:
1. Chuẩn bị file JSON cho mỗi cấp độ: hsk1.json, hsk2.json, ... hsk6.json
2. Chạy script: python import_hsk_all_levels.py
3. Script sẽ:
   - Đọc tất cả các file HSK
   - Gọi API backend để tạo từng từ (hoặc bulk create)
   - Log progress và lỗi

Số lượng từ mỗi cấp (tham khảo):
- HSK 1: ~150 từ
- HSK 2: ~150 từ (tổng 300)
- HSK 3: ~300 từ (tổng 600)
- HSK 4: ~600 từ (tổng 1200)
- HSK 5: ~1300 từ (tổng 2500)
- HSK 6: ~2500 từ (tổng 5000)
"""

import json
import requests
import time
from pathlib import Path
from typing import List, Dict, Optional
import sys

# Cấu hình
API_BASE_URL = "https://localhost:7028/api"  # Thay đổi theo môi trường
API_TOKEN = ""  # Nếu cần authentication

# Mapping HSK level
HSK_LEVELS = {
    1: {"file": "hsk1.json", "expected_count": 150},
    2: {"file": "hsk2.json", "expected_count": 150},
    3: {"file": "hsk3.json", "expected_count": 300},
    4: {"file": "hsk4.json", "expected_count": 600},
    5: {"file": "hsk5.json", "expected_count": 1300},
    6: {"file": "hsk6.json", "expected_count": 2500},
}

class HSKImporter:
    def __init__(self, api_base_url: str, api_token: Optional[str] = None):
        self.api_base_url = api_base_url
        self.headers = {
            "Content-Type": "application/json",
        }
        if api_token:
            self.headers["Authorization"] = f"Bearer {api_token}"
        
        self.stats = {
            "total": 0,
            "success": 0,
            "failed": 0,
            "skipped": 0,
            "by_level": {}
        }
    
    def load_hsk_file(self, filepath: Path) -> List[Dict]:
        """Đọc file JSON HSK"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✅ Đọc file {filepath.name}: {len(data)} từ")
                return data
        except FileNotFoundError:
            print(f"❌ Không tìm thấy file: {filepath}")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ Lỗi parse JSON {filepath}: {e}")
            return []
    
    def translate_meaning(self, definitions: List[str]) -> str:
        """
        Dịch definitions từ tiếng Anh sang tiếng Việt
        TODO: Tích hợp translation API hoặc sử dụng dictionary
        """
        from translation_dict import TRANSLATION_DICT
        
        vietnamese_meanings = []
        for definition in definitions:
            # Tìm trong dictionary
            translated = TRANSLATION_DICT.get(definition.lower(), definition)
            vietnamese_meanings.append(translated)
        
        return ", ".join(vietnamese_meanings)
    
    def create_word(self, word_data: Dict, hsk_level: int, batch_mode: bool = False) -> bool:
        """
        Tạo một từ vựng qua API
        
        word_data format từ HSK JSON:
        {
            "simplified": "你好",
            "traditional": "你好",
            "pinyin": "nǐhǎo",
            "definitions": ["hello", "hi"]
        }
        """
        try:
            # Chuẩn bị payload
            character = word_data.get("simplified", "")
            pinyin = word_data.get("pinyin", "")
            definitions = word_data.get("definitions", [])
            
            # Dịch sang tiếng Việt (nếu có translation dict)
            try:
                meaning = self.translate_meaning(definitions)
            except:
                meaning = ", ".join(definitions)  # Fallback: giữ tiếng Anh
            
            if not character or not pinyin:
                print(f"⚠️  Bỏ qua từ thiếu thông tin: {word_data}")
                self.stats["skipped"] += 1
                return False
            
            # Gọi API để tạo word
            endpoint = f"{self.api_base_url}/vocabulary/get-or-create"
            params = {"character": character}
            
            if not batch_mode:
                print(f"  📝 Đang tạo: {character} ({pinyin}) - {meaning[:50]}...")
            
            response = requests.get(
                endpoint,
                params=params,
                headers=self.headers,
                timeout=30,
                verify=False  # Tắt SSL verify cho localhost
            )
            
            if response.status_code == 200:
                self.stats["success"] += 1
                return True
            elif response.status_code == 409:  # Conflict - từ đã tồn tại
                if not batch_mode:
                    print(f"  ℹ️  Từ đã tồn tại: {character}")
                self.stats["skipped"] += 1
                return True
            else:
                print(f"  ❌ Lỗi API ({response.status_code}): {character}")
                if response.text:
                    print(f"     {response.text[:200]}")
                self.stats["failed"] += 1
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Lỗi kết nối API: {e}")
            self.stats["failed"] += 1
            return False
        except Exception as e:
            print(f"  ❌ Lỗi không xác định: {e}")
            self.stats["failed"] += 1
            return False
    
    def import_hsk_level(self, level: int, filepath: Path, batch_size: int = 10) -> Dict:
        """Import toàn bộ từ vựng của một cấp độ HSK"""
        print(f"\n{'='*60}")
        print(f"📚 Đang import HSK {level} từ {filepath.name}")
        print(f"{'='*60}")
        
        words = self.load_hsk_file(filepath)
        if not words:
            return {"success": 0, "failed": 0, "skipped": 0}
        
        level_stats = {"success": 0, "failed": 0, "skipped": 0}
        total_words = len(words)
        
        # Import theo batch
        for i in range(0, total_words, batch_size):
            batch = words[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total_words + batch_size - 1) // batch_size
            
            print(f"\n⏳ Batch {batch_num}/{total_batches} ({len(batch)} từ):")
            
            for word_data in batch:
                success = self.create_word(word_data, level, batch_mode=True)
                if success:
                    level_stats["success"] += 1
                else:
                    level_stats["failed"] += 1
            
            # Progress
            processed = min(i + batch_size, total_words)
            progress = (processed / total_words) * 100
            print(f"  ✅ Tiến độ: {processed}/{total_words} ({progress:.1f}%)")
            
            # Delay giữa các batch để không quá tải server
            if i + batch_size < total_words:
                time.sleep(1)
        
        self.stats["by_level"][level] = level_stats
        return level_stats
    
    def import_all_levels(self, base_dir: Path, levels: List[int] = None):
        """Import tất cả các cấp độ HSK"""
        if levels is None:
            levels = list(HSK_LEVELS.keys())
        
        print(f"\n{'#'*60}")
        print(f"🚀 BẮT ĐẦU IMPORT HSK {min(levels)}-{max(levels)}")
        print(f"{'#'*60}")
        
        start_time = time.time()
        
        for level in levels:
            if level not in HSK_LEVELS:
                print(f"⚠️  Bỏ qua HSK {level} (không có trong config)")
                continue
            
            config = HSK_LEVELS[level]
            filepath = base_dir / config["file"]
            
            if not filepath.exists():
                print(f"⚠️  Bỏ qua HSK {level}: Không tìm thấy {filepath}")
                continue
            
            self.import_hsk_level(level, filepath)
        
        # Tổng kết
        elapsed_time = time.time() - start_time
        self.print_summary(elapsed_time)
    
    def print_summary(self, elapsed_time: float):
        """In báo cáo tổng kết"""
        print(f"\n{'#'*60}")
        print(f"📊 TỔNG KẾT IMPORT")
        print(f"{'#'*60}")
        print(f"⏱️  Thời gian: {elapsed_time:.2f}s")
        print(f"✅ Thành công: {self.stats['success']} từ")
        print(f"⏭️  Bỏ qua (đã tồn tại): {self.stats['skipped']} từ")
        print(f"❌ Thất bại: {self.stats['failed']} từ")
        print(f"📈 Tổng cộng: {self.stats['success'] + self.stats['skipped'] + self.stats['failed']} từ")
        
        if self.stats["by_level"]:
            print(f"\n📚 Chi tiết theo cấp độ:")
            for level, stats in sorted(self.stats["by_level"].items()):
                total = stats["success"] + stats["failed"] + stats["skipped"]
                print(f"  HSK {level}: {stats['success']}/{total} thành công")


def main():
    """Main function"""
    print("="*60)
    print("HSK VOCABULARY IMPORTER")
    print("="*60)
    
    # Tìm thư mục chứa file HSK
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / "data"
    
    if not data_dir.exists():
        print(f"❌ Không tìm thấy thư mục data: {data_dir}")
        sys.exit(1)
    
    print(f"📂 Thư mục data: {data_dir}")
    
    # Khởi tạo importer
    importer = HSKImporter(
        api_base_url=API_BASE_URL,
        api_token=API_TOKEN
    )
    
    # Chọn cấp độ cần import
    print("\nChọn cấp độ cần import:")
    print("1. Chỉ HSK 1 (150 từ)")
    print("2. HSK 1-2 (300 từ)")
    print("3. HSK 1-3 (600 từ)")
    print("4. HSK 1-4 (1200 từ)")
    print("5. HSK 1-6 (5000 từ) - ĐỀ XUẤT")
    print("6. Tùy chọn")
    
    choice = input("\nNhập lựa chọn (1-6): ").strip()
    
    if choice == "1":
        levels = [1]
    elif choice == "2":
        levels = [1, 2]
    elif choice == "3":
        levels = [1, 2, 3]
    elif choice == "4":
        levels = [1, 2, 3, 4]
    elif choice == "5":
        levels = [1, 2, 3, 4, 5, 6]
    elif choice == "6":
        levels_input = input("Nhập các cấp độ (VD: 1,2,3): ").strip()
        levels = [int(l.strip()) for l in levels_input.split(",")]
    else:
        print("❌ Lựa chọn không hợp lệ")
        sys.exit(1)
    
    # Xác nhận
    print(f"\n⚠️  Sẽ import HSK {', '.join(map(str, levels))}")
    confirm = input("Tiếp tục? (y/n): ").strip().lower()
    
    if confirm != "y":
        print("❌ Đã hủy")
        sys.exit(0)
    
    # Bắt đầu import
    importer.import_all_levels(data_dir, levels)


if __name__ == "__main__":
    main()

