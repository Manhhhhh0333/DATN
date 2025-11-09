import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { WordExampleDto } from "@/types";

export interface GenerateExampleRequest {
  word: string;
}

export interface GenerateExampleResponse {
  word: string;
  examples: WordExampleDto[];
  count: number;
}

export const aiService = {
  // Generate examples cho từ vựng sử dụng AI
  generateExamples: async (word: string): Promise<WordExampleDto[]> => {
    const response = await apiClient.post<GenerateExampleResponse>(
      API_ENDPOINTS.AI.GENERATE_EXAMPLE,
      { word } as GenerateExampleRequest
    );
    return response.data.examples;
  },
};

