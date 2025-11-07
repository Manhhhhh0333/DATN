"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { lessonService } from "@/lib/services/lessonService";
import { LessonListDto } from "@/types";

export default function CoursesPage() {
  const [lessons, setLessons] = useState<LessonListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHSKLevel, setSelectedHSKLevel] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (selectedHSKLevel) {
      loadLessonsByHSKLevel(selectedHSKLevel);
    } else {
      setLessons([]);
    }
  }, [selectedHSKLevel]);

  const loadLessonsByHSKLevel = async (hskLevel: number) => {
    try {
      setLoading(true);
      const data = await lessonService.getLessonsByHSKLevel(hskLevel);
      setLessons(data);
    } catch (error) {
      console.error("Error loading lessons:", error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const hskLevels = [
    { level: 1, name: "HSK 1", description: "Cấp độ cơ bản nhất", color: "from-green-500 to-emerald-500" },
    { level: 2, name: "HSK 2", description: "Giao tiếp cơ bản", color: "from-blue-500 to-cyan-500" },
    { level: 3, name: "HSK 3", description: "Giao tiếp hàng ngày", color: "from-purple-500 to-violet-500" },
    { level: 4, name: "HSK 4", description: "Giao tiếp lưu loát", color: "from-orange-500 to-amber-500" },
    { level: 5, name: "HSK 5", description: "Đọc báo, xem phim", color: "from-red-500 to-pink-500" },
    { level: 6, name: "HSK 6", description: "Thành thạo như người bản ngữ", color: "from-indigo-500 to-blue-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải giáo trình HSK...</p>
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
              Giáo trình HSK
            </h1>
            <p className="text-xl text-white/90 text-center max-w-2xl mx-auto">
              Chọn cấp độ HSK phù hợp và bắt đầu hành trình học tiếng Trung của bạn
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedHSKLevel(undefined)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  selectedHSKLevel === undefined
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              {hskLevels.map((hsk) => (
                <button
                  key={hsk.level}
                  onClick={() => setSelectedHSKLevel(hsk.level)}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    selectedHSKLevel === hsk.level
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {hsk.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Lessons List */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {!selectedHSKLevel ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">
                  Vui lòng chọn cấp độ HSK để xem danh sách bài học
                </p>
                <p className="text-gray-500">
                  Chọn một trong các cấp độ HSK 1-6 ở trên để bắt đầu học
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách bài học...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  Chưa có bài học nào cho HSK {selectedHSKLevel}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-dark mb-6">
                  Danh sách bài học - {hskLevels.find(h => h.level === selectedHSKLevel)?.name}
                </h2>
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/lessons/${lesson.id}`}
                      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 ${
                        lesson.isLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              lesson.isCompleted
                                ? "bg-primary text-white"
                                : lesson.isLocked
                                ? "bg-gray-300 text-gray-600"
                                : "bg-primary/20 text-primary"
                            }`}>
                              {lesson.isCompleted ? "✓" : lesson.isLocked ? "🔒" : lesson.lessonIndex}
                            </div>
                            <h3 className="text-xl font-bold text-dark">
                              {lesson.title}
                            </h3>
                            {lesson.isCompleted && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                ✓ Hoàn thành
                              </span>
                            )}
                            {lesson.isLocked && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                                🔒 Đã khóa
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-gray-600 ml-14 mb-3">{lesson.description}</p>
                          )}
                          <div className="flex items-center gap-4 ml-14 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {lesson.totalWords} từ vựng
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {lesson.totalQuestions} câu hỏi
                            </span>
                          </div>
                        </div>
                        <div className="text-primary font-semibold">
                          {lesson.isLocked ? "🔒" : "Bắt đầu →"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

