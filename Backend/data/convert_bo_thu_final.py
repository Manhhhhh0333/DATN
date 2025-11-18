import json
import re

def parse_bo_thu():
    with open('214 _bo_thu.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    result = {}
    
    stroke_ranges = {
        1: (1, 6),
        2: (7, 29),
        3: (30, 60),
        4: (61, 94),
        5: (95, 117),
        6: (118, 146),
        7: (147, 166),
        8: (167, 175),
        9: (176, 186),
        10: (187, 194),
        11: (195, 200),
        12: (201, 204),
        13: (205, 206),
        14: (209, 210),
        15: (211, 211),
        16: (212, 213),
        17: (214, 214)
    }
    
    def get_strokes(number):
        for strokes, (start, end) in stroke_ranges.items():
            if start <= number <= end:
                return strokes
        return 1
    
    def normalize_vietnamese(text):
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text.strip())
        words = text.split()
        if len(words) > 0:
            words[0] = words[0].capitalize()
            for i in range(1, len(words)):
                words[i] = words[i].lower()
        return ' '.join(words)
    
    all_content = ""
    for page_data in data:
        content = page_data['content']
        content = re.sub(r'\d+\.\s+Bộ thủ \d+ nét.*?\)', '', content)
        all_content += " " + content
    
    entries = re.split(r'\s+(\d+)\s+', all_content)
    
    i = 1
    while i < len(entries):
        if i + 1 >= len(entries):
            break
        
        try:
            number = int(entries[i])
        except:
            i += 2
            continue
        
        if number < 1 or number > 214:
            i += 2
            continue
        
        entry_text = entries[i + 1] if i + 1 < len(entries) else ""
        entry_text = entry_text.strip()
        
        char_match = re.match(r'^([^\s(]+)', entry_text)
        if not char_match:
            i += 2
            continue
        
        traditional = char_match.group(1)
        rest = entry_text[len(traditional):].strip()
        
        variant_str = None
        variant_match = re.match(r'^\s*\(([^)]+)\)', rest)
        if variant_match:
            variant_str = variant_match.group(1).strip()
            variant_str = re.sub(r'\s+', ' ', variant_str)
            rest = rest[len(variant_match.group(0)):].strip()
        
        pinyin_match = re.match(r'^([A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)', rest)
        if not pinyin_match:
            i += 2
            continue
        
        pinyin = pinyin_match.group(1)
        rest = rest[len(pinyin):].strip()
        
        vietnamese_match = re.match(r'^([A-Z\s,()]+?)(?:\s{2,}|\s+)(.+)', rest)
        if not vietnamese_match:
            vietnamese_match = re.match(r'^([A-Z\s,()]+)\s+(.+)', rest)
        
        if not vietnamese_match:
            i += 2
            continue
        
        vietnamese_name = vietnamese_match.group(1).strip()
        meaning = vietnamese_match.group(2).strip()
        
        strokes = get_strokes(number)
        
        meaning_clean = meaning.split('    ')[0].strip()
        meaning_clean = re.sub(r'\s+', ' ', meaning_clean)
        
        vietnamese_clean = vietnamese_name.replace('   ', ' ').strip()
        vietnamese_clean = re.sub(r'\s+', ' ', vietnamese_clean)
        
        main_name = vietnamese_clean
        variant_name = None
        
        if '(' in vietnamese_clean and ')' in vietnamese_clean:
            main_name = re.sub(r'\s*\([^)]+\)\s*', '', vietnamese_clean).strip()
            variant_match = re.search(r'\(([^)]+)\)', vietnamese_clean)
            if variant_match:
                variant_name = variant_match.group(1).strip()
                variant_name = re.sub(r'\s+', ' ', variant_name)
        
        if main_name and meaning_clean:
            main_name_normalized = normalize_vietnamese(main_name)
            meaning_normalized = normalize_vietnamese(meaning_clean)
            
            result[traditional] = {
                "pinyin": pinyin.lower(),
                "meaning": f"{main_name_normalized} ({meaning_normalized})",
                "strokes": strokes,
                "traditional": traditional
            }
            
            if variant_str:
                variants = re.findall(r'[^\s,–\-]+', variant_str)
                for variant in variants:
                    variant_clean = variant.strip()
                    if variant_clean and variant_clean != traditional:
                        if variant_name:
                            variant_meaning = normalize_vietnamese(variant_name)
                        else:
                            variant_meaning = main_name_normalized
                        
                        result[variant_clean] = {
                            "pinyin": pinyin.lower(),
                            "meaning": f"{variant_meaning} ({meaning_normalized})",
                            "strokes": strokes,
                            "traditional": traditional
                        }
        
        i += 2
    
    return result

if __name__ == '__main__':
    result = parse_bo_thu()
    
    with open('214_bo_thu_converted.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(result)} radicals")