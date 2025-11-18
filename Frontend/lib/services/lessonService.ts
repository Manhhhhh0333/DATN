import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { LessonListDto, LessonDto } from "@/types";

export const lessonService = {
  // Lấy danh sách bài học của một khóa học
  getLessonsByCourse: async (courseId: number): Promise<LessonListDto[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSONS.BY_COURSE(courseId));
    return response.data;
  },

  // Lấy chi tiết bài học
  getLessonById: async (id: number): Promise<LessonDto> => {
    const response = await apiClient.get(API_ENDPOINTS.LESSONS.BY_ID(id));
    return response.data;
  },
};

