import apiClient from "../api";
import { API_ENDPOINTS } from "../api-endpoints";
import {
  VocabularyTopicDto,
  VocabularyTopicDetailDto,
  FlashcardReviewDto,
  ReviewStatsDto,
  UpdateReviewStatusRequest,
  UserWordProgress,
} from "../../types";

export const vocabularyService = {
  /**
   * Lấy danh sách tất cả chủ đề từ vựng
   */
  async getAllTopics(): Promise<VocabularyTopicDto[]> {
    const response = await apiClient.get<VocabularyTopicDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.BASE
    );
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết chủ đề từ vựng
   */
  async getTopicById(id: number): Promise<VocabularyTopicDetailDto> {
    const response = await apiClient.get<VocabularyTopicDetailDto>(
      API_ENDPOINTS.VOCABULARY_TOPICS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Lấy danh sách từ vựng để ôn tập (flashcard)
   */
  async getReviewWords(
    topicId: number,
    onlyDue: boolean = true,
    limit?: number
  ): Promise<FlashcardReviewDto[]> {
    const response = await apiClient.get<FlashcardReviewDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.REVIEW_WORDS(topicId, onlyDue, limit)
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái ôn tập từ vựng (SRS)
   */
  async updateReviewStatus(
    request: UpdateReviewStatusRequest
  ): Promise<UserWordProgress> {
    const response = await apiClient.post<UserWordProgress>(
      API_ENDPOINTS.VOCABULARY_TOPICS.UPDATE_REVIEW,
      request
    );
    return response.data;
  },

  /**
   * Lấy thống kê học tập của chủ đề
   */
  async getTopicStats(topicId: number): Promise<ReviewStatsDto> {
    const response = await apiClient.get<ReviewStatsDto>(
      API_ENDPOINTS.VOCABULARY_TOPICS.STATS(topicId)
    );
    return response.data;
  },

  /**
   * Lấy thống kê tổng quan học tập
   */
  async getOverallStats(): Promise<ReviewStatsDto> {
    const response = await apiClient.get<ReviewStatsDto>(
      API_ENDPOINTS.VOCABULARY_TOPICS.OVERALL_STATS
    );
    return response.data;
  },

  /**
   * Lấy danh sách từ cần ôn tập hôm nay
   */
  async getWordsDueForReview(
    topicId?: number,
    limit?: number
  ): Promise<FlashcardReviewDto[]> {
    const response = await apiClient.get<FlashcardReviewDto[]>(
      API_ENDPOINTS.VOCABULARY_TOPICS.REVIEW_DUE(topicId, limit)
    );
    return response.data;
  },
};

