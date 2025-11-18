import { WordWithProgressDto } from "../../types";

/**
 * Cache service để lưu từ vựng đã load
 * Giúp tránh gọi API nhiều lần cho cùng một từ
 */
class WordCache {
  private cache: Map<string, WordWithProgressDto> = new Map();
  private maxSize = 1000; // Giới hạn cache size

  /**
   * Lấy từ vựng từ cache
   */
  get(character: string): WordWithProgressDto | null {
    const cleanChar = this.cleanCharacter(character);
    return this.cache.get(cleanChar) || null;
  }

  /**
   * Lưu từ vựng vào cache
   */
  set(character: string, word: WordWithProgressDto): void {
    const cleanChar = this.cleanCharacter(character);
    
    // Nếu cache đã đầy, xóa một số entries cũ
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(cleanChar, word);
  }

  /**
   * Lưu nhiều từ vựng cùng lúc
   */
  setBatch(words: Record<string, WordWithProgressDto>): void {
    Object.entries(words).forEach(([character, word]) => {
      this.set(character, word);
    });
  }

  /**
   * Kiểm tra từ có trong cache không
   */
  has(character: string): boolean {
    const cleanChar = this.cleanCharacter(character);
    return this.cache.has(cleanChar);
  }

  /**
   * Lấy tất cả từ chưa có trong cache
   */
  getMissingCharacters(characters: string[]): string[] {
    return characters.filter(char => !this.has(char));
  }

  /**
   * Xóa cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Làm sạch character (loại bỏ khoảng trắng và dấu câu)
   */
  private cleanCharacter(character: string): string {
    return character.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
  }
}

// Singleton instance
export const wordCache = new WordCache();

/**
 * Extract các từ vựng từ WordExamples
 * Trả về danh sách các từ vựng duy nhất xuất hiện trong các ví dụ
 * 
 * Sử dụng segmenter để tách từ thông minh hơn thay vì extract từng ký tự
 */
export function extractWordsFromExamples(
  examples: Array<{ character: string; pinyin?: string; meaning?: string }>,
  allWords?: any[]
): string[] {
  const words = new Set<string>();
  
  // Import dynamic để tránh circular dependency
  const segmentChineseText = require('./chineseSegmenter').segmentChineseText;
  
  examples.forEach(example => {
    if (example.character) {
      try {
        // Sử dụng segmenter để tách từ (fallback, không dùng Jieba)
        const segments = segmentChineseText(example.character, allWords || [], false);
        
        segments.forEach(segment => {
          const cleanWord = segment.word.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
          
          // Chỉ thêm từ Hán (1-4 ký tự) - bỏ qua dấu câu, số, chữ cái Latin
          if (/^[\u4e00-\u9fa5]{1,4}$/.test(cleanWord)) {
            words.add(cleanWord);
          }
        });
      } catch (error) {
        // Fallback nếu segmenter fail: extract từng ký tự và cụm từ 2-3 ký tự
        console.warn('[extractWordsFromExamples] Segmenter error, sử dụng fallback:', error);
        
        const chineseRegex = /[\u4e00-\u9fa5]+/g;
        const matches = example.character.match(chineseRegex);
        
        if (matches) {
          matches.forEach(match => {
            // Thêm từng ký tự riêng lẻ
            for (let i = 0; i < match.length; i++) {
              const char = match[i];
              if (char && char.trim()) {
                words.add(char.trim());
              }
            }
            
            // Thêm các cụm từ 2-3 ký tự (nếu có)
            for (let len = 2; len <= Math.min(3, match.length); len++) {
              for (let i = 0; i <= match.length - len; i++) {
                const word = match.substring(i, i + len);
                if (word && word.trim()) {
                  words.add(word.trim());
                }
              }
            }
          });
        }
      }
    }
  });

  return Array.from(words);
}

