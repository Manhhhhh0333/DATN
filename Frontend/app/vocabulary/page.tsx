"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { VocabularyTopicDto, ReviewStatsDto } from "@/types";
import TopicCard from "@/components/vocabulary/TopicCard";

export default function VocabularyTopicsPage() {
  const [topics, setTopics] = useState<VocabularyTopicDto[]>([]);
  const [overallStats, setOverallStats] = useState<ReviewStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicsData, statsData] = await Promise.all([
        vocabularyService.getAllTopics(),
        vocabularyService.getOverallStats(),
      ]);
      setTopics(topicsData);
      setOverallStats(statsData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Từ Vựng Theo Chủ Đề
          </h1>
          <p className="text-gray-600">
            Học từ vựng tiếng Trung theo chủ đề, dễ nhớ và hiệu quả hơn
          </p>
        </div>

      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Tổng số từ</div>
            <div className="text-2xl font-bold text-gray-900">
              {overallStats.totalWords}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Chưa học</div>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.newWords}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Đang học</div>
            <div className="text-2xl font-bold text-yellow-600">
              {overallStats.learningWords}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Đã thuộc</div>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.masteredWords}
            </div>
          </div>
        </div>
      )}

      {overallStats && overallStats.wordsDueToday > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Có {overallStats.wordsDueToday} từ cần ôn tập hôm nay
              </h3>
              <p className="text-sm text-blue-700">
                Hãy ôn tập để không quên những từ đã học!
              </p>
            </div>
            <Link
              href="/vocabulary/review"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ôn tập ngay
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Chưa có chủ đề từ vựng nào</p>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}

