"use client";

import Link from "next/link";
import { VocabularyTopicDto } from "@/types";

interface TopicCardProps {
  topic: VocabularyTopicDto;
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/topics/${topic.id}`}>
      <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {topic.name}
            </h3>
            {topic.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>
          {topic.imageUrl && (
            <img
              src={topic.imageUrl}
              alt={topic.name}
              className="w-16 h-16 object-cover rounded-lg ml-4"
            />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Từ vựng:</span>
            <span className="text-sm font-medium text-gray-900">
              {topic.wordCount}
            </span>
          </div>
          <div className="text-blue-600 text-sm font-medium">
            Học ngay →
          </div>
        </div>
      </div>
    </Link>
  );
}

