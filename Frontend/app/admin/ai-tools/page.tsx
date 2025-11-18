"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { aiService } from "@/lib/services/aiService";

export default function AdminAIToolsPage() {
  const [activeTab, setActiveTab] = useState<"examples" | "conversation" | "image">("examples");
  const [word, setWord] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGenerateExamples = async () => {
    if (!word.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập từ vựng" });
      return;
    }

    try {
      setGenerating(true);
      setMessage(null);
      const response = await aiService.generateExamples(word);
      setResults(response);
      setMessage({ type: "success", text: "Đã tạo ví dụ thành công" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Lỗi khi tạo ví dụ" });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateConversation = async () => {
    // TODO: Implement conversation generation
    setMessage({ type: "error", text: "Chức năng này sẽ được implement sau" });
  };

  const handleGenerateImage = async () => {
    // TODO: Implement image generation
    setMessage({ type: "error", text: "Chức năng này sẽ được implement sau" });
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tools</h1>
          <p className="text-gray-600">Công cụ AI để tạo ví dụ, hội thoại và hình ảnh</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("examples")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "examples"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Generate Examples
              </button>
              <button
                onClick={() => setActiveTab("conversation")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "conversation"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Generate Conversation
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "image"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Generate Image
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Generate Examples Tab */}
            {activeTab === "examples" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ vựng
                  </label>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Nhập từ vựng (ví dụ: 你好)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleGenerateExamples}
                  disabled={generating || !word.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {generating ? "Đang tạo..." : "Tạo Ví dụ"}
                </button>

                {results && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Kết quả:</h3>
                    <div className="space-y-3">
                      {results.examples?.map((example: any, index: number) => (
                        <div key={index} className="p-3 bg-white rounded border border-gray-200">
                          <div className="font-medium text-gray-900 mb-1">{example.chinese}</div>
                          <div className="text-sm text-gray-600 mb-1">{example.pinyin}</div>
                          <div className="text-sm text-gray-700">{example.translation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate Conversation Tab */}
            {activeTab === "conversation" && (
              <div className="space-y-4">
                <p className="text-gray-600">Chức năng tạo hội thoại sẽ được implement sau</p>
                <button
                  onClick={handleGenerateConversation}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Tạo Hội thoại
                </button>
              </div>
            )}

            {/* Generate Image Tab */}
            {activeTab === "image" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ vựng
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập từ vựng để tạo hình ảnh"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleGenerateImage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Tạo Hình ảnh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

