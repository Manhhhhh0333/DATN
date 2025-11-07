"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WordCard from "@/components/lesson/WordCard";
import QuizComponent from "@/components/quiz/QuizComponent";
import { lessonService } from "@/lib/services/lessonService";
import { quizService } from "@/lib/services/quizService";
import { LessonDto, QuestionDto, QuizSubmissionDto, QuizResultDto } from "@/types";

type TabType = "words" | "grammar" | "reading" | "quiz";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);

  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("words");

  useEffect(() => {
    if (lessonId) {
      loadLessonData();
    }
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      const lessonData = await lessonService.getLessonById(lessonId);
      setLesson(lessonData);
    } catch (error: any) {
      console.error("Error loading lesson:", error);
      if (error.response?.status === 403) {
        alert("Bạn chưa hoàn thành bài học trước đó. Vui lòng hoàn thành bài học trước để tiếp tục.");
        router.back();
      } else if (error.response?.status === 404) {
        router.push("/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: any[]): Promise<QuizResultDto> => {
    if (!lesson) {
      throw new Error("Lesson not loaded");
    }
    const submission: QuizSubmissionDto = {
      lessonId: lesson.id,
      answers: answers,
    };
    return await quizService.submitQuiz(submission);
  };

  const handleQuizComplete = (result: QuizResultDto) => {
    // Reload lesson to get updated progress
    loadLessonData();
    
    if (result.lessonCompleted && result.nextLessonUnlocked) {
      // Show success message
      alert(`Chúc mừng! Bạn đã hoàn thành bài học. Bài học tiếp theo đã được mở khóa!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải bài học...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Bài học không tồn tại</p>
            <Link
              href="/courses"
              className="text-primary hover:text-primary-dark font-semibold"
            >
              ← Quay lại danh sách khóa học
            </Link>
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
        {/* Lesson Header */}
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Link
              href={`/courses/${lesson.courseId}`}
              className="inline-flex items-center text-white/90 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại khóa học: {lesson.courseTitle}
            </Link>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 px-4 py-1 rounded-full text-white font-semibold">
                  Bài {lesson.lessonIndex}
                </span>
                {lesson.isCompleted && (
                  <span className="bg-green-500/80 px-4 py-1 rounded-full text-white font-semibold">
                    ✓ Đã hoàn thành
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {lesson.title}
              </h1>
              
              {lesson.description && (
                <p className="text-lg text-white/90 mb-4">
                  {lesson.description}
                </p>
              )}

              {/* Lesson Stats */}
              <div className="flex items-center gap-6 text-white/90 text-sm flex-wrap">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {lesson.words.length} từ vựng
                </span>
                {lesson.sentencePatterns.length > 0 && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {lesson.sentencePatterns.length} mẫu câu
                  </span>
                )}
                {lesson.readingPassages.length > 0 && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {lesson.readingPassages.length} bài đọc
                  </span>
                )}
                {lesson.questions.length > 0 && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {lesson.questions.length} câu hỏi
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Navigation - Cấu trúc: Words -> Grammar -> Reading -> Quiz */}
        <section className="bg-white border-b sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("words")}
                className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === "words"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                📚 Từ vựng ({lesson.words.length})
              </button>
              {lesson.sentencePatterns.length > 0 && (
                <button
                  onClick={() => setActiveTab("grammar")}
                  className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === "grammar"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📖 Ngữ pháp ({lesson.sentencePatterns.length})
                </button>
              )}
              {lesson.readingPassages.length > 0 && (
                <button
                  onClick={() => setActiveTab("reading")}
                  className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === "reading"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📄 Bài đọc ({lesson.readingPassages.length})
                </button>
              )}
              {lesson.questions.length > 0 && (
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === "quiz"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ✅ Bài tập ({lesson.questions.length})
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content Area - Cấu trúc: Words -> Grammar -> Reading -> Quiz */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Tab: Words - Từ vựng */}
            {activeTab === "words" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-dark mb-2">
                    Từ vựng trong bài học
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Học <span className="font-semibold text-primary">{lesson.words.length}</span> từ vựng mới trong bài này
                  </p>
                </div>

                {lesson.words.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-600 text-lg">Chưa có từ vựng nào trong bài học này.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lesson.words.map((word, index) => (
                      <div key={word.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <WordCard word={word} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Grammar - Ngữ pháp */}
            {activeTab === "grammar" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark mb-2">
                    Ngữ pháp - Mẫu câu
                  </h2>
                  <p className="text-gray-600">
                    Học {lesson.sentencePatterns.length} mẫu câu ngữ pháp trong bài này
                  </p>
                </div>

                {lesson.sentencePatterns.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-600">Chưa có mẫu câu ngữ pháp nào trong bài học này.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lesson.sentencePatterns.map((pattern) => (
                      <div key={pattern.id} className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-dark mb-3">{pattern.patternText}</h3>
                        {pattern.pinyin && (
                          <p className="text-lg text-primary mb-2">{pattern.pinyin}</p>
                        )}
                        <p className="text-gray-700 mb-4">{pattern.meaning}</p>
                        {pattern.usage && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Cách dùng:</h4>
                            <p className="text-gray-600">{pattern.usage}</p>
                          </div>
                        )}
                        {pattern.exampleSentences && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Ví dụ:</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700 whitespace-pre-line">{pattern.exampleSentences}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reading - Bài đọc */}
            {activeTab === "reading" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark mb-2">
                    Bài đọc
                  </h2>
                  <p className="text-gray-600">
                    Đọc {lesson.readingPassages.length} bài đọc để luyện tập kỹ năng đọc hiểu
                  </p>
                </div>

                {lesson.readingPassages.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-600">Chưa có bài đọc nào trong bài học này.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {lesson.readingPassages.map((passage) => (
                      <div key={passage.id} className="bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-dark mb-4">{passage.title}</h3>
                        {passage.imageUrl && (
                          <img src={passage.imageUrl} alt={passage.title} className="w-full rounded-lg mb-4" />
                        )}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Nội dung:</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xl text-gray-800 mb-2">{passage.passageText}</p>
                            {passage.pinyin && (
                              <p className="text-lg text-primary">{passage.pinyin}</p>
                            )}
                          </div>
                        </div>
                        {passage.translation && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Bản dịch:</h4>
                            <p className="text-gray-700">{passage.translation}</p>
                          </div>
                        )}
                        {passage.questions.length > 0 && (
                          <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold text-gray-900 mb-4">Câu hỏi đọc hiểu:</h4>
                            <div className="space-y-4">
                              {passage.questions.map((q, idx) => (
                                <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                                  <p className="font-medium text-gray-900 mb-2">
                                    Câu {idx + 1}: {q.questionText}
                                  </p>
                                  <div className="space-y-2">
                                    {q.options.map((opt) => (
                                      <div key={opt.id} className="flex items-center">
                                        <span className="font-semibold mr-2">{opt.optionLabel}.</span>
                                        <span className={opt.isCorrect ? "text-green-600 font-medium" : "text-gray-700"}>
                                          {opt.optionText}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Quiz - Bài tập */}
            {activeTab === "quiz" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark mb-2">
                    Bài tập và Quiz
                  </h2>
                  <p className="text-gray-600">
                    Làm {lesson.questions.length} câu hỏi để kiểm tra kiến thức của bạn
                  </p>
                </div>

                {lesson.questions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-600">Chưa có câu hỏi nào trong bài học này.</p>
                  </div>
                ) : (
                  <QuizComponent
                    questions={lesson.questions}
                    onSubmit={handleQuizSubmit}
                    onComplete={handleQuizComplete}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

