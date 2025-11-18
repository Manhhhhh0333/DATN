"use client";

import { useState, useEffect } from "react";

export interface DisplayOptions {
  showChinese: boolean;
  showPinyin: boolean;
  showVietnamese: boolean;
}

interface DisplayOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: DisplayOptions) => void;
  initialOptions?: DisplayOptions;
}

export default function DisplayOptionsModal({
  isOpen,
  onClose,
  onSave,
  initialOptions,
}: DisplayOptionsModalProps) {
  const [options, setOptions] = useState<DisplayOptions>({
    showChinese: true,
    showPinyin: false,
    showVietnamese: false,
    ...initialOptions,
  });

  useEffect(() => {
    if (initialOptions) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof DisplayOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(options);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Tùy chọn hiển thị</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-purple-400/30 hover:bg-purple-400/50 transition-colors flex items-center justify-center"
              aria-label="Đóng"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Option 1: Hiện chữ Hán */}
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Hiện chữ Hán
                </h3>
                <p className="text-sm text-gray-500">Hiển thị ký tự Hán</p>
              </div>
              <button
                onClick={() => handleToggle("showChinese")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  options.showChinese ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    options.showChinese ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Option 2: Hiện phiên âm */}
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Hiện phiên âm
                </h3>
                <p className="text-sm text-gray-500">Hiển thị cách đọc Pinyin</p>
              </div>
              <button
                onClick={() => handleToggle("showPinyin")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  options.showPinyin ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    options.showPinyin ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Option 3: Hiện nghĩa tiếng Việt */}
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Hiện nghĩa tiếng Việt
                </h3>
                <p className="text-sm text-gray-500">Hiển thị bản dịch tiếng Việt</p>
              </div>
              <button
                onClick={() => handleToggle("showVietnamese")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  options.showVietnamese ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    options.showVietnamese ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

