"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterData } from "@/lib/services/characterService";
import HanziWriter from "hanzi-writer";

interface CharacterDetailViewProps {
  character: string;
  data: CharacterData;
}

type TabType = "detail" | "analysis" | "practice" | "strokes";

export default function CharacterDetailView({
  character,
  data,
}: CharacterDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("detail");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const writerRef = useRef<HanziWriter | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const practiceContainerRef = useRef<HTMLDivElement>(null);
  const strokesContainerRef = useRef<HTMLDivElement>(null);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);

  useEffect(() => {
    const initWriter = (container: HTMLDivElement | null, showChar: boolean = true) => {
      if (container && character) {
        return HanziWriter.create(container, character, {
          width: 200,
          height: 200,
          padding: 10,
          strokeColor: "#000000",
          strokeWidth: 2,
          showOutline: true,
          showCharacter: showChar,
          charColor: "#000000",
        });
      }
      return null;
    };

    if (activeTab === "detail" && containerRef.current) {
      writerRef.current = initWriter(containerRef.current);
    } else if (activeTab === "practice" && practiceContainerRef.current) {
      writerRef.current = initWriter(practiceContainerRef.current, false);
    } else if (activeTab === "strokes" && strokesContainerRef.current) {
      writerRef.current = initWriter(strokesContainerRef.current, false);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null;
      }
    };
  }, [character, activeTab]);

  const playAudio = async () => {
    try {
      setIsPlaying(true);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(character)}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const animateCharacter = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter({
        onComplete: () => {
          console.log("Animation complete");
        },
      });
    }
  };

  const showStrokeOrderAnimation = () => {
    if (writerRef.current) {
      setShowStrokeOrder(true);
      writerRef.current.animateStroke(0, {
        onComplete: () => {
          if (writerRef.current && data.strokes > 1) {
            for (let i = 1; i < data.strokes; i++) {
              setTimeout(() => {
                if (writerRef.current) {
                  writerRef.current.animateStroke(i);
                }
              }, i * 500);
            }
          }
        },
      });
    }
  };

  const resetCharacter = () => {
    if (writerRef.current) {
      writerRef.current.hideCharacter();
      setShowStrokeOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {character}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
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
                <span className="text-gray-700 text-xl font-medium">
                  {data.pinyin}
                </span>
              </div>
              <p className="text-gray-600 text-lg mb-2">{data.meaning}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Hán việt: {data.meaning.split(" ")[0]}</span>
                <span>•</span>
                <span>Số nét: {data.strokes}</span>
              </div>
            </div>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg
                className={`w-6 h-6 ${isFavorite ? "text-red-500 fill-current" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("detail")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "detail"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chi tiết từ vựng
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "analysis"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Phân tích ký tự
              </button>
              <button
                onClick={() => setActiveTab("practice")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "practice"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Luyện viết {character}
              </button>
              <button
                onClick={() => setActiveTab("strokes")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "strokes"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Thứ tự các nét
              </button>
            </div>

            {activeTab === "detail" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Gợi nhớ</h3>
                  <p className="text-gray-700">
                    Hãy vẽ <strong>một đường thẳng</strong> ({character}) để bắt đầu tất cả. Đây là nét vẽ cơ bản nhất, tượng trưng cho <strong>vị trí số một</strong> tuyệt đối.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Thành phần cấu tạo
                  </h3>
                  <p className="text-gray-700">
                    Một nét gạch ngang duy nhất
                  </p>
                </div>
                <div className="flex justify-center">
                  <div ref={containerRef} className="border-2 border-gray-200 rounded-lg p-4 bg-white"></div>
                </div>
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Phân tích ký tự
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Ký tự:</span>
                        <span className="ml-2 font-semibold text-2xl">
                          {character}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phiên âm:</span>
                        <span className="ml-2 font-semibold">{data.pinyin}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Số nét:</span>
                        <span className="ml-2 font-semibold">{data.strokes}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Nghĩa:</span>
                        <span className="ml-2 font-semibold">{data.meaning}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "practice" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Luyện viết {character}
                  </h3>
                  <div className="flex justify-center mb-4">
                    <div ref={practiceContainerRef} className="border-2 border-gray-200 rounded-lg p-4 bg-white"></div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={animateCharacter}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem cách viết
                    </button>
                    <button
                      onClick={resetCharacter}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "strokes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Thứ tự các nét
                  </h3>
                  <div className="flex justify-center mb-4">
                    <div ref={strokesContainerRef} className="border-2 border-gray-200 rounded-lg p-4 bg-white"></div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={showStrokeOrderAnimation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem thứ tự nét
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
