import json
import re
import sys

try:
    import pdfplumber
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber"])
    import pdfplumber

def parse_bo_thu_from_pdf():
    pdf_path = '214 Bộ Thủ tiếng Trung.pdf'
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
    
    all_lines = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('---') and not line.startswith('Trung tâm') and not line.startswith('214 BỘ') and not line.startswith('STT') and line != 'Tamnhinviet_vvs' and not re.match(r'^\d+\.\s+Bộ thủ', line):
                        all_lines.append(line)
    
    entries = {}
    i = 0
    
    while i < len(all_lines):
        line = all_lines[i]
        
        number_match = re.match(r'^(\d+)\s+', line)
        if number_match:
            number = int(number_match.group(1))
            if 1 <= number <= 214:
                rest = line[len(number_match.group(0)):].strip()
                
                char_match = re.match(r'^([^\s(]+)', rest)
                if char_match:
                    traditional = char_match.group(1)
                    rest = rest[len(traditional):].strip()
                    
                    variant_str = None
                    variant_match = re.match(r'^\s*\(([^)]+)\)', rest)
                    if variant_match:
                        variant_str = variant_match.group(1).strip()
                        rest = rest[len(variant_match.group(0)):].strip()
                    
                    pinyin_match = re.match(r'^([A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)', rest)
                    if pinyin_match:
                        pinyin = pinyin_match.group(1)
                        rest = rest[len(pinyin):].strip()
                        
                        vietnamese_name = ""
                        meaning = ""
                        
                        prev_line_is_vietnamese = False
                        skip_next_line = False
                        if i > 0:
                            prev_line = all_lines[i-1].strip()
                            if re.match(r'^[A-Z\s,()]+$', prev_line) and '(' in prev_line and ')' not in prev_line:
                                vietnamese_name = prev_line
                                prev_line_is_vietnamese = True
                                
                                if i + 1 < len(all_lines):
                                    next_line = all_lines[i + 1].strip()
                                    if re.match(r'^[A-Z\s,()]+\)$', next_line):
                                        vietnamese_name += " " + next_line
                                        skip_next_line = True
                        
                        if prev_line_is_vietnamese:
                            if rest:
                                meaning = rest.strip()
                        else:
                            parts = rest.split(None, 1)
                            if len(parts) >= 2:
                                first_part = parts[0].strip()
                                if re.match(r'^[A-Z\s,()]+$', first_part):
                                    vietnamese_name = first_part
                                    meaning = parts[1].strip()
                                else:
                                    meaning = rest.strip()
                            elif len(parts) == 1:
                                first_part = parts[0].strip()
                                if re.match(r'^[A-Z\s,()]+$', first_part):
                                    vietnamese_name = first_part
                        
                        if not meaning and rest:
                            meaning = rest.strip()
                        
                        if not meaning and i + 1 < len(all_lines):
                            next_line = all_lines[i + 1].strip()
                            if not re.match(r'^[A-Z\s,()]+\)$', next_line) and not re.match(r'^\d+\s+', next_line):
                                meaning = next_line
                                if not skip_next_line:
                                    i += 1
                        
                        if skip_next_line:
                            i += 1
                        
                        if meaning or vietnamese_name:
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
                            
                            if meaning_clean:
                                if not vietnamese_clean:
                                    vietnamese_clean = ""
                                if not main_name:
                                    main_name = vietnamese_clean
                                
                                main_name_normalized = normalize_vietnamese(main_name) if main_name else ""
                                meaning_normalized = normalize_vietnamese(meaning_clean)
                                
                                entries[number] = {
                                    "traditional": traditional,
                                    "variant_str": variant_str,
                                    "pinyin": pinyin.lower(),
                                    "main_name": main_name_normalized,
                                    "variant_name": variant_name,
                                    "meaning": meaning_normalized,
                                    "strokes": strokes
                                }
        
        i += 1
    
    for number, entry in entries.items():
        traditional = entry["traditional"]
        result[traditional] = {
            "pinyin": entry["pinyin"],
            "meaning": f"{entry['main_name']} ({entry['meaning']})",
            "strokes": entry["strokes"],
            "traditional": traditional
        }
        
        if entry["variant_str"]:
            variants = re.findall(r'[^\s,–\-]+', entry["variant_str"])
            for variant in variants:
                variant_clean = variant.strip()
                if variant_clean and variant_clean != traditional:
                    if entry["variant_name"]:
                        variant_meaning = normalize_vietnamese(entry["variant_name"])
                    else:
                        variant_meaning = entry["main_name"]
                    
                    result[variant_clean] = {
                        "pinyin": entry["pinyin"],
                        "meaning": f"{variant_meaning} ({entry['meaning']})",
                        "strokes": entry["strokes"],
                        "traditional": traditional
                    }
    
    return result

if __name__ == '__main__':
    result = parse_bo_thu_from_pdf()
    
    output_file = '214_bo_thu_from_pdf.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(result)} radicals from PDF to {output_file}")