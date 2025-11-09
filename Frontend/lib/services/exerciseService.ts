import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { LessonExerciseListDto, LessonExerciseDto } from "@/types";

export const exerciseService = {
  // Lấy danh sách bài tập theo chủ đề
  getExercisesByTopic: async (topicId: number): Promise<LessonExerciseListDto[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_EXERCISES.BY_TOPIC(topicId));
    return response.data;
  },

  // Lấy chi tiết bài tập
  getExerciseById: async (id: number): Promise<LessonExerciseDto> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_EXERCISES.BY_ID(id));
    return response.data;
  },

  // Kiểm tra trạng thái mở khóa
  getUnlockStatus: async (id: number): Promise<{ exerciseId: number; isLocked: boolean }> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSON_EXERCISES.UNLOCK_STATUS(id));
    return response.data;
  },
};

