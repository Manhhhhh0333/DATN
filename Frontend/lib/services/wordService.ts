import apiClient from "../api";
import { API_ENDPOINTS } from "../api-endpoints";
import { WordDto } from "../../types";

export const wordService = {
  /**
   * Lấy thông tin chi tiết từ vựng theo slug (ID hoặc Character)
   */
  async getWordBySlug(slug: string): Promise<WordDto> {
    const response = await apiClient.get<WordDto>(
      API_ENDPOINTS.WORDS.BY_SLUG(slug)
    );
    return response.data;
  },
};

