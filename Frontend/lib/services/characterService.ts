import axios from "axios";

export interface CharacterData {
  pinyin: string;
  meaning: string;
  strokes: number;
  traditional: string;
}

export const characterService = {
  async getCharacter(character: string): Promise<CharacterData | null> {
    try {
      // Chỉ tìm kiếm bộ thủ đơn (1 ký tự)
      if (character.length !== 1) {
        return null;
      }
      const response = await axios.get(`/api/characters/${encodeURIComponent(character)}`);
      return response.data;
    } catch (error: any) {
      // Không log error nếu là 404 (character không tồn tại)
      if (error.response?.status !== 404) {
        console.error("Error fetching character:", error);
      }
      return null;
    }
  },

  async getAllCharacters(): Promise<Record<string, CharacterData>> {
    try {
      const response = await axios.get("/api/characters");
      return response.data;
    } catch (error) {
      console.error("Error fetching characters:", error);
      return {};
    }
  },
};
