/**
 * Utility functions for audio playback
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Tạo proxy audio URL từ backend để tránh lỗi CORS
 * @param text Text cần phát âm (chữ Hán)
 * @param lang Ngôn ngữ (mặc định: zh-CN)
 * @returns Proxy audio URL
 */
export function getProxyAudioUrl(text: string, lang: string = "zh-CN"): string {
  if (!text) return "";
  
  // Nếu đã là proxy URL hoặc URL hợp lệ khác, trả về nguyên
  if (text.startsWith("http://") || text.startsWith("https://")) {
    // Kiểm tra xem có phải Google TTS URL không
    if (text.includes("translate.google.com/translate_tts")) {
      // Extract text từ Google TTS URL và tạo proxy URL
      try {
        const url = new URL(text);
        const q = url.searchParams.get("q");
        if (q) {
          return `${API_BASE_URL}/api/audio/proxy?text=${encodeURIComponent(q)}&lang=${lang}`;
        }
      } catch (e) {
        // Nếu không parse được, tạo proxy URL từ text gốc
      }
    } else {
      // Nếu là URL khác (không phải Google TTS), trả về nguyên
      return text;
    }
  }
  
  // Tạo proxy URL từ text
  return `${API_BASE_URL}/api/audio/proxy?text=${encodeURIComponent(text)}&lang=${lang}`;
}

/**
 * Phát audio với proxy URL
 * @param text Text cần phát âm
 * @param lang Ngôn ngữ
 * @returns Promise<HTMLAudioElement>
 */
export async function playAudio(text: string, lang: string = "zh-CN"): Promise<void> {
  if (!text) return;
  
  const audioUrl = getProxyAudioUrl(text, lang);
  const audio = new Audio(audioUrl);
  
  try {
    await audio.play();
  } catch (error) {
    console.error("Lỗi khi phát audio:", error);
    throw error;
  }
}

