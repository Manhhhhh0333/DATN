/**
 * Ví dụ sử dụng ProgressItemList component
 * 
 * Component này hiển thị danh sách các mục với:
 * - Từ/câu tiếng Trung
 * - Nghĩa tiếng Việt
 * - Progress bar với gradient (xanh -> cyan)
 * - Nhãn phần trăm
 * - Accordion (có thể mở rộng)
 */

import ProgressItemList, { ProgressItem } from "./ProgressItemList";

// Ví dụ 1: Sử dụng cơ bản
export function BasicExample() {
  const items: ProgressItem[] = [
    {
      id: 1,
      character: "你好",
      meaning: "Xin chào",
      progress: 93,
    },
    {
      id: 2,
      character: "汉语不太难",
      meaning: "Tiếng Hán không khó lắm",
      progress: 21,
    },
    {
      id: 3,
      character: "明天见",
      meaning: "Ngày mai gặp lại",
      progress: 21,
    },
    {
      id: 4,
      character: "你去哪儿",
      meaning: "Bạn đi đâu?",
      progress: 0,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách từ vựng</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ProgressItemList items={items} />
      </div>
    </div>
  );
}

// Ví dụ 2: Với expanded content
export function WithExpandedContentExample() {
  const items: ProgressItem[] = [
    {
      id: 1,
      character: "你好",
      meaning: "Xin chào",
      progress: 93,
      expandedContent: (
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Pinyin: </span>
            <span className="text-blue-600">Nǐ hǎo</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Ví dụ: </span>
            <span className="text-gray-600">你好，我是小明。 (Xin chào, tôi là Tiểu Minh.)</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Phát âm
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Ôn tập
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      character: "汉语不太难",
      meaning: "Tiếng Hán không khó lắm",
      progress: 21,
      expandedContent: (
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Pinyin: </span>
            <span className="text-blue-600">Hànyǔ bù tài nán</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Cấu trúc: </span>
            <span className="text-gray-600">不太 + tính từ (không quá...)</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách từ vựng với chi tiết</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ProgressItemList items={items} />
      </div>
    </div>
  );
}

// Ví dụ 3: Tích hợp với dữ liệu từ API (WordWithProgressDto)
export function WithWordDataExample() {
  // Giả sử bạn có dữ liệu từ API
  // const { words } = useVocabularyTopic(topicId);
  
  // Chuyển đổi WordWithProgressDto sang ProgressItem
  // const items: ProgressItem[] = words.map((word) => ({
  //   id: word.id,
  //   character: word.character,
  //   meaning: word.meaning,
  //   progress: calculateProgress(word.progress), // Tính progress từ UserWordProgress
  //   expandedContent: (
  //     <div>
  //       <p>Pinyin: {word.pinyin}</p>
  //       {word.exampleSentence && <p>Ví dụ: {word.exampleSentence}</p>}
  //     </div>
  //   ),
  // }));

  // return <ProgressItemList items={items} />;
  
  return null; // Placeholder
}

// Helper function để tính progress từ UserWordProgress
function calculateProgress(progress?: {
  status: "New" | "Learning" | "Mastered" | "Reviewing";
  reviewCount: number;
  correctCount: number;
}): number {
  if (!progress) return 0;
  
  if (progress.status === "Mastered") return 100;
  if (progress.status === "Learning") {
    // Tính dựa trên số lần review và tỷ lệ đúng
    const totalReviews = progress.reviewCount;
    const accuracy = totalReviews > 0 
      ? (progress.correctCount / totalReviews) * 100 
      : 0;
    return Math.min(90, Math.max(10, accuracy));
  }
  if (progress.status === "Reviewing") return 75;
  return 0; // New
}

