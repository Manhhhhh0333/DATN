"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { topicService } from "@/lib/services/topicService";
import { exerciseService } from "@/lib/services/exerciseService";
import { LessonTopicDto, LessonExerciseListDto } from "@/types";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [exercises, setExercises] = useState<LessonExerciseListDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      loadTopicData();
    }
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const [topicData, exercisesData] = await Promise.all([
        topicService.getTopicById(topicId),
        exerciseService.getExercisesByTopic(topicId),
      ]);
      setTopic(topicData);
      setExercises(exercisesData);
    } catch (error: any) {
      console.error("Error loading topic:", error);
      if (error.response?.status === 403) {
        alert("Bạn chưa hoàn thành chủ đề trước đó. Vui lòng hoàn thành chủ đề trước để mở khóa chủ đề này.");
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
            <p className="text-gray-600">Đang tải thông tin chủ đề...</p>
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
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Chủ đề không tồn tại</p>
            <Link href="/courses" className="text-primary hover:underline">
              Quay lại danh sách chủ đề
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
        {/* Topic Header */}
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              href="/courses"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách chủ đề
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-xl text-white/90 max-w-3xl">
                {topic.description}
              </p>
            )}
            <div className="flex items-center gap-6 mt-6 text-white/90">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {topic.totalExercises} bài tập
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {topic.totalWords} từ vựng
              </span>
            </div>
            {topic.progressPercentage > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-white/90 mb-2">
                  <span>Tiến độ học tập</span>
                  <span className="font-semibold">{topic.progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all"
                    style={{ width: `${topic.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Exercises List */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {exercises.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  Chưa có bài tập nào trong chủ đề này
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-dark mb-6">Danh sách bài tập</h2>
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <Link
                      key={exercise.id}
                      href={`/exercises/${exercise.id}`}
                      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 ${
                        exercise.isLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              exercise.isCompleted
                                ? "bg-green-500 text-white"
                                : exercise.isLocked
                                ? "bg-gray-300 text-gray-600"
                                : "bg-primary/20 text-primary"
                            }`}>
                              {exercise.isCompleted ? "✓" : exercise.isLocked ? "🔒" : exercise.exerciseIndex}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-dark">
                                {exercise.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {exercise.exerciseTypeName}
                              </p>
                            </div>
                            {exercise.isCompleted && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                ✓ Hoàn thành
                              </span>
                            )}
                            {exercise.isLocked && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                                🔒 Đã khóa
                              </span>
                            )}
                          </div>
                          {exercise.description && (
                            <p className="text-gray-600 ml-14 mb-3">{exercise.description}</p>
                          )}
                        </div>
                        <div className="text-primary font-semibold">
                          {exercise.isLocked ? "🔒" : "Bắt đầu →"}
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

