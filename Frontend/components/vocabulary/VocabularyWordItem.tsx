"use client";

import { useState, useEffect } from "react";
import { WordWithProgressDto, WordExampleDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";
import { aiService } from "@/lib/services/aiService";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { wordCache, extractWordsFromExamples } from "@/lib/utils/wordCache";
import VocabularyPopupCard from "./VocabularyPopupCard";

interface VocabularyWordItemProps {
  word: WordWithProgressDto;
  onDetailClick?: (word: WordWithProgressDto) => void;
  viewMode?: "list" | "grid";
  allWords?: WordWithProgressDto[]; // Danh sách tất cả từ để tìm thông tin từ được click
}

export default function VocabularyWordItem({ word, onDetailClick, viewMode = "list", allWords }: VocabularyWordItemProps) {
  const [isExamplesExpanded, setIsExamplesExpanded] = useState(true);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExamples, setGeneratedExamples] = useState<WordExampleDto[] | null>(null);
  const [popupWord, setPopupWord] = useState<WordWithProgressDto | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const playAudio = async (text?: string) => {
    try {
      setIsPlaying(true);
      const audioText = text || word.character;
      const audioUrl = word.audioUrl || getProxyAudioUrl(audioText);
      const audio = new Audio(audioUrl);
      await audio.play();
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
    } catch (error) {
      console.error("Lỗi phát audio:", error);
      setIsPlaying(false);
    }
  };

  const getStatusText = () => {
    if (!word.progress) return "Chưa học";
    switch (word.progress.status) {
      case "Mastered":
        return "Đã thuộc";
      case "Learning":
        return "Đang học";
      default:
        return "Chưa học";
    }
  };

  // Generate examples từ AI
  const handleGenerateExamples = async () => {
    try {
      setIsGenerating(true);
      const examples = await aiService.generateExamples(word.character);
      setGeneratedExamples(examples);
    } catch (error: any) {
      console.error("Lỗi khi generate examples:", error);
      alert(error.response?.data?.message || "Không thể tạo ví dụ. Vui lòng thử lại sau.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Lấy examples từ word.examples, generatedExamples, hoặc parse từ exampleSentence
  const getExamples = () => {
    // Ưu tiên 1: Generated examples từ AI
    if (generatedExamples && generatedExamples.length > 0) {
      return generatedExamples.map(ex => ({
        character: ex.character,
        pinyin: ex.pinyin,
        meaning: ex.meaning,
        audioUrl: ex.audioUrl || null,
      }));
    }

    // Ưu tiên 2: Sử dụng word.examples nếu có
    if (word.examples && word.examples.length > 0) {
      return word.examples.map(ex => ({
        character: ex.character,
        pinyin: ex.pinyin,
        meaning: ex.meaning,
        audioUrl: ex.audioUrl || null,
      }));
    }

    // Fallback: parse từ exampleSentence
    if (!word.exampleSentence) return [];
    
    const examples = word.exampleSentence.split(/[;\n]/).map(e => e.trim()).filter(e => e);
    
    return examples.map(example => {
      // Format: "chữ Hán (pinyin) - nghĩa"
      const format1Regex = /^([\u4e00-\u9fa5\s]+)\s*\(([^)]+)\)\s*-\s*(.+)$/;
      const match1 = example.match(format1Regex);
      if (match1) {
        return {
          character: match1[1].trim(),
          pinyin: match1[2].trim(),
          meaning: match1[3].trim(),
          audioUrl: null,
        };
      }
      
      // Fallback
      return {
        character: example,
        pinyin: word.pinyin,
        meaning: word.meaning,
        audioUrl: null,
      };
    });
  };

  const examples = getExamples();
  const hasExamples = examples.length > 0;

  // Pre-load các từ vựng từ WordExamples vào cache khi component mount
  useEffect(() => {
    if (examples.length > 0) {
      // Extract các từ vựng từ examples
      const wordsToLoad = extractWordsFromExamples(examples);
      
      // Lọc ra các từ chưa có trong cache và chưa có trong allWords
      const missingWords = wordsToLoad.filter(char => {
        const cleanChar = char.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
        return !wordCache.has(cleanChar) && 
               !allWords?.some(w => w.character === cleanChar);
      });

      // Nếu có từ chưa load, gọi batch API
      if (missingWords.length > 0 && missingWords.length <= 50) {
        vocabularyService.getOrCreateWordsBatch(missingWords)
          .then(words => {
            // Lưu vào cache
            wordCache.setBatch(words);
            console.log(`[VocabularyWordItem] Đã pre-load ${Object.keys(words).length} từ vựng vào cache`);
          })
          .catch(error => {
            console.error("[VocabularyWordItem] Lỗi khi pre-load từ vựng:", error);
          });
      }
    }
  }, [examples, allWords]);

  // Format câu tiếng Trung: thêm khoảng trắng giữa các từ Hán để dễ chọn và nhận diện
  const formatChineseSentence = (sentence: string): string => {
    if (!sentence) return sentence;
    
    // Tách câu thành các phần: chữ Hán, dấu câu, khoảng trắng, v.v.
    const result: string[] = [];
    let i = 0;
    
    while (i < sentence.length) {
      const char = sentence[i];
      
      // Nếu là chữ Hán
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // Tìm tất cả các chữ Hán liền kề
        let chinesePart = "";
        while (i < sentence.length && /[\u4e00-\u9fa5]/.test(sentence[i])) {
          chinesePart += sentence[i];
          i++;
        }
        
        // Thêm từng ký tự Hán với khoảng trắng giữa chúng
        for (let j = 0; j < chinesePart.length; j++) {
          result.push(chinesePart[j]);
          // Thêm khoảng trắng sau mỗi ký tự (trừ ký tự cuối cùng)
          if (j < chinesePart.length - 1) {
            result.push(" ");
          }
        }
      } else {
        // Không phải chữ Hán: thêm trực tiếp (dấu câu, khoảng trắng, v.v.)
        result.push(char);
        i++;
      }
    }
    
    return result.join("");
  };

  // Format pinyin: thêm khoảng trắng giữa các từ pinyin để dễ chọn và nhận diện
  const formatPinyin = (pinyin: string): string => {
    if (!pinyin) return pinyin;
    
    // Pinyin thường đã có khoảng trắng, nhưng cần đảm bảo format đúng
    // Tách pinyin thành các phần (thường cách nhau bởi khoảng trắng)
    const parts = pinyin.trim().split(/\s+/).filter(p => p.length > 0);
    
    // Nối lại với khoảng trắng
    return parts.join(" ");
  };

  // Parse pinyin của từ cụ thể từ pinyin của câu
  const parseWordPinyinFromSentence = (sentence: string, sentencePinyin: string, targetWord: string): string | null => {
    // Tách câu thành các từ Hán (giữ nguyên thứ tự và vị trí)
    const chineseWords: Array<{ word: string; startIndex: number; endIndex: number }> = [];
    const chineseRegex = /[\u4e00-\u9fa5]+/g;
    let match;
    
    while ((match = chineseRegex.exec(sentence)) !== null) {
      chineseWords.push({
        word: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
    
    // Tách pinyin thành các phần (thường cách nhau bởi khoảng trắng)
    const pinyinParts = sentencePinyin.trim().split(/\s+/).filter(p => p.length > 0);
    
    // Tìm từ targetWord trong danh sách
    const targetWordIndex = chineseWords.findIndex(w => w.word === targetWord || w.word.includes(targetWord));
    
    if (targetWordIndex >= 0 && targetWordIndex < pinyinParts.length) {
      // Lấy pinyin tương ứng với từ (giả định 1-1 mapping)
      return pinyinParts[targetWordIndex];
    }
    
    // Nếu không tìm thấy với mapping 1-1, thử tìm bằng cách đếm ký tự
    // (một số từ có thể có nhiều pinyin parts, một số ký tự có thể share pinyin)
    // Cách đơn giản: tìm từ đầu tiên khớp và lấy pinyin tương ứng
    for (let i = 0; i < chineseWords.length; i++) {
      if (chineseWords[i].word === targetWord || chineseWords[i].word.includes(targetWord)) {
        // Lấy pinyin tương ứng (giả định mỗi từ Hán có 1 pinyin part)
        if (i < pinyinParts.length) {
          return pinyinParts[i];
        }
      }
    }
    
    return null;
  };

  // Tìm thông tin từ vựng từ allWords list (nếu có)
  const findWordInAllWords = (character: string): WordWithProgressDto | null => {
    if (!allWords || allWords.length === 0) return null;
    
    // Tìm chính xác từ khớp
    const exactMatch = allWords.find(w => w.character === character);
    if (exactMatch) return exactMatch;
    
    // Tìm từ chứa character hoặc character chứa từ
    const partialMatch = allWords.find(w => 
      w.character.includes(character) || character.includes(w.character)
    );
    if (partialMatch) return partialMatch;
    
    return null;
  };

  // Tìm thông tin từ vựng từ examples (bao gồm cả AI generated)
  const findWordInExamples = (character: string, exampleContext?: { character: string; pinyin: string; meaning: string }): { character: string; pinyin: string; meaning: string; audioUrl: string | null } | null => {
    // Ưu tiên 1: Tìm trong allWords list (nếu có)
    const wordInList = findWordInAllWords(character);
    if (wordInList) {
      return {
        character: wordInList.character,
        pinyin: wordInList.pinyin,
        meaning: wordInList.meaning,
        audioUrl: wordInList.audioUrl || null,
      };
    }

    // Ưu tiên 2: Nếu có exampleContext và character là một phần của câu
    if (exampleContext && exampleContext.character.includes(character) && exampleContext.character !== character) {
      // Parse pinyin của từ từ pinyin của câu
      const wordPinyin = parseWordPinyinFromSentence(exampleContext.character, exampleContext.pinyin, character);
      
      if (wordPinyin) {
        return {
          character: character,
          pinyin: wordPinyin,
          meaning: exampleContext.meaning, // Fallback - nghĩa của cả câu
          audioUrl: null,
        };
      }
    }

    // Ưu tiên 3: Tìm trong generated examples
    if (generatedExamples && generatedExamples.length > 0) {
      for (const ex of generatedExamples) {
        // Nếu từ được click là từ chính trong ví dụ (không phải câu)
        if (ex.character === character) {
          return {
            character: ex.character,
            pinyin: ex.pinyin,
            meaning: ex.meaning,
            audioUrl: ex.audioUrl || null,
          };
        }
        // Nếu từ được click là một phần của câu ví dụ
        if (ex.character.includes(character) && ex.character !== character) {
          const wordPinyin = parseWordPinyinFromSentence(ex.character, ex.pinyin, character);
          if (wordPinyin) {
            return {
              character: character,
              pinyin: wordPinyin,
              meaning: ex.meaning, // Fallback
              audioUrl: ex.audioUrl || null,
            };
          }
        }
      }
    }

    // Ưu tiên 4: Tìm trong word.examples
    if (word.examples && word.examples.length > 0) {
      for (const ex of word.examples) {
        if (ex.character === character) {
          return {
            character: ex.character,
            pinyin: ex.pinyin,
            meaning: ex.meaning,
            audioUrl: ex.audioUrl || null,
          };
        }
        if (ex.character.includes(character) && ex.character !== character) {
          const wordPinyin = parseWordPinyinFromSentence(ex.character, ex.pinyin, character);
          if (wordPinyin) {
            return {
              character: character,
              pinyin: wordPinyin,
              meaning: ex.meaning, // Fallback
              audioUrl: ex.audioUrl || null,
            };
          }
        }
      }
    }

    // Nếu không tìm thấy, trả về null để dùng fallback
    return null;
  };

  // Handle click on word in example
  const handleWordClick = async (clickedWord: string, event: React.MouseEvent<HTMLSpanElement>, exampleContext?: { character: string; pinyin: string; meaning: string }) => {
    // Lưu vị trí click ngay lập tức (trước khi async call)
    const target = event.currentTarget;
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const clickPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top,
    };

    // Loại bỏ khoảng trắng và dấu câu để lấy từ gốc (nếu có)
    const cleanWord = clickedWord.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
    
    // Tìm thông tin từ trong examples (với context để parse pinyin đúng)
    // Sử dụng cleanWord để tìm, nhưng hiển thị clickedWord
    const wordInfo = findWordInExamples(cleanWord, exampleContext);
    
    // Sử dụng thông tin đã parse từ example context hoặc từ wordInfo
    // Ưu tiên: wordInfo (từ allWords hoặc đã parse) > parse từ exampleContext > word (từ vựng chính)
    let finalPinyin = wordInfo?.pinyin;
    let finalMeaning = wordInfo?.meaning;
    let finalAudioUrl: string | undefined = wordInfo?.audioUrl || undefined;
    let finalId = 0;
    let finalHSKLevel = word.hskLevel;
    let finalStrokeCount = word.strokeCount;
    let finalProgress = word.progress;
    let finalExamples: WordExampleDto[] = [];
    
    // Ưu tiên 1: Tìm trong allWords
    const wordInList = findWordInAllWords(cleanWord);
    if (wordInList) {
      finalId = wordInList.id;
      finalPinyin = wordInList.pinyin;
      finalMeaning = wordInList.meaning;
      finalAudioUrl = wordInList.audioUrl || undefined;
      finalHSKLevel = wordInList.hskLevel;
      finalStrokeCount = wordInList.strokeCount;
      finalProgress = wordInList.progress;
      finalExamples = wordInList.examples || [];
    } 
    // Ưu tiên 2: Tìm trong cache
    else {
      const cachedWord = wordCache.get(cleanWord);
      if (cachedWord) {
        console.log(`[VocabularyWordItem] Tìm thấy từ trong cache: "${cleanWord}"`);
        finalId = cachedWord.id;
        finalPinyin = cachedWord.pinyin;
        finalMeaning = cachedWord.meaning;
        finalAudioUrl = cachedWord.audioUrl || undefined;
        finalHSKLevel = cachedWord.hskLevel;
        finalStrokeCount = cachedWord.strokeCount;
        finalProgress = cachedWord.progress;
        finalExamples = cachedWord.examples || [];
      }
      // Ưu tiên 3: Gọi API (chỉ khi không có trong cache)
      else {
        try {
          console.log(`[VocabularyWordItem] Gọi API để lấy/tạo từ: "${cleanWord}"`);
          const wordFromApi = await vocabularyService.getOrCreateWordByCharacter(cleanWord);
          console.log(`[VocabularyWordItem] API trả về thành công cho từ: "${cleanWord}"`, wordFromApi);
          
          // Lưu vào cache để dùng lần sau
          wordCache.set(cleanWord, wordFromApi);
          
          finalId = wordFromApi.id;
          finalPinyin = wordFromApi.pinyin;
          finalMeaning = wordFromApi.meaning;
          finalAudioUrl = wordFromApi.audioUrl || undefined;
          finalHSKLevel = wordFromApi.hskLevel;
          finalStrokeCount = wordFromApi.strokeCount;
          finalProgress = wordFromApi.progress;
          finalExamples = wordFromApi.examples || [];
        } catch (error: any) {
          console.error("Lỗi khi gọi API để lấy/tạo từ:", error);
          console.error("Error details:", error.response?.data);
          console.error("Error message:", error.message);
          // Nếu API lỗi, sử dụng fallback
          if (!finalPinyin && exampleContext) {
            const parsedPinyin = parseWordPinyinFromSentence(exampleContext.character, exampleContext.pinyin, cleanWord);
            finalPinyin = parsedPinyin ?? undefined;
          }
          if (!finalPinyin) {
            finalPinyin = word.pinyin;
          }
          if (!finalMeaning) {
            finalMeaning = word.meaning;
          }
        }
      }
    }

    // Tạo WordWithProgressDto cho từ được click (không phải cả câu)
    const clickedWordData: WordWithProgressDto = {
      id: finalId,
      character: cleanWord, // Sử dụng cleanWord (không có khoảng trắng) để hiển thị trong popup
      pinyin: finalPinyin, // Pinyin của từ được click
      meaning: finalMeaning, // Meaning của từ được click
      audioUrl: finalAudioUrl,
      hskLevel: finalHSKLevel,
      strokeCount: finalStrokeCount,
      progress: finalProgress,
      examples: finalExamples,
    };

    // Sử dụng vị trí đã lưu (không gọi getBoundingClientRect sau async)
    setPopupPosition(clickPosition);
    setPopupWord(clickedWordData);
  };

  // Highlight keyword trong text (chữ Hán) với click handler
  const highlightKeyword = (text: string, keyword: string, exampleContext?: { character: string; pinyin: string; meaning: string }) => {
    if (!text || !keyword) return <span>{text}</span>;
    
    // Format câu trước (thêm khoảng trắng giữa các từ Hán)
    const formattedText = formatChineseSentence(text);
    
    // Tách text thành các phần, highlight từ vựng đang học
    const parts: Array<{ text: string; isKeyword: boolean; isChinese: boolean }> = [];
    let lastIndex = 0;
    
    // Tìm tất cả các từ trong text (chữ Hán) - bỏ qua khoảng trắng
    const chineseWordRegex = /[\u4e00-\u9fa5]+/g;
    let match;
    
    while ((match = chineseWordRegex.exec(formattedText)) !== null) {
      // Thêm phần text trước từ (khoảng trắng, dấu câu, v.v.)
      if (match.index > lastIndex) {
        parts.push({ 
          text: formattedText.substring(lastIndex, match.index), 
          isKeyword: false,
          isChinese: false
        });
      }
      
      // Kiểm tra xem từ này có phải là từ vựng đang học không
      const matchedWord = match[0];
      // Kiểm tra chính xác: từ phải chứa keyword hoặc keyword chứa từ
      // Ví dụ: keyword = "问", matchedWord = "问" hoặc "问题" → highlight
      const isKeyword = matchedWord === keyword || 
                       matchedWord.includes(keyword) || 
                       keyword.includes(matchedWord);
      
      parts.push({ 
        text: matchedWord, 
        isKeyword,
        isChinese: true
      });
      lastIndex = match.index + match[0].length;
    }
    
    // Thêm phần text còn lại
    if (lastIndex < formattedText.length) {
      parts.push({ 
        text: formattedText.substring(lastIndex), 
        isKeyword: false,
        isChinese: false
      });
    }
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.isKeyword) {
            // Highlight từ vựng đang học: màu đỏ, có thể click
            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(part.text, e, exampleContext)}
                className="text-red-500 font-semibold cursor-pointer hover:text-red-400 transition-colors"
              >
                {part.text}
              </span>
            );
          }
          if (part.isChinese) {
            // Các từ Hán khác: màu xám nhạt, có thể click
            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(part.text, e, exampleContext)}
                className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
              >
                {part.text}
              </span>
            );
          }
          // Phần không phải chữ Hán (khoảng trắng, dấu câu): màu xám nhạt, không click được
          return <span key={index} className="text-gray-400">{part.text}</span>;
        })}
      </>
    );
  };

  // Highlight keyword trong pinyin với click handler
  const highlightPinyin = (pinyin: string, keywordPinyin: string, exampleContext?: { character: string; pinyin: string; meaning: string }) => {
    if (!pinyin || !keywordPinyin) return <span className="text-gray-400">{pinyin}</span>;
    
    // Format pinyin trước (đảm bảo có khoảng trắng giữa các từ)
    const formattedPinyin = formatPinyin(pinyin);
    
    // Tách pinyin thành các phần (thường cách nhau bởi khoảng trắng)
    const pinyinParts = formattedPinyin.split(/\s+/).filter(p => p.length > 0);
    const keywordPinyinParts = keywordPinyin.split(/\s+/).filter(p => p.length > 0);
    
    // Tìm pinyin của từ vựng đang học (có thể là một phần hoặc nhiều phần)
    const keywordPinyinStr = keywordPinyinParts.join(" ");
    
    return (
      <>
        {pinyinParts.map((part, index) => {
          // Kiểm tra xem phần pinyin này có phải là pinyin của từ vựng đang học không
          const isKeyword = keywordPinyinParts.some(kp => 
            part === kp || part.includes(kp) || kp.includes(part)
          ) || keywordPinyinStr.includes(part) || part.includes(keywordPinyinStr);
          
          if (isKeyword) {
            // Highlight pinyin của từ vựng đang học: màu đỏ
            return (
              <span key={index} className="text-red-500 font-semibold">
                {part}
              </span>
            );
          }
          // Pinyin của từ khác: màu xám nhạt
          return (
            <span key={index} className="text-gray-400">
              {part}
              {index < pinyinParts.length - 1 && " "}
            </span>
          );
        })}
      </>
    );
  };

  // Layout khác nhau tùy viewMode
  if (viewMode === "grid") {
    // Grid layout: Word info trên, Examples dưới
  return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 h-full flex flex-col">
        {/* Word Information Section */}
        <div className="flex-1">
          {/* Header with Favorite Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Chinese Character - Large and Bold */}
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {word.character}
              </div>
              {/* Pinyin and Audio */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => playAudio()}
                  disabled={isPlaying}
                  className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                  title="Nghe phát âm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="text-lg text-green-600 font-semibold">
                  {word.pinyin}
                </span>
              </div>
              {/* Meaning */}
              <div className="text-gray-700 text-base mb-4">
                {word.meaning}
        </div>
            </div>
            {/* Favorite Icon */}
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
      </div>

      {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => playAudio()}
          disabled={isPlaying}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium disabled:opacity-50"
        >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
          Nghe
        </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
          Luyện viết
        </button>
        <button
          onClick={() => {
            setIsDetailExpanded(!isDetailExpanded);
            if (!isDetailExpanded && onDetailClick) {
              onDetailClick(word);
            }
          }}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
        >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          Chi tiết
        </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
          {getStatusText()}
        </button>
          </div>
      </div>

        {/* Examples Section - Below */}
        <div className="bg-slate-900 rounded-lg shadow-inner mt-4">
          {/* Examples Header */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-t-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              VÍ DỤ
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateExamples}
                disabled={isGenerating}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Tạo ví dụ bằng AI"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI
                  </>
                )}
              </button>
              <button
                onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                className="flex items-center text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                {isExamplesExpanded ? "Thu gọn" : "Mở rộng"}
                <svg className={`w-3 h-3 ml-1 transition-transform ${isExamplesExpanded ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Examples List */}
          {isExamplesExpanded ? (
            isGenerating ? (
              <div className="p-3 text-center">
                <div className="flex flex-col items-center justify-center py-4">
                  <svg className="w-6 h-6 animate-spin text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-slate-400 text-xs">Đang tạo ví dụ bằng AI...</p>
                </div>
              </div>
            ) : examples.length > 0 ? (
              <div className="p-3 space-y-3">
                {examples.slice(0, 2).map((example, index) => (
                  <div key={index} className="pb-3 border-b border-slate-700 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {highlightKeyword(example.character, word.character, example)}
                        </div>
                      </div>
                      <button
                        onClick={() => playAudio(example.character)}
                        disabled={isPlaying}
                        className="p-1 text-slate-300 hover:text-white transition-colors disabled:opacity-50 ml-2"
                        title="Nghe phát âm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs mb-1">
                      {highlightPinyin(example.pinyin, word.pinyin, example)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {example.meaning}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center">
                <p className="text-slate-400 text-xs mb-2">Chưa có ví dụ cho từ này.</p>
                <button
                  onClick={handleGenerateExamples}
                  disabled={isGenerating}
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Nhấn để tạo ví dụ bằng AI
                </button>
              </div>
            )
          ) : null}
        </div>

        {/* Popup Card */}
        {popupWord && (
          <VocabularyPopupCard
            word={popupWord}
            position={popupPosition}
            onClose={() => setPopupWord(null)}
            onViewDetail={onDetailClick}
            onEdit={(w) => {
              // TODO: Implement edit functionality
              console.log("Edit word:", w);
            }}
          />
        )}
      </div>
    );
  }

  // List layout: Word info trái, Examples phải
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Word Information */}
        <div className="flex-1">
          {/* Header with Favorite Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Chinese Character - Large and Bold */}
              <div className="text-5xl font-bold text-gray-900 mb-3">
                {word.character}
              </div>
              {/* Pinyin and Audio */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => playAudio()}
                  disabled={isPlaying}
                  className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                  title="Nghe phát âm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="text-xl text-green-600 font-semibold">
                  {word.pinyin}
                </span>
              </div>
              {/* Meaning */}
              <div className="text-gray-700 text-lg mb-4">
                {word.meaning}
              </div>
            </div>
            {/* Favorite Icon */}
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => playAudio()}
              disabled={isPlaying}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Nghe
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Luyện viết
            </button>
            <button
              onClick={() => {
                setIsDetailExpanded(!isDetailExpanded);
                if (!isDetailExpanded && onDetailClick) {
                  onDetailClick(word);
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chi tiết
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              {getStatusText()}
            </button>
          </div>
        </div>

        {/* Right Column: Examples Section */}
        <div className="w-full lg:w-96 bg-slate-900 rounded-lg shadow-inner flex-shrink-0">
          {/* Examples Header */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-t-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              VÍ DỤ
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateExamples}
                disabled={isGenerating}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Tạo ví dụ bằng AI"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI
                  </>
                )}
              </button>
              <button
                onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                className="flex items-center text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                {isExamplesExpanded ? "Thu gọn" : "Mở rộng"}
                <svg className={`w-4 h-4 ml-1 transition-transform ${isExamplesExpanded ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Examples List */}
          {isExamplesExpanded ? (
            isGenerating ? (
              <div className="p-4 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <svg className="w-8 h-8 animate-spin text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-slate-400 text-sm">Đang tạo ví dụ bằng AI...</p>
                </div>
              </div>
            ) : examples.length > 0 ? (
              <div className="p-4 space-y-4">
                {examples.slice(0, 3).map((example, index) => (
                  <div key={index} className="pb-4 border-b border-slate-700 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="text-white text-base font-medium">
                        {highlightKeyword(example.character, word.character, example)}
                      </div>
                      </div>
                      <button
                        onClick={() => playAudio(example.character)}
                        disabled={isPlaying}
                        className="p-1.5 text-slate-300 hover:text-white transition-colors disabled:opacity-50 ml-2"
                        title="Nghe phát âm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-slate-300 mb-1">
                      {highlightPinyin(example.pinyin, word.pinyin, example)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {example.meaning}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-slate-400 text-sm mb-3">Chưa có ví dụ cho từ này.</p>
                <button
                  onClick={handleGenerateExamples}
                  disabled={isGenerating}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Nhấn để tạo ví dụ bằng AI
                </button>
          </div>
            )
          ) : null}
        </div>

        {/* Popup Card */}
        {popupWord && (
          <VocabularyPopupCard
            word={popupWord}
            position={popupPosition}
            onClose={() => setPopupWord(null)}
            onViewDetail={onDetailClick}
            onEdit={(w) => {
              // TODO: Implement edit functionality
              console.log("Edit word:", w);
            }}
          />
          )}
        </div>
    </div>
  );
}