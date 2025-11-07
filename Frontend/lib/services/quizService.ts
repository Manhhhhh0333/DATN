import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { QuestionDto, QuizSubmissionDto, QuizResultDto } from "@/types";

export const quizService = {
  // Lấy danh sách câu hỏi của bài học
  getLessonQuestions: async (lessonId: number): Promise<QuestionDto[]> => {
    const response = await apiClient.get(`/api/quiz/lesson/${lessonId}`);
    return response.data;
  },

  // Nộp bài quiz
  submitQuiz: async (submission: QuizSubmissionDto): Promise<QuizResultDto> => {
    const response = await apiClient.post("/api/quiz/submit", submission);
    return response.data;
  },
};

