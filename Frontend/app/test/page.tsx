"use client";

import { useState } from "react";
import apiClient from "@/lib/api";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get("/api/test");
      setResult(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Không thể kết nối đến Backend API"
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Smoke Test: Backend & Frontend Connection
          </h1>

          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Đang kiểm tra..." : "Test Kết Nối API"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">❌ Lỗi:</p>
                <p>{error}</p>
                <p className="text-sm mt-2">
                  💡 Kiểm tra:
                  <br />- Backend đang chạy chưa?
                  <br />- API URL đúng chưa? (xem file .env.local)
                  <br />- CORS đã được cấu hình chưa?
                </p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">✅ Thành công!</p>
                <pre className="mt-2 text-sm overflow-auto bg-white p-3 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">
                Thông tin kết nối:
              </h2>
              <p className="text-sm text-gray-600">
                <strong>API URL:</strong>{" "}
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5075"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Endpoint:</strong> /api/test
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

