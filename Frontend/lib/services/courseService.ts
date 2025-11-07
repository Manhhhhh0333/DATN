import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { CourseListDto, CourseDto } from "@/types";

export const courseService = {
  // Lấy danh sách khóa học theo cấp độ HSK
  getCourses: async (hskLevel?: number): Promise<CourseListDto[]> => {
    const params = hskLevel ? { hskLevel } : {};
    const response = await apiClient.get(API_ENDPOINTS.COURSES.BASE, { params });
    return response.data;
  },

  // Lấy chi tiết khóa học
  getCourseById: async (id: number): Promise<CourseDto> => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.BY_ID(id));
    return response.data;
  },
};

