"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WordWithProgressDto, WordExampleDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";
import { aiService } from "@/lib/services/aiService";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { checkAndMarkVocabulary } from "@/lib/services/activityService";
import { wordCache, extractWordsFromExamples } from "@/lib/utils/wordCache";
import { segmentChineseText, segmentChineseTextAdvanced } from "@/lib/utils/chineseSegmenter";
import { toast } from "@/lib/utils/toast";
import VocabularyPopupCard from "./VocabularyPopupCard";

interface VocabularyWordItemProps {
  word: WordWithProgressDto;
  onDetailClick?: (word: WordWithProgressDto) => void;
  viewMode?: "list" | "grid";
  allWords?: WordWithProgressDto[]; // Danh sách tất cả từ để tìm thông tin từ được click
  hskLevel?: number; // Để gọi API check-and-mark-vocabulary
  partNumber?: number; // Để gọi API check-and-mark-vocabulary
  topicId?: number; // Để gọi API check-and-mark-vocabulary cho topics
  onVocabularyCompleted?: () => void; // Callback khi hoàn thành activity vocabulary
}

export default function VocabularyWordItem({ word, onDetailClick, viewMode = "list", allWords, hskLevel, partNumber, topicId, onVocabularyCompleted }: VocabularyWordItemProps) {
  const router = useRouter();
  const [isExamplesExpanded, setIsExamplesExpanded] = useState(false); // Mặc định đóng
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [segmentCache, setSegmentCache] = useState<Map<string, any[]>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [generatedExamples, setGeneratedExamples] = useState<WordExampleDto[] | null>(null);
  const [popupWord, setPopupWord] = useState<WordWithProgressDto | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState<WordWithProgressDto>(word);

  // Sync currentWord với word prop khi word thay đổi (để đồng bộ giữa list và grid view)
  useEffect(() => {
    setCurrentWord(word);
  }, [word]);

  const playAudio = async (text?: string, audioUrlOverride?: string | null) => {
    try {
      setIsPlaying(true);
      const audioText = text || currentWord.character;
      
      // Clean text để loại bỏ BOM và các ký tự không hợp lệ
      const cleanAudioText = audioText ? audioText.replace(/^\uFEFF/, "").trim() : "";
      
      // Nếu text khác với currentWord.character, đây là example sentence - không dùng currentWord.audioUrl
      const isExampleSentence = text && text !== currentWord.character;
      
      // Ưu tiên sử dụng audioUrlOverride (từ example), sau đó currentWord.audioUrl (chỉ khi không phải example sentence)
      let audioUrl = audioUrlOverride || (!isExampleSentence ? currentWord.audioUrl : null);
      
      // Nếu có audioUrl và là Google TTS URL, convert sang proxy URL
      if (audioUrl) {
        // Loại bỏ BOM từ URL string (dưới dạng %EF%BB%BF)
        audioUrl = audioUrl.replace(/%EF%BB%BF/gi, "");
        
        // Nếu là Google TTS URL, convert sang proxy URL
        if (audioUrl.includes("translate.google.com/translate_tts")) {
          try {
            const url = new URL(audioUrl);
            const q = url.searchParams.get("q");
            const lang = url.searchParams.get("tl") || "zh-CN";
            if (q) {
              // Decode và clean text trong URL parameter
              const decodedQ = decodeURIComponent(q);
              const cleanedQ = decodedQ.replace(/^\uFEFF/, "").trim();
              if (cleanedQ) {
                // Convert sang proxy URL
                audioUrl = getProxyAudioUrl(cleanedQ, lang);
              } else {
                // Nếu text sau khi clean rỗng, dùng cleanAudioText
                audioUrl = getProxyAudioUrl(cleanAudioText);
              }
            } else {
              // Nếu không có q parameter, dùng cleanAudioText
              audioUrl = getProxyAudioUrl(cleanAudioText);
            }
          } catch (e) {
            // Nếu không parse được URL, dùng cleanAudioText
            console.warn("Không thể parse Google TTS URL, dùng text trực tiếp:", e);
            audioUrl = getProxyAudioUrl(cleanAudioText);
          }
        }
        // Nếu không phải Google TTS URL, giữ nguyên (có thể là URL khác hợp lệ)
      } else {
        // Nếu không có audioUrl, generate từ text (luôn dùng proxy URL)
        audioUrl = getProxyAudioUrl(cleanAudioText);
      }
      
      // Kiểm tra audioUrl trước khi tạo Audio object
      if (!audioUrl || audioUrl.trim() === '') {
        console.warn("AudioUrl không hợp lệ:", audioUrl);
        setIsPlaying(false);
        return;
      }
      
      const audio = new Audio(audioUrl);
      
      // Thêm error handler trước khi play
      audio.onerror = (e) => {
        console.error("Lỗi khi load audio:", e, "URL:", audioUrl);
        setIsPlaying(false);
      };
      
      audio.onended = () => setIsPlaying(false);
      
      await audio.play();
    } catch (error) {
      console.error("Lỗi phát audio:", error);
      setIsPlaying(false);
    }
  };

  // Cập nhật word khi prop thay đổi
  useEffect(() => {
    setCurrentWord(word);
    // Reset generated examples khi chuyển sang từ khác
    setGeneratedExamples(null);
  }, [word]);

  const getStatusText = () => {
    if (!currentWord.progress) return "Chưa học";
    switch (currentWord.progress.status) {
      case "Mastered":
        return "Đã thuộc";
      case "Learning":
        return "Đang học";
      default:
        return "Chưa học";
    }
  };

  // Đánh dấu từ vựng là đã học
  const handleMarkAsLearned = async () => {
    if (!currentWord.id) {
      console.error("Word ID không tồn tại");
      return;
    }

    try {
      setIsMarking(true);
      const progress = await vocabularyService.markAsLearned(currentWord.id);
      
      // Cập nhật word với progress mới
      const updatedWord = {
        ...currentWord,
        progress: {
          id: progress.id,
          userId: progress.userId,
          wordId: progress.wordId,
          status: progress.status,
          nextReviewDate: progress.nextReviewDate,
          reviewCount: progress.reviewCount,
          correctCount: progress.correctCount,
          wrongCount: progress.wrongCount,
          lastReviewedAt: progress.lastReviewedAt,
        },
      };
      
      setCurrentWord(updatedWord);

      // Thông báo thành công
      console.log("Đã đánh dấu từ vựng là đã học:", currentWord.character);

      // Gọi callback ngay lập tức để update progress chart và sync cả 2 views
      // (Không cần đợi tất cả từ hoàn thành)
      if (onVocabularyCompleted && topicId) {
        // Gọi callback để parent component reload và update cả list và grid view
        onVocabularyCompleted();
      }

      // Kiểm tra và tự động đánh dấu activity "vocabulary" nếu tất cả từ đã học
      // CHỈ cho Topics (topicId), KHÔNG cho Courses (hskLevel + partNumber)
      if (topicId) {
        // Chạy async trong background, không block UI, silent fail nếu 404
        checkAndMarkVocabulary({ topicId })
          .then((result) => {
            if (result.marked) {
              console.log("✅ Activity 'vocabulary' đã được đánh dấu hoàn thành!");
              
              // Hiển thị toast notification
              toast.success("🎉 Chúc mừng! Bạn đã học xong tất cả từ vựng trong chủ đề này!", 5000);
              
              // Gọi callback lại để refresh sau khi mark activity
              if (onVocabularyCompleted) {
                onVocabularyCompleted();
              }
            }
          })
          .catch((error: any) => {
            // Silent fail cho 404 - endpoint có thể chưa được deploy hoặc backend chưa restart
            if (error?.response?.status === 404) {
              return;
            }
            if (error?.response?.status) {
              console.warn("Lỗi khi kiểm tra vocabulary completion:", error.response.status);
            }
          });
      }
    } catch (error: any) {
      console.error("Lỗi khi đánh dấu đã học:", error);
      alert(error.response?.data?.message || "Không thể đánh dấu đã học. Vui lòng thử lại sau.");
    } finally {
      setIsMarking(false);
    }
  };

  // Xem chi tiết từ vựng
  const handleViewDetail = (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!currentWord.character && !currentWord.id) {
      console.error("Character và ID không tồn tại");
      if (onDetailClick) {
        onDetailClick(currentWord);
      }
      return;
    }

    // Điều hướng đến trang word detail
    // Sử dụng ID nếu có, nếu không thì dùng character
    const slug = currentWord.id 
      ? currentWord.id.toString() 
      : encodeURIComponent(currentWord.character || "");
    const url = `/words/${slug}`;
    console.log("Navigating to:", url, "from word:", currentWord);
    
    try {
      router.push(url);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback: sử dụng window.location
      window.location.href = url;
    }
    
    // Vẫn gọi callback nếu có (để giữ tính tương thích)
    // Nhưng không redirect từ callback để tránh conflict
    if (onDetailClick) {
      // Delay callback để đảm bảo navigation xảy ra trước
      setTimeout(() => {
        onDetailClick(currentWord);
      }, 100);
    }
  };

  // Generate examples từ AI
  const handleGenerateExamples = async () => {
    // Kiểm tra character có tồn tại không
    if (!currentWord.character || currentWord.character.trim() === "") {
      alert("Không thể tạo ví dụ: Từ vựng không hợp lệ.");
      return;
    }

    try {
      setIsGenerating(true);
      console.log(`[VocabularyWordItem] Đang tạo ví dụ cho từ: "${currentWord.character}"`);
      
      const examples = await aiService.generateExamples(currentWord.character);
      
      console.log(`[VocabularyWordItem] Nhận được ${examples?.length || 0} ví dụ từ AI`);
      
      // Kiểm tra kết quả
      if (examples && examples.length > 0) {
        setGeneratedExamples(examples);
        // Tự động mở examples section nếu đang đóng
        if (!isExamplesExpanded) {
          setIsExamplesExpanded(true);
        }
        console.log(`[VocabularyWordItem] ✅ Tạo ví dụ thành công cho "${currentWord.character}"`);
      } else {
        console.warn(`[VocabularyWordItem] AI không trả về ví dụ nào cho "${currentWord.character}"`);
        alert("AI không tạo được ví dụ nào. Vui lòng thử lại sau.");
        setGeneratedExamples(null);
      }
    } catch (error: any) {
      console.error(`[VocabularyWordItem] ❌ Lỗi khi generate examples cho "${currentWord.character}":`, error);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Không thể tạo ví dụ. Vui lòng thử lại sau.";
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        console.error(`[VocabularyWordItem] HTTP ${status}:`, data);
        
        if (status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        } else if (status === 500) {
          errorMessage = data?.error || data?.message || "Lỗi server khi tạo ví dụ.";
          // Hiển thị chi tiết lỗi nếu có
          if (data?.innerException) {
            console.error(`[VocabularyWordItem] Inner Exception:`, data.innerException);
          }
        } else {
          errorMessage = data?.message || data?.error || `Lỗi HTTP ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response
        console.error(`[VocabularyWordItem] Không nhận được phản hồi từ server`);
        errorMessage = "Không kết nối được đến server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        // Something else happened
        console.error(`[VocabularyWordItem] Lỗi khác:`, error.message);
        errorMessage = error.message || "Đã xảy ra lỗi không xác định.";
      }
      
      alert(errorMessage);
      setGeneratedExamples(null);
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

    // Ưu tiên 2: Sử dụng currentWord.examples nếu có
    if (currentWord.examples && currentWord.examples.length > 0) {
      return currentWord.examples.map(ex => ({
        character: ex.character,
        pinyin: ex.pinyin,
        meaning: ex.meaning,
        audioUrl: ex.audioUrl || null,
      }));
    }

    // Fallback: parse từ exampleSentence
    if (!currentWord.exampleSentence) return [];
    
    const examples = currentWord.exampleSentence.split(/[;\n]/).map(e => e.trim()).filter(e => e);
    
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
      
      // Fallback: Nếu không parse được format chuẩn
      // Chỉ lấy character, để pinyin và meaning trống (không dùng của từ đang học)
      // Pinyin và meaning sẽ được lấy từ API hoặc allWords khi user click vào từ
      const cleanExample = example.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
      return {
        character: cleanExample || example,
        pinyin: "", // Để trống, sẽ được lấy từ API hoặc parse từ context khi cần
        meaning: "", // Để trống, sẽ được lấy từ API hoặc allWords khi cần
        audioUrl: null,
      };
    });
  };

  const examples = getExamples();
  const hasExamples = examples.length > 0;

  // Track các từ đã pre-load để tránh pre-load nhiều lần
  const preloadedWordsRef = useRef<Set<string>>(new Set());
  
  // Pre-load các từ vựng từ WordExamples vào cache (với debounce và error handling)
  useEffect(() => {
    // Chỉ pre-load nếu có generated examples (từ AI)
    if (!generatedExamples || generatedExamples.length === 0) return;
    
    // Debounce để tránh gọi nhiều lần
    const timeoutId = setTimeout(async () => {
      try {
        // Extract các từ vựng từ examples (sử dụng segmenter)
        const wordsToLoad = extractWordsFromExamples(generatedExamples, allWords);
        
        // Lọc ra các từ chưa có trong cache, chưa có trong allWords, và chưa được pre-load
        const missingWords = wordsToLoad.filter(char => {
          const cleanChar = char.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
          return !wordCache.has(cleanChar) && 
                 !allWords?.some(w => w.character === cleanChar) &&
                 !preloadedWordsRef.current.has(cleanChar);
        });

        // Giới hạn số lượng từ pre-load (max 20 từ)
        if (missingWords.length > 0 && missingWords.length <= 20) {
          console.log(`[VocabularyWordItem] Pre-loading ${missingWords.length} từ mới từ ví dụ`);
          
          // Đánh dấu các từ này đang được pre-load
          missingWords.forEach(char => {
            const cleanChar = char.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
            preloadedWordsRef.current.add(cleanChar);
          });
          
          // Gọi batch API (backend sẽ xử lý theo batch 5 từ/lần)
          try {
            const words = await vocabularyService.getOrCreateWordsBatch(missingWords);
            
            // Lưu vào cache
            wordCache.setBatch(words);
            console.log(`[VocabularyWordItem] ✅ Đã pre-load ${Object.keys(words).length}/${missingWords.length} từ vào cache`);
            
            // Log các từ fail (nếu có)
            const failedWords = missingWords.filter(char => {
              const cleanChar = char.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
              return !words[cleanChar];
            });
            
            if (failedWords.length > 0) {
              console.warn(`[VocabularyWordItem] ⚠️ Không thể load ${failedWords.length} từ:`, failedWords);
            }
          } catch (error) {
            console.error("[VocabularyWordItem] ❌ Lỗi khi pre-load từ vựng:", error);
            
            // Nếu lỗi, xóa khỏi Set để có thể thử lại
            missingWords.forEach(char => {
              const cleanChar = char.trim().replace(/[\s，。、！？：；,\.!?:;]+/g, "");
              preloadedWordsRef.current.delete(cleanChar);
            });
          }
        } else if (missingWords.length > 20) {
          console.warn(`[VocabularyWordItem] Quá nhiều từ cần pre-load (${missingWords.length}), bỏ qua để tránh quá tải`);
        }
      } catch (error) {
        console.error("[VocabularyWordItem] ❌ Lỗi khi extract/pre-load từ vựng:", error);
      }
    }, 1000); // Debounce 1s
    
    return () => clearTimeout(timeoutId);
  }, [generatedExamples, allWords]);

  // Format câu tiếng Trung: giữ nguyên câu gốc, không tách các cụm từ có nghĩa
  const formatChineseSentence = (sentence: string): string => {
    if (!sentence) return sentence;
    return sentence;
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
          meaning: "", // KHÔNG dùng nghĩa của câu ví dụ, để trống để tìm từ API hoặc allWords
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
              meaning: "", // KHÔNG dùng nghĩa của câu ví dụ, để trống để tìm từ API hoặc allWords
              audioUrl: ex.audioUrl || null,
            };
          }
        }
      }
    }

    // Ưu tiên 4: Tìm trong currentWord.examples
    if (currentWord.examples && currentWord.examples.length > 0) {
      for (const ex of currentWord.examples) {
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
              meaning: "", // KHÔNG dùng nghĩa của câu ví dụ, để trống để tìm từ API hoặc allWords
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
    
    // Lưu pinyin từ wordInfo để dùng làm fallback nếu API lỗi
    const parsedPinyinFromExample = wordInfo?.pinyin;
    
    // Sử dụng thông tin đã parse từ example context hoặc từ wordInfo
    // Ưu tiên: wordInfo (từ allWords hoặc đã parse) > parse từ exampleContext
    // LƯU Ý: Chỉ sử dụng wordInfo.meaning nếu nó từ allWords (có id), không dùng nghĩa của câu ví dụ
    let finalPinyin = wordInfo?.pinyin;
    let finalMeaning: string | undefined = undefined;
    let finalAudioUrl: string | undefined = wordInfo?.audioUrl || undefined;
    
    // Chỉ sử dụng wordInfo.meaning nếu từ được tìm thấy trong allWords (có đầy đủ thông tin)
    const wordInListForMeaning = findWordInAllWords(cleanWord);
    if (wordInListForMeaning) {
      finalMeaning = wordInListForMeaning.meaning;
    }
    let finalId = 0;
    let finalHSKLevel = currentWord.hskLevel;
    let finalStrokeCount = currentWord.strokeCount;
    let finalProgress = currentWord.progress;
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
          
          finalId = wordFromApi.id;
          // Nếu API trả về pinyin trống (do AI fail), sử dụng pinyin đã parse từ example context
          let wordToCache = wordFromApi;
          if (!wordFromApi.pinyin && parsedPinyinFromExample) {
            finalPinyin = parsedPinyinFromExample;
            console.log(`[VocabularyWordItem] API trả về pinyin trống, sử dụng pinyin đã parse: "${finalPinyin}"`);
            // Cập nhật wordToCache để lưu pinyin vào cache
            wordToCache = { ...wordFromApi, pinyin: parsedPinyinFromExample };
          } else {
            finalPinyin = wordFromApi.pinyin;
          }
          finalMeaning = wordFromApi.meaning;
          finalAudioUrl = wordFromApi.audioUrl || undefined;
          finalHSKLevel = wordFromApi.hskLevel;
          finalStrokeCount = wordFromApi.strokeCount;
          finalProgress = wordFromApi.progress;
          finalExamples = wordFromApi.examples || [];
          
          // Lưu vào cache để dùng lần sau (với pinyin đã cập nhật nếu có)
          wordCache.set(cleanWord, wordToCache);
        } catch (error: any) {
          console.error("Lỗi khi gọi API để lấy/tạo từ:", error);
          console.error("Error details:", error.response?.data);
          console.error("Error message:", error.message);
          
          // Nếu API lỗi, sử dụng thông tin đã parse từ example context
          // Ưu tiên: parsedPinyinFromExample > parse lại từ exampleContext > để trống (không fallback về currentWord.pinyin)
          if (!finalPinyin) {
            if (parsedPinyinFromExample) {
              finalPinyin = parsedPinyinFromExample;
              console.log(`[VocabularyWordItem] Sử dụng pinyin đã parse từ example: "${finalPinyin}"`);
            } else if (exampleContext) {
              const parsedPinyin = parseWordPinyinFromSentence(exampleContext.character, exampleContext.pinyin, cleanWord);
              if (parsedPinyin) {
                finalPinyin = parsedPinyin;
                console.log(`[VocabularyWordItem] Parse lại pinyin từ example context: "${finalPinyin}"`);
              }
            }
          }
          
          // Nếu không có meaning, hiển thị thông báo thay vì để trống
          if (!finalMeaning) {
            finalMeaning = "Không thể tải thông tin từ AI. Vui lòng thử lại sau.";
          }
          
          // Không fallback về currentWord.pinyin vì đây là từ khác, không phải từ đang học
          // Tạo word object tạm thời với thông tin có sẵn để hiển thị trong popup
        }
      }
    }

    // Tạo WordWithProgressDto cho từ được click (không phải cả câu)
    // Nếu chưa có meaning (chưa tìm thấy trong allWords và API chưa trả về), 
    // hiển thị thông báo phù hợp
    const clickedWordData: WordWithProgressDto = {
      id: finalId,
      character: cleanWord, // Sử dụng cleanWord (không có khoảng trắng) để hiển thị trong popup
      pinyin: finalPinyin || "", // Pinyin của từ được click
      meaning: finalMeaning || (finalId > 0 ? "Đang tải thông tin..." : "Chưa có thông tin. Vui lòng thử lại sau."), // Meaning của từ được click
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
  // Sử dụng Jieba AI/ML segmentation để phân tách đúng cụm từ có nghĩa
  // Xử lý đặc biệt cho từ ghép (compound words)
  const highlightKeyword = (text: string, keyword: string, exampleContext?: { character: string; pinyin: string; meaning: string }) => {
    if (!text || !keyword) return <span>{text}</span>;
    
    const originalText = text;
    const cleanKeyword = keyword.trim().replace(/\s+/g, "");
    
    if (!cleanKeyword) return <span>{originalText}</span>;
    
    // Đảm bảo keyword được thêm vào allWords để segment đúng
    // Tạo một mảng allWords mới bao gồm cả keyword (nếu chưa có)
    const enhancedAllWords = [...(allWords || [])];
    const keywordExists = enhancedAllWords.some(w => w.character === cleanKeyword);
    if (!keywordExists && currentWord.character === cleanKeyword) {
      // Thêm currentWord vào allWords để đảm bảo keyword được segment đúng
      enhancedAllWords.push(currentWord);
    }
    
    // Sử dụng Chinese Segmenter (fallback nếu Jieba chưa sẵn sàng)
    const segments = segmentChineseText(originalText, enhancedAllWords, true);
    
    if (segments.length === 0) {
      return <span>{originalText}</span>;
    }
    
    // Tạo một mảng để track các segments đã được highlight
    const highlightedSegments = new Set<number>();
    
    // Phân biệt từ đơn (1 ký tự) và cụm từ (2+ ký tự)
    const isSingleCharacter = cleanKeyword.length === 1;
    
    // Tìm các segments tạo thành keyword (xử lý từ đơn và cụm từ)
    // Kiểm tra từng segment và các segments liên tiếp
    for (let i = 0; i < segments.length; i++) {
      if (highlightedSegments.has(i)) continue;
      
      const cleanSegmentWord = segments[i].word.replace(/\s+/g, "");
      
      // Trường hợp 1: Segment chính xác bằng keyword (ưu tiên cao nhất)
      if (cleanSegmentWord === cleanKeyword) {
        highlightedSegments.add(i);
        continue;
      }
      
      // Trường hợp 2: Keyword là từ ghép (2+ ký tự), segment là một phần
      // Ví dụ: keyword = "问题", segment = "问"
      // Cần kiểm tra các segments liên tiếp để tạo thành keyword
      if (!isSingleCharacter && cleanKeyword.includes(cleanSegmentWord) && cleanKeyword.length > cleanSegmentWord.length) {
        // Thử tìm các segments liên tiếp tạo thành keyword
        let combinedText = cleanSegmentWord;
        let endIndex = i;
        
        for (let j = i + 1; j < segments.length && combinedText.length < cleanKeyword.length; j++) {
          const nextSegment = segments[j].word.replace(/\s+/g, "");
          // Chỉ thêm nếu là chữ Hán (không phải dấu câu, khoảng trắng)
          if (/[\u4e00-\u9fa5]/.test(segments[j].word)) {
            combinedText += nextSegment;
            endIndex = j;
          } else {
            break; // Dừng nếu gặp dấu câu
          }
        }
        
        // Nếu các segments liên tiếp tạo thành keyword chính xác
        if (combinedText === cleanKeyword) {
          for (let k = i; k <= endIndex; k++) {
            highlightedSegments.add(k);
          }
          continue;
        }
      }
      
      // Trường hợp 3: Keyword là từ đơn (1 ký tự), segment chứa keyword
      // CHỈ highlight nếu segment chính xác bằng keyword (đã xử lý ở Trường hợp 1)
      // KHÔNG highlight nếu segment là từ ghép chứa keyword (ví dụ: "问题" chứa "问")
      // Vì "问" và "问题" là hai từ khác nhau
      
      // Trường hợp 4: Keyword là từ ghép, segment chứa keyword (segment lớn hơn)
      // Ví dụ: keyword = "问", segment = "问题" - KHÔNG highlight vì là từ khác
      // Ví dụ: keyword = "问题", segment = "问题解决" - Có thể highlight nếu cần
      // Hiện tại: chỉ highlight khi segment = keyword (đã xử lý ở Trường hợp 1)
    }
    
    return (
      <>
        {segments.map((segment, index) => {
          const cleanSegmentWord = segment.word.replace(/\s+/g, "");
          const isHighlighted = highlightedSegments.has(index);
          
          if (isHighlighted) {
            // Highlight keyword (từ đang học) - màu đỏ, đậm
            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(cleanSegmentWord, e, exampleContext)}
                className="text-red-500 font-semibold cursor-pointer hover:text-red-400 transition-colors"
              >
                {segment.word}
              </span>
            );
          }
          
          // Các từ khác trong allWords - màu xanh
          if (segment.isKnownWord) {
            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(cleanSegmentWord, e, exampleContext)}
                className="text-blue-500 cursor-pointer hover:text-blue-400 transition-colors"
              >
                {segment.word}
              </span>
            );
          }
          
          // Các ký tự Hán khác (không có trong allWords) - màu xám
          // Phân biệt: đã load vs chưa load vs AI fail
          if (/[\u4e00-\u9fa5]/.test(segment.word)) {
            const wordInfo = wordCache.get(cleanSegmentWord);
            
            // Kiểm tra xem từ đã có thông tin đầy đủ chưa
            const hasFullInfo = wordInfo && 
                               wordInfo.pinyin && 
                               wordInfo.meaning && 
                               wordInfo.meaning !== "Không thể tải thông tin từ AI. Vui lòng thử lại sau." &&
                               wordInfo.meaning !== "Không thể tải thông tin (lỗi 2 lần). Vui lòng thử lại sau." &&
                               !wordInfo.meaning.includes("Không thể tải");
            
            const hasPartialInfo = wordInfo && !hasFullInfo;
            
            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(cleanSegmentWord, e, exampleContext)}
                className={`cursor-pointer transition-colors ${
                  hasFullInfo 
                    ? 'text-gray-600 hover:text-gray-700' // Đã có đầy đủ thông tin
                    : hasPartialInfo 
                    ? 'text-gray-400 hover:text-gray-500 italic' // Đã load nhưng không đủ thông tin
                    : 'text-gray-300 hover:text-gray-400' // Chưa load
                }`}
                title={
                  hasFullInfo 
                    ? undefined 
                    : hasPartialInfo 
                    ? "Thông tin chưa đầy đủ, click để tải lại" 
                    : "Từ mới, click để xem thông tin"
                }
              >
                {segment.word}
              </span>
            );
          }
          
          // Các ký tự không phải Hán (dấu câu, khoảng trắng, etc.) - màu xám, không click được
          return <span key={index} className="text-gray-400">{segment.word}</span>;
        })}
      </>
    );
  };

  // Async function để segment với Jieba (sử dụng trong useEffect)
  const segmentTextWithJieba = async (text: string) => {
    if (!text) return null;
    
    const cacheKey = text;
    if (segmentCache.has(cacheKey)) {
      return segmentCache.get(cacheKey);
    }

    try {
      const segments = await segmentChineseTextAdvanced(text, allWords, true, true);
      setSegmentCache(prev => new Map(prev).set(cacheKey, segments));
      return segments;
    } catch (error) {
      console.warn("Jieba segmentation failed, using fallback:", error);
      const fallbackSegments = segmentChineseText(text, allWords, true);
      setSegmentCache(prev => new Map(prev).set(cacheKey, fallbackSegments));
      return fallbackSegments;
    }
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
                {currentWord.character}
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
                  {currentWord.pinyin}
                </span>
              </div>
              {/* Meaning */}
              <div className="text-gray-700 text-base mb-4">
                {currentWord.meaning}
        </div>
            </div>
            {/* Favorite Icon */}
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Examples Section - Có đóng/mở, mặc định đóng - Style đẹp hơn cho grid - Đặt trước Action Buttons */}
        <div className="mt-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-md border border-gray-200 overflow-visible relative">
          {/* Examples Header */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wide">
                {examples.length} VÍ DỤ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateExamples}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                title="Tạo ví dụ bằng AI"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                title={isExamplesExpanded ? "Thu gọn" : "Mở rộng"}
              >
                <span>{isExamplesExpanded ? "Thu gọn" : "Xem ví dụ"}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isExamplesExpanded ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Examples List - Collapsible với smooth animation - Position absolute để không đẩy grid items khác */}
          {isExamplesExpanded && (
            <>
              {/* Backdrop overlay */}
              <div 
                className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
                onClick={() => setIsExamplesExpanded(false)}
              />
              
              {/* Examples Panel - Absolute positioned */}
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] overflow-hidden animate-slide-in-up">
                <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <svg className="w-12 h-12 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mt-4">Đang tạo ví dụ bằng AI...</p>
                    <p className="text-gray-400 text-xs mt-1">Vui lòng đợi trong giây lát</p>
                  </div>
                </div>
              ) : examples.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {examples.map((example, index) => (
                    <div 
                      key={index}
                      className="group bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="text-base font-semibold text-gray-900 leading-relaxed">
                                {highlightKeyword(example.character, currentWord.character, example)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-blue-600 mb-1.5 font-medium ml-8">
                            {highlightPinyin(example.pinyin, currentWord.pinyin, example)}
                          </div>
                          <div className="text-sm text-gray-600 leading-relaxed ml-8">
                            {example.meaning}
                          </div>
                        </div>
                        <button
                          onClick={() => playAudio(example.character, example.audioUrl || undefined)}
                          disabled={isPlaying}
                          className="flex-shrink-0 p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 disabled:opacity-50 group-hover:scale-110 shadow-sm hover:shadow-md"
                          title="Nghe phát âm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Chưa có ví dụ cho từ này</p>
                  <p className="text-gray-400 text-xs mb-4">Tạo ví dụ bằng AI để học tốt hơn</p>
                  <button
                    onClick={handleGenerateExamples}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Tạo ví dụ bằng AI
                  </button>
                </div>
              )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons - Đặt sau Examples Section */}
        <div className="mt-4 grid grid-cols-2 gap-2">
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
          {(currentWord.character || currentWord.id) && (
            <Link
              href={`/words/${currentWord.id ? currentWord.id : encodeURIComponent(currentWord.character || "")}`}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              onClick={(e) => {
                if (onDetailClick) {
                  e.preventDefault();
                  handleViewDetail(e);
                }
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chi tiết
            </Link>
          )}
          <button
            onClick={handleMarkAsLearned}
            disabled={isMarking || currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning"}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
              currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning"
                ? "bg-green-100 text-green-700 border border-green-300 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            } disabled:opacity-50`}
            title={currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning" ? "Đã được đánh dấu là đã học" : "Đánh dấu đã học"}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              )}
            </svg>
            {isMarking ? "Đang xử lý..." : getStatusText()}
          </button>
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
          {/* Top divider line */}
          <div className="text-4xl font-bold text-dark leading-tight">
            {currentWord.character}
          </div>
          
          {/* Header with Favorite Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Pinyin and Audio */}
              <div className="flex items-center gap-2 mb-3">
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
                <span className="text-base text-green-600 font-semibold">
                  {currentWord.pinyin}
                </span>
              </div>
              {/* Meaning - Large and Bold */}
              <div className="text-gray-900 text-xl font-bold mb-4">
                {currentWord.meaning}
              </div>
            </div>
            {/* Favorite Icon - Top Right */}
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Action Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => playAudio()}
              disabled={isPlaying}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Nghe
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Luyện viết
            </button>
            {(currentWord.character || currentWord.id) && (
              <Link
                href={`/words/${currentWord.id ? currentWord.id : encodeURIComponent(currentWord.character || "")}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={(e) => {
                  if (onDetailClick) {
                    e.preventDefault();
                    handleViewDetail(e);
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chi tiết
              </Link>
            )}
            <button
              onClick={handleMarkAsLearned}
              disabled={isMarking || currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning"}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning"
                  ? "bg-green-100 text-green-700 border border-green-300 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              } disabled:opacity-50`}
              title={currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning" ? "Đã được đánh dấu là đã học" : "Đánh dấu đã học"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {currentWord.progress?.status === "Mastered" || currentWord.progress?.status === "Learning" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                )}
              </svg>
              {isMarking ? "Đang xử lý..." : getStatusText()}
            </button>
          </div>
        </div>

        {/* Right Column: Examples Section - Giao diện đơn giản */}
        <div className="w-full lg:w-80 flex-shrink-0">
          {/* Examples Header Bar */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm font-bold text-white uppercase tracking-wide">
              {examples.length} VÍ DỤ
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateExamples}
                disabled={isGenerating}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                title="Tạo ví dụ bằng AI"
              >
                {isGenerating ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                title={isExamplesExpanded ? "Thu gọn" : "Xem ví dụ"}
              >
                <span>{isExamplesExpanded ? "Thu gọn" : "Xem ví dụ"}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isExamplesExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Examples List - Collapsible - Mặc định đóng */}
          {isExamplesExpanded && (
            <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 animate-spin text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 text-sm">Đang tạo ví dụ bằng AI...</p>
                  </div>
                </div>
              ) : examples.length > 0 ? (
                <div className="space-y-4">
                  {examples.map((example, index) => (
                    <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-gray-900 text-base font-medium mb-1">
                            {highlightKeyword(example.character, currentWord.character, example)}
                          </div>
                        </div>
                        <button
                          onClick={() => playAudio(example.character)}
                          disabled={isPlaying}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 ml-2"
                          title="Nghe phát âm cả câu"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {highlightPinyin(example.pinyin, currentWord.pinyin, example)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {example.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-3">Chưa có ví dụ cho từ này.</p>
                  <button
                    onClick={handleGenerateExamples}
                    disabled={isGenerating}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Nhấn để tạo ví dụ bằng AI
                  </button>
                </div>
              )}
            </div>
          )}
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