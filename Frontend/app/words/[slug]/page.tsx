"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { wordService } from "@/lib/services/wordService";
import { WordDto } from "@/types";
import WordDetailView from "@/components/words/WordDetailView";

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent(params.slug as string);
  const [word, setWord] = useState<WordDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWordData();
  }, [slug]);

  const loadWordData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wordService.getWordBySlug(slug);
      setWord(data);
    } catch (err: any) {
      console.error("Error loading word:", err);
      setError(err.response?.data?.message || "Không tìm thấy từ vựng");
      setWord(null);
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
            <p className="text-gray-600">Đang tải thông tin từ vựng...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-xl text-gray-600">
              {error || `Không tìm thấy từ vựng với slug: ${slug}`}
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
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
        <WordDetailView word={word} />
      </main>
      <Footer />
    </div>
  );
}

