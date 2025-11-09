"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import {
  VocabularyTopicDetailDto,
  FlashcardReviewDto,
  ReviewStatsDto,
} from "@/types";
import Flashcard from "@/components/vocabulary/Flashcard";
import VocabularyWordCard from "@/components/vocabulary/VocabularyWordCard";
import VocabularyDetailView from "@/components/vocabulary/VocabularyDetailView";
import VocabularyWordItem from "@/components/vocabulary/VocabularyWordItem";
import { WordWithProgressDto } from "@/types";

export default function VocabularyTopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<VocabularyTopicDetailDto | null>(null);
  const [reviewWords, setReviewWords] = useState<FlashcardReviewDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<ReviewStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "flashcard" | "detail">("list");
  const [selectedWord, setSelectedWord] = useState<WordWithProgressDto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "learning" | "mastered">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error.response?.status === 404) {
        // Vocabulary Topic chưa được seed
        alert(
          "Chủ đề từ vựng chưa được tạo. Vui lòng seed dữ liệu bằng cách:\n\n" +
          "1. Gọi API: POST http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1\n" +
          "2. Hoặc chạy script: Backend/scripts/seed_vocabulary_topic.ps1\n" +
          "3. Hoặc chạy migration: dotnet ef database update"
        );
        router.push("/vocabulary");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadReviewWords = async (onlyDue: boolean = true) => {
    try {
      const words = await vocabularyService.getReviewWords(topicId, onlyDue);
      setReviewWords(words);
      setCurrentIndex(0);
      setMode("flashcard");
    } catch (error) {
      console.error("Lỗi khi tải từ vựng:", error);
    }
  };

  const handleRate = async (wordId: number, rating: "Easy" | "Hard" | "Forgot") => {
    try {
      await vocabularyService.updateReviewStatus({ wordId, rating });
      // Reload stats
      const statsData = await vocabularyService.getTopicStats(topicId);
      setStats(statsData);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Đã xong tất cả từ
      setMode("list");
      loadData();
    }
  };

  const getFilteredWords = () => {
    if (!topic) return [];

    let filtered = topic.words;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.character.toLowerCase().includes(query) ||
          word.pinyin.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((word) => {
        if (!word.progress) {
          return filterStatus === "new";
        }
        switch (filterStatus) {
          case "new":
            return word.progress.status === "New";
          case "learning":
            return word.progress.status === "Learning";
          case "mastered":
            return word.progress.status === "Mastered";
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Đang tải...</div>
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
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500">Không tìm thấy chủ đề</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (mode === "flashcard" && reviewWords.length > 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setMode("list")}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Quay lại danh sách
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {topic.name}
              </h2>
              <p className="text-gray-600">
                Từ {currentIndex + 1} / {reviewWords.length}
              </p>
            </div>
          </div>

          <Flashcard
            word={reviewWords[currentIndex]}
            onRate={handleRate}
            onNext={handleNext}
            isLast={currentIndex === reviewWords.length - 1}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (mode === "detail" && selectedWord) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => {
                setMode("list");
                setSelectedWord(null);
              }}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.name}</h1>
          </div>

          <div className="h-[calc(100vh-250px)]">
            <VocabularyDetailView
              word={selectedWord}
              onClose={() => {
                setMode("list");
                setSelectedWord(null);
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate overall progress
  const overallProgress = stats
    ? Math.round(
        ((stats.masteredWords + stats.learningWords) / stats.totalWords) * 100
      )
    : 0;

  const completedCount = stats ? stats.masteredWords + stats.learningWords : 0;
  const inProgressCount = stats ? stats.learningWords : 0;
  const notStartedCount = stats ? stats.newWords : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Từ Vựng Tiếng Trung</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-lg text-gray-600">{overallProgress}% Hoàn thành</span>
          </div>
        </div>

        {/* Progress Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tiến độ</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Đã làm</div>
              <div className="text-2xl font-bold text-green-600">
                {completedCount}/{stats?.totalWords || 0}
              </div>
              <div className="text-xs text-gray-500">
                {stats?.totalWords ? Math.round((completedCount / stats.totalWords) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Đang làm</div>
              <div className="text-2xl font-bold text-yellow-600">
                {inProgressCount}/{stats?.totalWords || 0}
              </div>
              <div className="text-xs text-gray-500">
                {stats?.totalWords ? Math.round((inProgressCount / stats.totalWords) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Chưa làm</div>
              <div className="text-2xl font-bold text-blue-600">
                {notStartedCount}/{stats?.totalWords || 0}
              </div>
              <div className="text-xs text-gray-500">
                {stats?.totalWords ? Math.round((notStartedCount / stats.totalWords) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            KIỂM TRA NGHĨA TỪ
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            KIỂM TRA TỪ
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            KIỂM TRA PINYIN
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            KIỂM TRA PHÁT ÂM
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus("new")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "new"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chưa học
              </button>
              <button
                onClick={() => setFilterStatus("learning")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "learning"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Đang học
              </button>
              <button
                onClick={() => setFilterStatus("mastered")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "mastered"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Đã thuộc
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Words List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Danh sách từ vựng</h2>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">
                    {getFilteredWords().length} từ
                  </span>
                  <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Danh sách
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Lưới
                    </button>
                  </div>
                </div>
              </div>

              {topic.words.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có từ vựng nào trong chủ đề này.</p>
                </div>
              ) : getFilteredWords().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Không tìm thấy từ vựng nào phù hợp với bộ lọc.</p>
                </div>
              ) : viewMode === "list" ? (
                <div>
                  {getFilteredWords().map((word) => (
                    <VocabularyWordItem
                      key={word.id}
                      word={word}
                      onDetailClick={(w) => {
                        setSelectedWord(w);
                        setMode("detail");
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredWords().map((word, index) => (
                    <div
                      key={word.id}
                      className="animate-fade-in cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => {
                        setSelectedWord(word);
                        setMode("detail");
                      }}
                    >
                      <VocabularyWordCard word={word} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Lessons and Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hán Ngữ</h3>
              <div className="text-sm text-gray-600 mb-6">
                0/{topic.wordCount || 0} bài hoàn thành
              </div>

              {/* Lesson List - Placeholder */}
              <div className="space-y-3 mb-6">
                <div className="border-b border-gray-200 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">你好</span>
                    <span className="text-xs text-gray-500">0%</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">Xin chào</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
                {/* Add more lessons here */}
              </div>

              {/* Learning Activities */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Hoạt động học tập</h4>
                <div className="space-y-2">
                  {[
                    "Từ vựng",
                    "Nhớ nhanh từ",
                    "Chọn đúng sai",
                    "Chọn đúng sai với câu",
                    "Nghe câu chọn hình ảnh",
                    "Ghép câu",
                    "Điền từ",
                    "Flash card từ vựng",
                    "Hội thoại",
                    "Đọc hiểu",
                    "Ngữ pháp",
                    "Sắp xếp câu",
                    "Bài tập luyện dịch",
                    "Kiểm tra tổng hợp",
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

