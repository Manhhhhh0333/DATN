import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { LessonTopicListDto, LessonTopicDto } from "@/types";

export const topicService = {
  // Lấy danh sách chủ đề theo cấp độ HSK
  getTopicsByHSKLevel: async (hskLevel: number): Promise<LessonTopicListDto[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_TOPICS.BY_HSK_LEVEL(hskLevel));
    return response.data;
  },

  // Lấy chi tiết chủ đề
  getTopicById: async (id: number): Promise<LessonTopicDto> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_TOPICS.BY_ID(id));
    return response.data;
  },

  // Kiểm tra trạng thái mở khóa
  getUnlockStatus: async (id: number): Promise<{ topicId: number; isLocked: boolean }> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_TOPICS.UNLOCK_STATUS(id));
    return response.data;
  },
};

