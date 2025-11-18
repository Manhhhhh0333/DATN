"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminService, AdminQuestionDto } from "@/lib/services/adminService";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [lessonFilter, setLessonFilter] = useState<string>("all");

  useEffect(() => {
    loadQuestions();
  }, [typeFilter, lessonFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const lessonId = lessonFilter !== "all" ? parseInt(lessonFilter) : undefined;
      const type = typeFilter !== "all" ? typeFilter : undefined;
      const data = await adminService.getQuestions(lessonId, type);
      setQuestions(data);
    } catch (err: any) {
      console.error("Error loading questions:", err);
      setError(err.message || "Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      return;
    }

    try {
      await adminService.deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err: any) {
      alert("Lỗi khi xóa câu hỏi: " + (err.message || "Unknown error"));
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      CHOOSE_MEANING: "Chọn đáp án",
      TRUE_FALSE: "Đúng/Sai",
      IMAGE_QUIZ: "Hình ảnh",
      LISTEN: "Nghe",
      READING: "Đọc",
    };
    return typeMap[type] || type;
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Câu hỏi</h1>
              <p className="text-gray-600">Quản lý câu hỏi trắc nghiệm và ví dụ</p>
            </div>
            <button
              onClick={() => {
                // TODO: Open create modal
                alert("Chức năng thêm câu hỏi sẽ được implement sau");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo loại
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="CHOOSE_MEANING">Chọn đáp án</option>
                <option value="TRUE_FALSE">Đúng/Sai</option>
                <option value="IMAGE_QUIZ">Hình ảnh</option>
                <option value="LISTEN">Nghe</option>
                <option value="READING">Đọc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo bài học
              </label>
              <select
                value={lessonFilter}
                onChange={(e) => setLessonFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả bài học</option>
                {/* TODO: Load lessons for filter */}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Questions List */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-sm text-gray-600">
                Tổng số: <span className="font-semibold text-gray-900">{questions.length}</span> câu hỏi
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Câu hỏi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Không tìm thấy câu hỏi nào.
                        {questions.length === 0 && (
                          <p className="text-sm mt-2">
                            Vui lòng thêm câu hỏi mới hoặc seed dữ liệu từ trang Dashboard.
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {question.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                          <div className="truncate">{question.questionText}</div>
                          {question.options && question.options.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {question.options.length} lựa chọn
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {getQuestionTypeLabel(question.questionType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {question.points || 1} điểm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.createdAt
                            ? new Date(question.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                // TODO: Open edit modal
                                alert("Chức năng sửa câu hỏi sẽ được implement sau");
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(question.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
