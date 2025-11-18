"""
Script download dữ liệu HSK 1-6 từ các nguồn mở

Nguồn dữ liệu:
1. GitHub: aldrian/hsk-vocabulary (JSON format)
2. GitHub: clem109/hsk-vocabulary (CSV format)
3. CC-CEDICT (Chinese-English dictionary)

Cách sử dụng:
python download_hsk_data.py
"""

import requests
import json
from pathlib import Path
import sys

# URLs nguồn dữ liệu HSK miễn phí
HSK_DATA_SOURCES = {
    "github_aldrian": {
        "name": "aldrian/hsk-vocabulary",
        "base_url": "https://raw.githubusercontent.com/aldrian/hsk-vocabulary/master/data",
        "files": {
            1: "hsk1.json",
            2: "hsk2.json",
            3: "hsk3.json",
            4: "hsk4.json",
            5: "hsk5.json",
            6: "hsk6.json",
        }
    },
    "github_clem109": {
        "name": "clem109/hsk-vocabulary", 
        "base_url": "https://raw.githubusercontent.com/clem109/hsk-vocabulary/master/data",
        "files": {
            1: "HSK%20Level%201.json",
            2: "HSK%20Level%202.json",
            3: "HSK%20Level%203.json",
            4: "HSK%20Level%204.json",
            5: "HSK%20Level%205.json",
            6: "HSK%20Level%206.json",
        }
    }
}

def download_file(url: str, save_path: Path) -> bool:
    """Download file từ URL"""
    try:
        print(f"  📥 Downloading: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Kiểm tra content
        data = response.json()
        
        # Lưu file
        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ Saved to: {save_path} ({len(data)} items)")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Download error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"  ❌ JSON parse error: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Unknown error: {e}")
        return False

def download_hsk_data(output_dir: Path, source_name: str = "github_aldrian"):
    """Download toàn bộ dữ liệu HSK từ một nguồn"""
    if source_name not in HSK_DATA_SOURCES:
        print(f"❌ Nguồn không hợp lệ: {source_name}")
        print(f"Các nguồn có sẵn: {', '.join(HSK_DATA_SOURCES.keys())}")
        return
    
    source = HSK_DATA_SOURCES[source_name]
    print(f"\n{'='*60}")
    print(f"📚 Downloading HSK data từ: {source['name']}")
    print(f"{'='*60}\n")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    total_words = 0
    
    for level, filename in source["files"].items():
        url = f"{source['base_url']}/{filename}"
        save_path = output_dir / f"hsk{level}.json"
        
        print(f"HSK {level}:")
        if download_file(url, save_path):
            success_count += 1
            # Đếm số từ
            try:
                with open(save_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    total_words += len(data)
            except:
                pass
        print()
    
    print(f"\n{'='*60}")
    print(f"📊 SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Downloaded: {success_count}/{len(source['files'])} files")
    print(f"📝 Total words: {total_words}")
    print(f"📂 Output directory: {output_dir}")
    print()


def main():
    """Main function"""
    script_dir = Path(__file__).parent
    output_dir = script_dir.parent / "data"
    
    print("="*60)
    print("HSK DATA DOWNLOADER")
    print("="*60)
    print()
    print("Chọn nguồn dữ liệu:")
    print("1. aldrian/hsk-vocabulary (GitHub) - ĐỀ XUẤT")
    print("2. clem109/hsk-vocabulary (GitHub)")
    
    choice = input("\nNhập lựa chọn (1-2): ").strip()
    
    if choice == "1":
        source_name = "github_aldrian"
    elif choice == "2":
        source_name = "github_clem109"
    else:
        print("❌ Lựa chọn không hợp lệ")
        sys.exit(1)
    
    download_hsk_data(output_dir, source_name)
    
    print("\n✅ HOÀN TẤT!")
    print("\nBước tiếp theo:")
    print("1. Kiểm tra file trong thư mục: Backend/data/")
    print("2. Chạy script import: python import_hsk_all_levels.py")
    print()


if __name__ == "__main__":
    main()

