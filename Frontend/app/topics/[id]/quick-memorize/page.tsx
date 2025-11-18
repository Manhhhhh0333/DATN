"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { getCompletedActivities } from "@/lib/services/activityService";
import {
  VocabularyTopicDetailDto,
  ReviewStatsDto,
  WordWithProgressDto,
} from "@/types";
import VocabularyPopupCard from "@/components/vocabulary/VocabularyPopupCard";
import ActivityProgressChart from "@/components/vocabulary/ActivityProgressChart";
import { 
  getQuickMemorizeCompletion,
  calculateQuickMemorizeProgress 
} from "@/lib/services/activityProgressService";
import LearningActivities, {
  ActivityItem,
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import DisplayOptionsModal, {
  DisplayOptions,
} from "@/components/vocabulary/DisplayOptionsModal";
import { aiService } from "@/lib/services/aiService";

export default function QuickMemorizePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<VocabularyTopicDetailDto | null>(null);
  const [stats, setStats] = useState<ReviewStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<WordWithProgressDto | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [conversationText, setConversationText] = useState("");
  const [conversationData, setConversationData] = useState<{
    topic: string;
    monologue: Array<{ chinese: string; pinyin: string; translation: string }>;
  } | null>(null);
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false);
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(() => {
    // Load from localStorage hoặc dùng default
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickMemorizeDisplayOptions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      showChinese: true,
      showPinyin: false,
      showVietnamese: false,
    };
  });
  const [isGeneratingConversation, setIsGeneratingConversation] = useState(false);
  const [activityProgress, setActivityProgress] = useState<any>(null);

  useEffect(() => {
    if (topicId) {
      loadData();
    }
  }, [topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicData, statsData] = await Promise.all([
        vocabularyService.getTopicById(topicId),
        vocabularyService.getTopicStats(topicId),
      ]);
      setTopic(topicData);
      setStats(statsData);
      
      // Load completed activities
      try {
        const completedActivities = await getCompletedActivities(undefined, undefined, topicId);
        const completedIds = completedActivities.map(a => a.activityId);
        setCompletedActivityIds(completedIds);
        console.log("Loaded completed activities:", completedIds);
      } catch (activityError) {
        console.error("Error loading completed activities:", activityError);
        // Không cần show error, chỉ log
      }
      
      // Tạo đoạn hội thoại từ các từ vựng
      generateConversationText(topicData.words);
      
      // Load quick memorize progress
      const completedWords = getQuickMemorizeCompletion(topicId);
      const progress = calculateQuickMemorizeProgress(topicData.words, completedWords);
      setActivityProgress(progress);
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error.response?.status === 404) {
        alert("Chủ đề từ vựng chưa được tạo.");
        router.push(`/topics/${topicId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tạo đoạn hội thoại từ các từ vựng bằng AI
  const generateConversationText = async (words: WordWithProgressDto[]) => {
    if (!words || words.length === 0) {
      setConversationText("Chưa có từ vựng nào trong chủ đề này.");
      setConversationData(null);
      return;
    }

    try {
      setIsGeneratingConversation(true);
      
      // Lấy 15 từ đầu tiên để tạo đoạn hội thoại
      const selectedWords = words.slice(0, 15);
      const wordsWithMeaning = selectedWords.map(w => ({
        word: w.character,
        meaning: w.meaning,
      }));
      
      // Gọi AI để generate conversation
      const conversation = await aiService.generateConversation(wordsWithMeaning);
      setConversationData(conversation);
      
      // Tạo text từ monologue để highlight
      const text = conversation.monologue.map(m => m.chinese).join("");
      setConversationText(text);
    } catch (error: any) {
      console.error("Lỗi khi generate conversation:", error);
      // Fallback về text mẫu nếu AI fail
      const selectedWords = words.slice(0, 15);
      const characters = selectedWords.map(w => w.character);
      const sampleText = `你好! Hôm nay ${characters[1] || ""} có khỏe không? Tôi thì rất vui vì đã gặp được ${characters[2] || ""} người bạn mới. Chúng tôi cùng nhau ngắm nhìn ${characters[3] || ""} chú ${characters[4] || ""} đang phi nước đại trên cánh đồng ${characters[5] || ""}. Bỗng nhiên, có ${characters[6] || ""} con chim lạ bay đến, đậu trên một cái ${characters[7] || ""} giếng cạn. Chúng có bộ lông ${characters[8] || ""} như tuyết. Một ${characters[9] || ""} đi tới, cố gắng xua chúng đi, nhưng chúng lại ${characters[10] || ""} hề sợ hãi.`;
      setConversationText(sampleText);
      setConversationData(null);
    } finally {
      setIsGeneratingConversation(false);
    }
  };

  // Highlight từ vựng trong text với tùy chọn hiển thị
  const highlightWords = (text: string) => {
    if (!topic || !text) return <span>{text}</span>;

    const words = topic.words;
    
    // Sắp xếp từ vựng theo độ dài (từ dài đến ngắn) để match từ dài trước
    const sortedWords = [...words].sort((a, b) => b.character.length - a.character.length);
    
    const parts: Array<{ text: string; isWord: boolean; word?: WordWithProgressDto }> = [];
    let lastIndex = 0;
    const processedIndices = new Set<number>();

    // Duyệt qua text và tìm các từ vựng có trong part
    for (let i = 0; i < text.length; i++) {
      // Bỏ qua nếu đã được xử lý
      if (processedIndices.has(i)) continue;
      
      // Thử match với từ dài nhất trước
      let matched = false;
      for (const word of sortedWords) {
        const wordLength = word.character.length;
        const substring = text.substring(i, i + wordLength);
        
        // Chỉ match chính xác
        if (substring === word.character) {
          // Thêm phần text trước từ
          if (i > lastIndex) {
            parts.push({
              text: text.substring(lastIndex, i),
              isWord: false,
            });
          }
          
          // Thêm từ vựng được highlight
          parts.push({
            text: word.character,
            isWord: true,
            word: word,
          });
          
          // Đánh dấu các vị trí đã xử lý
          for (let j = i; j < i + wordLength; j++) {
            processedIndices.add(j);
          }
          
          lastIndex = i + wordLength;
          matched = true;
          break;
        }
      }
      
      // Nếu không match, chỉ cần tăng i (sẽ được xử lý ở phần text còn lại)
    }

    // Thêm phần text còn lại
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isWord: false,
      });
    }

    return (
      <>
        {parts.map((part, index) => {
          if (part.isWord && part.word) {
            const word = part.word;
            const elements: React.ReactNode[] = [];

            // Hiển thị chữ Hán
            if (displayOptions.showChinese) {
              elements.push(
                <span
                  key={`${index}-char`}
                  onClick={(e) => handleWordClick(word, e)}
                  className="text-red-500 font-semibold cursor-pointer hover:text-red-400 transition-colors"
                >
                  {part.text}
                </span>
              );
            }

            // Hiển thị Pinyin
            if (displayOptions.showPinyin && word.pinyin) {
              elements.push(
                <span
                  key={`${index}-pinyin`}
                  className="text-blue-600 italic ml-1"
                >
                  ({word.pinyin})
                </span>
              );
            }

            // Hiển thị nghĩa tiếng Việt
            if (displayOptions.showVietnamese && word.meaning) {
              elements.push(
                <span
                  key={`${index}-meaning`}
                  className="text-gray-600 ml-1"
                >
                  [{word.meaning}]
                </span>
              );
            }

            // Nếu không hiển thị gì, vẫn hiển thị chữ Hán
            if (elements.length === 0) {
              elements.push(
                <span
                  key={`${index}-char`}
                  onClick={(e) => handleWordClick(word, e)}
                  className="text-red-500 font-semibold cursor-pointer hover:text-red-400 transition-colors"
                >
                  {part.text}
                </span>
              );
            }

            return <span key={index}>{elements}</span>;
          }
          return <span key={index}>{part.text}</span>;
        })}
      </>
    );
  };

  const handleSaveDisplayOptions = (options: DisplayOptions) => {
    setDisplayOptions(options);
    // Lưu vào localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("quickMemorizeDisplayOptions", JSON.stringify(options));
    }
  };

  const handleWordClick = (word: WordWithProgressDto, event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setSelectedWord(word);
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
    setPopupPosition(null);
  };

  // Tính toán thống kê
  const getProgressStats = () => {
    if (!topic || !stats) {
      return { completed: 0, inProgress: 0, notStarted: 0, total: 0 };
    }

    const total = topic.words.length;
    const completed = topic.words.filter(w => w.progress?.status === "Mastered").length;
    const inProgress = topic.words.filter(w => w.progress?.status === "Learning").length;
    const notStarted = total - completed - inProgress;

    return { completed, inProgress, notStarted, total };
  };

  const progressStats = getProgressStats();

  // Tính completedCount như trong topics page (mastered + learning)
  const completedCount = progressStats.completed + progressStats.inProgress;

  // Tính phần trăm cho biểu đồ tròn
  const completedPercent = progressStats.total > 0 
    ? Math.round((progressStats.completed / progressStats.total) * 100) 
    : 0;
  const inProgressPercent = progressStats.total > 0 
    ? Math.round((progressStats.inProgress / progressStats.total) * 100) 
    : 0;
  const notStartedPercent = progressStats.total > 0 
    ? Math.round((progressStats.notStarted / progressStats.total) * 100) 
    : 0;

  // Danh sách hoạt động học tập
  const activities = createDefaultActivities({
    quickMemorizeLink: `/topics/${topicId}/quick-memorize`,
    imageQuizLink: undefined, // Chưa implement
    activeId: "quick-memorize",
    completedIds: completedActivityIds,
  });

  // Vẽ biểu đồ tròn
  const renderPieChart = () => {
    const size = 120;
    const radius = size / 2 - 5;
    const centerX = size / 2;
    const centerY = size / 2;
    const circumference = 2 * Math.PI * radius;

    // Tính độ dài cho mỗi phần (theo phần trăm)
    const completedLength = (completedPercent / 100) * circumference;
    const inProgressLength = (inProgressPercent / 100) * circumference;
    const notStartedLength = (notStartedPercent / 100) * circumference;

    // Tính offset cho mỗi phần
    // Completed: bắt đầu từ 0, hiển thị completedLength
    const completedOffset = circumference - completedLength;
    // In Progress: bắt đầu sau completed, hiển thị inProgressLength
    const inProgressOffset = circumference - inProgressLength - completedLength;
    // Not Started: bắt đầu sau completed + inProgress, hiển thị notStartedLength
    const notStartedOffset = circumference - notStartedLength - inProgressLength - completedLength;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Completed - Green (vẽ đầu tiên từ góc 0) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="10"
          strokeDasharray={`${completedLength} ${circumference}`}
          strokeDashoffset="0"
          className="transition-all duration-500"
        />
        {/* In Progress - Orange (vẽ sau completed) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="10"
          strokeDasharray={`${inProgressLength} ${circumference}`}
          strokeDashoffset={-completedLength}
          className="transition-all duration-500"
        />
        {/* Not Started - Gray (vẽ cuối cùng) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeDasharray={`${notStartedLength} ${circumference}`}
          strokeDashoffset={-(completedLength + inProgressLength)}
          className="transition-all duration-500"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Nhớ từ qua hội thoại
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Nhớ từ qua hội thoại
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">Không tìm thấy chủ đề từ vựng.</p>
              <Link
                href="/vocabulary"
                className="text-primary hover:text-primary-dark underline"
              >
                Quay lại danh sách chủ đề
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              href={`/topics/${topicId}`}
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại chủ đề
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Nhớ từ qua hội thoại
                </h1>
                {topic && (
                  <p className="text-xl text-white/90">
                    {topic.title || `Chủ đề ${topicId}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsDisplayOptionsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                <span className="text-sm font-medium">Tùy chọn hiển thị</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thống kê tiến độ */}
            {activityProgress && (
              <ActivityProgressChart progress={activityProgress} showDetails={true} />
            )}

            {/* Đoạn hội thoại */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isGeneratingConversation ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-gray-600">Đang tạo đoạn hội thoại bằng AI...</span>
                </div>
              ) : conversationData ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{conversationData.topic}</h3>
                  <div className="space-y-3">
                    {conversationData.monologue.map((sentence, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                        <p className="text-lg leading-relaxed text-gray-800 mb-1">
                          {highlightWords(sentence.chinese)}
                        </p>
                        {displayOptions.showPinyin && (
                          <p className="text-blue-600 italic text-sm mb-1">{sentence.pinyin}</p>
                        )}
                        {displayOptions.showVietnamese && (
                          <p className="text-gray-600 text-sm">{sentence.translation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed text-gray-800">
                    {highlightWords(conversationText)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Activities */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <LearningActivities
                activities={activities}
                title={topic?.title || "Hán Ngữ"}
                completedCount={completedCount}
                totalCount={progressStats.total}
                showFirstWord={
                  topic.words && topic.words.length > 0
                    ? {
                        character: topic.words[0].character,
                        meaning: topic.words[0].meaning,
                        isCompleted: topic.words[0].progress?.status === "Mastered",
                      }
                    : undefined
                }
                maxHeight="calc(100vh-200px)"
              />
            </div>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Popup hiển thị chi tiết từ vựng */}
      {selectedWord && popupPosition && (
        <VocabularyPopupCard
          word={selectedWord}
          position={popupPosition}
          onClose={handleClosePopup}
          onViewDetail={(word) => {
            router.push(`/topics/${topicId}?word=${word.id}`);
            handleClosePopup();
          }}
        />
      )}

      {/* Display Options Modal */}
      <DisplayOptionsModal
        isOpen={isDisplayOptionsOpen}
        onClose={() => setIsDisplayOptionsOpen(false)}
        onSave={handleSaveDisplayOptions}
        initialOptions={displayOptions}
      />
    </div>
  );
}

