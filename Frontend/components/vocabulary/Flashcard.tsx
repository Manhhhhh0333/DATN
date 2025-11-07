"use client";

import { useState, useEffect } from "react";
import { FlashcardReviewDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";

interface FlashcardProps {
  word: FlashcardReviewDto;
  onRate: (wordId: number, rating: "Easy" | "Hard" | "Forgot") => void;
  onNext: () => void;
  isLast: boolean;
}

export default function Flashcard({ word, onRate, onNext, isLast }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [word.wordId]);

  const handleFlip = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped(!isFlipped);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleRate = (rating: "Easy" | "Hard" | "Forgot") => {
    onRate(word.wordId, rating);
    if (!isLast) {
      setTimeout(() => {
        setIsFlipped(false);
        onNext();
      }, 300);
    }
  };

  const playAudio = () => {
    if (word.character) {
      // Sử dụng proxy endpoint để tránh lỗi CORS
      const audioUrl = getProxyAudioUrl(word.character);
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Lỗi khi phát audio:", error);
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative h-64 cursor-pointer ${
          isAnimating ? "pointer-events-none" : ""
        }`}
        onClick={handleFlip}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-full transition-transform duration-300"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Mặt trước - Chữ Hán */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="text-6xl font-bold text-gray-900 mb-4">
              {word.character}
            </div>
            {word.character && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                🔊 Phát âm
              </button>
            )}
            <p className="mt-4 text-sm text-gray-500">Nhấn để xem nghĩa</p>
          </div>

          {/* Mặt sau - Nghĩa và Pinyin */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {word.character}
            </div>
            <div className="text-2xl text-blue-600 mb-4 font-medium">
              {word.pinyin}
            </div>
            <div className="text-xl text-gray-800 mb-4 text-center">
              {word.meaning}
            </div>
            {word.exampleSentence && (
              <div className="text-sm text-gray-600 text-center italic mb-4">
                {word.exampleSentence}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">Đánh giá mức độ nhớ</p>
          </div>
        </div>
      </div>

      {/* Nút đánh giá - chỉ hiện khi đã flip */}
      {isFlipped && (
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => handleRate("Easy")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            ✅ Dễ
          </button>
          <button
            onClick={() => handleRate("Hard")}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            ⚠️ Khó
          </button>
          <button
            onClick={() => handleRate("Forgot")}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            ❌ Quên
          </button>
        </div>
      )}
    </div>
  );
}

