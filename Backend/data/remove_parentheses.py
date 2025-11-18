import json
import re

with open('214_bo_thu_from_pdf.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for key, value in data.items():
    if 'meaning' in value:
        meaning = value['meaning']
        meaning = re.sub(r'[()]', '', meaning)
        meaning = re.sub(r'\s+', ' ', meaning).strip()
        value['meaning'] = meaning

with open('214_bo_thu_from_pdf.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Removed parentheses from {len(data)} entries")
