"use client";

import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminStatisticsPage() {
  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thống kê & Báo cáo</h1>
          <p className="text-gray-600">Theo dõi hoạt động học tập và hiệu suất hệ thống</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Tổng học viên</div>
            <div className="text-3xl font-bold text-gray-900">1,234</div>
            <div className="text-sm text-green-600 mt-2">+12% so với tháng trước</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Bài học hoàn thành</div>
            <div className="text-3xl font-bold text-gray-900">5,678</div>
            <div className="text-sm text-green-600 mt-2">+8% so với tháng trước</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Từ vựng đã học</div>
            <div className="text-3xl font-bold text-gray-900">45,678</div>
            <div className="text-sm text-green-600 mt-2">+15% so với tháng trước</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Tỷ lệ hoàn thành</div>
            <div className="text-3xl font-bold text-gray-900">78%</div>
            <div className="text-sm text-blue-600 mt-2">Trung bình</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User by HSK Level */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng theo cấp độ HSK</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">HSK {level}</span>
                    <span className="text-sm text-gray-600">{200 + level * 50} người</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(200 + level * 50) / 5}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Words */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top từ vựng được học nhiều nhất</h3>
            <div className="space-y-3">
              {[
                { word: "你", meaning: "bạn", count: 1234 },
                { word: "好", meaning: "tốt", count: 1156 },
                { word: "我", meaning: "tôi", count: 1098 },
                { word: "是", meaning: "là", count: 987 },
                { word: "的", meaning: "của", count: 876 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.word}</div>
                      <div className="text-sm text-gray-600">{item.meaning}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{item.count} lần</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động học tập gần đây</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Biểu đồ sẽ được tích hợp Chart.js hoặc Recharts</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

