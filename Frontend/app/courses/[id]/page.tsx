"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { courseService } from "@/lib/services/courseService";
import { lessonService } from "@/lib/services/lessonService";
import { CourseDto } from "@/types";
import { LessonListDto } from "@/types";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.id as string);

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [lessons, setLessons] = useState<LessonListDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData.sort((a, b) => a.lessonIndex - b.lessonIndex));
    } catch (error: any) {
      console.error("Error loading course data:", error);
      if (error.response?.status === 404) {
        router.push("/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin giáo trình...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Giáo trình HSK không tồn tại</p>
            <Link
              href="/courses"
              className="text-primary hover:text-primary-dark font-semibold"
            >
              ← Quay lại danh sách giáo trình HSK
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const completedLessons = lessons.filter(l => l.isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Course Header */}
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              href="/courses"
              className="inline-flex items-center text-white/90 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách giáo trình HSK
            </Link>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 px-4 py-1 rounded-full text-white font-semibold">
                  {course.hskLevel ? `HSK ${course.hskLevel}` : course.level}
                </span>
                <span className="text-white/80">
                  {course.categoryName}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {course.title}
              </h1>
              
              {course.description && (
                <p className="text-xl text-white/90 mb-6">
                  {course.description}
                </p>
              )}

              {/* Progress Overview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Tiến độ học tập</span>
                  <span className="text-white font-bold text-2xl">
                    {course.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-300"
                    style={{ width: `${course.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-white/90 text-sm">
                  <span>{completedLessons} / {course.totalLessons} bài học đã hoàn thành</span>
                  <span>{course.totalLessons - completedLessons} bài học còn lại</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lessons List */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-dark mb-8">Danh sách bài học</h2>
            
            {lessons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Chưa có bài học nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all ${
                      lesson.isLocked ? "opacity-60" : ""
                    }`}
                  >
                    {lesson.isLocked ? (
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                              {lesson.lessonIndex}
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 line-through">
                              {lesson.title}
                            </h3>
                            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                              🔒 Đã khóa
                            </span>
                          </div>
                          {lesson.description && (
                            <p className="text-gray-500 ml-14">{lesson.description}</p>
                          )}
                          <p className="text-sm text-gray-400 ml-14 mt-2">
                            Hoàn thành bài học trước để mở khóa
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="p-6 flex items-center justify-between hover:bg-gray-50 transition block"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              lesson.isCompleted
                                ? "bg-primary text-white"
                                : "bg-primary/20 text-primary"
                            }`}>
                              {lesson.isCompleted ? "✓" : lesson.lessonIndex}
                            </div>
                            <h3 className="text-xl font-bold text-dark">
                              {lesson.title}
                            </h3>
                            {lesson.isCompleted && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                ✓ Hoàn thành
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-gray-600 ml-14">{lesson.description}</p>
                          )}
                          <div className="flex items-center gap-4 ml-14 mt-3 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {lesson.totalWords} từ vựng
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {lesson.totalQuestions} câu hỏi
                            </span>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

