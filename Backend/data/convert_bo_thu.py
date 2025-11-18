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
    
    for page_data in data:
        content = page_data['content']
        
        content = re.sub(r'\d+\.\s+Bộ thủ \d+ nét.*?\)', '', content)
        
        pattern = r'(\d+)\s+([^\s(]+)\s*(?:\(([^)]+)\))?\s+([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)\s+([A-Z\s,()]+?)\s+([^0-9]+?)(?=\s+\d+\s+|$)'
        
        matches = re.finditer(pattern, content)
        
        for match in matches:
            number = int(match.group(1))
            traditional = match.group(2).strip()
            variant_str = match.group(3) if match.group(3) else None
            pinyin = match.group(4).strip()
            vietnamese_name = match.group(5).strip()
            meaning = match.group(6).strip()
            
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
    
    return result

if __name__ == '__main__':
    result = parse_bo_thu()
    
    with open('214_bo_thu_converted.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(result)} radicals")