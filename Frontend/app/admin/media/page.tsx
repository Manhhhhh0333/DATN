"use client";

import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lỗi khi upload file");
      }

      const result = await response.json();
      setMessage({
        type: "success",
        text: result.message || `Đã upload ${files.length} file thành công`,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Lỗi khi upload file" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      fileInputRef.current.files = files;
      handleFileUpload({ target: { files } } as any);
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Media</h1>
          <p className="text-gray-600">Upload và quản lý hình ảnh, audio</p>
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

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Media</h2>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors"
          >
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 mb-2">Kéo thả file vào đây hoặc</p>
            <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              {uploading ? "Đang upload..." : "Chọn file"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Hỗ trợ: JPG, PNG, GIF, MP3, WAV</p>
          </div>
        </div>

        {/* Media Library */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thư viện Media</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Chức năng xem danh sách media sẽ được implement sau</p>
            <p className="text-sm mt-2">API endpoint: GET /api/admin/media</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

