"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { lessonService } from "@/lib/services/lessonService";
import { WordWithProgressDto, LessonListDto } from "@/types";
import VocabularyWordItem from "@/components/vocabulary/VocabularyWordItem";
import LessonSidebar from "@/components/vocabulary/LessonSidebar";

export default function HSKVocabularyPartPage() {
  const params = useParams();
  const router = useRouter();
  const hskLevel = parseInt(params.hskLevel as string);
  const partNumber = parseInt(params.partNumber as string);

  const [words, setWords] = useState<WordWithProgressDto[]>([]);
  const [lessons, setLessons] = useState<LessonListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mặc định mở

  useEffect(() => {
    if (hskLevel && partNumber) {
      loadData();
    }
  }, [hskLevel, partNumber]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wordsData, lessonsData] = await Promise.all([
        vocabularyService.getWordsByHSKLevelAndPart(hskLevel, partNumber),
        lessonService.getLessonsByHSKLevel(hskLevel).catch(() => []), // Fallback nếu không có lessons
      ]);
      setWords(wordsData);
      setLessons(lessonsData);
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error.response?.status === 404) {
        router.push("/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const stats = {
    total: words.length,
    mastered: words.filter(w => w.progress?.status === "Mastered").length,
    learning: words.filter(w => w.progress?.status === "Learning").length,
    new: words.filter(w => !w.progress || w.progress.status === "New").length,
  };

  const progressPercentage = stats.total > 0 
    ? Math.round(((stats.mastered + stats.learning) / stats.total) * 100) 
    : 0;

  // Hiển thị tất cả từ vựng
  const filteredWords = words;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải từ vựng...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow flex">
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6 transition-all duration-300">
        {/* Header Section */}
        <div className="mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách giáo trình HSK
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Từ Vựng Tiếng Trung
          </h1>
        </div>

        {/* Progress Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {progressPercentage}% Hoàn thành
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tiến độ</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.mastered}/{stats.total}</div>
              <div className="text-sm text-gray-600 mb-1">Đã làm</div>
              <div className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.learning}/{stats.total}</div>
              <div className="text-sm text-gray-600 mb-1">Đang làm</div>
              <div className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.learning / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{stats.new}/{stats.total}</div>
              <div className="text-sm text-gray-600 mb-1">Chưa làm</div>
              <div className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.new / stats.total) * 100) : 0}%
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

        {/* Words List Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Danh sách từ vựng
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{filteredWords.length} từ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Danh sách
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Lưới
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredWords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có từ vựng nào trong phần này.</p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredWords.map((word) => (
              <VocabularyWordItem key={word.id} word={word} viewMode="grid" allWords={filteredWords} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWords.map((word) => (
              <VocabularyWordItem key={word.id} word={word} viewMode="list" allWords={filteredWords} />
            ))}
          </div>
        )}
        </main>
        
        {/* Lesson Sidebar */}
        <LessonSidebar
          lessons={lessons}
          hskLevel={hskLevel}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      <Footer />
    </div>
  );
}

