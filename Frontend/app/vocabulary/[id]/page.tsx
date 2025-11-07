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

export default function VocabularyTopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<VocabularyTopicDetailDto | null>(null);
  const [reviewWords, setReviewWords] = useState<FlashcardReviewDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<ReviewStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "flashcard">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "learning" | "mastered">("all");

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/vocabulary")}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Quay lại danh sách chủ đề
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.name}</h1>
          {topic.description && (
            <p className="text-gray-600 mb-4">{topic.description}</p>
          )}
        </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Tổng số từ</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalWords}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Chưa học</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.newWords}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Đang học</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.learningWords}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Đã thuộc</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.masteredWords}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => loadReviewWords(true)}
          disabled={stats?.wordsDueToday === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Ôn tập từ cần ôn ({stats?.wordsDueToday || 0})
        </button>
        <button
          onClick={() => loadReviewWords(false)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Học tất cả từ ({topic.wordCount})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng (chữ Hán, pinyin, nghĩa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("new")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === "new"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Chưa học
            </button>
            <button
              onClick={() => setFilterStatus("learning")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === "learning"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setFilterStatus("mastered")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
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

      {/* Words List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Danh sách từ vựng
            </h2>
            <span className="text-gray-600">
              {(() => {
                const filtered = getFilteredWords();
                return `${filtered.length} / ${topic.words.length} từ`;
              })()}
            </span>
          </div>

          {topic.words.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-gray-500 text-lg">Chưa có từ vựng nào trong chủ đề này.</p>
            </div>
          ) : getFilteredWords().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy từ vựng nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredWords().map((word, index) => (
                <div
                  key={word.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <VocabularyWordCard word={word} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}

