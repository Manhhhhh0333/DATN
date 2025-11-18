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

export interface WordWithMeaning {
  word: string;
  meaning: string;
}

export interface MonologueSentence {
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface ConversationDto {
  topic: string;
  monologue: MonologueSentence[];
}

export interface GenerateConversationRequest {
  words: WordWithMeaning[];
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

  // Generate conversation từ danh sách từ vựng sử dụng AI
  generateConversation: async (words: WordWithMeaning[]): Promise<ConversationDto> => {
    const response = await apiClient.post<ConversationDto>(
      API_ENDPOINTS.AI.GENERATE_CONVERSATION,
      { words } as GenerateConversationRequest
    );
    return response.data;
  },
};

