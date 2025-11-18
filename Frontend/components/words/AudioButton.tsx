"use client";

import { useState } from "react";

interface AudioButtonProps {
  text: string;
  lang?: string;
  className?: string;
}

export default function AudioButton({ text, lang = "zh-CN", className = "" }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Web Speech API không được hỗ trợ trong trình duyệt này");
      return;
    }

    try {
      // Dừng bất kỳ phát âm nào đang chạy
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Tốc độ phát âm (0.1 - 10)
      utterance.pitch = 1; // Cao độ (0 - 2)
      utterance.volume = 1; // Âm lượng (0 - 1)

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (error) => {
        console.error("Lỗi phát âm:", error);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Lỗi khi phát âm:", error);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={playAudio}
      disabled={isPlaying}
      className={`p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 ${className}`}
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
  );
}

