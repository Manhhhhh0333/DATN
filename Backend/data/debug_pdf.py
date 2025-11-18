import pdfplumber
import re

pdf_path = '214 Bộ Thủ tiếng Trung.pdf'

with pdfplumber.open(pdf_path) as pdf:
    all_text = ""
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            all_text += f"\n--- Page {i+1} ---\n" + text

with open('pdf_text_output.txt', 'w', encoding='utf-8') as f:
    f.write(all_text)

print(f"Extracted text from {len(pdf.pages)} pages")
print("Text saved to pdf_text_output.txt")
