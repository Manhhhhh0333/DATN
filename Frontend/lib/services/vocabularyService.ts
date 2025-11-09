import apiClient from "../api";
import { API_ENDPOINTS } from "../api-endpoints";
import {
  VocabularyTopicDto,
  VocabularyTopicDetailDto,
  FlashcardReviewDto,
  ReviewStatsDto,
  UpdateReviewStatusRequest,
  UserWordProgress,
  WordWithProgressDto,
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

  /**
   * Lấy từ vựng theo HSK level và phần
   */
  async getWordsByHSKLevelAndPart(
    hskLevel: number,
    partNumber: number
  ): Promise<WordWithProgressDto[]> {
    const response = await apiClient.get<WordWithProgressDto[]>(
      API_ENDPOINTS.HSK_VOCABULARY.BY_HSK_AND_PART(hskLevel, partNumber)
    );
    return response.data;
  },

  /**
   * Lấy hoặc tạo từ vựng theo character
   * Nếu từ đã có trong database → trả về chi tiết từ đó
   * Nếu chưa có → gọi API để tạo từ mới bằng AI
   */
  async getOrCreateWordByCharacter(character: string): Promise<WordWithProgressDto> {
    const response = await apiClient.get<WordWithProgressDto>(
      API_ENDPOINTS.HSK_VOCABULARY.BY_CHARACTER(character)
    );
    return response.data;
  },

  /**
   * Lấy hoặc tạo nhiều từ vựng cùng lúc (batch)
   * Tối ưu hơn khi cần lấy nhiều từ từ WordExamples
   */
  async getOrCreateWordsBatch(characters: string[]): Promise<Record<string, WordWithProgressDto>> {
    const response = await apiClient.post<Record<string, WordWithProgressDto>>(
      API_ENDPOINTS.HSK_VOCABULARY.BATCH,
      { characters }
    );
    return response.data;
  },
};

