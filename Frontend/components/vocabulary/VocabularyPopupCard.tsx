"use client";

import { useEffect, useRef, useState } from "react";
import { WordWithProgressDto } from "@/types";
import { getProxyAudioUrl } from "@/lib/audio";

interface VocabularyPopupCardProps {
  word: WordWithProgressDto;
  position: { x: number; y: number };
  onClose: () => void;
  onViewDetail?: (word: WordWithProgressDto) => void;
  onEdit?: (word: WordWithProgressDto) => void;
}

export default function VocabularyPopupCard({
  word,
  position,
  onClose,
  onViewDetail,
  onEdit,
}: VocabularyPopupCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Điều chỉnh vị trí để popup không bị tràn ra ngoài màn hình
  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y - rect.height - 10; // Hiển thị phía trên từ

      // Đảm bảo không tràn ra ngoài màn hình
      if (adjustedX + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (adjustedX < 10) {
        adjustedX = 10;
      }
      if (adjustedY < 10) {
        adjustedY = position.y + 30; // Hiển thị phía dưới nếu không đủ chỗ trên
      }
      if (adjustedY + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      cardRef.current.style.left = `${adjustedX}px`;
      cardRef.current.style.top = `${adjustedY}px`;
    }
  }, [position]);

  const playAudio = async () => {
    try {
      setIsPlaying(true);
      
      // Clean text để loại bỏ BOM
      const cleanCharacter = word.character ? word.character.replace(/^\uFEFF/, "").trim() : "";
      
      // Ưu tiên sử dụng word.audioUrl, nhưng nếu là Google TTS URL thì convert sang proxy URL
      let audioUrl = word.audioUrl;
      
      if (audioUrl) {
        // Loại bỏ BOM từ URL string
        audioUrl = audioUrl.replace(/%EF%BB%BF/gi, "");
        
        // Nếu là Google TTS URL, convert sang proxy URL
        if (audioUrl.includes("translate.google.com/translate_tts")) {
          try {
            const url = new URL(audioUrl);
            const q = url.searchParams.get("q");
            const lang = url.searchParams.get("tl") || "zh-CN";
            if (q) {
              // Decode và clean text trong URL parameter
              const decodedQ = decodeURIComponent(q);
              const cleanedQ = decodedQ.replace(/^\uFEFF/, "").trim();
              if (cleanedQ) {
                // Convert sang proxy URL
                audioUrl = getProxyAudioUrl(cleanedQ, lang);
              } else {
                // Nếu text sau khi clean rỗng, dùng cleanCharacter
                audioUrl = getProxyAudioUrl(cleanCharacter);
              }
            } else {
              // Nếu không có q parameter, dùng cleanCharacter
              audioUrl = getProxyAudioUrl(cleanCharacter);
            }
          } catch (e) {
            // Nếu không parse được URL, dùng cleanCharacter
            console.warn("Không thể parse Google TTS URL, dùng character trực tiếp:", e);
            audioUrl = getProxyAudioUrl(cleanCharacter);
          }
        }
        // Nếu không phải Google TTS URL, giữ nguyên (có thể là URL khác hợp lệ)
      } else {
        // Nếu không có audioUrl, generate từ character
        audioUrl = getProxyAudioUrl(cleanCharacter);
      }
      
      // Kiểm tra audioUrl trước khi tạo Audio object
      if (!audioUrl || audioUrl.trim() === '') {
        console.warn("AudioUrl không hợp lệ:", audioUrl);
        setIsPlaying(false);
        return;
      }
      
      const audio = new Audio(audioUrl);
      
      // Thêm error handler trước khi play
      audio.onerror = (e) => {
        console.error("Lỗi khi load audio:", e, "URL:", audioUrl);
        setIsPlaying(false);
      };
      
      audio.onended = () => setIsPlaying(false);
      
      await audio.play();
    } catch (error) {
      console.error("Lỗi phát audio:", error);
      setIsPlaying(false);
    }
  };

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(word);
    }
    onClose();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(word);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Popup Card */}
      <div
        ref={cardRef}
        className="fixed z-50 bg-[#1E1E1E] rounded-xl shadow-2xl p-5 min-w-[280px] max-w-[320px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Chinese Character - Large and Bold */}
        <div className="text-center mb-4 pt-2">
          <div className="text-6xl font-bold text-white mb-2">
            {word.character}
          </div>

          {/* Pinyin - Italic, Light Gray */}
          <div className="text-lg italic text-gray-400 mb-3">
            {word.pinyin}
          </div>

          {/* Separator Line */}
          <div className="h-px bg-gray-600 mb-4"></div>

          {/* Meaning */}
          <div className="text-white text-base font-sans mb-5 text-left">
            Nghĩa: {word.meaning}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* 🔊 Phát âm */}
          <button
            onClick={playAudio}
            disabled={isPlaying}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
            title="Phát âm"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 👁️ Xem thêm */}
          <button
            onClick={handleViewDetail}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all hover:scale-110"
            title="Xem thêm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          {/* ✏️ Chỉnh sửa */}
          <button
            onClick={handleEdit}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all hover:scale-110"
            title="Chỉnh sửa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

