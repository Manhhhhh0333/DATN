import { WordWithProgressDto } from "@/types";
import apiClient from "@/lib/api";

export interface SegmentResult {
  word: string;
  startIndex: number;
  endIndex: number;
  isKnownWord: boolean;
  wordData?: WordWithProgressDto;
}

export class ChineseSegmenter {
  private knownWords: Map<string, WordWithProgressDto> = new Map();
  private wordLengths: number[] = [];
  private maxWordLength: number = 0;

  constructor(allWords?: WordWithProgressDto[]) {
    if (allWords) {
      this.updateKnownWords(allWords);
    }
  }

  updateKnownWords(allWords: WordWithProgressDto[]): void {
    this.knownWords.clear();
    this.wordLengths = [];
    this.maxWordLength = 0;

    allWords.forEach((word) => {
      const cleanChar = word.character.trim().replace(/\s+/g, "");
      if (cleanChar) {
        this.knownWords.set(cleanChar, word);
        const len = cleanChar.length;
        if (!this.wordLengths.includes(len)) {
          this.wordLengths.push(len);
        }
        if (len > this.maxWordLength) {
          this.maxWordLength = len;
        }
      }
    });

    this.wordLengths.sort((a, b) => b - a);
  }

  segment(text: string): SegmentResult[] {
    if (!text) return [];

    const results: SegmentResult[] = [];
    const textLength = text.length;
    let i = 0;

    while (i < textLength) {
      const char = text[i];
      
      if (!/[\u4e00-\u9fa5]/.test(char)) {
        let nonChineseEnd = i;
        while (nonChineseEnd < textLength && !/[\u4e00-\u9fa5]/.test(text[nonChineseEnd])) {
          nonChineseEnd++;
        }
        if (nonChineseEnd > i) {
          results.push({
            word: text.substring(i, nonChineseEnd),
            startIndex: i,
            endIndex: nonChineseEnd,
            isKnownWord: false,
          });
          i = nonChineseEnd;
          continue;
        }
      }

      let matched = false;
      let bestMatch: { word: string; length: number; wordData?: WordWithProgressDto } | null = null;

      const maxLength = Math.min(this.maxWordLength, textLength - i);
      
      for (const length of this.wordLengths) {
        if (length > maxLength) continue;
        if (i + length > textLength) continue;

        const candidate = text.substring(i, i + length);
        const cleanCandidate = candidate.replace(/\s+/g, "");

        if (this.knownWords.has(cleanCandidate)) {
          if (!bestMatch || bestMatch.length < length) {
            bestMatch = {
              word: candidate,
              length: length,
              wordData: this.knownWords.get(cleanCandidate),
            };
            matched = true;
          }
        }
      }

      if (matched && bestMatch) {
        results.push({
          word: bestMatch.word,
          startIndex: i,
          endIndex: i + bestMatch.length,
          isKnownWord: true,
          wordData: bestMatch.wordData,
        });
        i += bestMatch.length;
      } else {
        results.push({
          word: char,
          startIndex: i,
          endIndex: i + 1,
          isKnownWord: false,
        });
        i++;
      }
    }

    return results;
  }

  segmentWithSpaces(text: string): SegmentResult[] {
    if (!text) return [];

    const spaceRegex = /(\s+)/g;
    const parts: Array<{ text: string; isSpace: boolean }> = [];
    let lastIndex = 0;
    let match;

    while ((match = spaceRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          isSpace: false,
        });
      }
      parts.push({
        text: match[0],
        isSpace: true,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isSpace: false,
      });
    }

    const results: SegmentResult[] = [];
    let currentIndex = 0;

    for (const part of parts) {
      if (part.isSpace) {
        results.push({
          word: part.text,
          startIndex: currentIndex,
          endIndex: currentIndex + part.text.length,
          isKnownWord: false,
        });
        currentIndex += part.text.length;
      } else {
        const segments = this.segment(part.text);
        segments.forEach((segment) => {
          results.push({
            ...segment,
            startIndex: currentIndex + segment.startIndex,
            endIndex: currentIndex + segment.endIndex,
          });
        });
        currentIndex += part.text.length;
      }
    }

    return results;
  }
}

export async function segmentChineseTextWithJieba(
  text: string
): Promise<string[]> {
  try {
    const response = await apiClient.post("/api/segment", { text });
    return response.data.segments || [];
  } catch (error) {
    console.error("Jieba segmentation failed, using fallback:", error);
    return [];
  }
}

export function segmentChineseText(
  text: string,
  allWords?: WordWithProgressDto[],
  useSpaces: boolean = true
): SegmentResult[] {
  const segmenter = new ChineseSegmenter(allWords);
  return useSpaces ? segmenter.segmentWithSpaces(text) : segmenter.segment(text);
}

export async function segmentChineseTextAdvanced(
  text: string,
  allWords?: WordWithProgressDto[],
  useSpaces: boolean = true,
  useJieba: boolean = true
): Promise<SegmentResult[]> {
  if (useJieba) {
    try {
      const jiebaSegments = await segmentChineseTextWithJieba(text);
      if (jiebaSegments.length > 0) {
        return convertJiebaSegmentsToResults(jiebaSegments, text, allWords);
      }
    } catch (error) {
      console.warn("Jieba failed, falling back to custom segmenter:", error);
    }
  }

  return segmentChineseText(text, allWords, useSpaces);
}

function convertJiebaSegmentsToResults(
  jiebaSegments: string[],
  originalText: string,
  allWords?: WordWithProgressDto[]
): SegmentResult[] {
  const results: SegmentResult[] = [];
  const knownWordsMap = new Map<string, WordWithProgressDto>();
  
  if (allWords) {
    allWords.forEach((word) => {
      const cleanChar = word.character.trim().replace(/\s+/g, "");
      if (cleanChar) {
        knownWordsMap.set(cleanChar, word);
      }
    });
  }

  let currentIndex = 0;
  const originalTextClean = originalText.replace(/\s+/g, "");

  for (const segment of jiebaSegments) {
    const cleanSegment = segment.replace(/\s+/g, "");
    const segmentIndex = originalTextClean.indexOf(cleanSegment, currentIndex);
    
    if (segmentIndex >= 0) {
      const wordData = knownWordsMap.get(cleanSegment);
      results.push({
        word: segment,
        startIndex: segmentIndex,
        endIndex: segmentIndex + cleanSegment.length,
        isKnownWord: !!wordData,
        wordData,
      });
      currentIndex = segmentIndex + cleanSegment.length;
    } else {
      const startIndex = currentIndex;
      results.push({
        word: segment,
        startIndex,
        endIndex: startIndex + cleanSegment.length,
        isKnownWord: false,
      });
      currentIndex = startIndex + cleanSegment.length;
    }
  }

  return results;
}

