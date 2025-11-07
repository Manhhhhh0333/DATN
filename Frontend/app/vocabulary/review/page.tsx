"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { vocabularyService } from "@/lib/services/vocabularyService";
import { FlashcardReviewDto } from "@/types";
import Flashcard from "@/components/vocabulary/Flashcard";

export default function VocabularyReviewPage() {
  const router = useRouter();
  const [words, setWords] = useState<FlashcardReviewDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const wordsData = await vocabularyService.getWordsDueForReview();
      setWords(wordsData);
      if (wordsData.length === 0) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải từ vựng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (wordId: number, rating: "Easy" | "Hard" | "Forgot") => {
    try {
      await vocabularyService.updateReviewStatus({ wordId, rating });
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Đã xong tất cả từ
      setCompleted(true);
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

  if (completed || words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hoàn thành ôn tập!
          </h1>
          <p className="text-gray-600 mb-8">
            Bạn đã ôn tập xong tất cả từ vựng cần ôn hôm nay. Hãy quay lại vào ngày mai để tiếp tục!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/vocabulary")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Xem chủ đề từ vựng
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Về trang chủ
            </button>
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/vocabulary")}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Quay lại
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ôn tập từ vựng
            </h1>
            <p className="text-gray-600">
              Từ {currentIndex + 1} / {words.length}
            </p>
            <div className="mt-4 max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <Flashcard
          word={words[currentIndex]}
          onRate={handleRate}
          onNext={handleNext}
          isLast={currentIndex === words.length - 1}
        />
      </main>
      <Footer />
    </div>
  );
}

