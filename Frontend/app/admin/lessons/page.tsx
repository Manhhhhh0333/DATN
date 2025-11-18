"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminService, AdminLessonDto } from "@/lib/services/adminService";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLessonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");

  useEffect(() => {
    loadLessons();
  }, [courseFilter]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseId = courseFilter !== "all" ? parseInt(courseFilter) : undefined;
      const data = await adminService.getLessons(courseId);
      setLessons(data);
    } catch (err: any) {
      console.error("Error loading lessons:", err);
      setError(err.message || "Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      return;
    }

    try {
      await adminService.deleteLesson(id);
      setLessons(lessons.filter((l) => l.id !== id));
    } catch (err: any) {
      alert("Lỗi khi xóa bài học: " + (err.message || "Unknown error"));
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Bài học</h1>
              <p className="text-gray-600">Quản lý bài học và nội dung học tập</p>
            </div>
            <button
              onClick={() => {
                // TODO: Open create modal
                alert("Chức năng thêm bài học sẽ được implement sau");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Thêm bài học
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo khóa học
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả khóa học</option>
              {/* TODO: Load courses for filter */}
            </select>
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

        {/* Lessons Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-md p-12 text-center">
                <p className="text-gray-500 mb-2">Không tìm thấy bài học nào.</p>
                <p className="text-sm text-gray-400">
                  Vui lòng seed dữ liệu từ trang Dashboard hoặc thêm bài học mới.
                </p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {lesson.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          lesson.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {lesson.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Bài số:</span>
                      <span>{lesson.lessonIndex}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Số từ vựng:</span>
                      <span>{lesson.totalWords || lesson.wordCount || 0} từ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Số câu hỏi:</span>
                      <span>{lesson.totalQuestions || lesson.questionCount || 0} câu</span>
                    </div>
                    {lesson.isLocked && (
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 text-xs">🔒 Đã khóa</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // TODO: Navigate to lesson detail
                        alert("Chức năng xem chi tiết sẽ được implement sau");
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Open edit modal
                        alert("Chức năng sửa bài học sẽ được implement sau");
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
