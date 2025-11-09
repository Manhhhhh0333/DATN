"use client";

import { useState } from "react";

export interface ProgressItem {
  id: string | number;
  character: string; // Từ/câu tiếng Trung
  meaning: string; // Nghĩa tiếng Việt
  progress: number; // 0-100
  expandedContent?: React.ReactNode; // Nội dung khi mở rộng (optional)
}

interface ProgressItemListProps {
  items: ProgressItem[];
  className?: string;
}

export default function ProgressItemList({ items, className = "" }: ProgressItemListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string | number>>(new Set());

  const toggleItem = (id: string | number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {items.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`bg-white border-b border-gray-200 ${isLast ? "rounded-b-lg" : ""} ${
              isExpanded ? "shadow-sm" : ""
            } transition-all`}
          >
            {/* Main Item Content */}
            <div
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isExpanded ? "bg-gray-50" : ""
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-center justify-between">
                {/* Left: Text Content */}
                <div className="flex-1 min-w-0 mr-4">
                  {/* Chinese Text */}
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {item.character}
                  </div>
                  {/* Vietnamese Meaning */}
                  <div className="text-sm text-gray-600 mb-3">
                    {item.meaning}
                  </div>
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500"
                        style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                      ></div>
                    </div>
                    {/* Percentage Label */}
                    <div className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                      {Math.round(item.progress)}%
                    </div>
                  </div>
                </div>

                {/* Right: Accordion Icon */}
                <div className="flex-shrink-0 ml-4">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && item.expandedContent && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                <div className="pt-4">{item.expandedContent}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

