"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { topicService } from "@/lib/services/topicService";
import { exerciseService } from "@/lib/services/exerciseService";
import { getCompletedActivities } from "@/lib/services/activityService";
import { LessonTopicDto, LessonExerciseListDto } from "@/types";
import VocabularyWordItem from "@/components/vocabulary/VocabularyWordItem";
import LearningActivities, {
  createDefaultActivities,
} from "@/components/vocabulary/LearningActivities";
import ActivityProgressChart from "@/components/vocabulary/ActivityProgressChart";
import { calculateVocabularyProgress } from "@/lib/services/activityProgressService";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<LessonTopicDto | null>(null);
  const [exercises, setExercises] = useState<LessonExerciseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [vocabularyProgress, setVocabularyProgress] = useState<any>(null);

  const stats = topic
    ? {
        total: topic.words?.length || 0,
        mastered: topic.words?.filter((w: any) => w.progress?.status === "Mastered").length || 0,
        learning: topic.words?.filter((w: any) => w.progress?.status === "Learning").length || 0,
        new: topic.words?.filter((w: any) => !w.progress || w.progress.status === "New").length || 0,
      }
    : { total: 0, mastered: 0, learning: 0, new: 0 };

  const progressPercentage = stats.total > 0
    ? Math.round(((stats.mastered + stats.learning) / stats.total) * 100)
    : 0;

  const completedCount = stats.mastered + stats.learning;

  const activities = topic
    ? createDefaultActivities({
        quickMemorizeLink: topic.hskLevel
          ? `/topics/${topicId}/quick-memorize`
          : undefined,
        imageQuizLink: undefined, // Chưa implement
        pronunciationLink: `/topics/${topicId}/pronunciation`,
        progressLink: `/topics/${topicId}/progress`,
        activeId: "vocabulary",
        completedIds: completedActivityIds,
      })
    : [];

  useEffect(() => {
    if (topicId) {
      loadTopicData();
    }
  }, [topicId]);

  const loadCompletedActivities = async () => {
    try {
      const completedActivities = await getCompletedActivities(undefined, undefined, topicId);
      const completedIds = completedActivities.map(a => a.activityId);
      setCompletedActivityIds(completedIds);
      console.log("Loaded completed activities:", completedIds);
    } catch (activityError) {
      console.error("Error loading completed activities:", activityError);
      // Không cần show error, chỉ log
    }
  };

  const handleVocabularyCompleted = async () => {
    console.log("[Topics Page] Vocabulary progress updated! Refreshing...");
    
    // Reload topic data để lấy progress mới nhất từ server
    try {
      const topicData = await topicService.getTopicById(topicId);
      
      // Update topic state với words mới (có progress đã cập nhật)
      // Điều này sẽ trigger re-render cả list và grid view với data mới nhất
      setTopic(topicData);
      
      // Calculate và update vocabulary progress ngay lập tức
      if (topicData.words && topicData.words.length > 0) {
        const progress = calculateVocabularyProgress(topicData.words);
        setVocabularyProgress(progress);
        console.log("[Topics Page] Updated vocabulary progress:", progress);
      }
    } catch (error) {
      console.error("[Topics Page] Error refreshing vocabulary progress:", error);
      // Fallback: Tính từ state hiện tại nếu API fail
      if (topic?.words) {
        const progress = calculateVocabularyProgress(topic.words);
        setVocabularyProgress(progress);
      }
    }
  };

  const loadTopicData = async () => {
    try {
      setLoading(true);
      console.log("Loading topic data for ID:", topicId);
      const [topicData, exercisesData] = await Promise.all([
        topicService.getTopicById(topicId),
        exerciseService.getExercisesByTopic(topicId).catch(() => []),
      ]);
      console.log("Loaded topic data:", topicData);
      console.log("Loaded exercises data:", exercisesData);
      setTopic(topicData);
      setExercises(exercisesData || []);

      // Calculate vocabulary progress
      if (topicData.words && topicData.words.length > 0) {
        const progress = calculateVocabularyProgress(topicData.words);
        setVocabularyProgress(progress);
      }

      // Load completed activities
      await loadCompletedActivities();
    } catch (error: any) {
      console.error("Error loading topic:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      if (error.response?.status === 403) {
        alert("Bạn chưa hoàn thành chủ đề trước đó. Vui lòng hoàn thành chủ đề trước để mở khóa chủ đề này.");
        router.push("/courses");
      } else if (error.response?.status === 404) {
        alert("Chủ đề không tồn tại hoặc đã bị xóa.");
        router.push("/courses");
      } else {
        alert(`Lỗi khi tải dữ liệu: ${error.response?.data?.message || error.message}`);
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

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <main className="lg:col-span-2">
              {topic.words && topic.words.length > 0 ? (
                <>
                  {/* Vocabulary Progress Chart */}
                  {vocabularyProgress && (
                    <div className="mb-6">
                      <ActivityProgressChart progress={vocabularyProgress} showDetails={true} />
                    </div>
                  )}

                  {/* Vocabulary List */}
                  <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-dark">
                        Danh sách từ vựng ({topic.words.length})
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === "grid"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Lưới
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === "list"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Danh sách
                        </button>
                      </div>
                    </div>
                    {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {topic.words.map((word) => (
                        <VocabularyWordItem
                          key={word.id}
                          word={word}
                          viewMode="grid"
                          allWords={topic.words || []}
                          topicId={topicId}
                          onVocabularyCompleted={handleVocabularyCompleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topic.words.map((word) => (
                        <VocabularyWordItem
                          key={word.id}
                          word={word}
                          viewMode="list"
                          allWords={topic.words || []}
                          topicId={topicId}
                          onVocabularyCompleted={handleVocabularyCompleted}
                        />
                      ))}
                    </div>
                  )}
                  </section>
                </>
              ) : (
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">
                      Chưa có từ vựng nào trong chủ đề này
                    </p>
                  </div>
                </section>
              )}

              {topic.words && topic.words.length > 0 && (
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thống kê từ vựng
                    </h3>
                    <Link
                      href={`/topics/${topicId}/progress`}
                      className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                      Xem chi tiết
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  
                  {/* Progress bar */}
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
                  
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.mastered}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Đã làm</div>
                      <div className="text-xs font-semibold text-green-600">
                        {stats.total > 0
                          ? Math.round((stats.mastered / stats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.learning}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Đang làm</div>
                      <div className="text-xs font-semibold text-yellow-600">
                        {stats.total > 0
                          ? Math.round((stats.learning / stats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-500">
                        {stats.new}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Chưa làm</div>
                      <div className="text-xs font-semibold text-gray-500">
                        {stats.total > 0
                          ? Math.round((stats.new / stats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </main>

            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <LearningActivities
                  activities={activities}
                  title={topic?.title || "Hán Ngữ"}
                  completedCount={completedCount}
                  totalCount={stats.total}
                  showFirstWord={
                    topic?.words && topic.words.length > 0
                      ? {
                          character: topic.words[0].character,
                          meaning: topic.words[0].meaning,
                          isCompleted: false,
                        }
                      : undefined
                  }
                  maxHeight="calc(100vh-200px)"
                />
              </div>
            </aside>
          </div>
        </div>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-0">
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
