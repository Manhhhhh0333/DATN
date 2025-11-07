"use client";

import { useState } from "react";
import { WordDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";

interface WordCardProps {
  word: WordDto;
}

export default function WordCard({ word }: WordCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (!word.character) return;
    
    try {
      setIsPlaying(true);
      // Sử dụng proxy endpoint để tránh lỗi CORS
      const audioUrl = getProxyAudioUrl(word.character);
      const audio = new Audio(audioUrl);
      
      await audio.play();
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        console.error("Lỗi phát audio:", audioUrl);
      };
    } catch (error) {
      console.error("Lỗi phát audio:", error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 transition-all duration-300 border border-gray-200 hover:border-primary/30 hover:shadow-xl">
      {/* Header: Character và HSK Level */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="text-4xl font-bold text-dark leading-tight">
            {word.character}
          </h3>
          {word.character && (
            <button
              onClick={playAudio}
              disabled={isPlaying}
              className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Phát âm"
              title="Nghe phát âm"
            >
              <svg
                className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {isPlaying ? (
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </button>
          )}
        </div>
        {word.hskLevel && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
            HSK {word.hskLevel}
          </span>
        )}
      </div>

      {/* Pinyin và Meaning */}
      <div className="mb-4">
        <p className="text-xl text-primary font-semibold mb-2">
          {word.pinyin}
        </p>
        <p className="text-lg text-gray-800 leading-relaxed">
          {word.meaning}
        </p>
      </div>

      {/* Example Sentence */}
      {word.exampleSentence && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Ví dụ:</p>
          <p className="text-gray-800 leading-relaxed">{word.exampleSentence}</p>
        </div>
      )}

      {/* Footer: Stroke Count */}
      {word.strokeCount && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Số nét: {word.strokeCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

