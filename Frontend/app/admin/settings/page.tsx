"use client";

import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cấu hình và thiết lập hệ thống</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt chung</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hệ thống
                </label>
                <input
                  type="text"
                  defaultValue="HiHSK"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  defaultValue="admin@hihsk.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý dữ liệu</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Seed dữ liệu mẫu</div>
                  <div className="text-sm text-gray-600">Import dữ liệu từ file JSON</div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Seed Data
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-medium text-red-900">Xóa dữ liệu</div>
                  <div className="text-sm text-red-700">⚠️ Hành động này không thể hoàn tác</div>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                  Xóa dữ liệu
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

