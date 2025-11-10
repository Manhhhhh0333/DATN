import json

# Đọc file JSON
with open('seed-data-hsk1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Đặt tất cả exampleSentence thành rỗng
for word in data.get('words', []):
    word['exampleSentence'] = ''

# Ghi lại file
with open('seed-data-hsk1.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Đã xóa exampleSentence cho {len(data.get('words', []))} từ vựng")

