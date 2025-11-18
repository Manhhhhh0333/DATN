"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WordDto } from "@/types";
import AudioButton from "./AudioButton";
import HanziWriter from "hanzi-writer";

interface WordDetailViewProps {
  word: WordDto;
}

type TabType = "detail" | "analysis" | "practice" | "strokes";

interface CompoundWord {
  character: string;
  pinyin: string;
  meaning: string;
}

interface RecentlyViewedWord {
  date: string;
  character: string;
  pinyin: string;
  meaning: string;
}

export default function WordDetailView({ word }: WordDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("detail");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWriterReady, setIsWriterReady] = useState(false);
  const [showHintAfterMistake, setShowHintAfterMistake] = useState(1);
  const [repeatMode, setRepeatMode] = useState(false);
  const [hideStroke, setHideStroke] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const writerRef = useRef<HanziWriter | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const practiceContainerRef = useRef<HTMLDivElement>(null);
  const strokesContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewWriterRef = useRef<HanziWriter | null>(null);

  const [compoundWords] = useState<CompoundWord[]>([
    { character: "一副", pinyin: "yīfù", meaning: "phụ" },
    { character: "一些", pinyin: "yīxiē", meaning: "một số" },
    { character: "一定", pinyin: "yīdìng", meaning: "nhất định" },
    { character: "一直", pinyin: "yīzhí", meaning: "luôn luôn" },
    { character: "一下", pinyin: "yīxià", meaning: "một chút" },
    { character: "一点", pinyin: "yīdiǎn", meaning: "một chút" },
  ]);

  const [recentlyViewed] = useState<RecentlyViewedWord[]>([
    { date: "2025-01-15", character: "一", pinyin: "yī", meaning: "Nhất số một, thứ nhất" },
    { date: "2025-01-15", character: "一会儿", pinyin: "yīhuìr", meaning: "một lúc" },
    { date: "2025-01-14", character: "你好", pinyin: "nǐhǎo", meaning: "xin chào" },
    { date: "2025-01-14", character: "女", pinyin: "nǚ", meaning: "nữ, phụ nữ" },
    { date: "2025-01-13", character: "九", pinyin: "jiǔ", meaning: "chín" },
  ]);

  useEffect(() => {
    const initWriter = (container: HTMLDivElement | null, showChar: boolean = true) => {
      if (container && word.character && word.character.length === 1) {
        const writer = HanziWriter.create(container, word.character, {
          width: 200,
          height: 200,
          padding: 10,
          strokeColor: "#000000",
          strokeWidth: 2,
          showOutline: true,
          showCharacter: showChar,
        });
        
        // Đợi writer load xong data (HanziWriter cần thời gian để load character data)
        setTimeout(() => {
          setIsWriterReady(true);
          // Nếu đang ở practice tab và hideStroke = true, ẩn character ngay
          if (activeTab === "practice" && hideStroke && writer) {
            writer.hideCharacter();
          }
        }, 1000);
        
        return writer;
      }
      setIsWriterReady(false);
      return null;
    };

    setIsWriterReady(false);
    if (writerRef.current) {
      writerRef.current = null;
    }

    if (activeTab === "detail" && containerRef.current) {
      writerRef.current = initWriter(containerRef.current);
    } else if (activeTab === "practice") {
      if (practiceContainerRef.current) {
        // Tạo writer với strokeColor mờ để hiển thị character, và drawingColor đen cho nét viết
        // Chỉ tạo lại khi không ở quiz mode để tránh gián đoạn
        if (practiceContainerRef.current && word.character && word.character.length === 1 && !isQuizMode) {
          writerRef.current = HanziWriter.create(practiceContainerRef.current, word.character, {
            width: 256,
            height: 256,
            padding: 10,
            strokeColor: "#000000", // Màu mờ (#d1d5db) - cho character hiển thị
            drawingColor: "#000000", // Màu đen đậm (#000000) - cho nét viết khi di chuột
            drawingWidth: 4, // Độ dày nét đen đậm khi viết
            strokeWidth: 2, // Độ dày nét mờ
            showOutline: true,
            showCharacter: true, // Luôn hiển thị ban đầu, sẽ được ẩn/hiện bởi useEffect
          });
          
          setTimeout(() => {
            setIsWriterReady(true);
          }, 1000);
        }
      }
      if (previewContainerRef.current && word.character.length === 1) {
        previewWriterRef.current = HanziWriter.create(previewContainerRef.current, word.character, {
          width: 64,
          height: 64,
          padding: 5,
          strokeColor: "#000000",
          strokeWidth: 1,
          showOutline: true,
          showCharacter: true,
        });
      }
    } else if (activeTab === "strokes" && strokesContainerRef.current) {
      writerRef.current = initWriter(strokesContainerRef.current, false);
    }

    return () => {
      setIsWriterReady(false);
      setIsQuizMode(false);
      if (writerRef.current) {
        // Cancel quiz nếu đang ở quiz mode
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {
          // Ignore errors if quiz is not active
        }
        writerRef.current = null;
      }
      if (previewWriterRef.current) {
        previewWriterRef.current = null;
      }
    };
  }, [word.character, activeTab]);

  // Xử lý ẩn/hiện character dựa trên hideStroke
  useEffect(() => {
    // Chỉ xử lý khi đang ở practice tab và writer đã sẵn sàng
    if (activeTab !== "practice" || !isWriterReady) return;
    
    // Xử lý practice canvas - ẩn/hiện character dựa trên hideStroke
    // Chỉ xử lý khi không ở quiz mode để tránh xung đột
    if (writerRef.current && word.character.length === 1 && !isQuizMode) {
      // Áp dụng trạng thái ẩn/hiện ngay lập tức
      if (hideStroke) {
        // Ẩn hoàn toàn - chỉ còn ô trắng với lưới
        console.log("Ẩn character và outline trong practice canvas");
        writerRef.current.hideCharacter();
        writerRef.current.hideOutline(); // Ẩn outline để chỉ còn lưới
      } else {
        // Hiển thị với nét mờ (strokeColor #d1d5db đã được set khi tạo writer)
        console.log("Hiện character với nét mờ và outline trong practice canvas");
        writerRef.current.showCharacter();
        writerRef.current.showOutline(); // Hiện outline
      }
    }
  }, [hideStroke, word.character, activeTab, isWriterReady, isQuizMode]);


  const animateCharacter = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  const startPractice = () => {
    if (!writerRef.current || word.character.length !== 1) return;
    
    // Ẩn character trước
    writerRef.current.hideCharacter();
    
    // Đợi một chút để đảm bảo hideCharacter đã hoàn thành
    setTimeout(() => {
      if (writerRef.current) {
        // Bật quiz mode để cho phép viết bằng chuột
        writerRef.current.quiz({
          onComplete: () => {
            // Khi hoàn thành viết đúng
            setCorrectCount(prev => prev + 1);
            setIsQuizMode(false);
            
            // Nếu repeat mode, tự động reset và bắt đầu lại
            if (repeatMode) {
              setTimeout(() => {
                if (writerRef.current) {
                  writerRef.current.hideCharacter();
                  setTimeout(() => {
                    if (writerRef.current) {
                      writerRef.current.quiz({
                        onComplete: () => {
                          setCorrectCount(prev => prev + 1);
                          setIsQuizMode(false);
                        },
                        onMistake: (strokeData: any) => {
                          setWrongCount(prev => prev + 1);
                        },
                        showHintAfterMisses: showHintAfterMistake,
                        highlightOnComplete: true,
                      });
                      setIsQuizMode(true);
                    }
                  }, 200);
                }
              }, 1000);
            }
          },
          onMistake: (strokeData: any) => {
            // Khi viết sai
            setWrongCount(prev => prev + 1);
          },
          showHintAfterMisses: showHintAfterMistake,
          highlightOnComplete: true,
        });
        setIsQuizMode(true);
      }
    }, 200);
  };


  const resetCharacter = () => {
    if (writerRef.current) {
      // Nếu đang ở quiz mode, cần cancel quiz trước
      if (isQuizMode) {
        writerRef.current.cancelQuiz();
        setIsQuizMode(false);
      }
      writerRef.current.hideCharacter();
    }
  };

  const showStrokeOrderAnimation = () => {
    if (!isWriterReady || !writerRef.current || !word.strokeCount) {
      console.warn("Writer chưa sẵn sàng hoặc thiếu thông tin");
      return;
    }

    writerRef.current.hideCharacter();
    
    // Đợi một chút để đảm bảo hideCharacter đã hoàn thành
    setTimeout(() => {
      if (writerRef.current && word.strokeCount) {
        try {
          writerRef.current.animateStroke(0, {
            onComplete: () => {
              if (writerRef.current && word.strokeCount && word.strokeCount > 1) {
                for (let i = 1; i < word.strokeCount; i++) {
                  setTimeout(() => {
                    if (writerRef.current) {
                      try {
                        writerRef.current.animateStroke(i);
                      } catch (error) {
                        console.error(`Lỗi khi animate stroke ${i}:`, error);
                      }
                    }
                  }, (i - 1) * 500);
                }
              }
            },
          });
        } catch (error) {
          console.error("Lỗi khi animate stroke 0:", error);
        }
      }
    }, 200);
  };

  const getMemoryAid = () => {
    if (word.character === "一") {
      return "Hãy vẽ một đường thẳng (一) để bắt đầu tất cả. Đây là nét vẽ cơ bản nhất, tượng trưng cho vị trí số một tuyệt đối.";
    }
    return `Gợi nhớ cho từ ${word.character}: ${word.meaning}`;
  };

  const getComposition = () => {
    if (word.character === "一") {
      return "Một nét gạch ngang duy nhất";
    }
    return `Thành phần cấu tạo của ${word.character}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button and Title */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Chi tiết từ {word.character}
          </h2>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Character Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6">
                <h1 className="text-6xl font-bold text-gray-900 mb-4 text-center">
                  {word.character}
                </h1>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <AudioButton text={word.character} />
                  <span className="text-gray-700 text-xl font-medium">
                    {word.pinyin}
                  </span>
                </div>
                <div className="mb-6 text-center">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {word.meaning}
                  </p>
                </div>
                <div className="flex justify-around items-center border-t border-b border-gray-200 py-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Số nét</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {word.strokeCount || "-"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Hán Việt</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {word.character}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isFavorite
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
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
                    {isFavorite ? "Đã thêm vào sổ tay" : "Thêm vào sổ tay"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Tabs */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`py-3 px-6 text-center text-sm font-medium ${
                      activeTab === "detail"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Chi tiết từ vựng
                  </button>
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={`py-3 px-6 text-center text-sm font-medium ${
                      activeTab === "analysis"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Phân tích ký tự
                  </button>
                  <button
                    onClick={() => setActiveTab("practice")}
                    className={`py-3 px-6 text-center text-sm font-medium ${
                      activeTab === "practice"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Luyện viết
                  </button>
                  <button
                    onClick={() => setActiveTab("strokes")}
                    className={`py-3 px-6 text-center text-sm font-medium ${
                      activeTab === "strokes"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Thứ tự các nét
                  </button>
                </div>

                {activeTab === "detail" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Gợi nhớ</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {getMemoryAid()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Thành phần cấu tạo
                      </h3>
                      <p className="text-gray-700">{getComposition()}</p>
                    </div>
                    {word.character.length === 1 && (
                      <div className="flex justify-center">
                        <div
                          ref={containerRef}
                          className="border-2 border-gray-200 rounded-lg p-4 bg-white"
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "analysis" && (
                  <div className="space-y-6">
                    <p className="text-gray-700">
                      Phân tích chi tiết ký tự {word.character} sẽ được hiển thị tại đây.
                    </p>
                  </div>
                )}

                {activeTab === "practice" && (
                  <div className="space-y-6">
                    {/* Settings Panel */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Writing Mode</h4>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700">Show hint after mistake:</label>
                          <select
                            value={showHintAfterMistake}
                            onChange={(e) => setShowHintAfterMistake(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">View Mode</h4>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700">Repeat</label>
                          <button
                            onClick={() => setRepeatMode(!repeatMode)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              repeatMode ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                repeatMode ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preview Box */}
                    {word.character.length === 1 && (
                      <>
                        <div className="flex justify-center">
                          <div
                            ref={previewContainerRef}
                            className="w-16 h-16 border-2 border-green-500 rounded"
                          ></div>
                        </div>

                        {/* Main Practice Canvas */}
                        <div className="flex justify-center">
                          <div
                            ref={practiceContainerRef}
                            className="w-64 h-64 border-2 border-gray-300 rounded bg-white relative"
                            style={{
                              backgroundImage: `
                                repeating-linear-gradient(0deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px),
                                repeating-linear-gradient(90deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)
                              `,
                            }}
                          ></div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Ẩn nét</span>
                              <button
                                onClick={() => setHideStroke(!hideStroke)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${
                                  hideStroke ? "bg-blue-600" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    hideStroke ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={animateCharacter}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
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
                                Xem
                              </button>
                              <button
                                onClick={isQuizMode ? resetCharacter : startPractice}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  {isQuizMode ? (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  ) : (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  )}
                                </svg>
                                {isQuizMode ? "Dừng" : "Tập"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Statistics Bar */}
                        <div className="bg-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Đúng</p>
                              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Sai</p>
                              <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Tổng</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {correctCount + wrongCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "strokes" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Thứ tự các nét
                      </h3>
                      {word.character.length === 1 && (
                        <>
                          <div className="flex justify-center mb-4">
                            <div
                              ref={strokesContainerRef}
                              className="border-2 border-gray-200 rounded-lg p-4 bg-white"
                            ></div>
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={showStrokeOrderAnimation}
                              disabled={!isWriterReady}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isWriterReady ? "Xem thứ tự nét" : "Đang tải..."}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compound Words Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Từ ghép</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {compoundWords.slice(0, 6).map((cw, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {cw.character}
                  </p>
                  <p className="text-sm text-blue-600 mb-1">{cw.pinyin}</p>
                  <p className="text-sm text-gray-600">{cw.meaning}</p>
                </div>
              ))}
            </div>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Xem thêm ({compoundWords.length} từ ghép)
            </button>
          </div>

          {/* Examples Section */}
          {word.examples && word.examples.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ví dụ</h2>
              <div className="space-y-3 mb-4">
                {word.examples.slice(0, 12).map((example, index) => (
                  <div
                    key={example.id || index}
                    className="bg-white rounded-lg p-4 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-sm">{index + 1}.</span>
                        <p className="text-base font-medium text-gray-900">
                          {example.character}
                        </p>
                      </div>
                      <p className="text-sm text-blue-600 mb-1 ml-6">
                        {example.pinyin}
                      </p>
                      <p className="text-sm text-gray-600 ml-6">
                        {example.meaning}
                      </p>
                    </div>
                    <AudioButton text={example.character} className="ml-2" />
                  </div>
                ))}
              </div>
              {word.examples.length > 12 && (
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Xem thêm ({word.examples.length - 12} ví dụ)
                </button>
              )}
            </div>
          )}

          {/* Recently Viewed Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Từ đã xem</h2>
            <div className="bg-white rounded-lg p-4">
              <div className="space-y-3">
                {recentlyViewed.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-20">
                        {item.date}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 w-16">
                        {item.character}
                      </span>
                      <span className="text-sm text-blue-600">{item.pinyin}</span>
                      <span className="text-sm text-gray-600">{item.meaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
